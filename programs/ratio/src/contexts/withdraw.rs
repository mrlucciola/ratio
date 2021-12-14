use anchor_lang::prelude::*;
pub use anchor_lang::Discriminator;
use anchor_spl::token::{TokenAccount, Mint, Token};
// local
use crate::states::{State, Pool};

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(seeds = [&State::discriminator()[..]], bump = state.bump)]
    pub state: Account<'info, State>,
    #[account(seeds = [&Pool::discriminator()[..], pool.usdc_mint.as_ref()], bump = pool.bump)]
    pub pool: Account<'info, Pool>,
    #[account(mut, address = pool.pool_usdc)]
    pub pool_usdc: Account<'info, TokenAccount>,
    #[account(mut, address = pool.redeemable_mint)]
    pub redeemable_mint: Account<'info, Mint>,
    #[account(mut, constraint = user_usdc.mint == pool.usdc_mint)]
    pub user_usdc: Account<'info, TokenAccount>,
    #[account(mut, constraint = user_redeemable.mint == pool.redeemable_mint)]
    pub user_redeemable: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}