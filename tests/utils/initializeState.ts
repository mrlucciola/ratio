import { Provider, web3 } from "@project-serum/anchor";
import { Token as SplToken, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { findPDA } from "./utils";

// constants
const LAMPORTS_PER_SOL: number = web3.LAMPORTS_PER_SOL;

// UTILITY FUNCTIONS
const airdrop = async (
  provider: Provider,
  target: web3.PublicKey,
  lamps: number
) => {
  const signature: string = await provider.connection.requestAirdrop(
    target,
    lamps
  );
  const txnHash = await provider.connection.confirmTransaction(signature);
  return signature;
};
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

  // find pdas for respective pools
  const [poolPda, poolBump] = findPDA({
    programId: program.programId,
    name: "Pool",
    seeds: [usdcMint.publicKey.toBuffer()],
  });
  const [poolUsdcPda] = findPDA({
    programId: program.programId,
    seeds: [Buffer.from("USDC"), usdcMint.publicKey.toBuffer()],
  });
  // find redeemable mint
  const [redeemableMintPda] = findPDA({
    programId: program.programId,
    seeds: [Buffer.from("REDEEMABLE"), usdcMint.publicKey.toBuffer()],
  });

  // assoc account for usdc
  const userUsdcPda = (
    await usdcMint.getOrCreateAssociatedAccountInfo(wallet.publicKey)
  ).address;

  // send money to mint auth
  await airdrop(provider, usdcMintAuth.publicKey, 100 * LAMPORTS_PER_SOL);

  // mint 100 usdc to our wallet
  await usdcMint.mintTo(
    userUsdcPda,
    usdcMintAuth,
    [],
    100 * 10 ** USDC_DECIMALS
  );
  return [
    usdcMint,
    poolPda,
    poolBump,
    poolUsdcPda,
    redeemableMintPda,
    userUsdcPda,
  ] as [SplToken, web3.PublicKey, number, web3.PublicKey, web3.PublicKey, web3.PublicKey];
};
