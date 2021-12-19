import { Provider } from "@project-serum/anchor";
import { Connection } from "@solana/web3.js";

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