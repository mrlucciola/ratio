use std::fmt::Debug;
use anchor_spl::token::{MintTo, TokenAccount, burn};
use crate::PoolAccount;
use {
  anchor_lang::solana_program::program_option::COption,
  anchor_lang::prelude::*,
  anchor_spl::token::{mint_to, transfer, Mint, ID},
};


#[derive(Accounts)]
pub struct ExchangeRedeemableForUsdc<'info> {
    // #[account(has_one = redeemable_mint, has_one = pool_usdc)]
    pub pool_account: ProgramAccount<'info, PoolAccount>,
    // #[account(seeds = [pool_account.watermelon_mint.as_ref(), &[pool_account.nonce]])]
    // pool_signer: AccountInfo<'info>,
    // #[account(
    //     mut,
    //     constraint = redeemable_mint.mint_authority == COption::Some(*pool_signer.key)
    // )]
    // pub redeemable_mint: CpiAccount<'info, Mint>,
    // #[account(mut, constraint = pool_usdc.owner == *pool_signer.key)]
    // pub pool_usdc: CpiAccount<'info, TokenAccount>,
    // #[account(signer)]
    // pub user_authority: AccountInfo<'info>,
    // #[account(mut, constraint = user_usdc.owner == *user_authority.key)]
    // pub user_usdc: CpiAccount<'info, TokenAccount>,
    // #[account(mut, constraint = user_redeemable.owner == *user_authority.key)]
    // pub user_redeemable: CpiAccount<'info, TokenAccount>,
    // #[account(constraint = token_program.key == &token::ID)]
    // pub token_program: AccountInfo<'info>,
}
