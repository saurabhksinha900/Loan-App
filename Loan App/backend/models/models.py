from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Enum as SQLEnum, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from core.database import Base


# ============================================================================
# ENUMS
# ============================================================================

class UserRole(str, enum.Enum):
    """User role definitions"""
    ORIGINATOR = "ORIGINATOR"
    INVESTOR = "INVESTOR"
    ADMIN = "ADMIN"


class LoanStatus(str, enum.Enum):
    """Loan lifecycle status"""
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"
    SETTLED = "SETTLED"
    DEFAULTED = "DEFAULTED"
    RESTRUCTURED = "RESTRUCTURED"


class RiskGrade(str, enum.Enum):
    """Risk grade classifications"""
    A = "A"  # Low risk
    B = "B"  # Medium-low risk
    C = "C"  # Medium-high risk
    D = "D"  # High risk


class TransactionStatus(str, enum.Enum):
    """Transaction processing status"""
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    FAILED = "FAILED"


# ============================================================================
# MODELS
# ============================================================================

class User(Base):
    """User model with role-based access control"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False)
    is_active = Column(Boolean, default=True)
    near_account_id = Column(String(255), unique=True, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    originated_loans = relationship("Loan", back_populates="originator", foreign_keys="Loan.originator_id")
    transactions_as_buyer = relationship("Transaction", back_populates="buyer", foreign_keys="Transaction.buyer_id")
    transactions_as_seller = relationship("Transaction", back_populates="seller", foreign_keys="Transaction.seller_id")


class Loan(Base):
    """Loan model with comprehensive attributes"""
    __tablename__ = "loans"
    
    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(String(100), unique=True, index=True, nullable=False)
    originator_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Loan Details
    principal = Column(Float, nullable=False)
    interest_rate = Column(Float, nullable=False)  # Annual percentage
    tenure_months = Column(Integer, nullable=False)
    monthly_emi = Column(Float, nullable=False)
    
    # Borrower Information
    borrower_credit_score = Column(Integer, nullable=True)
    borrower_income = Column(Float, nullable=True)
    borrower_employment_type = Column(String(50), nullable=True)
    loan_purpose = Column(String(100), nullable=True)
    
    # Repayment History
    emis_paid = Column(Integer, default=0)
    emis_missed = Column(Integer, default=0)
    current_outstanding = Column(Float, nullable=False)
    
    # Risk Assessment
    risk_score = Column(Float, nullable=True)  # Probability of default
    expected_loss = Column(Float, nullable=True)
    risk_grade = Column(SQLEnum(RiskGrade), nullable=True)
    
    # Pricing
    suggested_price = Column(Float, nullable=True)
    yield_to_maturity = Column(Float, nullable=True)
    
    # Blockchain
    on_chain_token_id = Column(String(100), unique=True, nullable=True, index=True)
    status = Column(SQLEnum(LoanStatus), default=LoanStatus.PENDING)
    
    # AI Metadata
    model_version = Column(String(50), nullable=True)
    last_assessment_at = Column(DateTime(timezone=True), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    originator = relationship("User", back_populates="originated_loans", foreign_keys=[originator_id])
    transactions = relationship("Transaction", back_populates="loan")
    risk_explanations = relationship("RiskExplanation", back_populates="loan")
    audit_logs = relationship("AuditLog", back_populates="loan")


class Transaction(Base):
    """Transaction model for tracking trades"""
    __tablename__ = "transactions"
    
    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(String(100), unique=True, index=True, nullable=False)
    
    buyer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    seller_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    loan_id = Column(Integer, ForeignKey("loans.id"), nullable=False)
    
    # Transaction Details
    loan_token_id = Column(String(100), nullable=False)
    fraction = Column(Integer, nullable=False)  # Basis points (10000 = 100%)
    price = Column(Float, nullable=False)
    
    # Blockchain
    near_tx_hash = Column(String(255), unique=True, nullable=True, index=True)
    block_height = Column(Integer, nullable=True)
    
    # Status
    status = Column(SQLEnum(TransactionStatus), default=TransactionStatus.PENDING)
    
    # Timestamps
    initiated_at = Column(DateTime(timezone=True), server_default=func.now())
    confirmed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    buyer = relationship("User", back_populates="transactions_as_buyer", foreign_keys=[buyer_id])
    seller = relationship("User", back_populates="transactions_as_seller", foreign_keys=[seller_id])
    loan = relationship("Loan", back_populates="transactions")


class RiskExplanation(Base):
    """AI risk assessment explanations (SHAP values)"""
    __tablename__ = "risk_explanations"
    
    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(Integer, ForeignKey("loans.id"), nullable=False)
    
    # Explanation Data
    feature_name = Column(String(100), nullable=False)
    feature_value = Column(Float, nullable=False)
    shap_value = Column(Float, nullable=False)
    impact_description = Column(Text, nullable=True)
    
    # Metadata
    model_version = Column(String(50), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    loan = relationship("Loan", back_populates="risk_explanations")


class AuditLog(Base):
    """Comprehensive audit trail"""
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    loan_id = Column(Integer, ForeignKey("loans.id"), nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Audit Details
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(100), nullable=True)
    
    # Changes
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    
    # Context
    ip_address = Column(String(50), nullable=True)
    user_agent = Column(String(255), nullable=True)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    loan = relationship("Loan", back_populates="audit_logs")


class AIModel(Base):
    """AI model version tracking"""
    __tablename__ = "ai_models"
    
    id = Column(Integer, primary_key=True, index=True)
    model_name = Column(String(100), nullable=False)
    version = Column(String(50), nullable=False, unique=True)
    model_type = Column(String(50), nullable=False)  # e.g., "risk_assessment", "pricing"
    
    # Model Metadata
    file_path = Column(String(255), nullable=False)
    hyperparameters = Column(Text, nullable=True)
    training_metrics = Column(Text, nullable=True)
    
    # Status
    is_active = Column(Boolean, default=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    deprecated_at = Column(DateTime(timezone=True), nullable=True)
