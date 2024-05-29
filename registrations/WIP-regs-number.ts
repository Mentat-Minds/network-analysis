// Import
import { ApiPromise, WsProvider } from '@polkadot/api';
import * as ss from 'simple-statistics';

const subnets: number[] = [];
for (let i = 1; i <= 34; i++) {
  subnets.push(i);
}
const roundTo = function(num: number, places: number) {
    const factor = 10 ** places;
    return Math.round(num * factor) / factor;
};

// Define the function to sum arrays element-wise
function sumArrays(arr1: number[], arr2: number[]): number[] {
    return arr1.map((num, idx) => num + (arr2[idx] || 0));
}
  
async function getRegsAtBlock (api: ApiPromise, block: number) {
    // Construct
    // get block hash and set the api
    //const wsProvider = new WsProvider('wss://archive.chain.opentensor.ai:443');
    //const api = await ApiPromise.create({ provider: wsProvider });

    const hash = await api.rpc.chain.getBlockHash(block);
    const apiAt = await api.at(hash);

    // get the results and convert them
    const results = await apiAt.query.subtensorModule.registrationsThisBlock.multi(subnets);
    const finalResult = results.map(result => Number(JSON.stringify(result, null, 2)))

    console.log(finalResult);
    return finalResult;
}

// Main function to get the cumulative result
async function getCumulativeRegs24h(block: number) {
    // Construct the API provider outside the loop
    const wsProvider = new WsProvider('wss://archive.chain.opentensor.ai:443');
    const api = await ApiPromise.create({ provider: wsProvider });

    const rangeStart = block - 7200;
    let cumulativeRegs: number[] = [];

    for (let currentBlock = rangeStart; currentBlock <= block; currentBlock++) {
        const finalResult = await getRegsAtBlock(api, currentBlock);
        if (cumulativeRegs.length === 0) {
            cumulativeRegs = finalResult;
        } else {
            cumulativeRegs = sumArrays(cumulativeRegs, finalResult);
        }
    }

    console.log(cumulativeRegs)
    return cumulativeRegs;
}

/*

async function weeklyTaoRecycled() {
    // Construct
    const wsProvider = new WsProvider('wss://archive.chain.opentensor.ai:443');
    const api = await ApiPromise.create({ provider: wsProvider });
    
    const header = await api.rpc.chain.getHeader()
    const block = header.number
    const results = await taoRecycledAtBlock(Number(block))
    const results7d = await taoRecycledAtBlock(Number(block) - 7200*7)
    const finalResult: number[] = results.map((value, index) => (roundTo((value - results7d[index])/10**9, 2)));
    const dict = finalResult.reduce((i, value, index) => {
        i[index + 1] = value;
        return i;
    }, {} as {[key: number]: number});
    // console.log(dict)
    return dict 
}

// TODO
// get mean, median, top 10% TAO recycled (all subnets)

async function stats() {
    const data = await weeklyTaoRecycled()

    const arrayData = Object.values(data);
    const mean = ss.mean(arrayData);
    const median = ss.median(arrayData);
    const top10percentile = ss.quantile(arrayData, 0.9);

    const result = {
        "data": data,
        "mean": roundTo(mean, 2),
        "median": roundTo(median, 2),
        "top10percentile": roundTo(top10percentile, 2),
    }

    console.log(result)
    return result
}
*/
console.time('Execution Time');
getCumulativeRegs24h(3046828).catch(console.error).finally(() => {
    console.timeEnd('Execution Time');
    process.exit()
});
