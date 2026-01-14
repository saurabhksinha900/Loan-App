from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from models.models import UserRole, LoanStatus, RiskGrade, TransactionStatus


# ============================================================================
# USER SCHEMAS
# ============================================================================

class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    full_name: str = Field(..., min_length=1, max_length=255)
    role: UserRole
    near_account_id: Optional[str] = None


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    near_account_id: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ============================================================================
# AUTH SCHEMAS
# ============================================================================

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenPayload(BaseModel):
    sub: Optional[int] = None
    role: Optional[str] = None


class LoginRequest(BaseModel):
    username: str
    password: str


# ============================================================================
# LOAN SCHEMAS
# ============================================================================

class LoanBase(BaseModel):
    principal: float = Field(..., gt=0)
    interest_rate: float = Field(..., gt=0, lt=100)
    tenure_months: int = Field(..., gt=0)
    monthly_emi: float = Field(..., gt=0)
    borrower_credit_score: Optional[int] = Field(None, ge=300, le=850)
    borrower_income: Optional[float] = Field(None, gt=0)
    borrower_employment_type: Optional[str] = None
    loan_purpose: Optional[str] = None
    current_outstanding: float = Field(..., gt=0)
    emis_paid: int = Field(default=0, ge=0)
    emis_missed: int = Field(default=0, ge=0)


class LoanCreate(LoanBase):
    loan_id: str = Field(..., min_length=1, max_length=100)


class LoanBulkUpload(BaseModel):
    loans: List[LoanCreate]


class LoanUpdate(BaseModel):
    status: Optional[LoanStatus] = None
    emis_paid: Optional[int] = None
    emis_missed: Optional[int] = None
    current_outstanding: Optional[float] = None


class RiskAssessment(BaseModel):
    risk_score: float = Field(..., ge=0, le=1)
    expected_loss: float = Field(..., ge=0)
    risk_grade: RiskGrade
    model_version: str


class PricingData(BaseModel):
    suggested_price: float = Field(..., gt=0)
    yield_to_maturity: float
    discount_rate: float
    assumptions: dict


class LoanResponse(LoanBase):
    id: int
    loan_id: str
    originator_id: int
    risk_score: Optional[float] = None
    expected_loss: Optional[float] = None
    risk_grade: Optional[RiskGrade] = None
    suggested_price: Optional[float] = None
    yield_to_maturity: Optional[float] = None
    on_chain_token_id: Optional[str] = None
    status: LoanStatus
    model_version: Optional[str] = None
    last_assessment_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class LoanDetailResponse(LoanResponse):
    originator: UserResponse
    risk_explanations: List["RiskExplanationResponse"] = []
    transactions: List["TransactionResponse"] = []


# ============================================================================
# TRANSACTION SCHEMAS
# ============================================================================

class TransactionBase(BaseModel):
    loan_token_id: str
    fraction: int = Field(..., gt=0, le=10000)  # Basis points
    price: float = Field(..., gt=0)


class TransactionCreate(TransactionBase):
    buyer_id: int
    seller_id: int
    loan_id: int


class TransactionInitiate(BaseModel):
    loan_id: int
    fraction: int = Field(..., gt=0, le=10000)
    price: float = Field(..., gt=0)


class TransactionResponse(TransactionBase):
    id: int
    transaction_id: str
    buyer_id: int
    seller_id: int
    loan_id: int
    near_tx_hash: Optional[str] = None
    block_height: Optional[int] = None
    status: TransactionStatus
    initiated_at: datetime
    confirmed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True


# ============================================================================
# RISK EXPLANATION SCHEMAS
# ============================================================================

class RiskExplanationResponse(BaseModel):
    id: int
    loan_id: int
    feature_name: str
    feature_value: float
    shap_value: float
    impact_description: Optional[str] = None
    model_version: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class RiskExplanationSummary(BaseModel):
    loan_id: int
    overall_risk_score: float
    risk_grade: RiskGrade
    top_risk_factors: List[dict]
    top_protective_factors: List[dict]
    model_version: str


# ============================================================================
# MARKETPLACE SCHEMAS
# ============================================================================

class MarketplaceFilter(BaseModel):
    min_principal: Optional[float] = None
    max_principal: Optional[float] = None
    min_interest_rate: Optional[float] = None
    max_interest_rate: Optional[float] = None
    risk_grades: Optional[List[RiskGrade]] = None
    min_yield: Optional[float] = None
    max_yield: Optional[float] = None
    status: Optional[List[LoanStatus]] = None


class MarketplaceLoanResponse(BaseModel):
    loan_id: str
    principal: float
    interest_rate: float
    tenure_months: int
    risk_score: float
    risk_grade: RiskGrade
    suggested_price: float
    yield_to_maturity: float
    current_outstanding: float
    emis_paid: int
    emis_missed: int
    originator_name: str
    status: LoanStatus


# ============================================================================
# AUDIT SCHEMAS
# ============================================================================

class AuditLogResponse(BaseModel):
    id: int
    action: str
    entity_type: str
    entity_id: Optional[str] = None
    old_value: Optional[str] = None
    new_value: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============================================================================
# AI MODEL SCHEMAS
# ============================================================================

class AIModelResponse(BaseModel):
    id: int
    model_name: str
    version: str
    model_type: str
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True


# ============================================================================
# HEALTH CHECK SCHEMA
# ============================================================================

class HealthCheck(BaseModel):
    status: str
    version: str
    database: str
    near_contract: Optional[str] = None


# Update forward references
LoanDetailResponse.model_rebuild()
