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
// contract name VacuumTokenSale
import EMERATokenSale_artifacts from '../../build/contracts/EMERATokenSale.json'

var EMERATokenSale = contract(EMERATokenSale_artifacts)
let preIco = {}
let ico = {}

window.refreshList = function () {
  getStatistics()
}

async function getStatistics () {
    preIco = {}
    EMERATokenSale.deployed().then(async function (contractInstance) {
        contractInstance.currentStatCount.call( { from: web3.eth.accounts[0] }).then(async function (count) {
            for (let i = 0; i < count; i++) {
                await contractInstance.getStat.call(i + 1, { from: web3.eth.accounts[0] }).then(function (stat) {
                    let tok_sold = (stat[1]/100000000).toString()
                    let tok_free = (stat[2]/100000000).toString()
                    let eth_purchase = (stat[3]/1000000000000000000).toString()
                    $('#preico-rows').append('<tr><td>' + stat[0] + "</td><td>" + tok_sold + "</td><td>" + tok_free +
                      "</td><td>" + eth_purchase + "</td></tr>")

                })
            }
        })
    })  
}



window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source.")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider)
  } else {
    console.warn("No web3 detected. Please, install Metamask plugin!")
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    //window.web3 = new Web3(new Web3.providers.HttpProvider("http://34.231.64.186:8545"));
  }

  EMERATokenSale.setProvider(web3.currentProvider)

  refreshList()
})
