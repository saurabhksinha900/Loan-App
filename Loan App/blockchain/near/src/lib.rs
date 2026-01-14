use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedMap};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, near_bindgen, AccountId, Balance, PanicOnDefault, Timestamp};
use std::collections::HashMap;

// ============================================================================
// DOMAIN MODELS
// ============================================================================

/// Lifecycle status of a loan token
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, PartialEq, Debug)]
#[serde(crate = "near_sdk::serde")]
pub enum LifecycleStatus {
    Active,
    Settled,
    Defaulted,
    Restructured,
}

/// Fractional ownership record
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct FractionalOwnership {
    pub owner: AccountId,
    pub fraction: u64, // Basis points (10000 = 100%)
}

/// Loan token representing on-chain ownership
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct LoanToken {
    pub token_id: String,
    pub off_chain_loan_id: String,
    pub total_value: Balance, // in yoctoNEAR
    pub owners: Vec<FractionalOwnership>,
    pub lifecycle_status: LifecycleStatus,
    pub created_at: Timestamp,
    pub updated_at: Timestamp,
    pub originator: AccountId,
}

/// Transfer event record for audit trail
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct TransferEvent {
    pub token_id: String,
    pub from: AccountId,
    pub to: AccountId,
    pub fraction: u64,
    pub price: Balance,
    pub timestamp: Timestamp,
    pub block_height: u64,
}

// ============================================================================
// SMART CONTRACT
// ============================================================================

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct LoanTradingContract {
    /// Map token_id -> LoanToken
    pub loan_tokens: UnorderedMap<String, LoanToken>,
    
    /// Transfer history for audit
    pub transfer_history: UnorderedMap<String, Vec<TransferEvent>>,
    
    /// Authorized originators (can register loans)
    pub authorized_originators: LookupMap<AccountId, bool>,
    
    /// Admin account
    pub admin: AccountId,
    
    /// Contract metadata
    pub version: String,
}

// ============================================================================
// IMPLEMENTATION
// ============================================================================

#[near_bindgen]
impl LoanTradingContract {
    /// Initialize the contract
    #[init]
    pub fn new(admin: AccountId) -> Self {
        assert!(!env::state_exists(), "Contract already initialized");
        
        Self {
            loan_tokens: UnorderedMap::new(b"l"),
            transfer_history: UnorderedMap::new(b"t"),
            authorized_originators: LookupMap::new(b"o"),
            admin,
            version: "1.0.0".to_string(),
        }
    }

    // ------------------------------------------------------------------------
    // ADMIN FUNCTIONS
    // ------------------------------------------------------------------------

    /// Add an authorized originator
    pub fn authorize_originator(&mut self, originator: AccountId) {
        self.assert_admin();
        self.authorized_originators.insert(&originator, &true);
        
        env::log_str(&format!(
            "EVENT:ORIGINATOR_AUTHORIZED {{\"originator\": \"{}\", \"by\": \"{}\", \"timestamp\": {}}}",
            originator,
            env::predecessor_account_id(),
            env::block_timestamp()
        ));
    }

    /// Remove an authorized originator
    pub fn revoke_originator(&mut self, originator: AccountId) {
        self.assert_admin();
        self.authorized_originators.remove(&originator);
        
        env::log_str(&format!(
            "EVENT:ORIGINATOR_REVOKED {{\"originator\": \"{}\", \"by\": \"{}\", \"timestamp\": {}}}",
            originator,
            env::predecessor_account_id(),
            env::block_timestamp()
        ));
    }

    // ------------------------------------------------------------------------
    // LOAN TOKEN REGISTRATION
    // ------------------------------------------------------------------------

