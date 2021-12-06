use anchor_lang::prelude::*;
use std::fmt::Debug;
// use pool::cpi::accounts::SetData;
// use pool::program::Pool;
// use pool::{self, Data};
use anchor_lang::solana_program::program_option::COption;
use anchor_spl::token::{self, Burn, Mint, MintTo, TokenAccount, Transfer};

declare_id!("6cDMc7baVfghT4sUx1t3sEfohxXyj4XwDr8pbarQfz1z");

#[program]
pub mod ratio {

    use super::*;
    #[access_control(InitializePool::accounts(&ctx, nonce))]
    pub fn initialize_pool(ctx: Context<InitializePool>, nonce: u8) -> ProgramResult {
        // let pool_account = &mut ctx.accounts.pool_account;
        msg!("hy1: {}", *ctx.accounts.redeemable_mint.to_account_info().key);
        msg!("slerp2: {}", *ctx.accounts.pool_token.to_account_info().key);
        msg!("slerp9: {}", *ctx.accounts.distribution_authority.key);
        msg!("slerp8: {}", nonce);
        // map to pool acct
        // pool_account.redeemable_mint = *ctx.accounts.redeemable_mint.to_account_info().key;
        // pool_account.pool_token = *ctx.accounts.pool_token.to_account_info().key;
        // pool_account.distribution_authority = *ctx.accounts.distribution_authority.key;
        // pool_account.nonce = nonce;

        // let cpi_accounts = Transfer {
        //     authority: ctx.accounts.distribution_authority.to_account_info(),
        // }

        Ok(())
    }
    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> ProgramResult {
        // While token::transfer will check this, we prefer a verbose err msg.
        if ctx.accounts.user_token.amount < amount {
            return Err(ErrorCode::LowToken.into());
        }

        // Transfer user's token to pool token account.
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_token.to_account_info(),
            to: ctx.accounts.pool_token.to_account_info(),
            authority: ctx.accounts.user_authority.clone(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;

        let seeds = &[
            ctx.accounts.pool_account.redeemable_mint.as_ref(),
            &[ctx.accounts.pool_account.nonce],
        ];
        let signer = &[&seeds[..]];
        let cpi_accounts = MintTo {
            mint: ctx.accounts.redeemable_mint.to_account_info(),
            to: ctx.accounts.user_redeemable.to_account_info(),
            authority: ctx.accounts.pool_signer.clone(),
        };

        let cpi_program = ctx.accounts.token_program.clone();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::mint_to(cpi_ctx, amount)?;

        // // let cpi_program = ctx.accounts.pool_program.to_account_info();
        // // let cpi_accounts = SetData {
        // //     pool: ctx.accounts.pool.to_account_info(),
        // // };
        // // let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        Ok(())
    }
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> ProgramResult {
        // While token::burn will check this, we prefer a verbose err msg.
        if ctx.accounts.user_redeemable.amount < amount {
            return Err(ErrorCode::LowRedeemable.into());
        }

        // Burn the user's redeemable tokens.
        let cpi_accounts = Burn {
            mint: ctx.accounts.redeemable_mint.to_account_info(),
            to: ctx.accounts.user_redeemable.to_account_info(),
            authority: ctx.accounts.user_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.clone();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::burn(cpi_ctx, amount)?;

        // Transfer token from pool account to user.
        let seeds = &[
            ctx.accounts.pool_account.redeemable_mint.as_ref(),
            &[ctx.accounts.pool_account.nonce],
        ];
        let signer = &[&seeds[..]];
        let cpi_accounts = Transfer {
            from: ctx.accounts.pool_token.to_account_info(),
            to: ctx.accounts.user_token.to_account_info(),
            authority: ctx.accounts.pool_signer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.clone();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        token::transfer(cpi_ctx, amount)?;
        // token::transfer(cpi_ctx, ctx.accounts.pool_token.amount)?;
        Ok(())
    }
    // pub fn delegate(ctx: Context<Delegate>) -> ProgramResult {
    //     Ok(())
    // }
}
impl<'info> InitializePool<'info> {
    fn accounts(ctx: &Context<InitializePool<'info>>, nonce: u8) -> Result<()> {
        let expected_signer = Pubkey::create_program_address(
            &[ctx.accounts.pool_token.mint.as_ref(), &[nonce]],
            ctx.program_id,
        )
        .map_err(|_| ErrorCode::InvalidNonce)?;
        if ctx.accounts.pool_signer.key != &expected_signer {
            return Err(ErrorCode::InvalidNonce.into());
        }
        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(init, payer = distribution_authority, space = 8 + 8)]
    pub pool_account: ProgramAccount<'info, PoolAccount>,
    pub pool_signer: AccountInfo<'info>,

    #[account(
        constraint = redeemable_mint.mint_authority == COption::Some(*pool_signer.key),
        constraint = redeemable_mint.supply == 0
    )]
    pub redeemable_mint: Account<'info, Mint>,

    #[account(constraint = token_mint.decimals == redeemable_mint.decimals)]
    pub token_mint: Account<'info, Mint>,

    #[account(constraint = pool_token.owner == *pool_signer.key)]
    pub pool_token: Account<'info, TokenAccount>,

    // #[account(signer)]
    #[account(mut)]
    pub distribution_authority: AccountInfo<'info>,

    #[account(constraint = token_program.key == &token::ID)]
    pub token_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(has_one = redeemable_mint, has_one = pool_token)]
    pub pool_account: ProgramAccount<'info, PoolAccount>,

