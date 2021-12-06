// TODO: use the `@solana/spl-token` package instead of utils here.
import * as anchor from '@project-serum/anchor';
import serumCmn from "@project-serum/common";
import { TokenInstructions } from "@project-serum/serum";

// TODO: remove this constant once @project-serum/serum uses the same version
//       of @solana/web3.js as anchor (or switch packages).
export const TOKEN_PROGRAM_ID = new anchor.web3.PublicKey(
  TokenInstructions.TOKEN_PROGRAM_ID.toString()
);

// Our own sleep function.
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getTokenAccount(provider, addr) {
  return await serumCmn.getTokenAccount(provider, addr);
}

export async function createMint(provider, authority) {
  if (authority === undefined) {
    authority = provider.wallet.publicKey;
  }
  const mint = anchor.web3.Keypair.generate();
  const instructions = await createMintInstructions(
    provider,
    authority,
    mint.publicKey
  );

  const tx = new anchor.web3.Transaction();
  tx.add(...instructions);

  await provider.send(tx, [mint]);

  return mint.publicKey;
}

async function createMintInstructions(provider, authority, mint) {
  let instructions = [
    anchor.web3.SystemProgram.createAccount({
      fromPubkey: provider.wallet.publicKey,
      newAccountPubkey: mint,
      space: 82,
      lamports: await provider.connection.getMinimumBalanceForRentExemption(82),
      programId: TOKEN_PROGRAM_ID,
    }),
    TokenInstructions.initializeMint({
      mint,
      decimals: 6,
      mintAuthority: authority,
    }),
  ];
  return instructions;
}

export async function createTokenAccount(provider, mint, owner) {
  const vault = anchor.web3.Keypair.generate();
  const tx = new anchor.web3.Transaction();
  tx.add(
    ...(await createTokenAccountIxns(
      provider,
      vault.publicKey,
      mint,
      owner,
      undefined
    ))
  );
  await provider.send(tx, [vault]);
  return vault.publicKey;
}

async function createTokenAccountIxns(
  provider,
  newAccountPubkey,
  mint,
  owner,
  lamports
) {
  if (lamports === undefined) {
    lamports = await provider.connection.getMinimumBalanceForRentExemption(165);
  }
  return [
    anchor.web3.SystemProgram.createAccount({
      fromPubkey: provider.wallet.publicKey,
      newAccountPubkey,
      space: 165,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    TokenInstructions.initializeAccount({
      account: newAccountPubkey,
      mint,
      owner,
    }),
  ];
}

export async function mintToAccount(
  provider,
  mint,
  destination,
  amount,
  mintAuthority
) {
  // mint authority is the provider
  const tx = new anchor.web3.Transaction();
  tx.add(
    ...(await createMintToAccountIxns(
      mint,
      destination,
      amount,
      mintAuthority
    ))
  );
  await provider.send(tx, []);
  return;
}

async function createMintToAccountIxns(
  mint,
  destination,
  amount,
  mintAuthority
) {
  return [
    TokenInstructions.mintTo({
      mint,
      destination: destination,
      amount: amount,
      mintAuthority: mintAuthority,
    }),
  ];
}
