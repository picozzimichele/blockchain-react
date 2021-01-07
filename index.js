const bodyParser = require("body-parser");
const express = require("express");
const Blockchain = require("./blockchain");
const PubSub = require("./pubsub");

const app = express();
const blockchain = new Blockchain();
const pubsub = new PubSub({ blockchain });

setTimeout(() => pubsub.broadcastChain(), 1000);

app.use(bodyParser.json());

app.get("/api/blocks", (req, res) => { //res allows us to specify how the get request responds, in this case we want to return the blocks
    res.json(blockchain.chain); //this will send the chain in json format
}); 

app.post("/api/mine", (req, res) => {
    const { data } = req.body; //destructuring req.body

    blockchain.addBlock({ data });//this will add new block with the data from the requestor

    pubsub.broadcastChain();

    res.redirect("/api/blocks");
});

const DEFAULT_PORT = 3000;
let PEER_PORT;

if(process.env.GENERATE_PEER_PORT === 'true') {
    PEER_PORT = DEFAULT_PORT + Math.ceil(Math.random() * 1000);
}

const PORT = PEER_PORT || DEFAULT_PORT;
app.listen(PORT, () => {
    console.log(`listening on port localhost:${PORT}`)
});