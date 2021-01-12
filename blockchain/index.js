const Block = require("./block");
const { cryptoHash } = require("../utility");

class Blockchain {
    constructor() {
        this.chain = [Block.genesis()]; //this makes the genesis block the initial block of the blockchain
    }

    addBlock({ data }) {
        const newBlock = Block.mineBlock({
            lastBlock: this.chain[this.chain.length-1],
            data
        });

        this.chain.push(newBlock);
    }

    replaceChain(chain) {
        if(chain.length <= this.chain.length) {
            console.error("The incoming chain must be longer");
            return; //if we just return we escape the function early and this.chain = chain does not get excecuted
        }

        if(!Blockchain.isValidChain(chain)) {
            console.error("The incoming chain is not valid");
            return;
        }

        console.log("replacing chain with", chain);
        this.chain = chain;
    };


    static isValidChain(chain) {
        if(JSON.stringify(chain[0]) !== JSON.stringify(Block.genesis())){ //we are comparing the string forms in order to have a triple equality, in JS two instances of an object are not equal
            return false;
        };

        for(let i = 1; i < chain.length; i++) {
            const block = chain[i]; //getting the block at index i

            const actualLastHash = chain[i-1].hash; //getting the previous hash
            const lastDifficulty = chain[i-1].difficulty //getting prevuous difficulty

            const { timestamp, lastHash, hash, nonce, difficulty, data } = block; //destructuring the block variables

            if(lastHash !== actualLastHash) { return false; } //we check validity of the previous hash

            if(Math.abs(lastDifficulty - difficulty) > 1) return false; // we check if there has been a jump in difficulty grater than 1

            const validatedHash = cryptoHash(timestamp, lastHash, nonce, difficulty, data); //need this to check the hash is correct

            if(hash !== validatedHash) return false //checking if the hash is correct
        }

        return true;
    }
}

module.exports = Blockchain;