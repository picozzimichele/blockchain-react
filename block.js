const { GENESIS_DATA } = require("./config");
const cryptoHash = require("./crypto-hash");

class Block {
    constructor({ timestamp, lastHash, hash, data }) { //mapping the arguments {timestamp...} allowes us to change the order later if needed
        this.timestamp = timestamp;
        this.lastHash = lastHash;
        this.hash = hash;
        this.data = data;
    }

    static genesis() {
        return new this(GENESIS_DATA) //this refers to the Block class
    }

    static mineBlock({ lastBlock, data }) {
        const timestamp = Date.now();
        const lastHash = lastBlock.hash;
        
        return new this({ //this returns a new instance of the Block class
            timestamp: timestamp,
            lastHash: lastHash,
            data: data,
            hash: cryptoHash(timestamp, lastHash, data)
        }); 
    }
}

module.exports = Block