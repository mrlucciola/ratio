use anchor_lang::prelude::*;
pub use anchor_lang::Discriminator;
use anchor_spl::{token::{Mint, Token, TokenAccount}};
// local
pub use crate::states::{Pool, State};

#[derive(Accounts)]
#[instruction(pool_bump: u8, decimals: u8)]
pub struct InitPool<'info> {
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    pub token_program: Program<'info, Token>,
    // auth
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        seeds=[&State::discriminator()[..]],
        bump=state.bump,
        has_one=authority,
    )]
    pub state: Account<'info, State>,
    #[account(
        init,
        seeds=[&Pool::discriminator()[..], currency_mint.key().as_ref()],
        bump=pool_bump,
        payer=authority,
    )]
    pub pool: Account<'info, Pool>,
    // mints
    #[account(
        init,
        seeds=[b"CURRENCY_MINT".as_ref()],
        bump,
        mint::authority=state,
        mint::decimals=decimals,
        payer=authority,
    )]
    pub currency_mint: Account<'info, Mint>,
    #[account(
        init,
        payer=authority,
        seeds = [pool.key().as_ref(), currency_mint.key().as_ref()],
        bump,
        token::mint = currency_mint,
        token::authority = state,
    )]
    pub pool_currency: Account<'info, TokenAccount>,
}
