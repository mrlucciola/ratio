use anchor_lang::{prelude::*, Discriminator};
use anchor_spl::token::{Transfer, transfer, MintTo, mint_to, Burn, burn};
// local
pub mod contexts;
pub mod states;
use crate::states::{State};
pub use crate::contexts::*;

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
    pub fn deposit<'info>(ctx: Context<Deposit>, amount: u64) -> ProgramResult {
        let state_seed: &[&[&[u8]]] = &[&[&State::discriminator()[..], &[ctx.accounts.state.bump]]];

        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_usdc.to_account_info(),
                to: ctx.accounts.pool_usdc.to_account_info(),
                authority: ctx.accounts.state.to_account_info(),
            },
            state_seed,
        );

        // send the transfer
        transfer(transfer_ctx, amount)?;

        let mint_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            MintTo {
                mint: ctx.accounts.redeemable_mint.to_account_info(),
                to: ctx.accounts.user_redeemable.to_account_info(),
                authority: ctx.accounts.state.to_account_info(),
            },
            state_seed,
        );

        mint_to(mint_ctx, amount)?;

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> ProgramResult {

        let state_seed: &[&[&[u8]]] = &[&[
            &State::discriminator()[..],
            &[ctx.accounts.state.bump],
        ]];

        let burn_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Burn {
                mint: ctx.accounts.redeemable_mint.to_account_info(),
                to: ctx.accounts.user_redeemable.to_account_info(),
                authority: ctx.accounts.state.to_account_info(),
            },
            state_seed,
        );

        burn(burn_ctx, amount)?;

        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.pool_usdc.to_account_info(),
                to: ctx.accounts.user_usdc.to_account_info(),
                authority: ctx.accounts.state.to_account_info(),
            },
            state_seed,
        );

        transfer(transfer_ctx, amount)?;

        Ok(())
    }
}
