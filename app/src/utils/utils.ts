import { Provider, utils, Wallet, web3, getProvider } from "@project-serum/anchor";
import { Connection } from "@solana/web3.js";
import { sha256 } from "js-sha256";
import {
  Token as SplToken,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

export function GetProvider(wallet: any, network: any) {
  const opts = {
    preflightCommitment: 'processed',
  };
  // @ts-ignore
  const connection = new Connection(network, opts.preflightCommitment);
  const provider = new Provider(
    // @ts-ignore
    connection, wallet, opts.preflightCommitment,
  );
  return [provider, connection] as [Provider, Connection];
}

export async function getTokenBalance(
  assocToken: web3.PublicKey,
  provider: Provider,
  decimals?: number
) {
  const res: web3.RpcResponseAndContext<web3.TokenAmount> =
    await provider.connection.getTokenAccountBalance(assocToken);

  return decimals
    ? Number(res.value.amount) / decimals
    : Number(res.value.amount);
}

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

export const getAssocTokenAcct = (
  owner: web3.PublicKey,
  mintPda: web3.PublicKey
) => {
  const [assocAcct, bump] = findPDA({
    seeds: [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mintPda.toBuffer()],
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
  });
  return [assocAcct, bump] as [web3.PublicKey, number];
};

export const sendSingleIxnTxn = async (ixn: web3.TransactionInstruction, wallet: Wallet, connection: Connection, provider: Provider) => {
  const txn = new web3.Transaction().add(ixn);
  txn.feePayer = wallet?.publicKey;
  txn.recentBlockhash = (
    await connection.getRecentBlockhash()
  ).blockhash;
  const resMain: string = await provider.send(txn);
  await connection.confirmTransaction(resMain, 'processed');
  return resMain;
};

export const handleTxn = async (
  txn_: web3.Transaction,
  provider_: Provider,
  wallet_: Wallet,
) => {
  txn_.feePayer = wallet_.publicKey;
  txn_.recentBlockhash = (
    await provider_.connection.getRecentBlockhash()
  ).blockhash;
  const signedTxn: web3.Transaction = await wallet_.signTransaction(txn_);
  const resMain: string = await provider_.send(signedTxn);
  const conf: web3.RpcResponseAndContext<web3.SignatureResult> =
    await provider_.connection.confirmTransaction(resMain);
  return resMain;
};

export const checkIfAccountExists = async (provider: Provider, wallet: Wallet, userTokenAssoc: web3.PublicKey, tokenMint: web3.PublicKey) => {
  if (!(await getProvider().connection.getAccountInfo(userTokenAssoc))) {
    const txnUserAssoc = new web3.Transaction();
    txnUserAssoc.add(
      SplToken.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        tokenMint,
        userTokenAssoc,
        wallet.publicKey,
        wallet.publicKey,
      )
    );
    try {
      const confirmationUserAssoc = await handleTxn(txnUserAssoc, provider, wallet);
      return confirmationUserAssoc;
    } catch (error) {
      console.log(error);
    }
  }
};