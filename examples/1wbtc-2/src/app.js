const express = require('express')
// import or require Harmony class
const { Harmony } = require('@harmony-js/core')
// import or require settings
const { ChainType } = require('@harmony-js/utils')
// import or require simutlated keystore (optional)
const { importKey } = require('./simulated-keystore')
const {
	getContractInstance,
	txContractMethod,
	callContractMethod,
	oneToHexAddress
} = require('./contract-api')
/********************************
Config
********************************/
const config = require('../config')
const { url, port, net, shardID } = config
/********************************
Contract Imports
********************************/
const ONEWBTC = require('../build/contracts/ONEWBTC.json')
/********************************
Harmony
********************************/
const hmy = new Harmony(url,
	{
		chainType: ChainType.Harmony,
		chainId: net,
	},
)

const deployer = hmy.wallet.addByMnemonic(process.env.MNEMONIC)
hmy.wallet.setSigner(deployer.address)

//one1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65
const bob = hmy.wallet.addByMnemonic('surge welcome lion goose gate consider taste injury health march debris kick')
console.log('deployer', deployer.bech32Address)
console.log('bob', bob.bech32Address)
/********************************
Express
********************************/
const app = express()
/********************************
Contract methods
********************************/

/********************************
Mint
********************************/
//example (local): localhost:3000/mint?to=one103q7qe5t2505lypvltkqtddaef5tzfxwsse4z7&amount=1000
app.get('/mint', async (req, res) => {
	let {to, amount} = req.query
	//check args
	/********************************
	@todo check make sure address works and amount is valid
	********************************/
	//prepare args
   console.log(to)
	to = oneToHexAddress(hmy, to)
   console.log(to)

	//hex address of example above: 0x7c41e0668b551f4f902cfaec05b5bdca68b124ce
	amount = new hmy.utils.Unit(amount).asEther().toWei()
	//get instance
	const onewbtc = getContractInstance(hmy, ONEWBTC)
	//call method
	const { hash, receipt, error} = await txContractMethod(onewbtc, 'mint', to, amount)
	res.send({
		success: !error,
		hash,
		receipt,
	})
})
/********************************
Get Balance
********************************/
//example (local): localhost:3000/tokenbalance?address=one103q7qe5t2505lypvltkqtddaef5tzfxwsse4z7
app.get('/tokenbalance', async (req, res) => {
	let {address} = req.query
	//check args
	/********************************
	@todo check make sure address works
	********************************/
	//prepare args
	address = oneToHexAddress(hmy, address)
   console.log(address)
	//get instance
	const onewbtc = getContractInstance(hmy, ONEWBTC)
	//call method
	let balance = await callContractMethod(onewbtc, 'balanceOf', address)
	if (balance === null) {
		res.send({
			success: false,
			message: 'balance is null',
		})
		return
	}
	balance = new hmy.utils.Unit(balance).asWei().toEther()
	
	res.send({
		success: true,
		balance,
	})
})

/********************************
ONE transfer and balance methods (also see examples/node-sdk for simple example of this)
********************************/

/********************************
Transfer
********************************/
let transfers = {
	address: true
}
//example:
// localhost:3000/transfer?to=one1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65&value=1
// localhost:3000/transfer?from=one1w7lu05adqfhv8slx0aq8lgzglk5vrnwvf5f740&to=one1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65&value=1
// localhost:3000/transfer?to=one1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65&value=1&fromshard=0&toshard=1
app.get('/transfer', async (req, res) => {
    const {to, from, toshard, fromshard, value} = req.query
	if (!to || !value) {
		res.send({success: false, message: 'missing to or value query params e.g. localhost:3000/transfer?to=one1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65&value=1'})
		return
	}
	//defaults to shard 0
	const toShard = !toshard ? 0x0 : '0x' + toshard
	const fromShard = !fromshard ? 0x0 : '0x' + fromshard
	console.log(to, value)
	//checks for from argument and attempts to set address as signer
	//will fail if key isn't in keystore
	if (from) {
		const pkey = importKey(from)
		if(pkey) {
			hmy.wallet.addByPrivateKey(pkey)
			hmy.wallet.setSigner(hmy.crypto.getAddress(from).basicHex)
		}
		else {
			res.send({success: false, message: `account ${from} not in keystore`})
			return
		}
	} else {
		//set signer to default if from isn't used
		hmy.wallet.setSigner(alice.address)
	}
	//prevent accidental re-entry if transaction is in flight
	if (transfers[to]) return
	transfers[to] = true
	//prepare transaction
	const tx = hmy.transactions.newTx({
        to,
        value: new hmy.utils.Unit(value).asEther().toWei(),
        gasLimit: '21000',
        shardID: fromShard,
        toShardID: toShard,
        gasPrice: new hmy.utils.Unit('1').asGwei().toWei(),
    });
    const signedTX = await hmy.wallet.signTransaction(tx);
    signedTX.observed().on('transactionHash', (txHash) => {
        console.log('--- txHash ---', txHash)
    }).on('receipt', (receipt) => {
		// console.log('--- receipt ---', receipt)
		transfers[to] = false //can send again
		res.send({ success: true, receipt })
    }).on('error', console.error)
    const [sentTX, txHash] = await signedTX.sendTransaction()
    const confirmedTX = await sentTX.confirm(txHash)
})

/********************************
Get balance
********************************/
// localhost:3000/balance?address=one1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65
app.get('/balance', async (req, res) => {
	const {address, shard} = req.query
	if (!address) {
		res.send({success: false, message: 'missing address query param e.g. localhost:3000/transfer?to=one1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65&value=1'})
	}
	const shardID = !shard ? 0 : parseInt(shard)
	//rpc call
	const result = (await hmy.blockchain.getBalance({ address, shardID }).catch((error) => {
		res.send({success: false, error })
	})).result
	if (result) {
		res.send({success: true, balance: new hmy.utils.Unit(result).asWei().toEther()})
	}
})

/********************************
Get Examples
********************************/
app.get('/', (req, res) => {
	res.send({
		success: true,
		message: 'Harmony JS SDK NodeJS API Demo',
		examples: [
			'localhost:3000/transfer?to=one1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65&value=1',
			'localhost:3000/balance?address=one1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65',
			'localhost:3000/transfer?from=one1w7lu05adqfhv8slx0aq8lgzglk5vrnwvf5f740&to=one1a2rhuaqjcvfu69met9sque2l3w5v9z6qcdcz65&value=1'
		]
	})
})

app.listen(port, () => console.log(`App listening on port ${port}!`))
