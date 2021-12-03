// anchor/solana
import { web3, utils } from "@project-serum/anchor";
// utils
import { sha256 } from "js-sha256";

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
