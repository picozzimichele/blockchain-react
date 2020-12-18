const lightningHash = (data) => { //very simple hash for an example, for BTC use SHA256
    return data + "*";
}

class Block {
    constructor(data, hash, lastHash) { //whenever we create a Block we need to specify these following fields
        this.data = data;
        this.hash = hash;
        this.lastHash = lastHash;
    }   
}

class Blockchain {
    constructor() {
        const genesis = new Block("gen-data", "gen-hash", "gen-lastHash"); //this is the intial block of the chain

        this.chain = [genesis]; //we will start with the genesis block
    }

    addBlock(data) {
        const lastBlock = this.chain[this.chain.length -1] //this returns the last block of the chain
        const lastHash = lastBlock.hash //this returns the last hash of the previous block

        const hash = lightningHash(data + lastHash) //this is used to generate the hash for the new block

        const block = new Block(data, hash, lastHash)

        this.chain.push(block)
    }
}

// Example of blockchain
const fooBlockchain = new Blockchain();

fooBlockchain.addBlock("one");
fooBlockchain.addBlock("two");
fooBlockchain.addBlock("three");


console.log(fooBlockchain.chain)
