// THIS IS FOR DEPLOY USE ONLY!!!
// require('dotenv').config()

const MAINNET_CONFIG = {
    endpoint: "https://api.s0.t.hmny.io",
    shardID: 0,
    chainID: 1,

    oneWBTC: "0x19E7907a2861a9B96421f9Df0680ee0892C5b684",
    wONE: "0xA3380C16f0D419f7D6aC4649145D24A27F65582f",

    gasPrice: 0x4a817c800,
    gasLimit: 0x6691b7,

    coinPrecision: 1e8,
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

let ONEWBTC = null
let WONE = null

let TOKEN = null
