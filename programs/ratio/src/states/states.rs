use anchor_lang::{prelude::*};
#[account]
#[derive(Default)]
pub struct Pool {
    pub bump: u8,
    pub usdc_mint: Pubkey,
    pub pool_usdc: Pubkey,
    pub redeemable_mint: Pubkey,
}

#[account]
#[derive(Default)]
pub struct State {
    pub bump: u8,
    pub authority: Pubkey,
}