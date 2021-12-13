use anchor_lang::{prelude::*, Discriminator};
use anchor_spl::token::{Mint, Token, TokenAccount, Transfer, transfer, MintTo, mint_to, Burn, burn};

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