    #[account(seeds = [pool_account.redeemable_mint.as_ref()], bump = pool_account.nonce)]
    pool_signer: AccountInfo<'info>,

    #[account(
        mut,
        constraint = redeemable_mint.mint_authority == COption::Some(*pool_signer.key)
    )]
    pub redeemable_mint: Account<'info, Mint>,

    #[account(mut, constraint = pool_token.owner == *pool_signer.key)]
    pub pool_token: Account<'info, TokenAccount>,

    #[account(signer)]
    pub user_authority: AccountInfo<'info>,

    #[account(mut, constraint = user_token.owner == *user_authority.key)]
    pub user_token: Account<'info, TokenAccount>,

    #[account(mut, constraint = user_redeemable.owner == *user_authority.key)]
    pub user_redeemable: Account<'info, TokenAccount>,

    #[account(constraint = token_program.key == &token::ID)]
    pub token_program: AccountInfo<'info>,
}
#[derive(Accounts)]
pub struct Withdraw<'info> {
    // #[account(mut)]
    // pub pool: Account<'info, Data>,
    #[account(has_one = redeemable_mint, has_one = pool_token)]
    pub pool_account: ProgramAccount<'info, PoolAccount>,
    #[account(seeds = [pool_account.redeemable_mint.as_ref()], bump = pool_account.nonce)]
    pool_signer: AccountInfo<'info>,
    #[account(
      mut,
      constraint = redeemable_mint.mint_authority == COption::Some(*pool_signer.key)
    )]
    pub redeemable_mint: Account<'info, Mint>,
    #[account(mut, constraint = pool_token.owner == *pool_signer.key)]
    pub pool_token: Account<'info, TokenAccount>,
    #[account(signer)]
    pub user_authority: AccountInfo<'info>,
    #[account(mut, constraint = user_token.owner == *user_authority.key)]
    pub user_token: Account<'info, TokenAccount>,
    #[account(mut, constraint = user_redeemable.owner == *user_authority.key)]
    pub user_redeemable: Account<'info, TokenAccount>,
    #[account(constraint = token_program.key == &token::ID)]
    pub token_program: AccountInfo<'info>,
}

// #[derive(Debug)]
#[account]
pub struct PoolAccount {
    pub redeemable_mint: Pubkey,
    pub pool_token: Pubkey,
    pub distribution_authority: Pubkey,
    pub nonce: u8,
}

#[error]
pub enum ErrorCode {
    #[msg("Insufficient token")]
    LowToken,
    #[msg("Insufficient redeemable tokens")]
    LowRedeemable,
    #[msg("Given nonce is invalid")]
    InvalidNonce,
}
