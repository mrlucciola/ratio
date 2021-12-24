use anchor_lang::prelude::*;
pub use anchor_lang::Discriminator;
use anchor_spl::token::{Mint, Token, TokenAccount};
// local
use crate::states::Pool;

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(seeds=[&Pool::discriminator()[..], currency_mint.key().as_ref()], bump=pool.bump)]
    pub pool: Account<'info, Pool>,
    #[account(mut, constraint= pool_currency.mint == pool.currency_mint)]
    pub pool_currency: Account<'info, TokenAccount>,
    #[account(mut, address=pool.currency_mint)]
    pub currency_mint: Account<'info, Mint>,
    #[account(mut, constraint= user_currency.mint == pool.currency_mint)]
    pub user_currency: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
    #[account(mut)]
    pub payer: Signer<'info>,
}
