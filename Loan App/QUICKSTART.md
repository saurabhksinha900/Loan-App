# Quick Start Guide

This guide will help you get the AI-Powered Loan Trading Platform up and running on your local machine.

## Prerequisites

Ensure you have the following installed:

- **Python 3.11+** (for backend)
- **Node.js 18+** (for frontend)
- **PostgreSQL 14+** (for database)
- **Rust 1.70+** (for NEAR smart contract, optional for local development)

## Step 1: Clone and Setup

```bash
cd "c:\Loan App"
```

## Step 2: Database Setup

### Create PostgreSQL Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE loan_trading_db;

# Exit psql
\q
```

### Update Database Connection

Edit `backend\.env` (copy from `.env.example`):

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/loan_trading_db
SECRET_KEY=your-secret-key-here-change-this-in-production
NEAR_CONTRACT_ID=your-contract.testnet
```

## Step 3: Backend Setup

### Install Python Dependencies

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### Generate Demo Data

```bash
python scripts\generate_demo_data.py
```

This creates:
- 5 demo users (1 admin, 2 originators, 2 investors)
- 7 sample loans with varying risk profiles
- AI model version tracking

### Start Backend Server

```bash
uvicorn main:app --reload --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Step 4: Frontend Setup

### Install Node Dependencies

```bash
cd ../frontend
npm install
```

### Configure Environment

Create `.env.local` (copy from `.env.local.example`):

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME=Loan Trading Platform
```

### Start Frontend

```bash
npm run dev
```

The UI will be available at: http://localhost:3000

## Step 5: Login and Explore

### Demo Credentials

**Admin Account:**
- Username: `admin`
- Password: `admin123`

**Originator Account:**
- Username: `originator1`
- Password: `originator123`

**Investor Account:**
- Username: `investor1`
- Password: `investor123`

### Key Features to Test

1. **Loan Ingestion** (Originator)
   - Navigate to "My Loans"
   - Upload new loan or use bulk upload
   - Watch AI processing in real-time

2. **Marketplace** (Investor)
   - Browse available loans
   - Filter by risk grade, yield, principal
   - View AI risk explanations

3. **Transactions** (Investor)
   - Initiate purchase of loan fraction
   - View blockchain settlement status

4. **Admin Dashboard** (Admin)
   - View all users and loans
   - Access audit logs
   - Monitor AI model versions

## Step 6: NEAR Smart Contract (Optional)

### Build Contract

```bash
cd ../blockchain/near
cargo build --target wasm32-unknown-unknown --release
```

### Deploy to Testnet

```bash
# Install NEAR CLI
npm install -g near-cli

# Login to NEAR testnet
near login

# Deploy contract
near deploy --wasmFile target/wasm32-unknown-unknown/release/loan_trading_contract.wasm --accountId YOUR_ACCOUNT.testnet

# Initialize contract
near call YOUR_ACCOUNT.testnet new '{"admin": "YOUR_ACCOUNT.testnet"}' --accountId YOUR_ACCOUNT.testnet
```

### Update Backend Configuration

Update `backend\.env`:

```env
NEAR_CONTRACT_ID=YOUR_ACCOUNT.testnet
NEAR_ACCOUNT_ID=YOUR_ACCOUNT.testnet
```

## Troubleshooting

### Backend Won't Start

**Database Connection Error:**
```bash
# Check PostgreSQL is running
pg_isready

# Verify connection string in .env
```

**Module Import Errors:**
```bash
# Ensure virtual environment is activated
pip install -r requirements.txt --upgrade
```

### Frontend Won't Start

**Port Already in Use:**
```bash
# Use different port
npm run dev -- -p 3001
```

**API Connection Error:**
```bash
# Verify backend is running at http://localhost:8000
# Check NEXT_PUBLIC_API_URL in .env.local
```

### AI Models Not Loading

```bash
# Regenerate models
cd backend
python -c "from ai.risk_engine import initialize_risk_model; from pathlib import Path; initialize_risk_model(Path('./ai/models'))"
```

## Next Steps

1. **Read Full Documentation**: See `README.md` for architecture details
2. **Explore API**: Visit http://localhost:8000/docs for interactive API docs
3. **Customize**: Modify AI models, add new features, adjust UI
4. **Deploy**: Follow deployment guides for production setup

## Support

For issues or questions:
- Check the main `README.md`
- Review API documentation at `/docs`
- Examine log files for error details

## Security Notes

⚠️ **Important for Production:**

1. Change all default passwords
2. Generate strong `SECRET_KEY` in `.env`
3. Use environment-specific database credentials
4. Enable HTTPS/SSL
5. Configure proper CORS origins
6. Set up rate limiting
7. Implement backup strategy
8. Enable monitoring and alerting

---

**You're all set!** The platform should now be running locally. Start exploring the features and building on top of this foundation.
