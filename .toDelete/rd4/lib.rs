use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, ID, TokenAccount},
};
// use anchor_spl::token::{self, Mint, TokenAccount, Transfer, ID};

const PREFIX: &str = "pool_acct";
const TREASURY: &str = "treasury";
pub const POOL_SIZE: usize = 8 + //key
    32 + //fee payer
    32 + //treasury
    32 + //treasury_withdrawal_destination
    32 + //treasury mint
    32 + //authority
    32 + // creator
    1 + // bump
    1 + // treasury_bump
    // 1 + // fee_payer_bump
    220; //padding

#[program]
pub mod ratio {
    use super::*;

    // #[access_control(InitializePool::accounts(&ctx, nonce))]
    pub fn initialize_pool<'info>(
        ctx: Context<InitializePool>,
        bump: u8,
        treasury_bump: u8,
        nonce: u8,
    ) -> ProgramResult {
        let treasury_mint = &ctx.accounts.treasury_mint;
        msg!("treasury_minttreasury_mint: {}", &treasury_mint.key());
        let treasury_withdrawal_destination = &ctx.accounts.treasury_withdrawal_destination;
        msg!(
            "treasury_withdrawal_destinationIUYOIUYIOYU: {}",
            &treasury_withdrawal_destination.key()
        );
        let treasury_withdrawal_destination_owner =
            &ctx.accounts.treasury_withdrawal_destination_owner;
        msg!("treasury_withdrawal_destination_owner: {}", &treasury_withdrawal_destination_owner.key());
        let payer = &ctx.accounts.payer;
        msg!("payerpayer: {}", &payer.key());
        let authority = &ctx.accounts.authority;
        msg!("authorityauthority: {}", &authority.key());
        let pool_treasury = &ctx.accounts.pool_treasury;
        msg!("pool_treasurypool_treasury: {}", &pool_treasury.key());
        let token_program = &ctx.accounts.token_program;
        msg!("token_programtoken_program: {}", &token_program.key());
        let ata_program = &ctx.accounts.ata_program;
        msg!("ata_programata_program: {}", &ata_program.key());
        let system_program = &ctx.accounts.system_program;
        msg!("system_programsystem_program: {}", &system_program.key());
        let rent = &ctx.accounts.rent;
        msg!("rentrent: {}", &rent.key());
        // let pool_acct = &mut ctx.accounts.pool_acct;
        // msg!("pool_acctpool_acct: {}", &pool_acct.key());
        // set up the pool
        // pool.treasury_mint = treasury_mint.key();
        // pool.bump = bump;
        // msg!("hellow {}", &ctx.accounts.pool.key());
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(bump: u8, treasury_bump: u8)]
pub struct InitializePool<'info> {
    // #[account(mut)]
    pub treasury_mint: Account<'info, Mint>,
    #[account(mut)]
    pub treasury_withdrawal_destination: UncheckedAccount<'info>,
    pub treasury_withdrawal_destination_owner: UncheckedAccount<'info>,
    pub authority: AccountInfo<'info>,
    #[account(mut, seeds=[PREFIX.as_bytes(), pool_str.key().as_ref(), TREASURY.as_bytes()], bump=treasury_bump)]
    // pub pool_token: UncheckedAccount<'info>,
    pub pool_treasury: UncheckedAccount<'info>,
    // pub pool_treasury: Account<'info, TokenAccount>,
    pub pool_str: UncheckedAccount<'info>,
    // #[account(init, payer=payer)]
    // #[account(zero, seeds=[PREFIX.as_bytes(), authority.key().as_ref(), treasury_mint.key().as_ref()], bump=bump, space=POOL_SIZE, payer=payer)]
    #[account(init, seeds=[PREFIX.as_bytes(), authority.key().as_ref(), treasury_mint.key().as_ref()], bump=bump, space=POOL_SIZE, payer=payer)]
    pub pool_acct: ProgramAccount<'info, PoolAcct>,
    pub payer: Signer<'info>,
    pub token_program: AccountInfo<'info>,
    pub ata_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    // pub nonce:
}

// impl<'info> InitializePool<'info> {
//     fn accounts(ctx: &Context<InitializePool<'info>>, nonce: u8) -> Result<()> {
//         let expected_signer = Pubkey::create_program_address(
//             &[ctx.accounts.pool_treasury.mint.as_ref(), &[nonce]],
//             ctx.program_id,
//         )
//         .map_err(|_| ErrorCode::InvalidNonce)?;
//         if ctx.accounts.authority.key != &expected_signer {
//             return Err(ErrorCode::InvalidNonce.into());
//         }
//         Ok(())
//     }
// }
#[account]
#[derive(Default)]
pub struct PoolAcct {
    pub treasury_mint: Pubkey,
    pub treasury_withdrawal_destination: Pubkey,
    pub pool_treasury: Pubkey,
    pub authority: Pubkey,
    pub creator: Pubkey,
    pub bump: u8,
    pub treasury_bump: u8,
}

#[error]
pub enum ErrorCode {
    #[msg("The derived interaction signer does not match that which was given.")]
    InvalidInteractionSigner,
    #[msg("Given nonce is invalid")]
    InvalidNonce,
}
