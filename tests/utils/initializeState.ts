import { web3 } from "@project-serum/anchor";
import { Token as SplToken, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { findPDA } from "./utils";

// UTILITY FUNCTIONS
export const initializeTestState = async (testParams) => {
  const { USDC_DECIMALS, provider, program, usdcMintAuth } = testParams;
  const wallet = provider.wallet;
  // first create a fresh mint
  const usdcMint = await SplToken.createMint(
    provider.connection,
    wallet.payer,
    usdcMintAuth.publicKey,
    null,
    USDC_DECIMALS,
    TOKEN_PROGRAM_ID
  );

  // find redeemable mint
  const [redeemableMintPda] = findPDA({
    programId: program.programId,
    seeds: [Buffer.from("REDEEMABLE_MINT")],
  });
  // find pdas for respective pools
  const [poolPda, poolBump] = findPDA({
    programId: program.programId,
    name: "Pool",
    seeds: [usdcMint.publicKey.toBuffer()],
  });
  const [poolRedeemablePda] = findPDA({
    programId: program.programId,
    seeds: [Buffer.from("POOL_REDEEMABLE"), redeemableMintPda.toBuffer()],
  });
  
  return [
    usdcMint,
    poolPda,
    poolBump,
    poolRedeemablePda,
    redeemableMintPda,
  ] as [SplToken, web3.PublicKey, number, web3.PublicKey, web3.PublicKey];
};
