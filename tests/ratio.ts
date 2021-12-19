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
  BN,
} from "@project-serum/anchor";
import {
  Token as SplToken,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
// local
import { Ratio } from "../target/types/ratio";
import { initializeTestState } from "./utils/initializeState";
import {
  findPDA,
  getBalance,
  mintAndDepositTokens,
  poolBalance,
} from "./utils/utils";

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
let redeemableMintPda: web3.PublicKey;
let redeemableMintBump: number;
let userRedeemablePda: web3.PublicKey;
let poolRedeemablePda: web3.PublicKey;

describe("ratio", () => {
  before(async () => {
    [statePda, stateBump] = findPDA({
      programId: program.programId,
      name: "State",
    });
    [
      usdcMint,
      poolPda,
      poolBump,
      poolRedeemablePda,
      redeemableMintPda,
      redeemableMintBump,
    ] = await initializeTestState({
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
        poolRedeemable: poolRedeemablePda,
        redeemableMint: redeemableMintPda,
        rent,
        systemProgram,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [wallet.payer],
    });
  });

  it("mint and deposit", async () => {
    // get mint pda
    // const [mintPda, mintPdaBump] = await anchor.web3.PublicKey.findProgramAddress(
    //   [Buffer.from(anchor.utils.bytes.utf8.encode("MINT_AND_DEPOSIT"))],
    //   program.programId);

    // const receiver = new web3.PublicKey("8hpvAu6cq6qzVM4NpXp9bH2uuT4PEYMJvrXKrSd5tdfR");
    const ixns = [];
    if (!(await getProvider().connection.getAccountInfo(poolRedeemablePda))) {
      ixns.push(
        SplToken.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          redeemableMintPda,
          poolRedeemablePda,
          wallet.publicKey,
          wallet.publicKey
        )
      );
    }
    console.log('iasdifsidnfsodifn', ixns)

    let associatedTokenAccount = await SplToken.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      redeemableMintPda,
      poolRedeemablePda,
      true
    );
    console.log(`              receiver: ${poolRedeemablePda}`);
    console.log(
      `               mintPda: ${redeemableMintPda} - ${redeemableMintBump}`
    );
    console.log(`associatedTokenAccount: ${associatedTokenAccount}`);
    // FIRST AIRDROP
    const firstAirdropAmount = 100;
    await mintAndDepositTokens(
      firstAirdropAmount,
      redeemableMintPda,
      redeemableMintBump,
      poolRedeemablePda,
      associatedTokenAccount,
      statePda,
      program,
      ixns,
    );
    let balance = await getBalance(
      poolRedeemablePda,
      redeemableMintPda,
      provider
    );
    console.log('balalalla', balance)
    // assert.ok(balance == firstAirdropAmount);

    // SECOND AIRDROP
    // const secondAirdropAmount = 200;
    // await mintAndDepositTokens(
    //   secondAirdropAmount,
    //   redeemableMintPda,
    //   redeemableMintBump,
    //   poolRedeemablePda,
    //   associatedTokenAccount,
    //   statePda
    //   program,
    //   ixns,
    // );
    // balance = await getBalance(poolRedeemablePda, redeemableMintPda, provider);
    // assert.ok(balance == firstAirdropAmount + secondAirdropAmount);
  });

  // were using the mintToPool function to mint to user for init
  it("mint init user balance", async () => {
    const mintAmount = 27 * 10 ** USDC_DECIMALS;
    [userRedeemablePda] = findPDA({
      seeds: [
        wallet.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        redeemableMintPda.toBuffer(),
      ],
      programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    });
    const ixns = [];
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

    const signature: string = await program.rpc.mintToPool(new BN(mintAmount), {
      accounts: {
        state: statePda,
        pool: poolPda,
        redeemableMint: redeemableMintPda,
        poolRedeemable: userRedeemablePda,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [wallet.payer],
      instructions: ixns,
    });
    console.log(
      "userRedeemablePda Balance after mint:",
      await poolBalance(userRedeemablePda, provider)
    );
  });

  it("mint to pool", async () => {
    const mintAmount = (3.14 / 100) * 10 ** USDC_DECIMALS;
    [userRedeemablePda] = findPDA({
      seeds: [
        wallet.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        redeemableMintPda.toBuffer(),
      ],
      programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    });
    const ixns = [];
    if (!(await getProvider().connection.getAccountInfo(poolRedeemablePda))) {
      ixns.push(
        SplToken.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          redeemableMintPda,
          poolRedeemablePda,
          wallet.publicKey,
          wallet.publicKey
        )
      );
    }

    const signature: string = await program.rpc.mintToPool(new BN(mintAmount), {
      accounts: {
        state: statePda,
        pool: poolPda,
        redeemableMint: redeemableMintPda,
        poolRedeemable: poolRedeemablePda,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [wallet.payer],
      instructions: ixns,
    });
    console.log(
      "poolRedeemablePda Balance after mint:",
      await poolBalance(poolRedeemablePda, provider)
    );
  });

  it("deposit funds", async () => {
    // rederive as a sanity check
    [userRedeemablePda] = findPDA({
      seeds: [
        wallet.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        redeemableMintPda.toBuffer(),
      ],
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

    // approve a token transfer
    ixns.push(
      SplToken.createApproveInstruction(
        TOKEN_PROGRAM_ID,
        userRedeemablePda,
        statePda,
        wallet.publicKey,
        [],
        amount
      )
    );
    console.log(
      "userRedeemablePda Balance before:",
      await poolBalance(userRedeemablePda, provider)
    );
    console.log(
      "poolRedeemablePda Balance before:",
      await poolBalance(poolRedeemablePda, provider)
    );
    const signature = await program.rpc.deposit(new BN(amount), {
      accounts: {
        state: statePda,
        pool: poolPda,
        redeemableMint: redeemableMintPda,
        userRedeemable: userRedeemablePda,
        poolRedeemable: poolRedeemablePda,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [wallet.payer],
      instructions: ixns,
    });
    console.log(
      "userRedeemablePda Balance after:",
      await poolBalance(userRedeemablePda, provider)
    );
    console.log(
      "poolRedeemablePda Balance after:",
      await poolBalance(poolRedeemablePda, provider)
    );
  });

  it("withdraw funds", async () => {
    // rederive as a sanity check
    [userRedeemablePda] = findPDA({
      seeds: [
        wallet.publicKey.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        redeemableMintPda.toBuffer(),
      ],
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
      ),
    ];
    console.log(
      "userRedeemablePda Balance before:",
      await poolBalance(userRedeemablePda, provider)
    );
    console.log(
      "poolRedeemablePda Balance before:",
      await poolBalance(poolRedeemablePda, provider)
    );
    const signature = await program.rpc.withdraw(new BN(amount / 2), {
      accounts: {
        state: statePda,
        pool: poolPda,
        poolRedeemable: poolRedeemablePda,
        redeemableMint: redeemableMintPda,
        userRedeemable: userRedeemablePda,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
      signers: [wallet.payer],
      instructions: ixns,
    });
    console.log(
      "userRedeemablePda Balance after:",
      await poolBalance(userRedeemablePda, provider)
    );
    console.log(
      "poolRedeemablePda Balance after:",
      await poolBalance(poolRedeemablePda, provider)
    );
  });
});
