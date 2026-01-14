# AI-Powered Transparent Loan Trading Platform

## Architecture Overview

This is an enterprise-grade loan trading platform that leverages:
- **NEAR blockchain** for immutable ownership and auditability
- **AI/ML models** for risk assessment and pricing with full explainability
- **FastAPI backend** for business logic orchestration
- **Next.js frontend** for enterprise-grade user experience

## System Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   Next.js UI    │ ◄────► │  FastAPI Backend │ ◄────► │  NEAR Blockchain │
│  (Enterprise)   │         │   (Python 3.11+) │         │   (Rust Smart   │
│                 │         │                  │         │    Contract)     │
└─────────────────┘         └──────────────────┘         └─────────────────┘
                                     │
                            ┌────────┴────────┐
                            │   PostgreSQL    │
                            │   (Data Store)  │
                            └─────────────────┘
```

## Domain Model

### Off-Chain (PostgreSQL)
- **Users**: Originators, Investors, Admins (RBAC)
- **Loans**: Loan details, risk scores, pricing data
- **Transactions**: Trade history with NEAR tx references
- **AI Metadata**: Model versions, explanations, audit logs

### On-Chain (NEAR)
- **LoanToken**: Ownership state, fractional shares
- **Lifecycle Events**: Creation, transfers, settlements

## Core Principles

1. **Transparency by Design**: All events auditable
2. **AI Explainability**: SHAP-based explanations for regulators
3. **Clear Separation**: Blockchain = ownership, Backend = logic, Frontend = UX
4. **Enterprise Standards**: Professional UI, strong typing, defensive programming

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Recharts for visualization

### Backend
- Python 3.11+
- FastAPI
- SQLAlchemy
- PostgreSQL
- Pydantic
- scikit-learn, XGBoost, SHAP

### Blockchain
- NEAR Protocol
- Rust (near-sdk)
- Event-based state management

### Security
- JWT authentication
- Role-based access control (RBAC)
- Input validation with Pydantic

## Project Structure

```
/loan-app
├── /frontend               # Next.js application
│   ├── /app               # App Router pages
│   ├── /components        # Reusable UI components
│   ├── /lib               # Utilities and helpers
│   └── /types             # TypeScript types
│
├── /backend               # FastAPI application
│   ├── /api               # API endpoints
│   ├── /core              # Core configuration
│   ├── /services          # Business logic services
│   ├── /ai                # AI/ML models and engines
│   ├── /models            # SQLAlchemy models
│   ├── /schemas           # Pydantic schemas
│   └── /db                # Database utilities
│
└── /blockchain            # NEAR smart contracts
    └── /near              # Rust smart contract
        ├── src/lib.rs     # Contract implementation
        └── Cargo.toml     # Rust dependencies
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL 14+
- Rust 1.70+ (for NEAR contract)
- NEAR CLI

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
alembic upgrade head

# Start server
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend
npm install

# Configure environment
cp .env.local.example .env.local

# Start development server
npm run dev
```

### NEAR Smart Contract Setup

```bash
cd blockchain/near

# Build contract
cargo build --target wasm32-unknown-unknown --release

# Deploy to testnet
near deploy --wasmFile target/wasm32-unknown-unknown/release/loan_trading.wasm --accountId YOUR_ACCOUNT.testnet
```

## API Documentation

Once the backend is running, visit:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Key Features

### 1. Loan Ingestion
- CSV upload with strict schema validation
- Async AI processing for risk and pricing
- Automatic loan tokenization

### 2. AI Risk Engine
- Probability of Default (PD)
- Expected Loss (EL)
- Risk grades (A-D)
- SHAP explanations for regulatory compliance

### 3. AI Pricing Engine
- Fair value estimation
- Yield to maturity calculations
- Stress scenario analysis

### 4. Marketplace
- Advanced filtering and sorting
- Side-by-side loan comparison
- Risk/yield visualization
- AI-based investor recommendations

### 5. Transaction Flow
- Fractional ownership trading
- NEAR blockchain settlement
- Real-time status tracking
- Immutable audit trail

### 6. Post-Trade Monitoring
- EMI tracking
- Anomaly detection
- Early warning system
- Portfolio health dashboard

### 7. Audit & Compliance
- Full lifecycle timeline
- On-chain event explorer
- AI explainability views
- Regulatory reporting

## Security Considerations

- All API endpoints protected with JWT
- Role-based access control enforced
- Input validation at all layers
- Sensitive data encrypted at rest
- Audit logs for all critical operations

## Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test

# Smart contract tests
cd blockchain/near
cargo test
```

## Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] SSL certificates installed
- [ ] NEAR mainnet contract deployed
- [ ] API rate limiting enabled
- [ ] Monitoring and alerting configured
- [ ] Backup strategy implemented

## Monitoring & Observability

- Application logs: Structured JSON logging
- Metrics: Prometheus-compatible endpoints
- Tracing: OpenTelemetry integration
- Health checks: `/health` and `/ready` endpoints

## Support & Maintenance

For issues and feature requests, please follow the established ticketing process.

## License

Proprietary - All Rights Reserved

