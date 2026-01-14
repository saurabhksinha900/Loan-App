// User types
export enum UserRole {
  ORIGINATOR = 'ORIGINATOR',
  INVESTOR = 'INVESTOR',
  ADMIN = 'ADMIN',
}

export interface User {
  id: number
  email: string
  username: string
  full_name: string
  role: UserRole
  near_account_id?: string
  is_active: boolean
  created_at: string
  updated_at?: string
}

// Loan types
export enum LoanStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SETTLED = 'SETTLED',
  DEFAULTED = 'DEFAULTED',
  RESTRUCTURED = 'RESTRUCTURED',
}

export enum RiskGrade {
  A = 'A',
  B = 'B',
  C = 'C',
  D = 'D',
}

export interface Loan {
  id: number
  loan_id: string
  originator_id: number
  principal: number
  interest_rate: number
  tenure_months: number
  monthly_emi: number
  borrower_credit_score?: number
  borrower_income?: number
  borrower_employment_type?: string
  loan_purpose?: string
  current_outstanding: number
  emis_paid: number
  emis_missed: number
  risk_score?: number
  expected_loss?: number
  risk_grade?: RiskGrade
  suggested_price?: number
  yield_to_maturity?: number
  on_chain_token_id?: string
  status: LoanStatus
  model_version?: string
  last_assessment_at?: string
  created_at: string
  updated_at?: string
}

export interface LoanDetail extends Loan {
  originator: User
  risk_explanations: RiskExplanation[]
  transactions: Transaction[]
}

// Transaction types
export enum TransactionStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

export interface Transaction {
  id: number
  transaction_id: string
  buyer_id: number
  seller_id: number
  loan_id: number
  loan_token_id: string
  fraction: number
  price: number
  near_tx_hash?: string
  block_height?: number
  status: TransactionStatus
  initiated_at: string
  confirmed_at?: string
}

// Risk explanation types
export interface RiskExplanation {
  id: number
  loan_id: number
  feature_name: string
  feature_value: number
  shap_value: number
  impact_description?: string
  model_version: string
  created_at: string
}

export interface RiskExplanationSummary {
  loan_id: number
  overall_risk_score: number
  risk_grade: RiskGrade
  top_risk_factors: RiskFactor[]
  top_protective_factors: RiskFactor[]
  model_version: string
}

export interface RiskFactor {
  feature: string
  value: number
  impact: number
  description: string
}

// Marketplace types
export interface MarketplaceLoan {
  loan_id: string
  principal: number
  interest_rate: number
  tenure_months: number
  risk_score: number
  risk_grade: RiskGrade
  suggested_price: number
  yield_to_maturity: number
  current_outstanding: number
  emis_paid: number
  emis_missed: number
  originator_name: string
  status: LoanStatus
}

export interface MarketplaceFilter {
  min_principal?: number
  max_principal?: number
  min_interest_rate?: number
  max_interest_rate?: number
  risk_grades?: RiskGrade[]
  min_yield?: number
  max_yield?: number
  status?: LoanStatus[]
}

// Auth types
export interface LoginRequest {
  username: string
  password: string
}

export interface RegisterRequest {
  email: string
  username: string
  password: string
  full_name: string
  role: UserRole
  near_account_id?: string
}

export interface AuthToken {
  access_token: string
  token_type: string
}

// API response types
export interface ApiError {
  detail: string
}

export interface HealthCheck {
  status: string
  version: string
  database: string
  near_contract?: string
}