    /// Register a new loan token (only authorized originators)
    #[payable]
    pub fn register_loan_token(
        &mut self,
        token_id: String,
        off_chain_loan_id: String,
        total_value: Balance,
    ) -> LoanToken {
        let originator = env::predecessor_account_id();
        
        // Verify authorization
        assert!(
            self.authorized_originators.get(&originator).is_some(),
            "Originator not authorized"
        );
        
        // Verify token doesn't exist
        assert!(
            self.loan_tokens.get(&token_id).is_none(),
            "Token ID already exists"
        );
        
        // Validate inputs
        assert!(total_value > 0, "Total value must be positive");
        assert!(!token_id.is_empty(), "Token ID cannot be empty");
        assert!(!off_chain_loan_id.is_empty(), "Off-chain loan ID cannot be empty");
        
        let now = env::block_timestamp();
        
        // Create loan token with 100% ownership to originator
        let loan_token = LoanToken {
            token_id: token_id.clone(),
            off_chain_loan_id: off_chain_loan_id.clone(),
            total_value,
            owners: vec![FractionalOwnership {
                owner: originator.clone(),
                fraction: 10000, // 100%
            }],
            lifecycle_status: LifecycleStatus::Active,
            created_at: now,
            updated_at: now,
            originator: originator.clone(),
        };
        
        self.loan_tokens.insert(&token_id, &loan_token);
        self.transfer_history.insert(&token_id, &vec![]);
        
        env::log_str(&format!(
            "EVENT:LOAN_TOKEN_REGISTERED {{\"token_id\": \"{}\", \"off_chain_loan_id\": \"{}\", \"total_value\": \"{}\", \"originator\": \"{}\", \"timestamp\": {}}}",
            token_id,
            off_chain_loan_id,
            total_value,
            originator,
            now
        ));
        
        loan_token
    }

    // ------------------------------------------------------------------------
    // OWNERSHIP TRANSFER
    // ------------------------------------------------------------------------

    /// Transfer fractional ownership
    #[payable]
    pub fn transfer_fractional_ownership(
        &mut self,
        token_id: String,
        to: AccountId,
        fraction: u64,
        price: Balance,
    ) {
        let from = env::predecessor_account_id();
        
        // Get loan token
        let mut loan_token = self.loan_tokens
            .get(&token_id)
            .expect("Loan token not found");
        
        // Verify loan is active
        assert_eq!(
            loan_token.lifecycle_status,
            LifecycleStatus::Active,
            "Loan must be active for transfers"
        );
        
        // Validate fraction
        assert!(fraction > 0 && fraction <= 10000, "Invalid fraction");
        
        // Find sender's ownership
        let sender_index = loan_token.owners
            .iter()
            .position(|o| o.owner == from)
            .expect("Sender does not own any fraction");
        
        let sender_fraction = loan_token.owners[sender_index].fraction;
        assert!(sender_fraction >= fraction, "Insufficient ownership fraction");
        
        // Update sender's fraction
        if sender_fraction == fraction {
            // Remove sender if selling entire fraction
            loan_token.owners.remove(sender_index);
        } else {
            // Reduce sender's fraction
            loan_token.owners[sender_index].fraction -= fraction;
        }
        
        // Add or update receiver's fraction
        if let Some(receiver_index) = loan_token.owners.iter().position(|o| o.owner == to) {
            loan_token.owners[receiver_index].fraction += fraction;
        } else {
            loan_token.owners.push(FractionalOwnership {
                owner: to.clone(),
                fraction,
            });
        }
        
        // Update timestamp
        loan_token.updated_at = env::block_timestamp();
        
        // Save updated token
        self.loan_tokens.insert(&token_id, &loan_token);
        
        // Record transfer event
        let transfer_event = TransferEvent {
            token_id: token_id.clone(),
            from: from.clone(),
            to: to.clone(),
            fraction,
            price,
            timestamp: env::block_timestamp(),
            block_height: env::block_height(),
        };
        
        let mut history = self.transfer_history
            .get(&token_id)
            .unwrap_or_else(|| vec![]);
        history.push(transfer_event);
        self.transfer_history.insert(&token_id, &history);
        
        env::log_str(&format!(
            "EVENT:OWNERSHIP_TRANSFERRED {{\"token_id\": \"{}\", \"from\": \"{}\", \"to\": \"{}\", \"fraction\": {}, \"price\": \"{}\", \"timestamp\": {}}}",
            token_id,
            from,
            to,
            fraction,
            price,
            env::block_timestamp()
        ));
    }

    // ------------------------------------------------------------------------
    // LIFECYCLE MANAGEMENT
    // ------------------------------------------------------------------------

    /// Update loan lifecycle status (originator only)
    pub fn update_lifecycle_status(
        &mut self,
        token_id: String,
        new_status: LifecycleStatus,
    ) {
        let caller = env::predecessor_account_id();
        
        let mut loan_token = self.loan_tokens
            .get(&token_id)
            .expect("Loan token not found");
        
        // Only originator can update status
        assert_eq!(
            caller, loan_token.originator,
            "Only originator can update lifecycle status"
        );
        
        let old_status = loan_token.lifecycle_status.clone();
        loan_token.lifecycle_status = new_status.clone();
        loan_token.updated_at = env::block_timestamp();
        
        self.loan_tokens.insert(&token_id, &loan_token);
        
        env::log_str(&format!(
            "EVENT:LIFECYCLE_UPDATED {{\"token_id\": \"{}\", \"old_status\": \"{:?}\", \"new_status\": \"{:?}\", \"timestamp\": {}}}",
            token_id,
            old_status,
            new_status,
            env::block_timestamp()
        ));
    }

