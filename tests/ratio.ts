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
  // ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import {
  // Transaction,
  Keypair,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
} from "@solana/web3.js";
import { Ratio, IDL } from "../target/types/ratio";
const assert = require("assert");
import {
  // sleep,
  // getTokenAccount,
  createMint,
  createTokenAccount,
  mintToAccount,
} from "./utils";

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

  // let authorityClient: Program<Ratio>;
  // buyer vars
  // let buyerClient: Program<Ratio>;
  // const buyerWallet = Keypair.generate();
  // let buyerEscrow: PublicKey;
  // let buyerEscrowBump: number;

  // constant accounts
  // const treasuryMint = NATIVE_SOL_MINT;
  const systemProgram = SystemProgram.programId;
  const rent = SYSVAR_RENT_PUBKEY;
  // const ataProgram = ASSOCIATED_TOKEN_PROGRAM_ID;
  // const treasuryWithdrawalDestination = authorityPubKey;
  // const treasuryWithdrawalDestinationOwner = authorityPubKey;

  // uninit constant accounts
  // let pool: PublicKey;
  // let poolTreasury: PublicKey;
  // let poolTreasuryBump: number;
  // let bump: number;
  // let poolFeeAccount: PublicKey;
  // let poolFeeAccountBump: number;
  let poolSigner: PublicKey;
  let watermelonMint: PublicKey;
  let poolAccountKeypair: Keypair;
  let poolAccountPubKey: PublicKey;
  let creatorWatermelon: PublicKey;
  let nonce: number;
  // let poolAccount = null;
  let usdcMint: PublicKey;
  let creatorUsdc: PublicKey;
  const watermelonIdoAmount = new anchor.BN(5000000);

  // it("more init", async () => {
  //   buyerClient = new Program<Ratio>(
  //     IDL,
  //     POOL_PROGRAM_ID,
  //     new Provider(
  //       getProvider().connection,
  //       new Wallet(buyerWallet),
  //       Provider.defaultOptions()
  //     )
  //   );
  // });

  it("init state", async () => {
    watermelonMint = await createMint(envProvider, undefined);
    usdcMint = await createMint(envProvider, undefined);
    creatorUsdc = await createTokenAccount(
      envProvider,
      usdcMint,
      envProvider.wallet.publicKey
    );
    creatorWatermelon = await createTokenAccount(
      envProvider,
      watermelonMint,
      envProvider.wallet.publicKey
    );

    await mintToAccount(
      envProvider,
      watermelonMint,
      creatorWatermelon,
      watermelonIdoAmount,
      envProvider.wallet.publicKey
    );
  });

  // init pools
  let poolWatermelon: PublicKey;
  let poolUsdc: PublicKey;
  let redeemableMint: PublicKey;

  it("init pool", async () => {
    const [_poolSigner, _nonce] =
      await anchor.web3.PublicKey.findProgramAddress(
        [watermelonMint.toBuffer()],
        program.programId
      );
    poolSigner = _poolSigner;
    nonce = _nonce;

    redeemableMint = await createMint(envProvider, poolSigner);
    poolWatermelon = await createTokenAccount(
      envProvider,
      watermelonMint,
      poolSigner
    );
    poolUsdc = await createTokenAccount(envProvider, usdcMint, poolSigner);
    poolAccountKeypair = anchor.web3.Keypair.generate();
    poolAccountPubKey = poolAccountKeypair.publicKey;

    console.log("\n\n*************");
    console.log("params", new BN(100), new BN(nonce));
    await program.rpc.initializePool(
      new BN(nonce), // nonce
      new BN(nonce), // nonce
      // new BN(100), // watermelonIdoAmount
      {
        accounts: {
          tokenProgram: TOKEN_PROGRAM_ID,
          rent,
          systemProgram,

          authority: authorityPubKey, //AccountInfo<'info> = distributionAuthority

          usdcMint,
          creatorWatermelon,
          poolUsdc,
          poolAccount: poolAccountPubKey,
          poolSigner,
          poolWatermelon,
          redeemableMint,
        },
        signers: [poolAccountKeypair],
        // instructions: [
        //   await program.account.poolAccount.createInstruction(
        //     poolAccountKeypair
        //   ),
        // ],
      }
    );
    console.log("donezo");
  });

  let userUsdc = null;
  let userRedeemable = null;
  const firstDeposit = new anchor.BN(22_070_349);

  it("Exchanges user USDC for redeemable tokens", async () => {
    userUsdc = await createTokenAccount(
      envProvider,
      usdcMint,
      envProvider.wallet.publicKey
    );

    await mintToAccount(
      envProvider,
      usdcMint,
      userUsdc,
      firstDeposit,
      envProvider.wallet.publicKey
    );

    userRedeemable = await createTokenAccount(
      envProvider,
      redeemableMint,
      envProvider.wallet.publicKey
    );

    try {
      const tx = await program.rpc.exchangeUsdcForRedeemable(firstDeposit, {
        accounts: {
          poolAccount: poolAccountPubKey,
          poolSigner,
          redeemableMint,
          poolUsdc,
          userAuthority: envProvider.wallet.publicKey,
          userUsdc,
          userRedeemable,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      });
    } catch (err) {
      console.log("This is the error message", err.toString());
    }

    // poolUsdcAccount = await getTokenAccount(provider, poolUsdc);
    // assert.ok(poolUsdcAccount.amount.eq(firstDeposit));
    // userRedeemableAccount = await getTokenAccount(provider, userRedeemable);
    // assert.ok(userRedeemableAccount.amount.eq(firstDeposit));
  });

  const firstWithdrawal = new anchor.BN(2_000_000);

  it("Exchanges user Redeemable tokens for USDC", async () => {
    await program.rpc.exchangeRedeemableForUsdc(firstWithdrawal, {
      accounts: {
        poolAccount: poolAccountPubKey,
        poolSigner,
        redeemableMint,
        poolUsdc,
        userAuthority: envProvider.wallet.publicKey,
        userUsdc,
        userRedeemable,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    });

    // totalPoolUsdc = totalPoolUsdc.sub(firstWithdrawal);
    // poolUsdcAccount = await getTokenAccount(provider, poolUsdc);
    // assert.ok(poolUsdcAccount.amount.eq(totalPoolUsdc));
    // userUsdcAccount = await getTokenAccount(provider, userUsdc);
    // assert.ok(userUsdcAccount.amount.eq(firstWithdrawal));
  });
  // {
  //   poolAccount,
  //   userAuthority,
  //   userRedeemable,
  // }
});
