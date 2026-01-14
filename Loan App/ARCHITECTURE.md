# Architecture Documentation

## System Overview

The AI-Powered Loan Trading Platform is a three-tier enterprise application that combines:

1. **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
2. **Backend**: FastAPI with Python 3.11+, PostgreSQL, SQLAlchemy
3. **Blockchain**: NEAR Protocol smart contracts in Rust

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                       │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Next.js Frontend (TypeScript)                │  │
│  │  - App Router for routing                                 │  │
│  │  - Enterprise UI components (Tables, Charts, Filters)     │  │
│  │  - Axios for API communication                            │  │
│  │  - Tailwind CSS for styling                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS/REST
┌─────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                         │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              FastAPI Backend (Python)                     │  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  API Endpoints (/api/*)                             │ │  │
│  │  │  - Authentication (JWT)                             │ │  │
│  │  │  - Loans CRUD                                        │ │  │
│  │  │  - Marketplace search & recommendations              │ │  │
│  │  │  - Transactions                                      │ │  │
│  │  │  - Admin operations                                  │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  Business Logic Services                            │ │  │
│  │  │  - LoanService (orchestration)                      │ │  │
│  │  │  - NEARService (blockchain integration)             │ │  │
│  │  │  - AuthService (RBAC)                               │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  │                                                            │  │
│  │  ┌─────────────────────────────────────────────────────┐ │  │
│  │  │  AI/ML Engines                                       │ │  │
│  │  │  - RiskAssessmentEngine (Logistic Regression)       │ │  │
│  │  │  - PricingEngine (DCF, YTM calculations)            │ │  │
│  │  │  - SHAP Explainer                                    │ │  │
│  │  └─────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↕ SQL
┌─────────────────────────────────────────────────────────────────┐
│                          DATA LAYER                              │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              PostgreSQL Database                          │  │
│  │                                                            │  │
│  │  Tables:                                                   │  │
│  │  - users (auth, RBAC)                                     │  │
│  │  - loans (loan details, risk scores, pricing)             │  │
│  │  - transactions (trade history)                           │  │
│  │  - risk_explanations (SHAP values)                        │  │
│  │  - audit_logs (compliance trail)                          │  │
│  │  - ai_models (version tracking)                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       BLOCKCHAIN LAYER                           │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           NEAR Protocol Smart Contract (Rust)             │  │
│  │                                                            │  │
│  │  Functions:                                                │  │
│  │  - register_loan_token()                                  │  │
│  │  - transfer_fractional_ownership()                        │  │
│  │  - update_lifecycle_status()                              │  │
│  │  - get_loan_token()                                       │  │
│  │  - get_ownership_breakdown()                              │  │
│  │  - get_transfer_history()                                 │  │
│  │                                                            │  │
│  │  State:                                                    │  │
│  │  - loan_tokens: Map<TokenId, LoanToken>                  │  │
│  │  - transfer_history: Map<TokenId, Vec<TransferEvent>>    │  │
│  │  - authorized_originators: Set<AccountId>                │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Breakdown

### Frontend Architecture

**Technology Stack:**
- Next.js 14 (App Router)
- TypeScript for type safety
- Tailwind CSS for styling
- Axios for HTTP requests
- Recharts for data visualization

**Key Directories:**
```
frontend/
├── app/                    # Next.js app router pages
│   ├── page.tsx           # Home page
│   ├── layout.tsx         # Root layout
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── Badge.tsx          # Status and risk badges
│   └── Table.tsx          # Data table components
├── lib/                   # Utilities
│   ├── api.ts            # API client
│   └── utils.ts          # Helper functions
└── types/                # TypeScript types
    └── index.ts          # Domain types
```

**Design Principles:**
- Enterprise-grade professional UI
- Data-heavy tables with sorting and filtering
- Minimal, clean design (Bloomberg-style)
- Responsive but desktop-first
- Strong typing everywhere

### Backend Architecture

**Technology Stack:**
- FastAPI (async Python web framework)
- SQLAlchemy (ORM)
- PostgreSQL (database)
- Pydantic (validation)
- scikit-learn, XGBoost (ML)
- SHAP (explainability)

**Key Directories:**
```
backend/
├── api/                   # API endpoints
│   ├── auth.py           # Authentication & authorization
│   ├── loans.py          # Loan management
│   ├── marketplace.py    # Loan discovery
│   ├── transactions.py   # Trading
│   └── admin.py          # Admin operations
├── core/                  # Core configuration
│   ├── config.py         # Settings
│   ├── database.py       # Database setup
│   └── security.py       # Auth utilities
├── models/               # SQLAlchemy models
│   └── models.py         # Database schema
├── schemas/              # Pydantic schemas
│   └── schemas.py        # Request/response models
├── services/             # Business logic
│   ├── loan_service.py   # Loan operations
│   └── near_service.py   # Blockchain integration
├── ai/                   # AI/ML engines
│   ├── risk_engine.py    # Risk assessment
│   └── pricing_engine.py # Pricing calculations
└── scripts/              # Utility scripts
    └── generate_demo_data.py
```

**API Design:**
- RESTful endpoints
- JWT authentication
- Role-based access control (RBAC)
- Comprehensive error handling
- OpenAPI/Swagger documentation

### Blockchain Architecture

**Technology Stack:**
- NEAR Protocol (Layer 1 blockchain)
- Rust with near-sdk
- Event-driven state management

**Smart Contract Design:**
```rust
LoanTradingContract {
    loan_tokens: UnorderedMap<TokenId, LoanToken>,
    transfer_history: UnorderedMap<TokenId, Vec<TransferEvent>>,
    authorized_originators: LookupMap<AccountId, bool>,
    admin: AccountId
}
```

**Key Features:**
- Fractional ownership (basis points)
- Immutable transfer history
- Lifecycle status tracking
- Event emission for indexing

## Data Flow

### Loan Ingestion Flow

```
1. Originator uploads loan data (CSV or single)
   ↓
2. Backend validates schema (Pydantic)
   ↓
3. Loan persisted to PostgreSQL
   ↓
4. Async: AI Risk Assessment
   - Extract features
   - Predict PD, EL, Risk Grade
   - Generate SHAP explanations
   - Store in risk_explanations table
   ↓
5. Async: AI Pricing
   - Calculate fair value (DCF)
   - Compute yield to maturity
   - Store pricing data
   ↓
6. Register loan token on NEAR blockchain
   - Generate token_id
   - Call register_loan_token()
   - Store tx_hash
   ↓
7. Loan status → ACTIVE
   ↓
8. Available in marketplace
```

### Transaction Flow

```
1. Investor initiates purchase
   - Select loan
   - Specify fraction (basis points)
   - Set price
   ↓
2. Backend validates transaction
   - Check loan is ACTIVE
   - Verify seller ownership
   - Confirm NEAR accounts
   ↓
3. Create transaction record (PENDING)
   ↓
4. Call NEAR smart contract
   - transfer_fractional_ownership()
   - Update on-chain state
   ↓
5. Receive blockchain confirmation
   - Transaction hash
   - Block height
   ↓
6. Update transaction status (CONFIRMED)
   ↓
7. Emit success notification
```

## Security Architecture

### Authentication & Authorization

**JWT-based Authentication:**
- Access tokens with expiration
- HS256 algorithm
- Stored in localStorage (frontend)
- Bearer token in headers

**Role-Based Access Control (RBAC):**

| Role       | Permissions                                    |
|------------|------------------------------------------------|
| ORIGINATOR | Create/update own loans, view marketplace      |
| INVESTOR   | View marketplace, initiate transactions        |
| ADMIN      | Full read access, user management, audit logs  |

**Security Measures:**
1. Password hashing (bcrypt)
2. SQL injection prevention (SQLAlchemy ORM)
3. Input validation (Pydantic)
4. CORS configuration
5. Rate limiting (production)
6. HTTPS enforcement (production)

### Data Privacy

- Sensitive data encrypted at rest
- PII access logged in audit trail
- GDPR-compliant data retention
- Role-based data access

## AI/ML Architecture

### Risk Assessment Engine

**Model:**
- Logistic Regression (interpretable)
- Balanced class weights
- Standard scaling

**Features (10):**
1. principal
2. interest_rate
3. tenure_months
4. borrower_credit_score
5. borrower_income
6. emis_paid
7. emis_missed
8. current_outstanding
9. payment_ratio (derived)
10. outstanding_ratio (derived)

**Output:**
- Probability of Default (PD)
- Expected Loss (EL = PD × LGD × Outstanding)
- Risk Grade (A-D)

**Explainability:**
- SHAP (SHapley Additive exPlanations)
- Feature importance values
- Individual prediction breakdowns
- Regulatory compliance ready

### Pricing Engine

**Methodology:**
- Discounted Cash Flow (DCF)
- Risk-adjusted discount rate
- Survival probability modeling

**Formula:**
```
Discount Rate = Risk-Free Rate + Risk Grade Spread + Liquidity Premium + Individual Risk

NPV = Σ (Monthly EMI × Survival Probability) / (1 + Discount Rate)^t

YTM = IRR of cash flows
```

**Output:**
- Suggested fair value price
- Yield to maturity
- Stress test scenarios
- Pricing assumptions

## Scalability Considerations

### Current Architecture (MVP)

- Single server deployment
- Synchronous AI processing
- In-memory model loading
- Direct database queries

### Production Scaling Path

1. **Horizontal Scaling:**
   - Load balancer for API servers
   - Read replicas for PostgreSQL
   - Redis for session management

2. **Async Processing:**
   - Celery for background tasks
   - RabbitMQ/Redis as message broker
   - Separate AI processing workers

3. **Caching:**
   - Redis for API responses
   - CDN for static assets
   - Model prediction caching

4. **Database Optimization:**
   - Connection pooling
   - Query optimization
   - Partitioning large tables
   - TimescaleDB for time-series data

5. **Monitoring:**
   - Prometheus for metrics
   - Grafana for dashboards
   - ELK stack for logs
   - Sentry for error tracking

## Deployment Architecture

### Development
- Local PostgreSQL
- Local backend (uvicorn)
- Local frontend (Next.js dev server)
- NEAR testnet

### Production
- AWS/GCP/Azure cloud
- Kubernetes for orchestration
- Managed PostgreSQL (RDS/CloudSQL)
- CDN for frontend
- NEAR mainnet
- SSL/TLS everywhere

## Compliance & Auditability

### Audit Trail

Every critical operation logs:
- User ID
- Action type
- Entity modified
- Old/new values
- Timestamp
- IP address

### Regulatory Features

1. **AI Explainability:** SHAP values for all predictions
2. **Model Versioning:** Track which model version scored each loan
3. **Immutable History:** Blockchain for ownership changes
4. **Data Lineage:** Full trace from input to output
5. **Access Logs:** Who accessed what, when

### Reports

- Transaction history
- Risk assessment audit
- User activity logs
- Model performance metrics
- Regulatory compliance reports

---

This architecture is designed for:
- **Transparency:** Every decision is explainable
- **Security:** Defense in depth
- **Scalability:** Clear path from MVP to enterprise
- **Compliance:** Regulatory requirements built-in
- **Maintainability:** Clean separation of concerns
