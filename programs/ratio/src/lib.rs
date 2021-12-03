use anchor_lang::{prelude::*, Discriminator};
use anchor_spl::token::{Mint, Token, TokenAccount};

declare_id!("6cDMc7baVfghT4sUx1t3sEfohxXyj4XwDr8pbarQfz1z");

#[program]
pub mod ratio {
    use super::*;
    // initialize the state of the contract
    pub fn init_state<'info>(ctx: Context<InitState>, state_bump: u8) -> ProgramResult {
        ctx.accounts.state.bump = state_bump;
        ctx.accounts.state.authority = ctx.accounts.authority.key();

        Ok(())
    }

    // initialize the pool so we can add usdc to it
    pub fn init_pool<'info>(ctx: Context<InitPool>, pool_bump: u8) -> ProgramResult {
        ctx.accounts.pool.bump = pool_bump;
        ctx.accounts.pool.usdc_mint = ctx.accounts.usdc_mint.key(); //usdc_mint
        ctx.accounts.pool.pool_usdc = ctx.accounts.pool_usdc.key(); //pool_usdc
        ctx.accounts.pool.redeemable_mint = ctx.accounts.redeemable_mint.key(); //redeemable_mint

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(state_bump: u8)]
pub struct InitState<'info> {
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    #[account(mut)]
    pub authority: Signer<'info>,
    // state
    #[account(
        init,
        payer=authority,
        seeds=[&State::discriminator()[..]],
        bump=state_bump,
    )]
    pub state: Account<'info, State>,
}

#[account]
#[derive(Default)]
pub struct State {
    bump: u8,
    authority: Pubkey,
}

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

#[account]
#[derive(Default)]
pub struct Pool {
    bump: u8,
    usdc_mint: Pubkey,
    pool_usdc: Pubkey,
    redeemable_mint: Pubkey,
}
