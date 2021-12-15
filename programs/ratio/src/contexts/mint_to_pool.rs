use anchor_lang::prelude::*;
pub use anchor_lang::Discriminator;
use anchor_spl::token::{TokenAccount, Mint, Token};
// local
use crate::states::{Pool, State};

#[derive(Accounts)]
pub struct MintToPool<'info> {
    #[account(seeds=[&State::discriminator()[..]], bump=state.bump)]
    pub state: Account<'info, State>,
    #[account(seeds=[&Pool::discriminator()[..], pool.usdc_mint.as_ref()], bump=pool.bump)]
    pub pool: Account<'info, Pool>,
    #[account(mut, address=pool.redeemable_mint)]
    pub redeemable_mint: Account<'info, Mint>,
    #[account(mut, constraint= pool_redeemable.mint == pool.redeemable_mint)]
    pub pool_redeemable: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}