use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_option::COption;
use anchor_spl::token::{self, Burn, Mint, MintTo, TokenAccount, Transfer};

declare_id!("6cDMc7baVfghT4sUx1t3sEfohxXyj4XwDr8pbarQfz1z");

#[program]
pub mod ratio {
    use super::*;
    pub fn initialize_pool(ctx: Context<InitializePool>) -> ProgramResult {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePool {}

#[account]
pub struct PoolAccount {
    pub pool_token: Pubkey,
    pub distribution_authority: Pubkey,
    pub nonce: u8,
}

#[account]
pub struct Pool {
    /// Priviledged account.
    pub authority: Pubkey,
    /// Nonce to derive the program-derived address owning the vaults.
    pub nonce: u8,
    /// The vault holding users' token
    pub token_pool_vault: Pubkey,
}