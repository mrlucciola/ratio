use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount};
use std::convert::Into;

declare_id!("6cDMc7baVfghT4sUx1t3sEfohxXyj4XwDr8pbarQfz1z");

#[program]
pub mod ratio {
    use super::*;

    pub fn initialize_pool(
        ctx: Context<InitializePool>,
        pool_nonce: u8,
    ) -> Result<()> {

        // token lockup
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            token::Transfer {
                from: ctx.accounts.token_depositor.to_account_info(),
                to: ctx.accounts.token_pool_vault.to_account_info(),
                authority: ctx.accounts.token_deposit_authority.to_account_info(),
            },
        );
        token::transfer(cpi_ctx, 0)?;

        let pool = &mut ctx.accounts.pool;

        pool.authority = ctx.accounts.authority.key();
        pool.nonce = pool_nonce;
        pool.token_pool_vault = ctx.accounts.token_pool_vault.key();
        
        Ok(())
    }
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

#[derive(Accounts)]
#[instruction(pool_nonce: u8)]
pub struct InitializePool<'info> {
    authority: UncheckedAccount<'info>,

    #[account(
        mut,
        constraint = token_pool_vault.owner == pool_signer.key(),
    )]
    token_pool_vault: Box<Account<'info, TokenAccount>>,
    #[account(mut)]
    token_depositor: Box<Account<'info, TokenAccount>>,
    token_deposit_authority: Signer<'info>,

    #[account(seeds = [pool.to_account_info().key.as_ref()],bump = pool_nonce)]
    pool_signer: UncheckedAccount<'info>,

    #[account(zero)]
    pool: Box<Account<'info, Pool>>,

    token_program: Program<'info, Token>,
}

#[account]
#[derive(Default)]
pub struct Delegation {
    from: Pubkey,
    to: Pubkey,
    amount: u64,
    bank: Pubkey,
    nonce: u8,
    closed: bool,
}

#[error]
pub enum ErrorCode {
    #[msg("Insufficient funds to withdraw.")]
    InsufficientFundWithdraw,
    #[msg("Cannot deauthorize the primary pool authority.")]
    CannotDeauthorizePoolAuthority,
    #[msg("Authority not found for deauthorization.")]
    CannotDeauthorizeMissingAuthority,
}