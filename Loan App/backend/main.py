from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from pathlib import Path
import logging

from core.config import settings
from core.database import get_db, init_db, Base, engine
from core.security import verify_password, create_access_token, decode_access_token
from models.models import User, UserRole
from schemas.schemas import (
    UserCreate, UserResponse, Token, HealthCheck,
    LoanCreate, LoanResponse, LoanDetailResponse, LoanBulkUpload,
    TransactionInitiate, TransactionResponse,
    MarketplaceFilter, MarketplaceLoanResponse,
    RiskExplanationSummary
)
from ai.risk_engine import initialize_risk_model
from ai.pricing_engine import initialize_pricing_engine
from services.loan_service import LoanService
from api import auth, loans, transactions, marketplace, admin

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="AI-Powered Loan Trading Platform",
    description="Enterprise-grade loan trading platform with AI risk assessment and NEAR blockchain integration",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
logger.info("Initializing database...")
Base.metadata.create_all(bind=engine)

# Initialize AI engines
logger.info("Initializing AI engines...")
model_path = Path(settings.AI_MODEL_PATH)
model_path.mkdir(parents=True, exist_ok=True)

risk_engine = initialize_risk_model(model_path, settings.MODEL_VERSION)
pricing_engine = initialize_pricing_engine()

# Initialize services
loan_service = LoanService(risk_engine, pricing_engine)

# Make services available globally
app.state.loan_service = loan_service
app.state.risk_engine = risk_engine
app.state.pricing_engine = pricing_engine


# ============================================================================
# HEALTH CHECK
# ============================================================================

@app.get("/health", response_model=HealthCheck)
async def health_check(db: Session = Depends(get_db)):
    """Health check endpoint"""
    try:
        # Test database connection
        db.execute("SELECT 1")
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"
    
    return HealthCheck(
        status="healthy" if db_status == "healthy" else "degraded",
        version="1.0.0",
        database=db_status,
        near_contract=settings.NEAR_CONTRACT_ID
    )


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "AI-Powered Loan Trading Platform API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(loans.router, prefix="/api/loans", tags=["Loans"])
app.include_router(transactions.router, prefix="/api/transactions", tags=["Transactions"])
app.include_router(marketplace.router, prefix="/api/marketplace", tags=["Marketplace"])
app.include_router(admin.router, prefix="/api/admin", tags=["Admin"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
