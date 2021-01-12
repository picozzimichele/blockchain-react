const hexToBinary = require("hex-to-binary"); //this module installed with npm allows for conversion from hex to binary
const { GENESIS_DATA, MINE_RATE } = require("../config");
const { cryptoHash } = require("../utility");


class Block {
    constructor({ timestamp, lastHash, hash, data, nonce, difficulty }) { //mapping the arguments {timestamp...} allowes us to change the order later if needed
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
        this.nonce = nonce;
        this.difficulty = difficulty;
    }

    static genesis() {
        return new this(GENESIS_DATA) //this refers to the Block class
    }

    static mineBlock({ lastBlock, data }) {
        const lastHash = lastBlock.hash;
        let timestamp;
        let hash;
        let { difficulty } = lastBlock; //destructuring the difficulty from the last block
        let nonce = 0; //this needs to be a let since it will adjust the nonce through mining

        // we set the let variables timestamp and hash in the do - while loop here below
        do {
            nonce++;
            timestamp = Date.now();
            difficulty = Block.adjustDifficulty({ originalBlock: lastBlock, timestamp: timestamp });
            hash = cryptoHash(timestamp, lastHash, data, nonce, difficulty); //every iteration of the loop the hash will change
        } while (hexToBinary(hash).substring(0, difficulty) !== "0".repeat(difficulty)); //checking if the substring of the hash has the correct leading "0s" as the difficulty requires, also we converted the hash from hex to binary
        
        return new this({ //this returns a new instance of the Block class
            timestamp: timestamp,
            lastHash: lastHash,
            data: data,
            difficulty: difficulty,
            nonce: nonce,
            hash: hash,
        }); 
    }

    static adjustDifficulty({ originalBlock, timestamp }) {
        const { difficulty } = originalBlock; //this is the previous block

        if(difficulty < 1) return 1; //code would break if difficulty is less than 1

        const difference = timestamp - originalBlock.timestamp; //we need to compare how much time has passed between the previous block and the current block 

        if(difference > MINE_RATE) return difficulty - 1; //if too much time has passed we will lower the diffuculty

        return difficulty + 1; //if too little time has passed we will increase the difficulty

        // We return an integer value in the end that get set as value in the mineBlock do/while loop
    }
}

module.exports = Block