const Block = require("./block")
const { GENESIS_DATA } = require("./config");
const cryptoHash = require("./crypto-hash");

describe("Block", () => {
    const timestamp = "a-date";
    const hash = "bar-hash";
    const lastHash = "last-bar-hash";
    const data = ["foo-data", "blockchain"];
    const block = new Block({
        timestamp: timestamp,
        hash: hash,
        lastHash: lastHash,
        data: data,
    });

    //it is the test function and takes a description and a callback function, expect is the outcome of our test. Usually only one expect per test but this example is easy
    it("has timestamp, hash, lastHash and data propeties", () => { 
        expect(block.timestamp).toEqual(timestamp)
        expect(block.hash).toEqual(hash)
        expect(block.lastHash).toEqual(lastHash)
        expect(block.data).toEqual(data)
    });

    describe("genesis()", () => {
        const genesisBlock = Block.genesis();

        it("returns a block instance", () => {
            expect(genesisBlock instanceof Block).toBe(true); //instanceof returns either true or false
        });

        it("returns the genesis data", () => {
            expect(genesisBlock).toEqual(GENESIS_DATA);
        });
    });

    describe("mineBlock()", () => {
        const lastBlock = Block.genesis(); //this could be any block
        const data = "mined data"; //this is just dummy data for the test
        const minedBlock = Block.mineBlock({ lastBlock, data }) //this is a static function same as genesis()

        it("returns a Block instance", () => {
            expect(minedBlock instanceof Block).toBe(true); //we expect the minedBlock to be an instance of the Block class
        });

        it("sets the `lastHash` of the minedBlock same as the `hash` of the previous Block", () => {
            expect(minedBlock.lastHash).toEqual(lastBlock.hash);
        });

        it("sets the `data`", () => {
            expect(minedBlock.data).toEqual(data);
        });
        
        it("has a `timestamp`", () => {
            expect(minedBlock.timestamp).not.toEqual(undefined); //we just care that a timestamp exists
        });

        it("creates a SHA-265 `hash` based on the proper inputs", () => {
            expect(minedBlock.hash)
                .toEqual(cryptoHash(minedBlock.timestamp, lastBlock.hash, data));
        });
    });

});