// modules
// import * as anchor from '@project-serum/anchor';
import {
  Provider,
  Program,
  Wallet,
  getProvider,
  web3,
  workspace,
  setProvider,
  utils,
  BN,
} from "@project-serum/anchor";
import {
  Token as SplToken,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
// local
import { Ratio } from '../target/types/ratio';
import { initializeTestState } from "./utils/initializeState";
import { findPDA, poolBalance } from "./utils/utils";

// general constants
const systemProgram = web3.SystemProgram.programId;
const rent = web3.SYSVAR_RENT_PUBKEY;
const USDC_DECIMALS: number = 8;
const amount = 10 ** USDC_DECIMALS;

setProvider(Provider.local());
const provider: Provider = getProvider();
// @ts-ignore
const wallet: Wallet = provider.wallet;

const program = workspace.Ratio as Program<Ratio>;
console.log(`ratio programId: ${program.programId.toString()}`);

// test constants
const usdcMintAuth: web3.Keypair = new web3.Keypair();
let statePda: web3.PublicKey;
let stateBump: number;
let usdcMint: SplToken;
let poolPda: web3.PublicKey;
let poolBump: number;
let userUsdcPda: web3.PublicKey;
let poolUsdcPda: web3.PublicKey;
let redeemableMintPda: web3.PublicKey;
let userRedeemablePda: web3.PublicKey;

describe('ratio', () => {

  before(async () => {
    [statePda, stateBump] = findPDA({
      programId: program.programId,
      name: "State",
    });
    [usdcMint, poolPda, poolBump, poolUsdcPda, redeemableMintPda, userUsdcPda] =
      await initializeTestState({
        USDC_DECIMALS,
        provider,
        program,
        usdcMintAuth,
      });
  });

  it("initalize state", async () => {
    const signature: string = await program.rpc.initState(stateBump, {
      accounts: {
        authority: wallet.publicKey,
        state: statePda,
        rent,
        systemProgram,
      },
      signers: [wallet.payer],
    });
    return signature;
  });

  it("initalize pool", async () => {
    const signature: string = await program.rpc.initPool(poolBump, {
      accounts: {
        authority: wallet.publicKey,
        state: statePda,
        usdcMint: usdcMint.publicKey,
        pool: poolPda,
        poolUsdc: poolUsdcPda,
        redeemableMint: redeemableMintPda,
        rent,
        systemProgram,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [wallet.payer],
    });
  });

  it("deposit funds", async () => {
    // rederive this just as a sanity check
    [userUsdcPda] = findPDA({
      seeds: [wallet.publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(),usdcMint.publicKey.toBuffer()],
      programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    });
    [userRedeemablePda] = findPDA({
      seeds: [wallet.publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(),redeemableMintPda.toBuffer()],
      programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    });

    const ixns = [];

    // create redeemable acct for user if !exist
    if (!(await getProvider().connection.getAccountInfo(userRedeemablePda))) {
      ixns.push(
        SplToken.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          redeemableMintPda,
          userRedeemablePda,
          wallet.publicKey,
          wallet.publicKey
        )
      );
    }

    const poolUsdcBalanceBefore: string = await poolBalance(
      poolUsdcPda,
      provider
    );
    console.log("     poolUsdcBalance before:", poolUsdcBalanceBefore);
    const userUsdcBalanceBefore: string = await poolBalance(
      userUsdcPda,
      provider
    );
    console.log("     userUsdcBalance before:", userUsdcBalanceBefore);
    console.log();
    // approve a token transfer to avoid requiring the wallet
    ixns.push(
      SplToken.createApproveInstruction(
        TOKEN_PROGRAM_ID,
        userUsdcPda,
        statePda,
        wallet.publicKey,
        [],
        amount
      )
    );

    const signature = await program.rpc.deposit(new BN(amount), {
      accounts: {
        state: statePda,
        pool: poolPda,
        poolUsdc: poolUsdcPda,
        redeemableMint: redeemableMintPda,
        userUsdc: userUsdcPda,
        userRedeemable: userRedeemablePda,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [wallet.payer],
      instructions: ixns,
    });
    const poolUsdcBalanceAfter: string = await poolBalance(
      poolUsdcPda,
      provider
    );
    console.log("      poolUsdcBalance after:", poolUsdcBalanceAfter);
    const userUsdcBalanceAfter: string = await poolBalance(
      userUsdcPda,
      provider
    );
    console.log("      userUsdcBalance after:", userUsdcBalanceAfter);
    console.log();
    const userRedeemableBalanceAfter: string = await poolBalance(
      userRedeemablePda,
      provider
    );
    console.log("userRedeemableBalance after:", userRedeemableBalanceAfter);
  });

  it("withdraw funds", async () => {
    // rederive this just as a sanity check
    [userUsdcPda] = findPDA({
      seeds: [wallet.publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(),usdcMint.publicKey.toBuffer()],
      programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    });
    [userRedeemablePda] = findPDA({
      seeds: [wallet.publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(),redeemableMintPda.toBuffer()],
      programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    });

    const ixns = [
      SplToken.createApproveInstruction(
        TOKEN_PROGRAM_ID,
        userRedeemablePda,
        statePda,
        wallet.publicKey,
        [],
        amount
      )
    ];
    const signature = await program.rpc.withdraw(new BN(amount / 2), {
      accounts: {
        state: statePda,
        pool: poolPda,
        poolUsdc: poolUsdcPda,
        redeemableMint: redeemableMintPda,
        userUsdc: userUsdcPda,
        userRedeemable: userRedeemablePda,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [wallet.payer],
      instructions: ixns,
    });
  });
});
