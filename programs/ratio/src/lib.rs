use anchor_lang::{prelude::*, Discriminator};
use anchor_spl::token::{mint_to, transfer, MintTo, Transfer};
// local
pub mod contexts;
pub mod states;
pub use crate::contexts::*;
use crate::states::State;

declare_id!("6cDMc7baVfghT4sUx1t3sEfohxXyj4XwDr8pbarQfz1z");

#[program]
pub mod ratio {
    // use crate::instruction::MintAndDeposit;

    use super::*;
    // initialize the state of the contract
    pub fn init_state<'info>(ctx: Context<InitState>, state_bump: u8) -> ProgramResult {
        ctx.accounts.state.bump = state_bump;
        ctx.accounts.state.authority = ctx.accounts.authority.key();
        ctx.accounts.state.last_minted = 0;

        Ok(())
    }

    // initialize the pool so we can add usdc to it
    pub fn init_pool<'info>(ctx: Context<InitPool>, pool_bump: u8) -> ProgramResult {
        ctx.accounts.pool.bump = pool_bump;
        ctx.accounts.pool.usdc_mint = ctx.accounts.usdc_mint.key();
        ctx.accounts.pool.pool_redeemable = ctx.accounts.pool_redeemable.key();
        ctx.accounts.pool.redeemable_mint = ctx.accounts.redeemable_mint.key();

        Ok(())
    }
    pub fn mint_and_deposit(ctx: Context<MintAndDeposit>, mint_bump: u8, amount: u64) -> ProgramResult {
        let state_seed: &[&[&[u8]]] =
                &[&[&State::discriminator()[..], &[ctx.accounts.state.bump]]];
        anchor_spl::token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token::MintTo {
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.destination.to_account_info(),
                    authority: ctx.accounts.state.to_account_info(),
                },
                state_seed,
            ),
            amount,
        )?;
        Ok(())
    }
    pub fn mint_to_pool<'info>(ctx: Context<MintToPool>, mint_amount: u64) -> ProgramResult {
        msg!("mint_amountmint_amountmint_amount: {}", mint_amount);
        let current_time = Clock::get().expect("Failed").unix_timestamp;

        if current_time - ctx.accounts.state.last_minted > 60 {
            let state_seed: &[&[&[u8]]] =
                &[&[&State::discriminator()[..], &[ctx.accounts.state.bump]]];
            let mint_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.redeemable_mint.to_account_info(),
                    to: ctx.accounts.pool_redeemable.to_account_info(),
                    authority: ctx.accounts.state.to_account_info(),
                },
                state_seed,
            );

            mint_to(mint_ctx, mint_amount)?;
            // set new mint time
            ctx.accounts.state.last_minted = current_time;
        }

        Ok(())
    }

    pub fn deposit<'info>(ctx: Context<Deposit>, amount: u64) -> ProgramResult {
        let state_seed: &[&[&[u8]]] = &[&[&State::discriminator()[..], &[ctx.accounts.state.bump]]];

        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_redeemable.to_account_info(),
                to: ctx.accounts.pool_redeemable.to_account_info(),
                authority: ctx.accounts.state.to_account_info(),
            },
            state_seed,
        );

        // send the transfer
        transfer(transfer_ctx, amount)?;

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> ProgramResult {
        let state_seed: &[&[&[u8]]] = &[&[&State::discriminator()[..], &[ctx.accounts.state.bump]]];

        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.pool_redeemable.to_account_info(),
                to: ctx.accounts.user_redeemable.to_account_info(),
                authority: ctx.accounts.state.to_account_info(),
            },
            state_seed,
        );

        transfer(transfer_ctx, amount)?;

        Ok(())
    }
}
