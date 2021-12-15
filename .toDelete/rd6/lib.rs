use std::fmt::Debug;
pub mod errors;
use anchor_lang::solana_program::program_option::COption;
use anchor_spl::token::{burn, MintTo, TokenAccount};
// pub mod state;
pub mod utils;
use {
    // state::ExchangeUsdcForRedeemable::ExchangeUsdcForRedeemable,
    anchor_lang::prelude::*,
    anchor_spl::token::{mint_to, transfer, Mint, ID},
};

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
    use anchor_spl::token::{Burn, Transfer};

    use super::*;

    #[access_control(InitializePool::accounts(&ctx, nonce))]
    pub fn initialize_pool<'info>(
        ctx: Context<InitializePool>,
        nonce: u8,
    ) -> ProgramResult {
        let pool_account = &mut ctx.accounts.pool_account;
        pool_account.redeemable_mint = *ctx.accounts.redeemable_mint.to_account_info().key;
        pool_account.pool_watermelon = *ctx.accounts.pool_watermelon.to_account_info().key;
        pool_account.seed_mint = ctx.accounts.pool_watermelon.mint;
        pool_account.pool_usdc = *ctx.accounts.pool_usdc.to_account_info().key;
        pool_account.authority = *ctx.accounts.authority.key;
        pool_account.nonce = nonce;
        // pool_account.num_ido_tokens = num_ido_tokens;

        // let cpi_accounts = Transfer {
        //     from: ctx.accounts.creator_watermelon.to_account_info(),
        //     to: ctx.accounts.pool_watermelon.to_account_info(),
        //     authority: ctx.accounts.authority.to_account_info(),
        // };

        // let cpi_program = ctx.accounts.token_program.clone();
        // let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        // transfer(cpi_ctx, num_ido_tokens)?;

        Ok(())
    }

    pub fn exchange_usdc_for_redeemable(
        ctx: Context<ExchangeUsdcForRedeemable>,
        amount: u64,
    ) -> Result<()> {
        // While token::transfer will check this, we prefer a verbose err msg.
        if ctx.accounts.user_usdc.amount < amount {
            return Err(ErrorCode::LowUsdc.into());
        }

        // Transfer user's USDC to pool USDC account.
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_usdc.to_account_info(),
            to: ctx.accounts.pool_usdc.to_account_info(),
            authority: ctx.accounts.user_authority.clone(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        transfer(cpi_ctx, amount)?;

        // Mint Redeemable to user Redeemable account.
        let seeds = &[
            ctx.accounts.pool_account.seed_mint.as_ref(),
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
        mint_to(cpi_ctx, amount)?;

        Ok(())
    }

    pub fn exchange_redeemable_for_usdc(
        ctx: Context<ExchangeRedeemableForUsdc>,
        amount: u64,
    ) -> Result<()> {
        // While token::burn will check this, we prefer a verbose err msg.
        if ctx.accounts.user_redeemable.amount < amount {
            return Err(ErrorCode::LowRedeemable.into());
        }

        // // Burn the user's redeemable tokens.
        let cpi_accounts = Burn {
            mint: ctx.accounts.redeemable_mint.to_account_info(),
            to: ctx.accounts.user_redeemable.to_account_info(),
            authority: ctx.accounts.user_authority.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.clone();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        burn(cpi_ctx, amount)?;

        // // Transfer USDC from pool account to user.
        let seeds = &[
            ctx.accounts.pool_account.seed_mint.as_ref(),
            &[ctx.accounts.pool_account.nonce],
        ];
        let signer = &[&seeds[..]];
        let cpi_accounts = Transfer {
            from: ctx.accounts.pool_usdc.to_account_info(),
            to: ctx.accounts.user_usdc.to_account_info(),
            authority: ctx.accounts.pool_signer.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.clone();
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
        transfer(cpi_ctx, amount)?;

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(nonce: u8)]
pub struct InitializePool<'info> {
    #[account(constraint = token_program.key == &ID)]
    pub token_program: AccountInfo<'info>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,

    #[account(signer)]
    pub authority: AccountInfo<'info>,

    #[account(
        constraint = redeemable_mint.mint_authority == COption::Some(*pool_signer.key),
        constraint = redeemable_mint.supply == 0
    )]
    pub redeemable_mint: Account<'info, Mint>,
    pub usdc_mint: Account<'info, Mint>,

    #[account(mut, constraint = creator_watermelon.owner == *authority.key)]
    pub creator_watermelon: Account<'info, TokenAccount>,
    #[account(mut, constraint = pool_watermelon.owner == *pool_signer.key)]
    pub pool_watermelon: Account<'info, TokenAccount>,
    #[account(constraint = pool_usdc.owner == *pool_signer.key)]
    pub pool_usdc: Account<'info, TokenAccount>,

    #[account(init, payer = authority)]
    pub pool_account: ProgramAccount<'info, PoolAccount>,
    pub pool_signer: AccountInfo<'info>,
}

impl<'info> InitializePool<'info> {
    fn accounts(ctx: &Context<InitializePool<'info>>, nonce: u8) -> Result<()> {
        let expected_signer = Pubkey::create_program_address(
            &[ctx.accounts.pool_watermelon.mint.as_ref(), &[nonce]],
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
pub struct ExchangeUsdcForRedeemable<'info> {
    #[account(has_one = redeemable_mint, has_one = pool_usdc)]
    pub pool_account: ProgramAccount<'info, PoolAccount>,
    #[account(seeds = [pool_account.seed_mint.as_ref()], bump = pool_account.nonce)]
    pool_signer: AccountInfo<'info>,
    #[account(
        mut,
        constraint = redeemable_mint.mint_authority == COption::Some(*pool_signer.key)
    )]
    pub redeemable_mint: Account<'info, Mint>,
    #[account(mut, constraint = pool_usdc.owner == *pool_signer.key)]
    pub pool_usdc: Account<'info, TokenAccount>,
    #[account(signer)]
    pub user_authority: AccountInfo<'info>,
    #[account(mut, constraint = user_usdc.owner == *user_authority.key)]
    pub user_usdc: Account<'info, TokenAccount>,
    #[account(mut, constraint = user_redeemable.owner == *user_authority.key)]
    pub user_redeemable: Account<'info, TokenAccount>,
    #[account(constraint = token_program.key == &ID)]
    pub token_program: AccountInfo<'info>,
}

#[derive(Accounts)]
pub struct ExchangeRedeemableForUsdc<'info> {
    #[account(has_one = redeemable_mint, has_one = pool_usdc)]
    pub pool_account: ProgramAccount<'info, PoolAccount>,
    #[account(seeds = [pool_account.seed_mint.as_ref()], bump = pool_account.nonce)]
    pool_signer: AccountInfo<'info>,
    #[account(
        mut,
        constraint = redeemable_mint.mint_authority == COption::Some(*pool_signer.key)
    )]
    pub redeemable_mint: Account<'info, Mint>,
    #[account(mut, constraint = pool_usdc.owner == *pool_signer.key)]
    pub pool_usdc: Account<'info, TokenAccount>,
    #[account(signer)]
    pub user_authority: AccountInfo<'info>,
    #[account(mut, constraint = user_usdc.owner == *user_authority.key)]
    pub user_usdc: Account<'info, TokenAccount>,
    #[account(mut, constraint = user_redeemable.owner == *user_authority.key)]
    pub user_redeemable: Account<'info, TokenAccount>,
    #[account(constraint = token_program.key == &ID)]
    pub token_program: AccountInfo<'info>,
}

#[account]
#[derive(Default, Debug)]
pub struct PoolAccount {
    pub seed_mint: Pubkey,
    pub pool_watermelon: Pubkey,
    pub pool_usdc: Pubkey,
    pub authority: Pubkey,
    pub redeemable_mint: Pubkey,
    pub nonce: u8,
    pub num_ido_tokens: u64,
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
