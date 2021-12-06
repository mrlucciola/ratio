use std::fmt::Debug;
pub mod errors;
use anchor_spl::token::Token;

pub mod utils;
use {
    // crate::errors::ErrorCode,
    crate::utils::*,
    anchor_lang::prelude::*,
    anchor_spl::{
        associated_token::AssociatedToken,
        token::{Mint, ID},
    },
};

// use anchor_spl::token::{self, Mint, TokenAccount, Transfer, ID};

const PREFIX: &str = "pool_acct";
const TREASURY: &str = "treasury";
const FEE_PAYER: &str = "fee_payer";
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
    use super::*;

    // #[access_control(InitializePool::accounts(&ctx, nonce))]
    pub fn initialize_pool<'info>(
        ctx: Context<InitializePool>,
        bump: u8,
        fee_payer_bump: u8,
        treasury_bump: u8,
        // nonce: u8,
    ) -> ProgramResult {
        let treasury_mint = &ctx.accounts.treasury_mint;
        let treasury_withdrawal_destination = &ctx.accounts.treasury_withdrawal_destination;
        let treasury_withdrawal_destination_owner =
            &ctx.accounts.treasury_withdrawal_destination_owner;
        let payer = &ctx.accounts.payer;
        let fee_withdrawal_destination = &ctx.accounts.fee_withdrawal_destination;
        let authority = &ctx.accounts.authority;
        let pool_treasury = &ctx.accounts.pool_treasury;
        let token_program = &ctx.accounts.token_program;
        let ata_program = &ctx.accounts.ata_program;
        let system_program = &ctx.accounts.system_program;
        let rent = &ctx.accounts.rent;
        let pool_acct = &mut ctx.accounts.pool_acct;
        let pool_key = pool_acct.key(); // let ah_key = auction_house.key()
        
        // set up the pool
        pool_acct.bump = bump;
        pool_acct.fee_payer_bump = fee_payer_bump;
        pool_acct.treasury_bump = treasury_bump;
        pool_acct.creator = authority.key();
        pool_acct.authority = authority.key();
        pool_acct.treasury_mint = treasury_mint.key();
        pool_acct.pool_treasury = pool_treasury.key();
        pool_acct.treasury_withdrawal_destination = treasury_withdrawal_destination.key();
        pool_acct.fee_withdrawal_destination = fee_withdrawal_destination.key();
        
        let is_native = treasury_mint.key() == spl_token::native_mint::id();
        let pool_treasury_seeds = [
            PREFIX.as_bytes(),
            pool_key.as_ref(),
            TREASURY.as_bytes(),
            &[treasury_bump],
        ];
        msg!("pool_trea sury_seedspool_trea sury_seeds: {:?}", &pool_treasury_seeds);
        create_program_token_account_if_not_present(
            pool_treasury,
            system_program,
            &payer,
            token_program,
            treasury_mint,
            &pool_acct.to_account_info(),
            rent,
            &pool_treasury_seeds,
            &[],
            is_native,
        )?;

        if !is_native {
            if treasury_withdrawal_destination.data_is_empty() {
                make_ata(
                    treasury_withdrawal_destination.to_account_info(),
                    treasury_withdrawal_destination_owner.to_account_info(),
                    treasury_mint.to_account_info(),
                    payer.to_account_info(),
                    ata_program.to_account_info(),
                    token_program.to_account_info(),
                    system_program.to_account_info(),
                    rent.to_account_info(),
                    &[],
                )?;
            }
      
            assert_is_ata(
                &treasury_withdrawal_destination.to_account_info(),
                &treasury_withdrawal_destination_owner.key(),
                &treasury_mint.key(),
            )?;
        } else {
            assert_keys_equal(
                treasury_withdrawal_destination.key(),
                treasury_withdrawal_destination_owner.key(),
            )?;
        }

        Ok(())
    }
    pub fn deposit<'info>(
        ctx: Context<'_, '_, '_, 'info, Deposit<'info>>,
        escrow_payment_bump: u8,
        amount: u64,
    ) -> ProgramResult {
        // let wallet = &ctx.accounts.wallet;
        // let payment_account = &ctx.accounts.payment_account;
        // let transfer_authority = &ctx.accounts.transfer_authority;
        // let escrow_payment_account = &ctx.accounts.escrow_payment_account;
        // let authority = &ctx.accounts.authority;
        // let auction_house = &ctx.accounts.auction_house;
        // let auction_house_fee_account = &ctx.accounts.auction_house_fee_account;
        // let treasury_mint = &ctx.accounts.treasury_mint;
        // let system_program = &ctx.accounts.system_program;
        // let token_program = &ctx.accounts.token_program;
        // let rent = &ctx.accounts.rent;

        // let auction_house_key = auction_house.key();
        // let seeds = [
        //     PREFIX.as_bytes(),
        //     auction_house_key.as_ref(),
        //     FEE_PAYER.as_bytes(),
        //     &[auction_house.fee_payer_bump],
        // ];
        // let wallet_key = wallet.key();

        // let escrow_signer_seeds = [
        //     PREFIX.as_bytes(),
        //     auction_house_key.as_ref(),
        //     wallet_key.as_ref(),
        //     &[escrow_payment_bump],
        // ];

        // let (fee_payer, fee_seeds) = get_fee_payer(
        //     authority,
        //     auction_house,
        //     wallet.to_account_info(),
        //     auction_house_fee_account.to_account_info(),
        //     &seeds,
        // )?;

        // let is_native = treasury_mint.key() == spl_token::native_mint::id();

        // create_program_token_account_if_not_present(
        //     escrow_payment_account,
        //     system_program,
        //     &fee_payer,
        //     token_program,
        //     treasury_mint,
        //     &auction_house.to_account_info(),
        //     rent,
        //     &escrow_signer_seeds,
        //     fee_seeds,
        //     is_native,
        // )?;

        // if !is_native {
        //     assert_is_ata(payment_account, &wallet.key(), &treasury_mint.key())?;
        //     invoke_signed(
        //         &spl_token::instruction::transfer(
        //             token_program.key,
        //             &payment_account.key(),
        //             &escrow_payment_account.key(),
        //             &transfer_authority.key(),
        //             &[],
        //             amount,
        //         )?,
        //         &[
        //             escrow_payment_account.to_account_info(),
        //             payment_account.to_account_info(),
        //             token_program.to_account_info(),
        //             transfer_authority.to_account_info(),
        //         ],
        //         &[],
        //     )?;
        // } else {
        //     assert_keys_equal(payment_account.key(), wallet.key())?;
        //     invoke_signed(
        //         &system_instruction::transfer(
        //             &payment_account.key(),
        //             &escrow_payment_account.key(),
        //             amount,
        //         ),
        //         &[
        //             escrow_payment_account.to_account_info(),
        //             payment_account.to_account_info(),
        //             system_program.to_account_info(),
        //         ],
        //         &[],
        //     )?;
        // }

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(bump: u8, fee_payer_bump: u8, treasury_bump: u8)]
pub struct InitializePool<'info> {
    pub treasury_mint: Account<'info, Mint>,
    #[account(mut)]
    pub fee_withdrawal_destination: UncheckedAccount<'info>,
    #[account(mut)]
    pub treasury_withdrawal_destination: UncheckedAccount<'info>,
    pub treasury_withdrawal_destination_owner: UncheckedAccount<'info>,
    pub authority: AccountInfo<'info>,
    #[account(mut, seeds=[PREFIX.as_bytes(), pool_str.key().as_ref(), TREASURY.as_bytes()], bump=treasury_bump)]
    pub pool_treasury: UncheckedAccount<'info>,
    pub pool_str: UncheckedAccount<'info>,
    #[account(init, seeds=[PREFIX.as_bytes(), authority.key().as_ref(), treasury_mint.key().as_ref()], bump=bump, space=POOL_SIZE, payer=payer)]
    pub pool_acct: ProgramAccount<'info, PoolAcct>,
    #[account(mut, seeds=[PREFIX.as_bytes(), pool_acct.key().as_ref(), FEE_PAYER.as_bytes()], bump=fee_payer_bump)]
    pub pool_fee_account: UncheckedAccount<'info>,
    pub payer: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub ata_program: Program<'info, AssociatedToken>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(escrow_payment_bump: u8)]
