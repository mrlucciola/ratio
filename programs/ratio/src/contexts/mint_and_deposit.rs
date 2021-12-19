use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};
pub use anchor_lang::Discriminator;
// local
use crate::states::State;

#[derive(Accounts)]
#[instruction(mint_bump: u8, amount: u64)]
pub struct MintAndDeposit<'info> {
    #[account(
        init_if_needed,
        payer = payer,
        seeds = [b"REDEEMABLE_MINT".as_ref()],
        bump = mint_bump,
        mint::decimals = 8,
        mint::authority = state
    )]
    pub mint: Account<'info, Mint>,

    #[account(
        init_if_needed,
        payer = payer,
        associated_token::mint = mint,
        associated_token::authority = receiver
    )]
    pub destination: Account<'info, TokenAccount>,
    pub payer: Signer<'info>,
    pub receiver: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub associated_token_program: Program<'info, AssociatedToken>,
    pub rent: Sysvar<'info, Rent>,
    #[account(seeds=[&State::discriminator()[..]], bump=state.bump)]
    pub state: Account<'info, State>,
}