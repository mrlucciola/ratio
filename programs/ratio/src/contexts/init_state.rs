pub use anchor_lang::Discriminator;
use anchor_lang::prelude::*;
// local
use crate::states::State;

#[derive(Accounts)]
#[instruction(state_bump: u8)]
pub struct InitState<'info> {
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
    #[account(mut)]
    pub authority: Signer<'info>,
    // state
    #[account(
        init,
        payer=authority,
        seeds=[&State::discriminator()[..]],
        bump=state_bump,
    )]
    pub state: Account<'info, State>,
}
