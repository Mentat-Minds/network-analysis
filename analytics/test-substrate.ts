// Import
import { ApiPromise, WsProvider } from '@polkadot/api';

// Our address for Alice on the dev chain
const GUS = '5CFYcspxYVpkJuVKq4U9niSzk5kGKUfCgehGsoep51LYo6su';

async function main () {
    // Construct
    const wsProvider = new WsProvider('wss://entrypoint-finney.opentensor.ai:443/');
    const api = await ApiPromise.create({ provider: wsProvider });

  // Retrieve the last block header, extracting the hash and parentHash
  const { hash, parentHash } = await api.rpc.chain.getHeader();

  console.log(`last header hash ${hash.toHex()}`);

  // Retrieve the balance at the preceding block for Alice using an at api
  const apiAt = await api.at(parentHash);
  const balance = await apiAt.query.system.account(GUS);
  const netBalance = balance.toJSON() as { data: { free: string } };
  //const netBalance = JSON.stringify(balance.toJSON(), null, 2);
  //const freeBalance = netBalance.nonce

  console.log(`${netBalance.data.free}`);
}

main().catch(console.error).finally(() => process.exit());