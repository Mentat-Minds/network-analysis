// Import
import { ApiPromise, WsProvider } from '@polkadot/api';
import * as ss from 'simple-statistics';
import { format, sub } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';


// utils functions and constants
const subnets: number[] = [];
for (let i = 1; i <= 34; i++) {
  subnets.push(i);
}
const roundTo = function(num: number, places: number) {
    const factor = 10 ** places;
    return Math.round(num * factor) / factor;
};
// Generator function to generate a range of numbers
function* range(start: number, end: number, step: number) {
    for (let i = start; i <= end; i += step) {
        yield i;
    }
}
function zipArraysToDict(keys: string[], values: any[]): { [key: string]: any } {
    let dict: { [key: string]: any } = {};
    keys.forEach((key, index) => {
      dict[key] = values[index];
    });
    return dict;
  }
  

// functions for TAO recycled
async function taoRecycledAtBlock (block: number) {
    // Construct
    const wsProvider = new WsProvider('wss://archive.chain.opentensor.ai:443');
    const api = await ApiPromise.create({ provider: wsProvider });

    // get block hash and set the api
    const hash = await api.rpc.chain.getBlockHash(block);
    const apiAt = await api.at(hash);

    // get the results and convert them
    const results = await apiAt.query.subtensorModule.raoRecycledForRegistration.multi(subnets);
    const finalResult = results.map(result => Number(JSON.stringify(result, null, 2)))
    
    // console.log(finalResult);
    return finalResult;
}

async function TAORecycledInterval(blockStart:number, blockEnd: number) {
    const currentResults = await taoRecycledAtBlock(blockEnd)
    const pastResults = await taoRecycledAtBlock(blockStart)
    const finalResult: number[] = currentResults.map((value, index) => (roundTo((value - pastResults[index])/10**9, 2)));
    const dict = finalResult.reduce((i, value, index) => {
        i[index + 1] = value;
        return i;
    }, {} as {[key: number]: number});
    console.log(dict)
    return dict 
}

// this function gives the number of TAO recycled for a specific subnet 
// for each step of the period between the two blocks
async function TAORecycledbyPeriod(startDate: Date, subnet: number, blockStart:number, blockEnd:number, step: number) {
    const index = subnet - 1
    const blocks = Array.from(range(blockStart, blockEnd, step));
    const newDate = new Date(startDate);

    // const dict: { [key: string]: number } = {};
    const datesArray: any[] = []
    const resultArray: number[] = []

    for (const block in blocks) {
        newDate.setDate(newDate.getDate() + 1)
        const dateString = format(toZonedTime(newDate, 'UTC'), 'yyyy-MM-dd');
        datesArray.push(dateString)
        const result = await taoRecycledAtBlock(blocks[block]);
        resultArray.push(result[index]/10**9)
    }
    console.log(resultArray)
    const transformedResult = resultArray.map((value, i, arr) => i === 0 ? value : roundTo((value - arr[i - 1]), 2));
    const dict = zipArraysToDict(datesArray, transformedResult)
    delete dict[Object.keys(dict)[0]];
    console.log(dict)
    return dict
}

TAORecycledbyPeriod(new Date('2024-05-20'), 25, 2998150 , 3070150, 7200).catch(console.error).finally(() => process.exit());
// TAORecycledInterval(3011720 , 3062120).catch(console.error).finally(() => process.exit());