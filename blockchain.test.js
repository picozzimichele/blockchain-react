const Blockchain = require("./blockchain");
const Block = require("./block");

describe("Blockchain", () => {
    const blockchain = new Blockchain(); //we make a new instance of the Blockchain class

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
            it("returns false", () => {});
        });

        describe("when the chain does start with the genesis block and has multiple blocks", () => {
            describe("and a lastHash reference has changed", () => { //in this case the lastHash is not correct
                it("returns false", () => {

                });
            });
            describe("and the chain contains a block with an invalid field", () => {

            });
        });
    });


});