    // ------------------------------------------------------------------------
    // QUERY FUNCTIONS
    // ------------------------------------------------------------------------

    /// Get loan token details
    pub fn get_loan_token(&self, token_id: String) -> Option<LoanToken> {
        self.loan_tokens.get(&token_id)
    }

    /// Get ownership breakdown
    pub fn get_ownership_breakdown(&self, token_id: String) -> Vec<FractionalOwnership> {
        self.loan_tokens
            .get(&token_id)
            .map(|token| token.owners)
            .unwrap_or_else(|| vec![])
    }

    /// Get transfer history
    pub fn get_transfer_history(&self, token_id: String) -> Vec<TransferEvent> {
        self.transfer_history
            .get(&token_id)
            .unwrap_or_else(|| vec![])
    }

    /// Get all tokens for an owner
    pub fn get_tokens_for_owner(&self, owner: AccountId) -> Vec<LoanToken> {
        self.loan_tokens
            .values()
            .filter(|token| {
                token.owners.iter().any(|o| o.owner == owner)
            })
            .collect()
    }

    /// Check if account is authorized originator
    pub fn is_authorized_originator(&self, account: AccountId) -> bool {
        self.authorized_originators.get(&account).is_some()
    }

    /// Get contract version
    pub fn get_version(&self) -> String {
        self.version.clone()
    }

    // ------------------------------------------------------------------------
    // INTERNAL HELPERS
    // ------------------------------------------------------------------------

    fn assert_admin(&self) {
        assert_eq!(
            env::predecessor_account_id(),
            self.admin,
            "Only admin can perform this action"
        );
    }
}

// ============================================================================
// TESTS
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::testing_env;

    fn get_context(predecessor: AccountId) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder.predecessor_account_id(predecessor);
        builder
    }

    #[test]
    fn test_contract_initialization() {
        let context = get_context(accounts(0));
        testing_env!(context.build());
        
        let contract = LoanTradingContract::new(accounts(0));
        assert_eq!(contract.admin, accounts(0));
        assert_eq!(contract.version, "1.0.0");
    }

    #[test]
    fn test_authorize_originator() {
        let mut context = get_context(accounts(0));
        testing_env!(context.build());
        
        let mut contract = LoanTradingContract::new(accounts(0));
        contract.authorize_originator(accounts(1));
        
        assert!(contract.is_authorized_originator(accounts(1)));
    }

    #[test]
    fn test_register_loan_token() {
        let mut context = get_context(accounts(0));
        testing_env!(context.build());
        
        let mut contract = LoanTradingContract::new(accounts(0));
        contract.authorize_originator(accounts(1));
        
        context.predecessor_account_id(accounts(1));
        testing_env!(context.build());
        
        let token = contract.register_loan_token(
            "LOAN-001".to_string(),
            "OFF-CHAIN-001".to_string(),
            1000000,
        );
        
        assert_eq!(token.token_id, "LOAN-001");
        assert_eq!(token.owners.len(), 1);
        assert_eq!(token.owners[0].fraction, 10000);
    }

    #[test]
    fn test_transfer_fractional_ownership() {
        let mut context = get_context(accounts(0));
        testing_env!(context.build());
        
        let mut contract = LoanTradingContract::new(accounts(0));
        contract.authorize_originator(accounts(1));
        
        context.predecessor_account_id(accounts(1));
        testing_env!(context.build());
        
        contract.register_loan_token(
            "LOAN-001".to_string(),
            "OFF-CHAIN-001".to_string(),
            1000000,
        );
        
        // Transfer 25% to accounts(2)
        contract.transfer_fractional_ownership(
            "LOAN-001".to_string(),
            accounts(2),
            2500,
            250000,
        );
        
        let token = contract.get_loan_token("LOAN-001".to_string()).unwrap();
        assert_eq!(token.owners.len(), 2);
        
        let owner1 = token.owners.iter().find(|o| o.owner == accounts(1)).unwrap();
        let owner2 = token.owners.iter().find(|o| o.owner == accounts(2)).unwrap();
        
        assert_eq!(owner1.fraction, 7500); // 75%
        assert_eq!(owner2.fraction, 2500); // 25%
    }
}
