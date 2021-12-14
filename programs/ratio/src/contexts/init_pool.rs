pub use anchor_lang::Discriminator;
use anchor_lang::prelude::*;
use anchor_spl::token::{Token, Mint, TokenAccount};
// local
pub use crate::states::{State, Pool};


#[derive(Accounts)]
#[instruction(pool_bump: u8)]
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
        seeds=[&Pool::discriminator()[..], usdc_mint.key().as_ref()],
        bump=pool_bump,
        payer=authority,
    )]
    pub pool: Account<'info, Pool>,
    // mints
    pub usdc_mint: Account<'info, Mint>,
    #[account(
        init,
        seeds=[b"REDEEMABLE".as_ref(), usdc_mint.key().as_ref()],
        bump,
        mint::authority=state,
        mint::decimals=usdc_mint.decimals,
        payer=authority,
    )]
    pub redeemable_mint: Account<'info, Mint>,
    // tokens
    #[account(
        init,
        seeds=[b"USDC".as_ref(), usdc_mint.key().as_ref()],
        bump,
        token::mint=usdc_mint,
        token::authority=state,
        payer=authority,
    )]
    pub pool_usdc: Account<'info, TokenAccount>,
}