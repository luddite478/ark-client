const readline = require('readline');
const axios = require("axios");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.emitKeypressEvents(process.stdin);

if (process.stdin.isTTY){
  process.stdin.setRawMode(true);
}

process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'q') process.exit();
});

rl.prompt();

console.log('Welcome to ark-client.');

async function cliFlow() {
  try {
    const transactionParams = {
        network: null,
        recipientId: null,
        amount: null,
        passphrase: null
    }

    await cliAsk('Press Enter if you want to perform transaction or press Ctrl+Q to exit\n');
    let network = await cliAsk('Enter network name (mainnet or devnet): ');
    while(network !== "mainnet" && network !== "devnet"){
        console.log("Only 2 networks available");
        network = await cliAsk('Enter network name (mainnet or devnet): ');
    }
    transactionParams.recipientId = await cliAsk('Enter recipientId: ');
    transactionParams.amount = await cliAsk('Enter amount (in satoshis): ');
    while(transactionParams.amount < 1){
        console.log("You can't send less then 1 satoshi");
        transactionParams.amount = await cliAsk('Enter amount (in satoshis): ');
    }
    transactionParams.passphrase = await cliAsk('Enter passphrase: ');

    const creationResponse = await createTransaction(network, transactionParams);

    if(creationResponse.data.success){
      const transactionId = creationResponse.data.transaction.id;
      await cliAsk(`Your transaction id is ${transactionId}\nPress Enter if you want to broadcast this transaction or Ctrl+Q to exit`);
      await cliAsk('Select network again (mainnet or devnet): ');
      while(network !== "mainnet" && network !== "devnet") {
          console.log("Only 2 networks available");
          network = await cliAsk('Enter network name (mainnet or devnet): ');
      }

      const broadcastingResponse = await broadcastTransaction(network, {id: transactionId});

      if(broadcastingResponse.data.success){
        console.log("Transaction successfully broadcasted\n");
        cliFlow();
      } else {
        console.log("An error occurred during the broadcast: ", broadcastingResponse.data.error);
        cliFlow();
      }

    } else {
      console.log("An error occurred during the transaction creation: ", creationResponse.data.error);
      cliFlow();
    }

  } catch(e){
    console.log("Error! " + e);
    process.exit();
  }
}

cliFlow();

function cliAsk(pharse) {
  return new Promise((resolve) => {
    rl.question(pharse, (line) => resolve(line))
  })
}

async function createTransaction(network, transactionParams) {
  return await axios({
    method:'post',
    url:`http://localhost:8080/${network}/transaction`,
    data: transactionParams
  })
}

async function broadcastTransaction(network, transactionId) {
  return await axios({
    method:'post',
    url:`http://localhost:8080/${network}/broadcast`,
    data: transactionId
  })
}
