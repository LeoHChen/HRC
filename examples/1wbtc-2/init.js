async function initWallet(type) {
    if (EXT == null || WALLET == null ) {
        return wallet.getExtension(CONFIG)
            .then( (ext) => {
                EXT = ext
                return ext.login()
            }).then( (acc) => {
                console.log("login with acc", acc)
                console.log(Object.getOwnPropertyNames(acc))
                ONE_ADDR = acc.address
                ETH_ADDR = wallet.oneToEthAddr(ONE_ADDR)
                console.log("eth address", ETH_ADDR)
            })
    }
}

async function init_contracts() {
    if (EXT == null){
        console.error("call init_contracts before init extension")
    }

    let contractFactory = EXT.contracts
    // console.log("before create contract")
    let oneWBTC = contractFactory.createContract(oneWBTC_abi, CONFIG.oneWBTC);
    let wONE = contractFactory.createContract(wONE_abi, CONFIG.wONE);

    console.log("oneWBTC", oneWBTC)
    console.log("wONE", wONE)

    ONEWBTC = oneWBTC
    WONE = wONE
}


async function approve_1wbtc(contract, amount, account) {
    return contract.methods.approve(CONFIG.oneWBTC, amount)
        .send({
            gasPrice: CONFIG.gasPrice,
            gasLimit: CONFIG.gasLimit,
        })
}

async function approve_wone(contract, amount, account) {
    return contract.methods.approve(CONFIG.wONE, amount)
        .send({
            gasPrice: CONFIG.gasPrice,
            gasLimit: CONFIG.gasLimit,
        })
}

async function handle_transfer() {
   var default_account = ETH_ADDR;
   console.log("addr:", default_account)

   var raw = null
   amount = $('input[type=text][name=amount]').val();
   to = $('input[type=text][name=to_address]').val();
   to = wallet.oneToEthAddr(to)

   console.log("amount:", amount)
   console.log("to_address:", to)
   token = $('input[type=radio][name=token]:checked').val();

   $('input[type=text][name=status]').val(to);
   try {
      if ( token == "1wbtc" ) {
         await ONEWBTC.methods.transfer(to, amount).call(CALL_OPTION);
      } else {
         await WONE.methods.transfer(to, amount).call(CALL_OPTION);
      }
   } catch (e) {
      console.error(e);
   } finally {
      console.log("cleanup");
   }
   $('input[type=text][name=token_status]').val(to);
}

async function handle_burn() {
   var default_account = ETH_ADDR;
   console.log("addr:", default_account)

   var raw = null
   amount = $('input[type=text][name=amount]').val();
   console.log("amount:", amount)
   token = $('input[type=radio][name=token]:checked').val();

   do_burn()

//  if ( token == "1wbtc" ) {
//      response = await approve(ONEWBTC, amount, default_account)
//      raw = await ONEWBTC.methods.burn(amount).call(CALL_OPTION)
//   } else {
//      response = await approve(WONE, amount, default_account)
//      raw = await WONE.methods.burn(amount).call(CALL_OPTION)
//   }

//   $('input[type=text][name=token_status]').val("called");
//   $('input[type=text][name=status]').val(raw);
}

async function get_balance() {
   var default_account = ETH_ADDR;
   console.log("addr:", default_account)

   var raw = null
   var balance = null
   if ( TOKEN == "1wbtc" ) {
      balance = await ONEWBTC.methods.balanceOf(default_account).call(CALL_OPTION)
   } else {
      balance = await WONE.methods.balanceOf(default_account).call(CALL_OPTION)
   }
   balance = balance / CONFIG.coinPrecision
   console.log("balance:", balance)
   $('input[type=text][name=theamount]').val(balance);
}

async function do_burn() {
   var default_account = ETH_ADDR;
   console.log("addr:", default_account)

   var raw = null
   var amount = $('input[type=text][name=amount]').val();
   token = $('input[type=radio][name=token]:checked').val();
   $('input[type=text][name=status]').val(token);
   $('input[type=text][name=token_status]').val(ONEWBTC);

   try {
      if ( token == "1wbtc" ) {
         await ONEWBTC.methods.burn(amount).call(CALL_OPTION);
      } else {
         await WONE.methods.burn(amount).call(CALL_OPTION);
      }
   } catch (e) {
      console.error(e);
   } finally {
      console.log("cleanup");
   }

   $('input[type=hidden][name=action]').val("")
//   $('input[type=text][name=token_status]').val("called");
}

async function token_handler() {
   token = $('input[type=radio][name=token]:checked').val();
   console.log("token:", token);
   TOKEN = token;

   await get_balance();
}

async function init_ui() {
   $("#one_address").val(ONE_ADDR);
   $('input[type=radio][name=token]').change(token_handler);
   $("#burn").click(handle_burn);
   $("#transfer").click(handle_transfer);

   await token_handler();
   await get_balance();

   action = $('#action').val();
   if (action == 'burn') {
      console.log("CALLING DO_BURN");
      await do_burn();
   }
}
