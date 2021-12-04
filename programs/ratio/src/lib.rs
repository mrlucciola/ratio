use anchor_lang::prelude::*;
use anchor_lang::solana_program::program_option::COption;
use anchor_spl::token::{self, Burn, Mint, MintTo, TokenAccount, Transfer};

declare_id!("6cDMc7baVfghT4sUx1t3sEfohxXyj4XwDr8pbarQfz1z");

#[program]
pub mod ratio {
    use super::*;
    pub fn initialize(ctx: Context<InitializePool>) -> ProgramResult {
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