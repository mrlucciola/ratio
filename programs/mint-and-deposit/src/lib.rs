use anchor_lang::prelude::*;
// local
use ratio::cpi::accounts::MintAndDeposit;

declare_id!("9AWyK1cbjJxP5HLctXeiG1ZHRkZo7sUiy7km7SCtjG9G");

#[program]
#[deny(unused_must_use)]
pub mod mint_and_deposit {
    use super::*;

    pub fn mint_and_deposit_cpi<'info>(ctx: Context<MintAndDepositCpiAccount>, mint_amount: u64) -> ProgramResult {
        ratio::cpi::mint_and_deposit(ctx.accounts.into_mint_and_address_ctx(), mint_amount)?;

        Ok(())

    }
}

#[derive(Accounts)]
pub struct MintAndDepositCpiAccount<'info> {
    #[account(mut)]
    pub state: AccountInfo<'info>,
    #[account(mut)]
    pub currency_mint: AccountInfo<'info>,
    #[account(mut)]
    pub dest_currency: AccountInfo<'info>,
    pub token_program: AccountInfo<'info>,
    pub ratio_program: AccountInfo<'info>,
}

impl <'info> MintAndDepositCpiAccount<'info> {
    fn into_mint_and_address_ctx(&self) -> CpiContext<'_, '_, '_, 'info, MintAndDeposit<'info>> {
        CpiContext::new(
            self.ratio_program.clone().to_account_info(),
            MintAndDeposit {
                state: self.state.clone().to_account_info(),
                currency_mint: self.currency_mint.clone().to_account_info(),
                dest_currency: self.dest_currency.clone().to_account_info(),
                token_program: self.token_program.clone().to_account_info(),
            },
        )
    }
}