#[access_control(InitializePool::accounts(&ctx, nonce) future_start_time(&ctx, start_ido_ts))]
pub fn initialize_pool(
    ctx: Context<InitializePool>,
    // num_ido_tokens: u64,
    nonce: u8,
    // start_ido_ts: i64,
    // end_deposits_ts: i64,
    // end_ido_ts: i64,
) -> Result<()> {
    // if !(start_ido_ts < end_deposits_ts && end_deposits_ts < end_ido_ts) {
    //     return Err(ErrorCode::SeqTimes.into());
    // }

    let pool_account = &mut ctx.accounts.pool_account;
    pool_account.redeemable_mint = *ctx.accounts.redeemable_mint.to_account_info().key;
    // pool_account.pool_watermelon = *ctx.accounts.pool_watermelon.to_account_info().key;
    // pool_account.watermelon_mint = ctx.accounts.pool_watermelon.mint;
    pool_account.pool_usdc = *ctx.accounts.pool_usdc.to_account_info().key;
    pool_account.distribution_authority = *ctx.accounts.distribution_authority.key;
    pool_account.nonce = nonce;
    // pool_account.num_ido_tokens = num_ido_tokens;
    // pool_account.start_ido_ts = start_ido_ts;
    // pool_account.end_deposits_ts = end_deposits_ts;
    // pool_account.end_ido_ts = end_ido_ts;

    // Transfer Watermelon from creator to pool account.
    let cpi_accounts = Transfer {
        // from: ctx.accounts.creator_watermelon.to_account_info(),
        // to: ctx.accounts.pool_watermelon.to_account_info(),
        authority: ctx.accounts.distribution_authority.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.clone();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, num_ido_tokens)?;

    Ok(())
}

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(init)]
    pub pool_account: ProgramAccount<'info, PoolAccount>,
    pub pool_signer: AccountInfo<'info>,
    #[account(
        constraint = redeemable_mint.mint_authority == COption::Some(*pool_signer.key),
        constraint = redeemable_mint.supply == 0
    )]
    pub redeemable_mint: CpiAccount<'info, Mint>,
    #[account(constraint = usdc_mint.decimals == redeemable_mint.decimals)]
    pub usdc_mint: CpiAccount<'info, Mint>,
    // #[account(mut, constraint = pool_watermelon.owner == *pool_signer.key)]
    // pub pool_watermelon: CpiAccount<'info, TokenAccount>,
    #[account(constraint = pool_usdc.owner == *pool_signer.key)]
    pub pool_usdc: CpiAccount<'info, TokenAccount>,
    #[account(signer)]
    pub distribution_authority: AccountInfo<'info>,
    // #[account(mut, constraint = creator_watermelon.owner == *distribution_authority.key)]
    // pub creator_watermelon: CpiAccount<'info, TokenAccount>,
    #[account(constraint = token_program.key == &token::ID)]
    pub token_program: AccountInfo<'info>,
    pub rent: Sysvar<'info, Rent>,
    pub clock: Sysvar<'info, Clock>,
}
#[error]
pub enum ErrorCode {
    #[msg("IDO must start in the future")]
    IdoFuture,
    #[msg("IDO times are non-sequential")]
    SeqTimes,
    #[msg("IDO has not started")]
    StartIdoTime,
    #[msg("Deposits period has ended")]
    EndDepositsTime,
    #[msg("IDO has ended")]
    EndIdoTime,
    #[msg("IDO has not finished yet")]
    IdoNotOver,
    #[msg("Insufficient USDC")]
    LowUsdc,
    #[msg("Insufficient redeemable tokens")]
    LowRedeemable,
    #[msg("USDC total and redeemable total don't match")]
    UsdcNotEqRedeem,
    #[msg("Given nonce is invalid")]
    InvalidNonce,
}