pub struct Deposit<'info> {
    pub wallet: Signer<'info>,
    #[account(mut)]
    pub payment_account: UncheckedAccount<'info>,
    pub transfer_authority: UncheckedAccount<'info>,
    #[account(mut, seeds=[PREFIX.as_bytes(), pool_acct.key().as_ref(), wallet.key().as_ref()], bump=escrow_payment_bump)]
    pub escrow_payment_account: UncheckedAccount<'info>,
    pub treasury_mint: Account<'info, Mint>,
    #[account(signer)]
    pub authority: AccountInfo<'info>,
    #[account(seeds=[PREFIX.as_bytes(), pool_acct.creator.as_ref(), pool_acct.treasury_mint.as_ref()], bump=pool_acct.bump, has_one=authority, has_one=treasury_mint, has_one=pool_fee_account)]
    pub pool_acct: ProgramAccount<'info, PoolAcct>,
    #[account(mut, seeds=[PREFIX.as_bytes(), pool_acct.key().as_ref(), FEE_PAYER.as_bytes()], bump=pool_acct.fee_payer_bump)]
    pub pool_fee_account: UncheckedAccount<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[account]
#[derive(Default, Debug)]
pub struct PoolAcct {
    pub treasury_mint: Pubkey,
    pub treasury_withdrawal_destination: Pubkey,
    pub pool_treasury: Pubkey,
    pub authority: Pubkey,
    pub creator: Pubkey,
    pub pool_fee_account: Pubkey,
    pub fee_withdrawal_destination: Pubkey,
    pub fee_payer_bump: u8,
    pub bump: u8,
    pub treasury_bump: u8,
    // pub nonce: u8,
}
