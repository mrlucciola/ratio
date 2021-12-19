// anchor/solana
import { web3, utils, BN } from "@project-serum/anchor";
// utils
import { sha256 } from "js-sha256";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
interface IgenerateSeedsArr {
  name?: string;
  nameSpace?: string;
  otherSeeds?: Buffer[];
}
const generateSeedsArr = ({
  name = "",
  nameSpace = "accounts",
  otherSeeds = [] as Buffer[],
}: IgenerateSeedsArr) => {
  if (name === "") {
    return otherSeeds;
  }
  const seedHash: string = sha256(`${nameSpace}:${name}`);
  const seedDiscriminator: Buffer = Buffer.from(
    seedHash.substring(0, 16),
    "hex"
  );

  const seedsArr = [seedDiscriminator];
  otherSeeds && seedsArr.push(...otherSeeds);
  return seedsArr;
};

interface IFindPDA {
  programId: web3.PublicKey;
  name?: string;
  seeds?: Buffer[];
  nameSpace?: string;
}
export const findPDA = ({
  programId,
  name = "",
  seeds = [] as Buffer[],
  nameSpace = "account",
}: IFindPDA) => {
  const seedsArr = generateSeedsArr({ name, nameSpace, otherSeeds: seeds });
  const [pubKey, bump]: [web3.PublicKey, number] =
    utils.publicKey.findProgramAddressSync(seedsArr, programId);
  return [pubKey, bump] as [web3.PublicKey, number];
};

export async function poolBalance(poolTokenPda: web3.PublicKey, provider) {
  const res: web3.RpcResponseAndContext<web3.TokenAmount> =
    await provider.connection.getTokenAccountBalance(poolTokenPda);

  return res.value.amount as string;
}
export async function getBalance(receiver, mintPda, provider) {
  const parsedTokenAccountsByOwner =
    await provider.connection.getParsedTokenAccountsByOwner(receiver, {
      mint: mintPda,
    });
  let balance =
    parsedTokenAccountsByOwner.value[0].account.data.parsed.info.tokenAmount
      .uiAmount;

  return balance;
}

export async function mintAndDepositTokens(
  amount,
  mintPda,
  mintPdaBump,
  receiver,
  associatedTokenAccount,
  statePda,
  program,
  ixns
) {
  let amountToAirdrop = new BN(amount * 100000000);
  await program.rpc.mintAndDeposit(mintPdaBump, amountToAirdrop, {
    accounts: {
      payer: program.provider.wallet.publicKey,
      mint: mintPda,
      destination: associatedTokenAccount,
      receiver,
      rent: web3.SYSVAR_RENT_PUBKEY,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: web3.SystemProgram.programId,
      associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
      state: statePda,
    },
    signers: [],
    instructions: ixns,
  });
}
