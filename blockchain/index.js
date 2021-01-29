const Block = require("./block");
const Transaction = require("../wallet/transaction");
const Wallet = require("../wallet");
const { cryptoHash } = require("../utility");
const { REWARD_INPUT, MINING_REWARD } = require("../config");

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

    replaceChain(chain, validateTransactions, onSuccess) {
        if(chain.length <= this.chain.length) {
            console.error("The incoming chain must be longer");
            return; //if we just return we escape the function early and this.chain = chain does not get excecuted
        }

        if(!Blockchain.isValidChain(chain)) {
            console.error("The incoming chain is not valid");
            return;
        }

        if(validateTransactions && !this.validTransactionData({ chain })) { //we check if the new incoming chain has been manipulated or not
            console.error("The incoming chain has invalid transaction data");
            return;
        }

        if (onSuccess) onSuccess(); //we call the method only if we suceed in replacing the chain

        console.log("replacing chain with", chain);
        this.chain = chain;
    };

    validTransactionData({ chain }) {
        for (let i = 1; i < chain.length; i++) {
            const block = chain[i]; //we get each block
            const transactionSet = new Set(); //we keep track of all the transactions in the block to see if there are duplicates, Set() unlike arrays does not allow for duplicates to be created
            let rewardTransactionCount = 0;

            for (let transaction of block.data) { //we iterate trhough all the part of the block data
                if (transaction.input.address === REWARD_INPUT.address) {
                    rewardTransactionCount += 1;

                    if (rewardTransactionCount > 1) {
                        console.error("Miner reward exceeds limit");
                        return false;
                    }

                    if (Object.values(transaction.outputMap)[0] !== MINING_REWARD) { //we only have one single value specified in the MINING_REWARD, so accessing [0] on the object value returns the reward
                        console.error("Miner reward amount is invalid");
                        return false;
                    }
                } else {
                    if (!Transaction.validTransaction(transaction)) {
                        console.error("Invalid transaction");
                        return false;
                    }

                    const trueBalance = Wallet.calculateBalance({
                        chain: this.chain, //we need to have the official chain as an attacker could fake a new chain with different balances instead
                        address: transaction.input.address
                    })

                    if (transaction.input.amount !== trueBalance) { //attacker is faking his balance in this case
                        console.error("This is an invalid input amount!")
                        return false;
                    }

                    if (transactionSet.has(transaction)) { //this checks for duble transactions
                        console.error("An identical transaction appears more than once!")
                        return false;
                    } else {
                        transactionSet.add(transaction);
                    }
                }
            }

        }
        
        return true;
    }

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