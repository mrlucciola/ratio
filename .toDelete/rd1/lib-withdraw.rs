#[access_control(withdraw_only_phase(&ctx))]
pub fn exchange_redeemable_for_usdc(
    ctx: Context<ExchangeRedeemableForUsdc>,
    amount: u64,
) -> Result<()> {
    // While token::burn will check this, we prefer a verbose err msg.
    if ctx.accounts.user_redeemable.amount < amount {
        return Err(ErrorCode::LowRedeemable.into());
    }

    // // // Burn the user's redeemable tokens.
    // // let cpi_accounts = Burn {
    // //     mint: ctx.accounts.redeemable_mint.to_account_info(),
    // //     to: ctx.accounts.user_redeemable.to_account_info(),
    // //     authority: ctx.accounts.user_authority.to_account_info(),
    // // };
    // // let cpi_program = ctx.accounts.token_program.clone();
    // // let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    // // token::burn(cpi_ctx, amount)?;

    // Transfer USDC from pool account to user.
    let seeds = &[
        // ctx.accounts.pool_account.watermelon_mint.as_ref(),
        ctx.accounts.pool_account.pool_usdct.as_ref(),
        &[ctx.accounts.pool_account.nonce],
    ];
    let signer = &[&seeds[..]];
    let cpi_accounts = Transfer {
        from: ctx.accounts.pool_usdc.to_account_info(),
        to: ctx.accounts.user_usdc.to_account_info(),
        authority: ctx.accounts.pool_signer.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.clone();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::transfer(cpi_ctx, amount)?;

    Ok(())
}

#[derive(Accounts)]
pub struct ExchangeRedeemableForUsdc<'info> {
    // #[account(has_one = redeemable_mint, has_one = pool_usdc)]
    #[account(has_one = pool_usdc)]
    pub pool_account: ProgramAccount<'info, PoolAccount>,

    #[account(seeds = [pool_account.watermelon_mint.as_ref(), &[pool_account.nonce]])]
    pool_signer: AccountInfo<'info>,
    
    // #[account(
    //   mut,
    //   constraint = redeemable_mint.mint_authority == COption::Some(*pool_signer.key)
    // )]
    // pub redeemable_mint: CpiAccount<'info, Mint>,
    
    #[account(mut, constraint = pool_usdc.owner == *pool_signer.key)]
    pub pool_usdc: CpiAccount<'info, TokenAccount>,
    
    #[account(signer)]
    pub user_authority: AccountInfo<'info>,
    
    #[account(mut, constraint = user_usdc.owner == *user_authority.key)]
    pub user_usdc: CpiAccount<'info, TokenAccount>,
    
    // #[account(mut, constraint = user_redeemable.owner == *user_authority.key)]
    // pub user_redeemable: CpiAccount<'info, TokenAccount>,
    
    #[account(constraint = token_program.key == &token::ID)]
    pub token_program: AccountInfo<'info>,
    pub clock: Sysvar<'info, Clock>,
}

#[account]
pub struct PoolAccount {
    // pub redeemable_mint: Pubkey,
    // pub pool_watermelon: Pubkey,
    // pub watermelon_mint: Pubkey,
    pub pool_usdc: Pubkey,
    pub distribution_authority: Pubkey,
    pub nonce: u8,
    // pub num_ido_tokens: u64,
    // pub start_ido_ts: i64,
    // pub end_deposits_ts: i64,
    // pub end_ido_ts: i64,
}
