// import { getTokenAccount } from "@project-serum/common";
import * as anchor from "@project-serum/anchor";
import {
  Provider,
  Program,
  Wallet,
  BN,
  getProvider,
} from "@project-serum/anchor";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  Transaction,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { Ratio, IDL } from "../target/types/ratio";
const assert = require("assert");

// program constants
const NATIVE_SOL_MINT = new PublicKey(
  "So11111111111111111111111111111111111111112"
);
const POOL_PROGRAM_ID = new PublicKey(
  "6cDMc7baVfghT4sUx1t3sEfohxXyj4XwDr8pbarQfz1z"
);

// seed constants
const PREFIX = Buffer.from("pool_acct");
const TREASURY = Buffer.from("treasury");
const FEE_PAYER = Buffer.from("fee_payer");

describe("ratio", async () => {
  // Configure the client to use the local cluster.
  const program = anchor.workspace.Ratio as Program<Ratio>;
  const envProvider = anchor.Provider.env();
  anchor.setProvider(envProvider);
  const authorityProvider = getProvider(); // === program.provider.wallet.publicKey
  const authorityWallet = authorityProvider.wallet; // === program.provider.wallet.publicKey
  const authorityPubKey = authorityWallet.publicKey;

  let authorityClient: Program<Ratio>;
  // buyer vars
  let buyerClient: Program<Ratio>;
  const buyerWallet = Keypair.generate();
  let buyerEscrow: PublicKey;
  let buyerEscrowBump: number;

  // constant accounts
  const treasuryMint = NATIVE_SOL_MINT;
  const systemProgram = SystemProgram.programId;
  const rent = SYSVAR_RENT_PUBKEY;
  const ataProgram = ASSOCIATED_TOKEN_PROGRAM_ID;
  const treasuryWithdrawalDestination = authorityPubKey;
  const treasuryWithdrawalDestinationOwner = authorityPubKey;

  // uninit constant accounts
  let pool: PublicKey;
  let poolTreasury: PublicKey;
  let poolTreasuryBump: number;
  let bump: number;
  let poolFeeAccount: PublicKey;
  let poolFeeAccountBump: number;
  it("more init", async () => {
    buyerClient = new Program<Ratio>(
      IDL,
      POOL_PROGRAM_ID,
      new Provider(
        getProvider().connection,
        new Wallet(buyerWallet),
        Provider.defaultOptions()
      )
    );
  });

  it("init state", async () => {
    const [_pool, _bump] = await PublicKey.findProgramAddress(
      [PREFIX, authorityPubKey.toBuffer(), treasuryMint.toBuffer()],
      POOL_PROGRAM_ID
    );
    const [_poolTreasury, _poolTreasuryBump] =
      await PublicKey.findProgramAddress(
        [PREFIX, _pool.toBuffer(), TREASURY],
        POOL_PROGRAM_ID
      );
    const [_buyerEscrow, _buyerEscrowBump] = await PublicKey.findProgramAddress(
      [PREFIX, _pool.toBuffer(), buyerWallet.publicKey.toBuffer()],
      POOL_PROGRAM_ID
    );
    const [_poolFeeAccount, _poolFeeAccountBump] =
      await PublicKey.findProgramAddress(
        [PREFIX, _pool.toBuffer(), FEE_PAYER],
        POOL_PROGRAM_ID
      );
    pool = _pool;
    bump = _bump;
    poolFeeAccountBump = _poolFeeAccountBump;
    // poolFeeAccount = _poolFeeAccount;
    poolFeeAccount = _poolFeeAccount;
    poolTreasury = _poolTreasury;
    poolTreasuryBump = _poolTreasuryBump;
    buyerEscrow = _buyerEscrow;
    buyerEscrowBump = _buyerEscrowBump;
  });

  it("Funds the buyer with lamports so that it can bid", async () => {
    const tx = new Transaction();
    tx.add(
      SystemProgram.transfer({
        fromPubkey: authorityPubKey,
        toPubkey: buyerWallet.publicKey,
        lamports: 20 * 10 ** 9,
      })
    );
    // tx.add(
    //   SystemProgram.transfer({
    //     fromPubkey: authorityPubKey,
    //     toPubkey: sellerWallet.publicKey,
    //     lamports: 20*10**9,
    //   }),
    // );
    tx.add(
      SystemProgram.transfer({
        fromPubkey: authorityPubKey,
        toPubkey: poolFeeAccount,
        lamports: 100 * 10 ** 9,
      })
    );
    const txSig = await getProvider().send(tx);
    console.log("fund buyer:", txSig);
    const x = await authorityProvider.connection.getAccountInfo(
      authorityWallet.publicKey
    );
    console.log("itsa me", x);
  });

  it("init pool", async () => {
    const accounts = {
      treasuryMint, //Account<'info, Mint>,
      treasuryWithdrawalDestination,
      treasuryWithdrawalDestinationOwner,
      payer: authorityPubKey, //Signer<'info>,
      authority: authorityPubKey, //AccountInfo<'info>,
      poolAcct: pool,
      poolStr: pool,
      poolTreasury,
      systemProgram,
      tokenProgram: TOKEN_PROGRAM_ID,
      ataProgram,
      feeWithdrawalDestination: authorityPubKey,
      poolFeeAccount,
      rent,
    };
    console.log("*************", accounts);
    await program.rpc.initializePool(bump, poolFeeAccountBump, poolTreasuryBump, { accounts });
    console.log("donezo");
  });

  it("Deposits into an escrow account", async () => {
    const amount = new BN(10 * 10 ** 9);
    const txSig = await buyerClient.rpc.deposit(buyerEscrowBump, amount, {
      accounts: {
        wallet: authorityWallet.publicKey,
        paymentAccount: buyerWallet.publicKey,
        transferAuthority: buyerWallet.publicKey,
        escrowPaymentAccount: buyerEscrow,
        treasuryMint,
        authority: authorityPubKey,
        poolAcct: pool,
        poolFeeAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram,
        rent,
      },
      // @ts-ignore
      signers: [authorityWallet.payer],
    });
    console.log("deposit:", txSig);
  });

  // it('Withdraws from the treasury account', async () => {
  //   const txSig = await authorityClient.rpc.withdrawFromTreasury(
  //     new u64(1),
  //     {
  //       accounts: {
  //         treasuryMint,
  //         authority: authorityPubKey,
  //         treasuryWithdrawalDestination,
  //         auctionHouseTreasury,
  //         auctionHouse,
  //         tokenProgram,
  //         systemProgram,
  //       }
  //     },
  //   );
  //   console.log('txSig:', txSig);
  // });
});
