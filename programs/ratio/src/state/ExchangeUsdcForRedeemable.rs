use crate::PoolAccount;
use {
    anchor_lang::solana_program::program_option::COption,
    anchor_lang::prelude::*,
    anchor_spl::token::{mint_to, transfer, Mint, ID},
};
use anchor_spl::token::{MintTo, TokenAccount, burn};

#[derive(Accounts)]
pub struct ExchangeUsdcForRedeemable<'info> {
    #[account(has_one = redeemable_mint, has_one = pool_usdc)]
    pub pool_account: ProgramAccount<'info, PoolAccount>,
    #[account(seeds = [pool_account.watermelon_mint.as_ref()], bump = pool_account.nonce)]
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
