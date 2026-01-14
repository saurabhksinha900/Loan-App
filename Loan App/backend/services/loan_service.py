"""
Loan Service

Business logic for loan management, AI processing, and blockchain integration.
"""

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from typing import List, Optional, Dict
from datetime import datetime
import logging

from models.models import Loan, User, RiskExplanation, AuditLog, UserRole, LoanStatus
from schemas.schemas import LoanCreate, LoanUpdate, RiskAssessment, PricingData
from ai.risk_engine import RiskAssessmentEngine
from ai.pricing_engine import PricingEngine
from services.near_service import near_service

logger = logging.getLogger(__name__)


class LoanService:
    """Service for loan-related operations"""
    
    def __init__(
        self,
        risk_engine: RiskAssessmentEngine,
        pricing_engine: PricingEngine
    ):
        self.risk_engine = risk_engine
        self.pricing_engine = pricing_engine
    
    async def create_loan(
        self,
        db: Session,
        loan_data: LoanCreate,
        originator_id: int
    ) -> Loan:
        """
        Create a new loan and trigger AI processing.
        
        Args:
            db: Database session
            loan_data: Loan creation data
            originator_id: ID of the originating user
            
        Returns:
            Created loan object
        """
        logger.info(f"Creating loan {loan_data.loan_id} for originator {originator_id}")
        
        # Verify loan_id is unique
        existing = db.query(Loan).filter(Loan.loan_id == loan_data.loan_id).first()
        if existing:
            raise ValueError(f"Loan ID {loan_data.loan_id} already exists")
        
        # Create loan
        loan = Loan(
            loan_id=loan_data.loan_id,
            originator_id=originator_id,
            principal=loan_data.principal,
            interest_rate=loan_data.interest_rate,
            tenure_months=loan_data.tenure_months,
            monthly_emi=loan_data.monthly_emi,
            borrower_credit_score=loan_data.borrower_credit_score,
            borrower_income=loan_data.borrower_income,
            borrower_employment_type=loan_data.borrower_employment_type,
            loan_purpose=loan_data.loan_purpose,
            current_outstanding=loan_data.current_outstanding,
            emis_paid=loan_data.emis_paid,
            emis_missed=loan_data.emis_missed,
            status=LoanStatus.PENDING
        )
        
        db.add(loan)
        db.commit()
        db.refresh(loan)
        
        # Log audit
        self._log_audit(db, loan.id, None, "LOAN_CREATED", "Loan", loan.loan_id)
        
        # Trigger async AI processing
        await self.process_loan_ai(db, loan)
        
        return loan
    
    async def create_loans_bulk(
        self,
        db: Session,
        loans_data: List[LoanCreate],
        originator_id: int
    ) -> List[Loan]:
        """
        Create multiple loans in bulk.
        
        Args:
            db: Database session
            loans_data: List of loan creation data
            originator_id: ID of the originating user
            
        Returns:
            List of created loan objects
        """
        logger.info(f"Creating {len(loans_data)} loans in bulk for originator {originator_id}")
        
        created_loans = []
        
        for loan_data in loans_data:
            try:
                loan = await self.create_loan(db, loan_data, originator_id)
                created_loans.append(loan)
            except Exception as e:
                logger.error(f"Failed to create loan {loan_data.loan_id}: {str(e)}")
                # Continue with other loans
        
        return created_loans
    
    async def process_loan_ai(self, db: Session, loan: Loan) -> None:
        """
        Process loan through AI risk and pricing engines.
        
        Args:
            db: Database session
            loan: Loan object to process
        """
        logger.info(f"Processing AI for loan {loan.loan_id}")
        
        try:
            # Prepare loan data
            loan_dict = {
                'principal': loan.principal,
                'interest_rate': loan.interest_rate,
                'tenure_months': loan.tenure_months,
                'borrower_credit_score': loan.borrower_credit_score or 650,
                'borrower_income': loan.borrower_income or 50000,
                'emis_paid': loan.emis_paid,
                'emis_missed': loan.emis_missed,
                'current_outstanding': loan.current_outstanding,
                'monthly_emi': loan.monthly_emi,
            }
            
            # Risk assessment
            prob_default, expected_loss, risk_grade = self.risk_engine.predict_risk(loan_dict)
            
            # Generate explanations
            explanations = self.risk_engine.explain_prediction(loan_dict)
            
            # Update loan with risk data
            loan.risk_score = prob_default
            loan.expected_loss = expected_loss
            loan.risk_grade = risk_grade
            loan.model_version = self.risk_engine.model_version
            loan.last_assessment_at = datetime.utcnow()
            
            # Save risk explanations
            for exp in explanations[:10]:  # Save top 10 features
                risk_exp = RiskExplanation(
                    loan_id=loan.id,
                    feature_name=exp['feature_name'],
                    feature_value=exp['feature_value'],
                    shap_value=exp['shap_value'],
                    impact_description=exp['impact_description'],
                    model_version=self.risk_engine.model_version
                )
                db.add(risk_exp)
            
            # Pricing
            pricing_data = self.pricing_engine.calculate_fair_value(
                loan_dict,
                prob_default,
                risk_grade
            )
            
            loan.suggested_price = pricing_data['suggested_price']
            loan.yield_to_maturity = pricing_data['yield_to_maturity']
            
            # Update status to ACTIVE
            loan.status = LoanStatus.ACTIVE
            
            db.commit()
            
            # Register on blockchain if originator has NEAR account
            originator = db.query(User).filter(User.id == loan.originator_id).first()
            if originator and originator.near_account_id:
                await self.register_on_blockchain(db, loan, originator.near_account_id)
            
            logger.info(f"AI processing completed for loan {loan.loan_id}")
            
        except Exception as e:
            logger.error(f"AI processing failed for loan {loan.loan_id}: {str(e)}")
            loan.status = LoanStatus.PENDING
            db.commit()
            raise
    
    async def register_on_blockchain(
        self,
        db: Session,
        loan: Loan,
        originator_account: str
    ) -> None:
        """
        Register loan token on NEAR blockchain.
        
        Args:
            db: Database session
            loan: Loan object
            originator_account: Originator's NEAR account ID
        """
        logger.info(f"Registering loan {loan.loan_id} on blockchain")
        
        try:
            # Generate on-chain token ID
            token_id = f"LOAN-TOKEN-{loan.id}"
            
            # Calculate total value in yoctoNEAR (simplified)
            total_value = int(loan.suggested_price * 1e24)  # Convert to yoctoNEAR
            
            # Register on NEAR
            result = await near_service.register_loan_token(
                token_id=token_id,
                off_chain_loan_id=loan.loan_id,
                total_value=total_value,
                originator_account=originator_account
            )
            
            # Update loan with blockchain data
            loan.on_chain_token_id = token_id
            db.commit()
            
            # Log audit
            self._log_audit(
                db,
                loan.id,
                None,
                "BLOCKCHAIN_REGISTERED",
                "Loan",
                loan.loan_id,
                new_value=result['transaction_hash']
            )
            
            logger.info(f"Loan registered on blockchain: {result['transaction_hash']}")
            
        except Exception as e:
            logger.error(f"Blockchain registration failed: {str(e)}")
            # Don't fail the loan creation, just log the error
    
    def get_loan_by_id(self, db: Session, loan_id: int) -> Optional[Loan]:
        """Get loan by database ID"""
        return db.query(Loan).filter(Loan.id == loan_id).first()
    
    def get_loan_by_loan_id(self, db: Session, loan_id: str) -> Optional[Loan]:
        """Get loan by loan_id"""
        return db.query(Loan).filter(Loan.loan_id == loan_id).first()
    
    def get_loans_by_originator(
        self,
        db: Session,
        originator_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[Loan]:
        """Get all loans for an originator"""
        return db.query(Loan)\
            .filter(Loan.originator_id == originator_id)\
            .offset(skip)\
            .limit(limit)\
            .all()
    
    def get_marketplace_loans(
        self,
        db: Session,
        filters: Optional[Dict] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Loan]:
        """
        Get loans available in marketplace with optional filters.
        
        Args:
            db: Database session
            filters: Optional filter criteria
            skip: Pagination offset
            limit: Maximum results
            
        Returns:
            List of filtered loans
        """
        query = db.query(Loan).filter(Loan.status == LoanStatus.ACTIVE)
        
        if filters:
            if filters.get('min_principal'):
                query = query.filter(Loan.principal >= filters['min_principal'])
            if filters.get('max_principal'):
                query = query.filter(Loan.principal <= filters['max_principal'])
            if filters.get('min_interest_rate'):
                query = query.filter(Loan.interest_rate >= filters['min_interest_rate'])
            if filters.get('max_interest_rate'):
                query = query.filter(Loan.interest_rate <= filters['max_interest_rate'])
            if filters.get('risk_grades'):
                query = query.filter(Loan.risk_grade.in_(filters['risk_grades']))
            if filters.get('min_yield'):
                query = query.filter(Loan.yield_to_maturity >= filters['min_yield'])
            if filters.get('max_yield'):
                query = query.filter(Loan.yield_to_maturity <= filters['max_yield'])
        
        return query.offset(skip).limit(limit).all()
    
    def update_loan(
        self,
        db: Session,
        loan_id: int,
        update_data: LoanUpdate,
        user_id: int
    ) -> Loan:
        """Update loan details"""
        loan = self.get_loan_by_id(db, loan_id)
        if not loan:
            raise ValueError(f"Loan {loan_id} not found")
        
        # Update fields
        update_dict = update_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(loan, key, value)
        
        db.commit()
        db.refresh(loan)
        
        # Log audit
        self._log_audit(db, loan.id, user_id, "LOAN_UPDATED", "Loan", loan.loan_id)
        
        return loan
    
    def get_risk_explanations(
        self,
        db: Session,
        loan_id: int
    ) -> List[RiskExplanation]:
        """Get risk explanations for a loan"""
        return db.query(RiskExplanation)\
            .filter(RiskExplanation.loan_id == loan_id)\
            .order_by(RiskExplanation.shap_value.desc())\
            .all()
    
    def _log_audit(
        self,
        db: Session,
        loan_id: Optional[int],
        user_id: Optional[int],
        action: str,
        entity_type: str,
        entity_id: str,
        old_value: Optional[str] = None,
        new_value: Optional[str] = None
    ) -> None:
        """Log audit trail"""
        audit_log = AuditLog(
            loan_id=loan_id,
            user_id=user_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            old_value=old_value,
            new_value=new_value
        )
        db.add(audit_log)
        db.commit()
