import * as anchor from "@project-serum/anchor";
import { getTokenAccount } from "@project-serum/common";
import * as serumCmn from "@project-serum/common";
import { Ratio } from "../target/types/ratio";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
const assert = require("assert");

describe("ratio 2", () => {
  // Configure the client to use the local cluster.
  const program = anchor.workspace.Ratio;
  const envProvider = anchor.Provider.env();
  const programProvider = program as anchor.Program<Ratio>;
  anchor.setProvider(envProvider);

  const MINT_TOKENS = 600000000000000; // 6M with 8dp
  const MINT_DECIMALS = 8;

  let mint = null;
  let god = null;
  let creatorAcc = anchor.web3.Keypair.generate();
  let creatorTokenAcc = null;

  it("init state", async () => {
    const [_mint, _god] = await serumCmn.createMintAndVault(
      program.provider,
      new anchor.BN(MINT_TOKENS),
      undefined,
      MINT_DECIMALS
    );
    mint = _mint;
    god = _god;

    creatorTokenAcc =await serumCmn.createTokenAccount(
      program.provider,
      mint,
      creatorAcc.publicKey
    );
  });

  it("Actions an interaction", async () => {
    const INTERACTION_FEE = 200000000000000;

    // let [_authority, nonce] = await anchor.web3.PublicKey.findProgramAddress(
    //   [god.toBuffer()],
    //   program.programId
    // );
    // authority = _authority;

    console.log('*************', {
      from: god.toBase58(),
      to: creatorTokenAcc.toBase58(),
      tokenProgram: TOKEN_PROGRAM_ID.toBase58(),
      programId: program.programId.toBase58(),
    });

    await program.rpc.interaction(new anchor.BN(INTERACTION_FEE), {
      accounts: {
        from: god,
        to: creatorTokenAcc,
        owner: program.provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    });
    console.log('donezo')
  });
});