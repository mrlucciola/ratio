import { Wallet } from "@project-serum/anchor";
import { Keypair, PublicKey, Transaction } from "@solana/web3.js";

export class NodeWallet implements Wallet {
  constructor(readonly payer: Keypair, public publicKey: PublicKey, public secretKey: Uint8Array) {
    this.payer = payer;
    this.publicKey = payer.publicKey;
    this.secretKey = payer.secretKey;
  }
  // constructor(provider: unknown, _network: string)

  static local(): NodeWallet {
    const process = require("process");
    const payer = Keypair.fromSecretKey(
      Buffer.from(
        JSON.parse(
          require("fs").readFileSync(process.env.ANCHOR_WALLET, {
            encoding: "utf-8",
          })
        )
      )
    );
    const secretKey = payer.secretKey;
    const publicKey = payer.publicKey;
    return new NodeWallet(payer, publicKey, secretKey);
  }
  async signTransaction(tx: Transaction): Promise<Transaction> {
    tx.partialSign(this.payer);
    return tx;
  }

  async signAllTransactions(txs: Transaction[]): Promise<Transaction[]> {
    return txs.map((t) => {
      t.partialSign(this.payer);
      return t;
    });
  }

  // get publicKey(): PublicKey {
  //   return this.payer.publicKey;
  // }

}