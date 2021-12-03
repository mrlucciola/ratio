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
} from "@project-serum/anchor";
import {
  Token as SplToken,
} from "@solana/spl-token";
// local
import { Ratio } from '../target/types/ratio';
import { initializeTestState } from "./utils/initializeState";
import { findPDA, poolBalance } from "./utils/utils";

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
let userUsdcPda: web3.PublicKey;
let poolUsdcPda: web3.PublicKey;
let redeemableMintPda: web3.PublicKey;

describe('ratio', () => {

  before(async () => {
    [statePda, stateBump] = findPDA({
      programId: program.programId,
      name: "State",
    });
    [usdcMint, poolPda, poolBump, poolUsdcPda, redeemableMintPda, userUsdcPda] =
      await initializeTestState({
        USDC_DECIMALS,
        provider,
        program,
        usdcMintAuth,
      });
  });
});
