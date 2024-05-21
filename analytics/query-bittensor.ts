// Import
import { ApiPromise, WsProvider } from '@polkadot/api';

const hash = '0xd79341367413ceb1b5a4fd722db4b5ea57fdca244cc74265d1d27ddf4f01e498';

async function main () {
    // Construct
    const wsProvider = new WsProvider('wss://archive.chain.opentensor.ai:443');
    const api = await ApiPromise.create({ provider: wsProvider });

  // Retrieve the balance at the preceding block for Alice using an at api
  const apiAt = await api.at(hash);
  const result = await apiAt.query.subtensorModule.raoRecycledForRegistration(16);
  const finalResult = JSON.stringify(result, null, 2)
  console.log(finalResult);
}

main().catch(console.error).finally(() => process.exit());