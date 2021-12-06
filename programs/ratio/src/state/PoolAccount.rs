use anchor_lang::prelude::*;

#[account]
#[derive(Default, Debug)]
pub struct PoolAccount {
    pub watermelon_mint: Pubkey,
    pub pool_watermelon: Pubkey,
    pub pool_usdc: Pubkey,
    pub authority: Pubkey,
    pub redeemable_mint: Pubkey,
    pub nonce: u8,
    pub num_ido_tokens: u64,
}