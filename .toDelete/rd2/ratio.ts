import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";
const assert = require("assert");
import { getTokenAccount } from "@project-serum/common";
import { Ratio } from "../target/types/ratio";
import {
  createMint,
  createTokenAccount,
  mintToAccount,
  TOKEN_PROGRAM_ID,
} from "./utils";
// import { Pool } from '../target/types/pool';

describe("ratio", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.Provider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.Ratio as Program<Ratio>;
  const envProvider = program.provider;

  // All mints default to 6 decimal places.
  // const watermelonIdoAmount = new anchor.BN(5000000);

  // These are all of the variables we assume exist in the world already and
  // are available to the client.
  let tokenMint = null;
  // let watermelonMint = null;
  let seedMint = null;
  let creatorToken = null;
  // let creatorWatermelon = null;
  let systemProgram = anchor.web3.SystemProgram.programId;

  it("init app state", async () => {
    tokenMint = await createMint(provider, undefined);
    // watermelonMint = await createMint(provider, undefined);
    seedMint = await createMint(provider, undefined);
    creatorToken = await createTokenAccount(
      provider,
      tokenMint,
      provider.wallet.publicKey
    );

    // const [sandboxPda, sandboxBump] = await PublicKey.findProgramAddress([Buffer.from('pool')], program.programId);
    // creatorWatermelon = await createTokenAccount(
    //   provider,
    //   watermelonMint,
    //   provider.wallet.publicKey
    // );
    // // Mint Watermelon tokens the will be distributed from the IDO pool.
    // await mintToAccount(
    //   provider,
    //   watermelonMint,
    //   creatorWatermelon,
    //   watermelonIdoAmount,
    //   provider.wallet.publicKey
    // );
    // creator_watermelon_account = await getTokenAccount(
    //   provider,
    //   creatorWatermelon
    // );
    // assert.ok(creator_watermelon_account.amount.eq(watermelonIdoAmount));
  });

  // client side pool init vars
  let poolSigner = null;
  let redeemableMint = null;
  // let poolWatermelon = null;
  let poolToken = null;
  let poolAccount = null;

  // let startIdoTs = null;
  // let endDepositsTs = null;
  // let endIdoTs = null;

  it("init pool", async () => {
    // We use the watermelon mint address as the seed, could use something else though.
    const [_poolSigner, nonce] = await anchor.web3.PublicKey.findProgramAddress(
      // [watermelonMint.toBuffer()],
      [seedMint.toBuffer()],
      program.programId
    );
    poolSigner = _poolSigner;

    // Pool doesn't need a Redeemable SPL token account because it only
    // burns and mints redeemable tokens, it never stores them.
    redeemableMint = await createMint(provider, poolSigner);
    // poolWatermelon = await createTokenAccount(
    //   provider,
    //   watermelonMint,
    //   poolSigner
    // );
    poolToken = await createTokenAccount(provider, tokenMint, poolSigner);

    poolAccount = anchor.web3.Keypair.generate();
    // const nowBn = new anchor.BN(Date.now() / 1000);
    // startIdoTs = nowBn.add(new anchor.BN(5));
    // endDepositsTs = nowBn.add(new anchor.BN(10));
    // endIdoTs = nowBn.add(new anchor.BN(15));

    // Atomically create the new account and initialize it with the program.
    const asdf = await program.account.poolAccount.createInstruction(
      poolAccount
    );
    console.log("asdfasdfasdfa", nonce, {
      accounts: {
        poolAccount: poolAccount.publicKey,
        poolSigner,
        distributionAuthority: provider.wallet.publicKey,
        redeemableMint,
        tokenMint,
        poolToken,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram,
        // clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      },
      signers: [poolAccount],
      instructions: [asdf],
    });
    await program.rpc.initializePool(nonce, {
      accounts: {
        poolAccount: poolAccount.publicKey,
        poolSigner,
        distributionAuthority: provider.wallet.publicKey,
        redeemableMint,
        tokenMint,
        poolToken,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: anchor.web3.SYSVAR_RENT_PUBKEY,
        systemProgram,
        // clock: anchor.web3.SYSVAR_CLOCK_PUBKEY,
      },
      signers: [poolAccount],
      instructions: [asdf],
    });
    console.log("\n\n\n\nDONE\n\n\n\n", poolToken);

    // creators_watermelon_account = await getTokenAccount(
    //   provider,
    //   creatorWatermelon
    // );
    // assert.ok(creators_watermelon_account.amount.eq(new anchor.BN(0)));
  });

  it("Performs CPI from user to pool", async () => {
    const caller = anchor.workspace.Ratio;
    const pool = anchor.workspace.Pool;
  });
});

// let x = {
//   name: "poolAccount",
//   type: {
//     kind: "struct",
//     fields: [
//       {
//         name: "redeemableMint",
//         type: "publicKey",
//       },
//       {
//         name: "poolToken",
//         type: "publicKey",
//       },
//       {
//         name: "distributionAuthority",
//         type: "publicKey",
//       },
//       {
//         // ...,
//       }
//     ],
//   },
// }
