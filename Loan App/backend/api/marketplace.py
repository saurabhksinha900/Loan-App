from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from core.database import get_db
from models.models import User, UserRole, Loan, LoanStatus
from schemas.schemas import MarketplaceFilter, MarketplaceLoanResponse
from api.auth import get_current_user, require_role

router = APIRouter()


@router.post("/search", response_model=List[MarketplaceLoanResponse])
async def search_marketplace(
    filters: Optional[MarketplaceFilter] = None,
    skip: int = 0,
    limit: int = 100,
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.INVESTOR, UserRole.ADMIN]))
):
    """
    Search marketplace with advanced filters.
    
    Available for investors to discover loan trading opportunities.
    """
    loan_service = request.app.state.loan_service
    
    # Build filter dict
    filter_dict = None
    if filters:
        filter_dict = filters.model_dump(exclude_none=True)
    
    # Get filtered loans
    loans = loan_service.get_marketplace_loans(db, filter_dict, skip, limit)
    
    # Transform to marketplace response
    marketplace_loans = []
    for loan in loans:
        originator = db.query(User).filter(User.id == loan.originator_id).first()
        
        marketplace_loans.append(
            MarketplaceLoanResponse(
                loan_id=loan.loan_id,
                principal=loan.principal,
                interest_rate=loan.interest_rate,
                tenure_months=loan.tenure_months,
                risk_score=loan.risk_score or 0.0,
                risk_grade=loan.risk_grade or "D",
                suggested_price=loan.suggested_price or 0.0,
                yield_to_maturity=loan.yield_to_maturity or 0.0,
                current_outstanding=loan.current_outstanding,
                emis_paid=loan.emis_paid,
                emis_missed=loan.emis_missed,
                originator_name=originator.full_name if originator else "Unknown",
                status=loan.status
            )
        )
    
    return marketplace_loans


@router.get("/featured", response_model=List[MarketplaceLoanResponse])
async def get_featured_loans(
    limit: int = 10,
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get featured loans (highest rated, best yield).
    
    Showcases top investment opportunities.
    """
    # Get active loans with good ratings
    loans = db.query(Loan)\
        .filter(Loan.status == LoanStatus.ACTIVE)\
        .filter(Loan.risk_grade.in_(['A', 'B']))\
        .order_by(Loan.yield_to_maturity.desc())\
        .limit(limit)\
        .all()
    
    marketplace_loans = []
    for loan in loans:
        originator = db.query(User).filter(User.id == loan.originator_id).first()
        
        marketplace_loans.append(
            MarketplaceLoanResponse(
                loan_id=loan.loan_id,
                principal=loan.principal,
                interest_rate=loan.interest_rate,
                tenure_months=loan.tenure_months,
                risk_score=loan.risk_score or 0.0,
                risk_grade=loan.risk_grade or "D",
                suggested_price=loan.suggested_price or 0.0,
                yield_to_maturity=loan.yield_to_maturity or 0.0,
                current_outstanding=loan.current_outstanding,
                emis_paid=loan.emis_paid,
                emis_missed=loan.emis_missed,
                originator_name=originator.full_name if originator else "Unknown",
                status=loan.status
            )
        )
    
    return marketplace_loans


@router.get("/recommendations", response_model=List[MarketplaceLoanResponse])
async def get_recommendations(
    limit: int = 10,
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.INVESTOR]))
):
    """
    Get personalized loan recommendations for investor.
    
    Uses simple heuristics (in production, would use collaborative filtering).
    """
    # For now, recommend loans with good risk/return profile
    loans = db.query(Loan)\
        .filter(Loan.status == LoanStatus.ACTIVE)\
        .filter(Loan.risk_score < 0.15)\
        .filter(Loan.yield_to_maturity > 8.0)\
        .order_by(Loan.yield_to_maturity.desc())\
        .limit(limit)\
        .all()
    
    marketplace_loans = []
    for loan in loans:
        originator = db.query(User).filter(User.id == loan.originator_id).first()
        
        marketplace_loans.append(
            MarketplaceLoanResponse(
                loan_id=loan.loan_id,
                principal=loan.principal,
                interest_rate=loan.interest_rate,
                tenure_months=loan.tenure_months,
                risk_score=loan.risk_score or 0.0,
                risk_grade=loan.risk_grade or "D",
                suggested_price=loan.suggested_price or 0.0,
                yield_to_maturity=loan.yield_to_maturity or 0.0,
                current_outstanding=loan.current_outstanding,
                emis_paid=loan.emis_paid,
                emis_missed=loan.emis_missed,
                originator_name=originator.full_name if originator else "Unknown",
                status=loan.status
            )
        )
    
    return marketplace_loans
