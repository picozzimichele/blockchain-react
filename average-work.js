//This file is for testing purposed, we can run with console.logs in order to check functionality

const Blockchain = require("./blockchain");

const blockchain = new Blockchain();

blockchain.addBlock({ data: "initial" });

let prevTimestamp, nextTimestamp, nextBlock, timeDiff, average;

const times = [];

for(let i = 0; i < 10000; i++) {
    prevTimestamp = blockchain.chain[blockchain.chain.length -1].timestamp;

    blockchain.addBlock({ data: `block ${i}`});
    nextBlock = blockchain.chain[blockchain.chain.length -1];

    nextTimestamp = nextBlock.timestamp;
    timeDiff = nextTimestamp - prevTimestamp; //this is how long it took us to mine the new block
    times.push(timeDiff); //we push this difference to the times array

    average = times.reduce((total, num) => (total + num))/times.length; //reduces the array to a single value. This value is kept tracked in a "total variable", then we have the callback function to explain behavior of each element of the array "num" 

    console.log(`Time to mine block is: ${timeDiff}ms. Difficulty ${nextBlock.difficulty}. Average time: ${average}ms.`)
}