const readline = require('readline');
const request = require('request');
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
  if (key.ctrl && key.name === 'w') {
        process.exit();
  }
});

rl.prompt();

const phrases = [
  'Press Enter if you want to perform transaction or press CTRL+W to exit',
  'Enter network name (mainnet or devnet): ',
  'Enter recipientId: ',
  'Enter amount (in satoshis): ',
  'Enter passphrase: '
]

console.log('Welcome to ark-client.');

function* cliGen(){

  const transactionParams = {
      network: null,
      recipientId: null,
      amount: null,
      passphrase: null
  }

  while(true){
    yield ask(phrases[0]);

    let network = yield ask(phrases[1]);
    while(network !== "mainnet" && network !== "devnet"){
        console.log("Only 2 networks available. Enter mainnet or devnet");
        network = yield ask(phrases[1]);
    }
    transactionParams.recipientId = yield ask(phrases[2]);
    transactionParams.amount = yield ask(phrases[3]);
    while(transactionParams.amount < 1){
        console.log("You can't send less then 1 satoshi");
        transactionParams.amount = yield ask(phrases[3]);
    }
    transactionParams.passphrase = yield ask(phrases[4]);

    const response = yield createTransaction(network, transactionParams);
    console.log(response);
    if(response.success){
      console.log('great success!');
    } else {
      console.log(response.error);
    }
  }
}

const createTransaction = async (network, transactionParams) => {
  const response = await axios({
    method:'post',
    url:`http://localhost:8080/${network}/transaction`,
    data: transactionParams
  })
  console.log(response);
}

let cliFlow = cliGen();
cliFlow.next();

function ask(pharse){
  rl.question(pharse, (line) => cliFlow.next(line))
}
