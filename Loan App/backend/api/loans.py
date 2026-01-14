from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from models.models import User, UserRole, Loan
from schemas.schemas import (
    LoanCreate, LoanResponse, LoanDetailResponse, LoanBulkUpload,
    RiskExplanationSummary, LoanUpdate
)
from api.auth import get_current_user, require_role

router = APIRouter()


@router.post("/", response_model=LoanResponse, status_code=status.HTTP_201_CREATED)
async def create_loan(
    loan_data: LoanCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ORIGINATOR, UserRole.ADMIN]))
):
    """Create a new loan (Originators only)"""
    loan_service = request.app.state.loan_service
    
    try:
        loan = await loan_service.create_loan(db, loan_data, current_user.id)
        return loan
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create loan: {str(e)}"
        )


@router.post("/bulk", response_model=List[LoanResponse], status_code=status.HTTP_201_CREATED)
async def create_loans_bulk(
    bulk_data: LoanBulkUpload,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ORIGINATOR, UserRole.ADMIN]))
):
    """Create multiple loans in bulk (Originators only)"""
    loan_service = request.app.state.loan_service
    
    try:
        loans = await loan_service.create_loans_bulk(db, bulk_data.loans, current_user.id)
        return loans
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Bulk upload failed: {str(e)}"
        )


@router.get("/{loan_id}", response_model=LoanDetailResponse)
async def get_loan(
    loan_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get loan details by ID"""
    loan_service = request.app.state.loan_service
    loan = loan_service.get_loan_by_id(db, loan_id)
    
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found"
        )
    
    # Check access permissions
    if current_user.role == UserRole.ORIGINATOR and loan.originator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return loan


@router.get("/", response_model=List[LoanResponse])
async def get_my_loans(
    skip: int = 0,
    limit: int = 100,
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get loans for current user (originators see their loans)"""
    loan_service = request.app.state.loan_service
    
    if current_user.role == UserRole.ORIGINATOR:
        loans = loan_service.get_loans_by_originator(db, current_user.id, skip, limit)
    elif current_user.role == UserRole.ADMIN:
        # Admins see all loans
        loans = db.query(Loan).offset(skip).limit(limit).all()
    else:
        # Investors see marketplace loans
        loans = loan_service.get_marketplace_loans(db, skip=skip, limit=limit)
    
    return loans


@router.put("/{loan_id}", response_model=LoanResponse)
async def update_loan(
    loan_id: int,
    update_data: LoanUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ORIGINATOR, UserRole.ADMIN]))
):
    """Update loan details"""
    loan_service = request.app.state.loan_service
    
    try:
        loan = loan_service.get_loan_by_id(db, loan_id)
        if not loan:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Loan not found"
            )
        
        # Only originator can update their loans
        if current_user.role == UserRole.ORIGINATOR and loan.originator_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        updated_loan = loan_service.update_loan(db, loan_id, update_data, current_user.id)
        return updated_loan
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/{loan_id}/risk-explanation", response_model=RiskExplanationSummary)
async def get_risk_explanation(
    loan_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get AI risk assessment explanation for a loan"""
    loan_service = request.app.state.loan_service
    
    loan = loan_service.get_loan_by_id(db, loan_id)
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found"
        )
    
    explanations = loan_service.get_risk_explanations(db, loan_id)
    
    if not explanations:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Risk explanations not available"
        )
    
    # Sort by absolute SHAP value
    sorted_exp = sorted(explanations, key=lambda x: abs(x.shap_value), reverse=True)
    
    # Separate risk factors (positive SHAP) and protective factors (negative SHAP)
    risk_factors = [
        {
            'feature': exp.feature_name,
            'value': exp.feature_value,
            'impact': exp.shap_value,
            'description': exp.impact_description
        }
        for exp in sorted_exp if exp.shap_value > 0
    ][:5]
    
    protective_factors = [
        {
            'feature': exp.feature_name,
            'value': exp.feature_value,
            'impact': abs(exp.shap_value),
            'description': exp.impact_description
        }
        for exp in sorted_exp if exp.shap_value < 0
    ][:5]
    
    return RiskExplanationSummary(
        loan_id=loan_id,
        overall_risk_score=loan.risk_score,
        risk_grade=loan.risk_grade,
        top_risk_factors=risk_factors,
        top_protective_factors=protective_factors,
        model_version=loan.model_version
    )
