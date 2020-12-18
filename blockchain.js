const Block = require("./block");

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()]; //this makes the genesis block the initial block of the blockchain
    }

    addBlock({ data }) {
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length-1],
            data
        })

        this.chain.push(newBlock);
    }
}

module.exports = Blockchain;