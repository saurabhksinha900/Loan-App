from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
import uuid

from core.database import get_db
from models.models import User, UserRole, Transaction, Loan, TransactionStatus
from schemas.schemas import TransactionInitiate, TransactionResponse
from api.auth import get_current_user, require_role
from services.near_service import near_service

router = APIRouter()


@router.post("/", response_model=TransactionResponse, status_code=status.HTTP_201_CREATED)
async def initiate_transaction(
    transaction_data: TransactionInitiate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.INVESTOR, UserRole.ORIGINATOR]))
):
    """
    Initiate a loan ownership transfer transaction.
    
    The buyer initiates the transaction, which triggers blockchain settlement.
    """
    loan_service = request.app.state.loan_service
    
    # Get loan
    loan = loan_service.get_loan_by_id(db, transaction_data.loan_id)
    if not loan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan not found"
        )
    
    # Verify loan is active
    if loan.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Loan must be active for trading"
        )
    
    # Get current owner (originator for now, in production would check fractional ownership)
    seller = db.query(User).filter(User.id == loan.originator_id).first()
    
    if not seller:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan owner not found"
        )
    
    # Verify seller has NEAR account
    if not seller.near_account_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Seller does not have NEAR account configured"
        )
    
    # Verify buyer has NEAR account
    if not current_user.near_account_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Buyer must configure NEAR account"
        )
    
    # Validate fraction
    if transaction_data.fraction <= 0 or transaction_data.fraction > 10000:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid fraction. Must be between 1 and 10000 basis points"
        )
    
    # Create transaction record
    transaction_id = f"TXN-{uuid.uuid4().hex[:12].upper()}"
    
    transaction = Transaction(
        transaction_id=transaction_id,
        buyer_id=current_user.id,
        seller_id=seller.id,
        loan_id=loan.id,
        loan_token_id=loan.on_chain_token_id or f"LOAN-TOKEN-{loan.id}",
        fraction=transaction_data.fraction,
        price=transaction_data.price,
        status=TransactionStatus.PENDING
    )
    
    db.add(transaction)
    db.commit()
    db.refresh(transaction)
    
    # Execute blockchain transfer
    try:
        # Convert price to yoctoNEAR
        price_yocto = int(transaction_data.price * 1e24)
        
        result = await near_service.transfer_ownership(
            token_id=transaction.loan_token_id,
            from_account=seller.near_account_id,
            to_account=current_user.near_account_id,
            fraction=transaction_data.fraction,
            price=price_yocto
        )
        
        # Update transaction with blockchain data
        transaction.near_tx_hash = result['transaction_hash']
        transaction.block_height = result['block_height']
        transaction.status = TransactionStatus.CONFIRMED
        transaction.confirmed_at = datetime.utcnow()
        
        db.commit()
        db.refresh(transaction)
        
    except Exception as e:
        # Mark transaction as failed
        transaction.status = TransactionStatus.FAILED
        db.commit()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Blockchain transaction failed: {str(e)}"
        )
    
    return transaction


@router.get("/", response_model=List[TransactionResponse])
async def get_my_transactions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get transactions for current user (as buyer or seller)"""
    transactions = db.query(Transaction).filter(
        (Transaction.buyer_id == current_user.id) | (Transaction.seller_id == current_user.id)
    ).offset(skip).limit(limit).all()
    
    return transactions


@router.get("/{transaction_id}", response_model=TransactionResponse)
async def get_transaction(
    transaction_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get transaction details"""
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    
    # Check access permissions
    if current_user.role not in [UserRole.ADMIN] and \
       transaction.buyer_id != current_user.id and \
       transaction.seller_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    return transaction
