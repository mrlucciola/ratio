// modules
import {
  Provider,
  Program,
  getProvider,
  web3,
  workspace,
  setProvider,
  BN,
} from "@project-serum/anchor";
import {
  Token as SplToken,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
// local
import { Ratio } from "../target/types/ratio";
import { MintAndDeposit } from "../target/types/mint_and_deposit";
import {
  getTokenBalance,
  initEnvironment,
  TOKEN_DECMIALS,
  IDeployer,
  IUser,
  handleTxn,
} from "./utils/utils";
// general constants
const systemProgram = web3.SystemProgram.programId;
const rent = web3.SYSVAR_RENT_PUBKEY;

const mintAmount = 3.14 * 10 ** TOKEN_DECMIALS;
const withdrawAmount = mintAmount / 2;
const depositAmount = withdrawAmount / 2;

setProvider(Provider.local());
const provider: Provider = getProvider();
// @ts-ignore
const programMintCpi = workspace.MintAndDeposit as Program<MintAndDeposit>;
const programRatio = workspace.Ratio as Program<Ratio>;
console.log(`ratio program ID: ${programRatio.programId.toString()}`);
console.log(`mintCpi program ID: ${programMintCpi.programId.toString()}`);

// test constants
let deployer: IDeployer;
let user1: IUser;
let user2: IUser;

describe("ratio", () => {
  before(async () => {
    // @ts-ignore
    const envObj = await initEnvironment(provider, programRatio);
    deployer = envObj.deployer;
    user1 = envObj.user1;
    user2 = envObj.user2;
  });

  it("initalize state", async () => {
    const txnState = new web3.Transaction();
    txnState.add(programRatio.instruction.initState(
      deployer.state.bump,
      {
        accounts: {
          authority: deployer.wallet.publicKey,
          state: deployer.state.pda,
          rent,
          systemProgram,
        },
        signers: [deployer.wallet.payer],
      }
    ));
    const confirmation = await handleTxn(txnState, provider, deployer.wallet);
    console.log("initialized state successfully!\n", confirmation, !!(await provider.connection.getAccountInfo(deployer.state.pda)));
  });

  it("initalize pool", async () => {
    const txnPool = new web3.Transaction();
    txnPool.add(programRatio.instruction.initPool(
      deployer.pool.bump,
      TOKEN_DECMIALS,
      {
        accounts: {
          authority: deployer.wallet.publicKey,
          state: deployer.state.pda,
          pool: deployer.pool.pda,
          poolCurrency: deployer.pool.currency.pda,
          currencyMint: deployer.currency.mint,
          rent,
          systemProgram,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      }
    ));
    const confirmation = await handleTxn(txnPool, provider, deployer.wallet);
    console.log(
      "Created the pool: successful!\n",
      confirmation,
      !!(await getProvider().connection.getAccountInfo(deployer.currency.mint))
    );
  });

  it('init user account', async () => {
    const txnUserAssoc = new web3.Transaction();
    txnUserAssoc.add(
      SplToken.createAssociatedTokenAccountInstruction(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        deployer.currency.mint,
        user1.currency.assoc,
        user1.wallet.publicKey,
        user1.wallet.publicKey,
      )
    );
    try {
      const confirmationUserAssoc = await handleTxn(txnUserAssoc, provider, user1.wallet);
      console.log('user assoc initialized!', confirmationUserAssoc);
    } catch (error) {
      console.log(error)
      process.exit()
    }
  });

  it("mint to pool cpi", async () => {
    const txnMint = new web3.Transaction();
    const poolBalancePre = await getTokenBalance(deployer.pool.currency.pda,provider);

    txnMint.add(programMintCpi.instruction.mintAndDepositCpi(
      new BN(Number(mintAmount)),
      {
        accounts: {
          state: deployer.state.pda,
          currencyMint: deployer.currency.mint,
          destCurrency: deployer.pool.currency.pda,
          tokenProgram: TOKEN_PROGRAM_ID,
          ratioProgram: programRatio.programId,
        },
      }
    ));
    try {
      const confirmation = await handleTxn(txnMint, provider, deployer.wallet);
      console.log("Pool: Mint To Address confirmation: ", confirmation);
    } catch (e) {
      console.log(e)
      console.log(e.code, e.msg);
    }
    const poolBalancePost = await getTokenBalance(deployer.pool.currency.pda, provider);
    console.log(
      `mint to pool (Mint To Address) Pool:\n after - before = ${poolBalancePost} - ${poolBalancePre} = ${
        poolBalancePost - poolBalancePre
      } = ${mintAmount} ? ${
        mintAmount === poolBalancePost - poolBalancePre
      }\n`
    );
  });

  it("withdraw funds", async () => {
    const txnWithdraw = new web3.Transaction();
    txnWithdraw.add(programRatio.instruction.withdraw(new BN(Number(withdrawAmount)), {
      accounts: {
        state: deployer.state.pda,
        pool: deployer.pool.pda,
        poolCurrency: deployer.pool.currency.pda,
        currencyMint: deployer.currency.mint,
        userCurrency: user1.currency.assoc,
        tokenProgram: TOKEN_PROGRAM_ID,
      },
    }));

    const userBalancePre = await getTokenBalance(user1.currency.assoc, provider, TOKEN_DECMIALS);
    const poolBalancePre = await getTokenBalance(deployer.pool.currency.pda, provider, TOKEN_DECMIALS);

    const confirmation = await handleTxn(txnWithdraw, provider, user1.wallet);
    console.log("USER: Withdraw confirmation: ", confirmation);

    const userBalancePost = await getTokenBalance(user1.currency.assoc, provider, TOKEN_DECMIALS);
    const poolBalancePost = await getTokenBalance(deployer.pool.currency.pda, provider, TOKEN_DECMIALS);
    console.log(
      `(withdraw) User: ${userBalancePost} (after) - ${userBalancePre} (before) = ${
        userBalancePost - userBalancePre
      } = ${withdrawAmount} ? ${
        withdrawAmount === Math.abs(userBalancePost - userBalancePre)
      }`
    );
    console.log(
      `(withdraw) Pool: ${poolBalancePost} (after) - ${poolBalancePre} (before) = ${
        poolBalancePost - poolBalancePre
      } = ${withdrawAmount} ? ${
        withdrawAmount === Math.abs(poolBalancePost - poolBalancePre)
      }\n`
    );
  });

  it("deposit funds", async () => {
    const txnDeposit = new web3.Transaction();

    // approve a token transfer
    txnDeposit.add(
      SplToken.createApproveInstruction(
        TOKEN_PROGRAM_ID,
        user1.currency.assoc,
        deployer.state.pda,
        user1.wallet.publicKey,
        [],
        depositAmount
      )
    );

    txnDeposit.add(programRatio.instruction.deposit(new BN(Number(depositAmount)), {
      accounts: {
        pool: deployer.pool.pda,
        currencyMint: deployer.currency.mint,
        userCurrency: user1.currency.assoc,
        poolCurrency: deployer.pool.currency.pda,
        tokenProgram: TOKEN_PROGRAM_ID,
        payer: user1.wallet.publicKey,
      },
    }));

    const userBalancePreDeposit = await getTokenBalance(user1.currency.assoc, provider, TOKEN_DECMIALS);
    const poolBalancePreDeposit = await getTokenBalance(deployer.pool.currency.pda, provider, TOKEN_DECMIALS);

    const confirmation = await handleTxn(txnDeposit, provider, user1.wallet);
    console.log("USER: Deposit confirmation: ", confirmation);

    const userBalancePostDeposit = await getTokenBalance(user1.currency.assoc, provider, TOKEN_DECMIALS);
    const poolBalancePostDeposit = await getTokenBalance(deployer.pool.currency.pda, provider, TOKEN_DECMIALS);
    console.log(
      `(deposit) User: after - before = ${userBalancePostDeposit} - ${userBalancePreDeposit} = ${
        userBalancePostDeposit - userBalancePreDeposit
      } = ${depositAmount} ? ${
        depositAmount === -userBalancePostDeposit + userBalancePreDeposit
      }`
    );
    console.log(
      `(deposit) Pool: after - before = ${poolBalancePostDeposit} - ${poolBalancePreDeposit} = ${
        poolBalancePostDeposit - poolBalancePreDeposit
      } = ${depositAmount} ? ${
        depositAmount === poolBalancePostDeposit - poolBalancePreDeposit
      }\n`
    );
  });
});
