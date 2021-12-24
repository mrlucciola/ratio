import { web3 } from "@project-serum/anchor";
import idlMintAndDeposit from "../mint_and_deposit_idl.json";
import idlRatio from "../ratio_idl.json";

interface IPda {
  pda: web3.PublicKey,
  bump: number,
  currencyAssoc?: web3.PublicKey,
}
interface IinitState {
  action: string;
  endpoint: string;
  state: IPda;
  currency: IPda;
  pool: IPda;
  poolAmount: number;
  userAmount: number;
  idlRatio: any;
  idlMintAndDeposit: any;
  programIdRatio: web3.PublicKey;
  programIdMintAndDeposit: web3.PublicKey;
}
// @ts-ignore
const programIdRatio: web3.PublicKey = new web3.PublicKey(idlRatio.metadata.address);
// @ts-ignore
const programIdMintAndDeposit: web3.PublicKey = new web3.PublicKey(idlMintAndDeposit.metadata.address);
// @ts-ignore
export const initState: IinitState = {
  action: "Deposit",
  programIdRatio,
  programIdMintAndDeposit,
  idlRatio,
  idlMintAndDeposit,
  endpoint: "http://127.0.0.1:8899",
  state: {
    pda: new web3.PublicKey("GPVQCW1pu31pDRj1kpAfXbLRkJ1dgzQcPcMrL5k6eCHN"),
    bump: 255,
  },
  currency: {
    pda: new web3.PublicKey("2PTzPm2mZUyB3d55rEDHfGBDM2ecaySuWyMPoxj7p65k"),
    bump: 253,
  },
  pool: {
    pda: new web3.PublicKey("4buB8xpiFM3NmBgKtrjJ7k3Z8vjuC1E9mba4PMnftb7S"),
    currencyAssoc: new web3.PublicKey("HZKE3rqqX6SiCNdbYjMTpu3xVGK6HnkiJzyPvxyaKMGw"),
    bump: 251,
  },
  poolAmount: 0,
  userAmount: 0,
};
