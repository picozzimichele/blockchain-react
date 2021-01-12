const hexToBinary = require("hex-to-binary"); //this module installed with npm allows for conversion from hex to binary
const Block = require("./block")
const { GENESIS_DATA, MINE_RATE } = require("../config");
const { cryptoHash } = require("../utility");

describe("Block", () => {
    const timestamp = 2000;
    const hash = "bar-hash";
    const lastHash = "last-bar-hash";
    const data = ["foo-data", "blockchain"];
    const nonce = 1;
    const difficulty = 1;
    const block = new Block({
        timestamp: timestamp,
        hash: hash,
        lastHash: lastHash,
        data: data,
        nonce: nonce,
        difficulty: difficulty
    });

    //it is the test function and takes a description and a callback function, expect is the outcome of our test. Usually only one expect per test but this example is easy
    it("has timestamp, hash, lastHash and data propeties", () => { 
        expect(block.timestamp).toEqual(timestamp)
        expect(block.hash).toEqual(hash)
        expect(block.lastHash).toEqual(lastHash)
        expect(block.data).toEqual(data)
        expect(block.nonce).toEqual(nonce)
        expect(block.difficulty).toEqual(difficulty)
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
                .toEqual(
                    cryptoHash(
                        minedBlock.timestamp,
                        minedBlock.nonce,
                        minedBlock.difficulty,
                        lastBlock.hash, 
                        data
                    )
                );
        });

        it("sets a `hash` that meets the difficulty criteria", () => {
            expect(hexToBinary(minedBlock.hash).substring(0, minedBlock.difficulty)).toEqual("0".repeat(minedBlock.difficulty));
        });

        it("adjusts the difficulty", () => {
            const possibleResutls = [lastBlock.difficulty + 1, lastBlock.difficulty - 1];
            
            expect(possibleResutls.includes(minedBlock.difficulty)).toBe(true);
        });
    });

    describe("adjustDifficulty()", () => {
        it("raises the difficulty for a quickly mined block", () => {
            expect(Block.adjustDifficulty({ 
                originalBlock: block,
                timestamp: block.timestamp + MINE_RATE - 100, //we subtract 100ms from the MINE_RATE in order to make sure the block has been mined faster than target value
            })).toEqual(block.difficulty + 1)
        });

        it("lowers the difficulty for a slowly mined block", () => {
            expect(Block.adjustDifficulty({ 
                originalBlock: block,
                timestamp: block.timestamp + MINE_RATE + 100, //we add 100ms from the MINE_RATE in order to make sure the block has been mined slower than target value
            })).toEqual(block.difficulty - 1)
        });

        it("has a lower limit of 1", () => {
            block.difficulty = -1;

            expect(Block.adjustDifficulty({ originalBlock: block })).toEqual(1)
        });
    });

});