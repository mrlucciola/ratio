use anchor_lang::prelude::*;
pub use anchor_lang::Discriminator;
use anchor_spl::token::{TokenAccount, Mint, Token};
// local
use crate::states::{State, Pool};

#[derive(Accounts)]
pub struct Withdraw<'info> {
    pub token_program: Program<'info, Token>,
    #[account(seeds = [&State::discriminator()[..]], bump = state.bump)]
    pub state: Account<'info, State>,
    #[account(seeds = [&Pool::discriminator()[..], currency_mint.key().as_ref()], bump = pool.bump)]
    pub pool: Account<'info, Pool>,
    #[account(mut, address = pool.pool_currency)]
    pub pool_currency: Account<'info, TokenAccount>,
    #[account(mut, address = pool.currency_mint)]
    pub currency_mint: Account<'info, Mint>,
    #[account(mut, constraint= user_currency.mint == pool.currency_mint)]
    pub user_currency: Account<'info, TokenAccount>,
}
