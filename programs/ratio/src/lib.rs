// use std::fmt::Debug;
// use {
//     anchor_lang::{prelude::*, solana_program::program_option::COption, Discriminator},
//     anchor_spl::token::{
//         mint_to, transfer, Mint, MintTo, Token, TokenAccount, Transfer,
//     },
// };
use anchor_lang::prelude::*;
// use anchor_lang::solana_program::program_option::COption;
use anchor_lang::Discriminator;
use anchor_spl::token::{mint_to, transfer, Mint, MintTo, Token, TokenAccount, Transfer};
use anchor_spl::token::{self, Burn};
declare_id!("6cDMc7baVfghT4sUx1t3sEfohxXyj4XwDr8pbarQfz1z");
// pub mod state;

pub mod errors;
pub mod utils;

// use anchor_spl::token::{self, Mint, TokenAccount, Transfer, ID};

// const PREFIX: &str = "pool_acct";
// const TREASURY: &str = "treasury";
// const FEE_PAYER: &str = "fee_payer";
pub const POOL_SIZE: usize = 8 + //key
    32 + //fee payer
    32 + //treasury
    32 + //treasury_withdrawal_destination
    32 + //treasury mint
    32 + //authority
    32 + // creator
    1 + // bump
    1 + // treasury_bump
    1 + // fee_payer_bump
    220; //padding

#[program]
pub mod ratio {

    use super::*;

    pub fn init_state<'info>(ctx: Context<InitState>, state_bump: u8) -> ProgramResult {
        ctx.accounts.state.bump = state_bump;
        ctx.accounts.state.authority = ctx.accounts.authority.key();

        Ok(())
    }
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

        token::burn(burn_ctx, amount)?;

        let transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.pool_usdc.to_account_info(),
                to: ctx.accounts.user_usdc.to_account_info(),
                authority: ctx.accounts.state.to_account_info(),
            },
            state_seed,
        );

        token::transfer(transfer_ctx, amount)?;

        Ok(())
    }
    // pub fn exchange_usdc_for_redeemable(
    //     ctx: Context<ExchangeUsdcForRedeemable>,
    //     amount: u64,
    // ) -> Result<()> {
    //     // While token::transfer will check this, we prefer a verbose err msg.
    //     if ctx.accounts.user_usdc.amount < amount {
    //         return Err(ErrorCode::LowUsdc.into());
    //     }

    //     // Transfer user's USDC to pool USDC account.
    //     let cpi_accounts = Transfer {
    //         from: ctx.accounts.user_usdc.to_account_info(),
    //         to: ctx.accounts.pool_usdc.to_account_info(),
    //         authority: ctx.accounts.user_authority.clone(),
    //     };
    //     let cpi_program = ctx.accounts.token_program.to_account_info();
    //     let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    //     transfer(cpi_ctx, amount)?;

    //     // Mint Redeemable to user Redeemable account.
    //     let seeds = &[
    //         // ctx.accounts.pool_account.watermelon_mint.as_ref(),
    //         // ctx.accounts.pool_account.seed_mint.as_ref(),
    //         ctx.accounts.pool_account.redeemable_mint.as_ref(),
    //         &[ctx.accounts.pool_account.nonce],
    //     ];
    //     let signer = &[&seeds[..]];
    //     let cpi_accounts = MintTo {
    //         mint: ctx.accounts.redeemable_mint.to_account_info(),
    //         to: ctx.accounts.user_redeemable.to_account_info(),
    //         // authority: ctx.accounts.pool_signer.clone(),
    //         // authority: ctx.accounts.pool_pda.clone(),
    //         authority: ctx.accounts.redeemable_pda.clone(),
    //     };
    //     let cpi_program = ctx.accounts.token_program.clone();
    //     msg!("WE ARE HERE USDC FOR REDEEMABLE");
    //     let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    //     msg!("WE PASSED HERE USDC FOR REDEEMABLE");
    //     mint_to(cpi_ctx, amount)?;

    //     Ok(())
    // }

    // pub fn exchange_redeemable_for_usdc(
    //     ctx: Context<ExchangeRedeemableForUsdc>,
    //     amount: u64,
    // ) -> Result<()> {
    //     // While token::burn will check this, we prefer a verbose err msg.
    //     if ctx.accounts.user_redeemable.amount < amount {
    //         return Err(ErrorCode::LowRedeemable.into());
    //     }

    //     // // Burn the user's redeemable tokens.
    //     let cpi_accounts = Burn {
    //         mint: ctx.accounts.redeemable_mint.to_account_info(),
    //         to: ctx.accounts.user_redeemable.to_account_info(),
    //         authority: ctx.accounts.user_authority.to_account_info(),
    //     };
    //     let cpi_program = ctx.accounts.token_program.clone();
    //     let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    //     burn(cpi_ctx, amount)?;

    //     // // Transfer USDC from pool account to user.
    //     let seeds = &[
    //         // ctx.accounts.pool_account.watermelon_mint.as_ref(),
    //         // ctx.accounts.pool_account.seed_mint.as_ref(),
    //         ctx.accounts.pool_account.redeemable_mint.as_ref(),
    //         &[ctx.accounts.pool_account.nonce],
    //     ];
    //     let signer = &[&seeds[..]];
    //     let cpi_accounts = Transfer {
    //         from: ctx.accounts.pool_usdc.to_account_info(),
    //         to: ctx.accounts.user_usdc.to_account_info(),
    //         // authority: ctx.accounts.pool_signer.to_account_info(),
    //         authority: ctx.accounts.redeemable_pda.to_account_info(),
    //     };
    //     let cpi_program = ctx.accounts.token_program.clone();
    //     msg!("WE ARE HERE REDEEMABLE FOR USDC");
    //     let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    //     msg!("WE PASSED HERE REDEEMABLE FOR USDC");
    //     transfer(cpi_ctx, amount)?;

    //     Ok(())
    // }
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

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(seeds=[&State::discriminator()[..]], bump=state.bump)]
    pub state: Account<'info, State>,
    #[account(seeds=[&Pool::discriminator()[..], pool.usdc_mint.as_ref()], bump=pool.bump)]
    pub pool: Account<'info, Pool>,
    #[account(mut, address=pool.pool_usdc)]
    pub pool_usdc: Account<'info, TokenAccount>,
    #[account(mut, address=pool.redeemable_mint)]
    pub redeemable_mint: Account<'info, Mint>,
    #[account(mut, constraint= user_usdc.mint == pool.usdc_mint)]
    pub user_usdc: Account<'info, TokenAccount>,
    #[account(mut, constraint= user_redeemable.mint == pool.redeemable_mint)]
    pub user_redeemable: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

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

#[error]
pub enum ErrorCode {
    #[msg("Insufficient USDC")]
    LowUsdc,
    #[msg("Insufficient redeemable tokens")]
    LowRedeemable,
    // #[msg("USDC total and redeemable total don't match")]
    // UsdcNotEqRedeem,
    #[msg("Given nonce is invalid")]
    InvalidNonce,
}
