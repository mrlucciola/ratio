use anchor_lang::prelude::*;
// use anchor_lang::solana_program::program_option::COption;
// use anchor_spl::token::{self, Burn, Mint, MintTo, TokenAccount, Transfer};
const PUBLIC_KEY_LENGTH: usize = 32;
declare_id!("6cDMc7baVfghT4sUx1t3sEfohxXyj4XwDr8pbarQfz1y");

#[program]
pub mod pool {
    use super::*;
    pub fn initialize_pool(_ctx: Context<InitializePool>) -> ProgramResult {
        Ok(())
    }
    pub fn set_data(
        ctx: Context<SetData>,
        pool_pubkey: Pubkey,
        token_account_pubkey: Pubkey,
        token_amount: u64,
    ) -> ProgramResult {
        // let escrow_pubkey = create_program_address(&[&["escrow"]], &escrow_program_id);
        let (pda, _bump_seed) = Pubkey::find_program_address(&[b"escrow"], &pool_pubkey);
        let pool = &mut ctx.accounts.pool;

        pool.token_account_pubkey = token_account_pubkey;
        pool.token_amount = token_amount;
        Ok(())
    }
}

/// Find a valid off-curve derived program address and its bump seed
///     * seeds, symbolic keywords used to derive the key
///     * program_id, program that the address is derived for
pub fn find_program_address(
    seeds: &[&[u8]],
    program_id: &Pubkey,
) -> Option<(Pubkey, u8)> {
    let mut bump_seed = [std::u8::MAX];
    for _ in 0..std::u8::MAX {
        let mut seeds_with_bump = seeds.to_vec();
        seeds_with_bump.push(&bump_seed);
        if let Ok(address) = create_program_address(&seeds_with_bump, program_id) {
            return Some((address, bump_seed[0]));
        }
        bump_seed[0] -= 1;
    }
    None
}

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(init, payer = user, space = 8 + 64)]
    pub pool: Account<'info, Data>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct SetData<'info> {
    #[account(mut)]
    pub pool: Account<'info, Data>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
#[derive(Default)]
pub struct Data {
    pub token_account_pubkey: Pubkey,
    pub token_amount: u64,
}
