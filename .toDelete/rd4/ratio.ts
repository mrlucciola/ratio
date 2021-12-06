// import { getTokenAccount } from "@project-serum/common";
import * as anchor from "@project-serum/anchor";
import { getProvider } from "@project-serum/anchor";
import * as serumCmn from "@project-serum/common";
import { Ratio } from "../target/types/ratio";
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

describe("ratio 2", () => {
  // Configure the client to use the local cluster.
  const program = anchor.workspace.Ratio;
  const envProvider = anchor.Provider.env();
  // const programProvider = program as anchor.Program<Ratio>;
  anchor.setProvider(envProvider);
  const authority = getProvider().wallet.publicKey; // === program.provider.wallet.publicKey

  const MINT_TOKENS = 600000000000000; // 6M with 8 decimal pts
  const MINT_DECIMALS = 8;
  // constant accounts
  const treasuryMint = NATIVE_SOL_MINT;
  const systemProgram = SystemProgram.programId;
  const rent = SYSVAR_RENT_PUBKEY;
  const ataProgram = ASSOCIATED_TOKEN_PROGRAM_ID;
  const treasuryWithdrawalDestination = authority;
  const treasuryWithdrawalDestinationOwner = authority;

  // uninit constant accounts
  let pool: PublicKey;
  let poolTreasury: PublicKey;
  let poolTreasuryBump: number;
  let bump: number;

  it("init state", async () => {
    const [_pool, _bump] = await PublicKey.findProgramAddress(
      [PREFIX, authority.toBuffer(), treasuryMint.toBuffer()],
      POOL_PROGRAM_ID
    );
    const [_poolTreasury, _poolTreasuryBump] =
      await PublicKey.findProgramAddress(
        [PREFIX, _pool.toBuffer(), TREASURY],
        POOL_PROGRAM_ID
      );
    pool = _pool;
    bump = _bump;
    poolTreasury = _poolTreasury;
    poolTreasuryBump = _poolTreasuryBump;
  });

  it("Actions an interaction", async () => {
    const INTERACTION_FEE = 200000000000000;

    const accounts = {
      treasuryMint, //Account<'info, Mint>,
      treasuryWithdrawalDestination,
      treasuryWithdrawalDestinationOwner,
      payer: authority, //Signer<'info>,
      authority, //AccountInfo<'info>,
      poolAcct: pool,
      poolStr: pool,
      poolTreasury,
      systemProgram,
      tokenProgram: TOKEN_PROGRAM_ID,
      ataProgram,
      rent,
    };

    console.log("*************", accounts);
    await program.rpc.initializePool(
      bump,
      poolTreasuryBump,
      bump,
      { accounts },
    );
    console.log("donezo");
  });
  // it('Creates an auction house', async () => {
  //   const sellerFeeBasisPoints = 1;
  //   const requiresSignOff = true;
  //   const canChangeSalePrice = true;

  //   const txSig = await authorityClient.rpc.createAuctionHouse(
  //     bump,
  //     auctionHouseFeeAccountBump,
  //     auctionHouseTreasuryBump,
  //     sellerFeeBasisPoints,
  //     requiresSignOff,
  //     canChangeSalePrice,
  //     {
  //       accounts: {
  //         treasuryMint,
  //         payer: authority,
  //         authority,
  //         feeWithdrawalDestination,
  //         treasuryWithdrawalDestination,
  //         treasuryWithdrawalDestinationOwner,
  //         auctionHouse,
  //         auctionHouseFeeAccount,
  //         auctionHouseTreasury,
  //         tokenProgram,
  //         systemProgram,
  //         ataProgram,
  //         rent,
  //       },
  //     }
  //   );

  //   console.log('createAuctionHouse:', txSig);
  // });
});
