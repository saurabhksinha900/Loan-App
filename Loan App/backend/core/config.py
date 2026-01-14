from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application configuration settings"""
    
    # Database
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/loan_trading_db"
    
    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # NEAR Blockchain
    NEAR_NETWORK: str = "testnet"
    NEAR_CONTRACT_ID: str = "your-contract.testnet"
    NEAR_ACCOUNT_ID: str = "your-account.testnet"
    NEAR_PRIVATE_KEY: str = "your-private-key"
    
    # Application
    DEBUG: bool = True
    CORS_ORIGINS: List[str] = ["http://localhost:3000"]
    
    # AI Models
    AI_MODEL_PATH: str = "./ai/models"
    MODEL_VERSION: str = "1.0.0"
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
