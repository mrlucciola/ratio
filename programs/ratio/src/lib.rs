use anchor_lang::{prelude::*, Discriminator};
use anchor_spl::token::{mint_to, transfer, MintTo, Transfer};
// local
pub mod contexts;
pub mod states;
pub use crate::contexts::*;
pub use crate::states::State;

declare_id!("6cDMc7baVfghT4sUx1t3sEfohxXyj4XwDr8pbarQfz1z");

#[program]
#[deny(unused_must_use)]
pub mod ratio {

    use super::*;
    // initialize the state of the contract
    pub fn init_state<'info>(ctx: Context<InitState>, state_bump: u8) -> ProgramResult {
        ctx.accounts.state.bump = state_bump;
        ctx.accounts.state.authority = ctx.accounts.authority.key();
        ctx.accounts.state.last_minted = 0;

        Ok(())
    }

    // initialize the pool so we can add token to it
    pub fn init_pool<'info>(ctx: Context<InitPool>, pool_bump: u8, decimals: u8) -> ProgramResult {
        ctx.accounts.pool.bump = pool_bump;
        ctx.accounts.pool.pool_currency = ctx.accounts.pool_currency.key();
        ctx.accounts.pool.currency_mint = ctx.accounts.currency_mint.key();

        Ok(())
    }

    pub fn mint_and_deposit<'info>(ctx: Context<MintAndDeposit>, mint_amount: u64) -> ProgramResult {
        let current_time = Clock::get().expect("Failed").unix_timestamp;

        if current_time - ctx.accounts.state.last_minted > 60 {
            let state_seed: &[&[&[u8]]] =
                &[&[&State::discriminator()[..], &[ctx.accounts.state.bump]]];
            let mint_ctx = CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.currency_mint.to_account_info(),
                    to: ctx.accounts.dest_currency.to_account_info(),
                    authority: ctx.accounts.state.to_account_info(),
                },
                state_seed,
            );

            // mint
            mint_to(mint_ctx, mint_amount)?;

            // set new mint time
            ctx.accounts.state.last_minted = current_time;
        } else {
            msg!("Need to wait 1 minute");
            return Err(ErrorCode::TimeDelay)?;
        }

        Ok(())
    }

    pub fn deposit<'info>(ctx: Context<Deposit>, amount: u64) -> ProgramResult {
        msg!("depositing amount: {}", amount);
        let transfer_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_currency.clone().to_account_info(),
                to: ctx.accounts.pool_currency.clone().to_account_info(),
                authority: ctx.accounts.payer.clone().to_account_info(),
            },
        );

        // send the transfer
        transfer(transfer_ctx, amount)?;

        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> ProgramResult {
        msg!("withdrawing amount: {}", amount);
        let state_seed: &[&[&[u8]]] =
            &[&[&State::discriminator()[..], &[ctx.accounts.state.bump]]];
        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.pool_currency.to_account_info(),
                to: ctx.accounts.user_currency.to_account_info(),
                authority: ctx.accounts.state.to_account_info(),
            },
            state_seed,
        );

        transfer(transfer_ctx, amount)?;

        Ok(())
    }
}

#[error]
pub enum ErrorCode {
    #[msg("Please wait 60 seconds")]
    TimeDelay,
}