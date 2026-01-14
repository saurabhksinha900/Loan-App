from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from core.database import get_db
from models.models import User, UserRole, AuditLog, AIModel
from schemas.schemas import AuditLogResponse, AIModelResponse, UserResponse
from api.auth import get_current_user, require_role

router = APIRouter()


@router.get("/users", response_model=List[UserResponse])
async def get_all_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Get all users (Admin only)"""
    users = db.query(User).offset(skip).limit(limit).all()
    return users


@router.get("/audit-logs", response_model=List[AuditLogResponse])
async def get_audit_logs(
    skip: int = 0,
    limit: int = 100,
    entity_type: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Get audit logs (Admin only)"""
    query = db.query(AuditLog)
    
    if entity_type:
        query = query.filter(AuditLog.entity_type == entity_type)
    
    logs = query.order_by(AuditLog.created_at.desc()).offset(skip).limit(limit).all()
    return logs


@router.get("/audit-logs/loan/{loan_id}", response_model=List[AuditLogResponse])
async def get_loan_audit_logs(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Get audit logs for a specific loan (Admin only)"""
    logs = db.query(AuditLog)\
        .filter(AuditLog.loan_id == loan_id)\
        .order_by(AuditLog.created_at.desc())\
        .all()
    return logs


@router.get("/ai-models", response_model=List[AIModelResponse])
async def get_ai_models(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Get all AI model versions (Admin only)"""
    models = db.query(AIModel).all()
    return models


@router.put("/users/{user_id}/status")
async def update_user_status(
    user_id: int,
    is_active: bool,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.ADMIN]))
):
    """Activate or deactivate a user (Admin only)"""
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = is_active
    db.commit()
    
    return {"message": f"User {user.username} {'activated' if is_active else 'deactivated'} successfully"}
