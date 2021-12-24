use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct Pool {
    pub bump: u8,
    pub currency_mint: Pubkey,
    pub pool_currency: Pubkey,
}

#[account]
#[derive(Default)]
pub struct State {
    pub bump: u8,
    pub authority: Pubkey,
    pub last_minted: i64,
}
