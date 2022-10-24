// import Web3 from 'web3';

var Web3 = require('web3')
//web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:8545', { reconnect: { auto: true }}))
const web3 = new Web3(new Web3.providers.HttpProvider('http://192.168.0.7:30303', { reconnect: { auto: true }}))
//const web3 = new Web3(new Web3.providers.HttpProvider('http://192.168.0.14:30304', { reconnect: { auto: true }}))

//web3 = new Web3(new Web3.providers.HttpProvider('https://ropsten.infura.io/v3/eb2c5282b83b4f45bd2cee63d2c2fc53'))

// if (window.ethereum) {
//   window.web3 = new Web3(ethereum);
//   try {
//     // Request account access if needed
//     ethereum.enable();
//   } catch (error) {
//     // User denied account access...
//   }
// } else if (window.web3) { // Legacy dapp browsers...
//   window.web3 = new Web3(web3.currentProvider);
// } else { // Non-dapp browsers...
//   console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
// }



//console.log(web3);
module.exports = web3;
