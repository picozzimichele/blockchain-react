const Blockchain = require("./index");
const Block = require("./block");
const { cryptoHash } = require("../utility");
const Wallet = require("../wallet");
const Transaction = require("../wallet/transaction");

describe("Blockchain", () => {
    let blockchain; //we make a new instance of the Blockchain class
    let newChain;
    let originalChain;
    let errorMock;

    beforeEach(() => {
        blockchain = new Blockchain(); //before each test we reset the blockchain to a new instance, this way any changes to it for test is not carried over
        newChain = new Blockchain();
        errorMock = jest.fn(); //this allows us to create temporary methods for tests

        originalChain = blockchain.chain //we store the initial chain to compare to the new Chain in the replaceChain method
        global.console.error = errorMock; //when we call error we will call the special jest.fn()
    });

    it("contains a `chain` Array instance", () => {
        expect(blockchain.chain instanceof Array).toBe(true); //we expect chain to be an array
    });

    it("starts with the genesis block", () => {
        expect(blockchain.chain[0]).toEqual(Block.genesis()); //first item of the array should equal to the genesis()
    });

    it("adds a new block to the blockchain", () => {
        const newData = "foo bar";
        blockchain.addBlock({ data: newData });

        expect(blockchain.chain[blockchain.chain.length-1].data).toEqual(newData); //we take the last block, newly mined and compare the data field with the newData variable
    });

    describe("isValidChain()", () => {
        describe("when the chain does not start with the genesis block", () => {
            it("returns false", () => {
                blockchain.chain[0] = { data: "fake-genesis" };

                expect(Blockchain.isValidChain(blockchain.chain)).toBe(false); //the chain will be false since we have created the "fake genesis block"
            });
        });

        describe("when the chain does start with the genesis block and has multiple blocks", () => {

            beforeEach(() => { //this will add few blocks to each of the tests below
                blockchain.addBlock({ data: "foo-data"}); //adding few blocks to validate
                blockchain.addBlock({ data: "foo-bears"});
                blockchain.addBlock({ data: "foo-horses"});
            });

            describe("and a lastHash reference has changed", () => { //in this case the lastHash is not correct
                it("returns false", () => {

                    blockchain.chain[2].lastHash = "broken-last-hash"; //replacing a lastHash value with an invalid one

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });
            describe("and the chain contains a block with an invalid field", () => {
                it("returns false", () => {

                    blockchain.chain[2].data = "foo-and-bad-data"; //creating some invalid data to replace the existing one

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe("and the chain contains a block with a jump difficulty", () => {
                it("returns false", () => {
                    const lastBlock = blockchain.chain[blockchain.chain.length - 1];
                    const lastHash = lastBlock.hash;
                    const timestamp = Date.now();
                    const nonce = 0;
                    const data = [];
                    const difficulty = lastBlock.difficulty -3;
                    const hash = cryptoHash(timestamp, lastHash, nonce, data, difficulty);

                    const badBlock = new Block({ timestamp, lastHash, hash, nonce, data, difficulty });

                    blockchain.chain.push(badBlock);

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
                });
            });

            describe("the chain does not contain any invalid blocks", () => {
                it("returns true", () => {

                    expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
                });
            })
        });
    });

    describe("replaceChain()", () => {
        let logMock;

        beforeEach(() => {
            logMock = jest.fn();

            global.console.log = logMock; //when we call log we will call the special jest.fn()
        });

        describe("when the new chain is not longer", () => {

            beforeEach(() => {
                newChain.chain[0] = { new: "chain" };

                blockchain.replaceChain(newChain.chain);
            });
            
            it("does not replace the chain", () => {
                expect(blockchain.chain).toEqual(originalChain);
            });

            it("logs an error", () => {
                expect(errorMock).toHaveBeenCalled();
            }); 

        });

        describe("when the new chain is longer", () => {

            beforeEach(() => { //this will add few blocks to each of the tests below
                newChain.addBlock({ data: "foo-data"}); //adding few blocks to validate
                newChain.addBlock({ data: "foo-bears"});
                newChain.addBlock({ data: "foo-horses"});
            });

            describe("and the new chain is invalid", () => {
                beforeEach(() => {
                    newChain.chain[2].hash = "some-fake-hash"

                    blockchain.replaceChain(newChain.chain);
                });

                it("does not replace the chain", () => {
                    expect(blockchain.chain).toEqual(originalChain);
                });

                it("logs an error", () => {
                    expect(errorMock).toHaveBeenCalled();
                }); 
            });

            describe("and the new chain is valid", () => {
                beforeEach(() => {
                    blockchain.replaceChain(newChain.chain);
                });
                
                it("does replace the chain", () => {
                    expect(blockchain.chain).toEqual(newChain.chain);
                });

                it("logs about the chain replacement", () => {
                    expect(logMock).toHaveBeenCalled();
                });
            });
        });

        describe("and the `validateTransactions` flag is true", () => {
            it("calls validTransactionData()", () => {
                const validTransactionDataMock = jest.fn();

                blockchain.validTransactionData = validTransactionDataMock;

                newChain.addBlock({ data: "foo" });

                blockchain.replaceChain(newChain.chain, true); //we need to pass the true value in order to execute the method

                expect(validTransactionDataMock).toHaveBeenCalled();
            });
        });
    });

    describe("validTransactionData()", () => {
        let transaction, rewardTransaction, wallet;

        beforeEach(() => {
            wallet = new Wallet();
            transaction = wallet.createTransaction({ recipient: "foo-address", amount: 65 });
            rewardTransaction = Transaction.rewardTransaction({ minerWallet: wallet });
        });

        describe("and the transaction data is valid", () => {
            it("returns true", () => {
                newChain.addBlock({ data: [transaction, rewardTransaction] });

                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(true);
                expect(errorMock).not.toHaveBeenCalled();
            });
        });

        describe("and the transaction data has multiple rewards", () => {
            it("returns false and logs an error", () => {
                newChain.addBlock({ data: [transaction, rewardTransaction, rewardTransaction] });

                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe("and the transaction data has at least one malformed outputMap", () => {
            describe("and the transaction is not a reward transaction", () => {
                it("returns false and logs an error", () => {
                    transaction.outputMap[wallet.publicKey] = 999999; //set an invalid amount 

                    newChain.addBlock({ data: [transaction, rewardTransaction] });

                    expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });

            describe("and the transaction is a reward transaction", () => {
                it("returns false and logs an error", () => {
                    rewardTransaction.outputMap[wallet.publicKey] = 999999;

                    newChain.addBlock({ data: [transaction, rewardTransaction] });

                    expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                    expect(errorMock).toHaveBeenCalled();
                });
            });
        });

        describe("and the transaction data has at least one malformed input", () => {
            it("returns false and logs an error", () => {
                wallet.balance = 9000; //the point here is there is no record of the wallet to have this much balance in the blockchain

                const evilOuputMap = {
                    [wallet.publicKey]: 8900,
                    fooRecipient: 100,
                }

                const evilTransaction = {
                    input: {
                        timestamp: Date.now(),
                        amount: wallet.balance,
                        address: wallet.publicKey,
                        signature: wallet.sign(evilOuputMap)
                    },
                    outputMap: evilOuputMap
                }

                newChain.addBlock({ data: [evilTransaction, rewardTransaction] });
                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        });

        describe("and a block contains multiple identical transactions", () => {
            it("returns false and logs an error", () => {
                newChain.addBlock({
                    data: [transaction, transaction, transaction, rewardTransaction] //we have 3 identical transactions at the same time
                });

                expect(blockchain.validTransactionData({ chain: newChain.chain })).toBe(false);
                expect(errorMock).toHaveBeenCalled();
            });
        })
    });
});