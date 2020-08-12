// THIS IS FOR DEPLOY USE ONLY!!!
// require('dotenv').config()

let endpoint, port, chainID, shardID

switch (process.env.NETWORK) {
    case 'localnet': {
        endpoint = "http://localhost:950" + process.env.SHARD + "/"
        chainID = 2
        shardID = process.env.SHARD
        port = 6000
        break;
    }
    case 'testnet': {
        endpoint = "https://api.s" + process.env.SHARD + ".b.hmny.io"
        chainID = 2
        shardID = process.env.SHARD
        port = 6000
        break;
    }
    case 'mainnet': {
        endpoint = "https://api.s" + process.env.SHARD + ".t.hmny.io"
        chainID = 1
        shardID = process.env.SHARD
        port = 6000
        break;
    }
}

module.exports = {
    endpoint,
    port,
    chainID,
    shardID,
}

const MAINNET_CONFIG = {
    endpoint: "https://api.s0.t.hmny.io",
    shardID: 0,
    chainID: 1,

    numCoins: 3,
    coinPrecision: [1e18, 1e18, 1e18],

    gasPrice: 0x4a817c800,
    gasLimit: 0x6691b7,
}

const CONFIG = MAINNET_CONFIG

let CALL_OPTION = {
    gasPrice: CONFIG.gasPrice,
    gasLimit: CONFIG.gasLimit,
}

let EXT = null
let ONE_ADDR = null
let ETH_ADDR = null

let WALLET = null
