// Import the page's CSS. Webpack will know what to do with it.
import '../stylesheets/app.css'
// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'
/*
 * When you compile and deploy your contract,
 * truffle stores the abi and deployed address in a json
 * file in the build directory. We will use this information
 * to setup a contract abstraction. We will use this abstraction
 * later to create an instance of the contract.
 */

import crowdsaleArtifacts from '../../build/contracts/GEMERA.json'

const crowdsale = contract(crowdsaleArtifacts)
let { web3 } = window

window.addEventListener('load', function () {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn('Using web3 detected from external source.')
    // Use Mist/MetaMask's provider
    web3 = new Web3(web3.currentProvider)
  } else {
    console.warn('No web3 detected. Please, install Metamask plugin!')
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    // window.web3 = new Web3(new Web3.providers.HttpProvider("http://34.231.64.186:8545"));
    web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:9545'))
  }

  crowdsale.setProvider(web3.currentProvider)
  refreshList()
})

const refreshList = function () {
  getStatistics()
}

async function getStatistics () {
  const instance = await crowdsale.deployed()
  const count = await instance.currentStatCount()
  const decimals = 1E8
  const ether = 1E18

  for (let i = 0; i < count; i++) {
    await instance.statistics(i + 1).then((stat) => {
      let tokSold = (stat[1] / decimals).toString()
      let tokFree = (stat[2] / decimals).toString()
      let ethPurchase = (stat[3] / ether).toString()
      $('#preico-rows')
        .append(`<tr><td>${stat[0]}</td><td>${tokSold}</td><td>${tokFree}</td><td>${ethPurchase}</td></tr>`)
    })
  }
}
