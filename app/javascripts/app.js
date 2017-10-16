// Import the page's CSS. Webpack will know what to do with it.
import '../stylesheets/app.css'
// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'
import { default as moment } from 'moment'

// contract name VacuumTokenSale
import EMERAToken_artifacts from '../../build/contracts/EMERAToken.json'
import EMERATokenSale_artifacts from '../../build/contracts/EMERATokenSale.json'

var EMERAToken = contract(EMERAToken_artifacts)
var EMERATokenSale = contract(EMERATokenSale_artifacts)

let startTime
let endTime
let lastTimeRate
let inputStart
let inputPeriod
let currentRate

function onlyIcoAddress() {
    EMERATokenSale.deployed().then(function (contractInstance) {
        $('#ico-address').html(EMERATokenSale.address)
    })
}

function onlyTokenAddress() {
  EMERATokenSale.deployed().then(function (contractInstance) {
    	contractInstance.token.call({ from: web3.eth.accounts[0] }).then(function (token) {
    	    $('#tokenAddress').html(token)
        })
    })
}

function onlyOwner() {
  EMERATokenSale.deployed().then(function (contractInstance) {
        contractInstance.owner.call({ from: web3.eth.accounts[0] }).then(function (owner) {
            $('#owner').html(owner)
        })
    })
}

function onlyPaused() {
  EMERATokenSale.deployed().then(function (contractInstance) {
        contractInstance.paused.call({ from: web3.eth.accounts[0] }).then(function (paused) {
            $('#paused').html(paused.toString())
        })
    })
}

function onlyStart() {
  EMERATokenSale.deployed().then(function (contractInstance) {
        contractInstance.start.call({ from: web3.eth.accounts[0] }).then(function (start) {
            let ts = moment.unix(start)
            startTime = Number(ts)
            if (startTime > 0) {
                $('#start').html((ts.utcOffset(0)).format('MMMM DD YYYY, h:mm:ss'))
            } else {
                $('#start').html('Start time not planned')
            }
        })
    })
}

function onlyLastRateChange() {
  EMERATokenSale.deployed().then(function (contractInstance) {
    contractInstance.lastTimeRateChange.call({ from: web3.eth.accounts[0] }).then(function (lastTimeRateChange) {
      let ts = moment.unix(lastTimeRateChange)
      lastTimeRate = Number(ts)
      if (lastTimeRate > 0) {
        $('#lastTimeRate').html((ts.utcOffset(0)).format('MMMM DD YYYY, h:mm:ss'))
      } else {
        $('#lastTimeRate').html("Rate didn't setup")
      }
    })
  })
}

function onlyPeriod() {
  EMERATokenSale.deployed().then(function (contractInstance) {
        contractInstance.period.call({ from: web3.eth.accounts[0] }).then(function (period) {
            endTime = (Number(period) * 60000) // * 60 * 24)
            $('#period').html(period.toString())
        })
    })
}

function onlyRate() {
  EMERATokenSale.deployed().then(function (contractInstance) {
    contractInstance.rate.call({ from: web3.eth.accounts[0] }).then(function (rate) {
      $('#currentRate').html(rate.toString())
    })
  })
}

function onlyDiscount() {
  EMERATokenSale.deployed().then(function (contractInstance) {
    contractInstance.bonusPercentage.call({ from: web3.eth.accounts[0] }).then(function (bonusPercentage) {
      $('#discount').html(bonusPercentage.toString())
    })
  })
}

function onlyHardcap() {
  EMERATokenSale.deployed().then(function (contractInstance) {
    contractInstance.hardCapRound.call({ from: web3.eth.accounts[0] }).then(function (hardCapRound) {
        hardCapRound = hardCapRound / 100000000
      $('#hardcap').html(hardCapRound.toString())
    })
  })
}

function onlyRemainTokens() {
  EMERATokenSale.deployed().then(function (contractInstance) {
    contractInstance.remainTokens.call({ from: web3.eth.accounts[0] }).then(function (remainTokens) {
      remainTokens = remainTokens / 100000000
      $('#remain').html(remainTokens.toString())
    })
  })
}

function onlyTotalSypply() {
  EMERAToken.deployed().then(function (contractInstance) {
    contractInstance.totalSupply.call({ from: web3.eth.accounts[0] }).then(function (totalSupply) {
      totalSupply = totalSupply / 100000000
      $('#totalSupply').html(totalSupply.toString())
    })
  })
}

function onlyTotalBurned() {
  EMERAToken.deployed().then(function (contractInstance) {
    contractInstance.burned.call({ from: web3.eth.accounts[0] }).then(function (burned) {
      burned = burned / 100000000
      $('#totalBurned').html(burned.toString())
    })
  })
}

function onlyBalanceForCurrentCustomer() {
  EMERAToken.deployed().then(function (contractInstance) {
    contractInstance.balanceOf.call(web3.eth.accounts[0], { from: web3.eth.accounts[0] }).then(function (balance) {
      balance = balance / 100000000
      $('#totalCurrentAddress').html(balance.toString())
    })
  })
}

function onlyUntilStartJs() {
  setInterval(function() {
    let begin = Number(startTime)
    if (begin > 0) {
        if (moment().isBefore(begin)) {
                let diffTime = moment(moment(begin).diff(moment.utc(), 'seconds'))
                let hours = Math.floor(diffTime / 3600)
                let minutes = Math.floor((diffTime - hours * 3600) / 60)
                let seconds = Math.floor((diffTime - hours * 3600 - minutes * 60))
                $('#until-start').html(hours + ':' + minutes + ':' + seconds)
        } else {
            $('#until-start').html('Has already begun')
        }
    } else {
        $('#until-start').html('Start time not planned')
    }
  }, 1000)
}

function onlyUntilEndJs() {
  setInterval(function() {
    let end = (Number(startTime) + Number(endTime))
    if (Number(startTime) > 0) {
        if (moment().isBefore(end)) {
            let diffTime = moment(moment(end).diff(moment.utc(), 'seconds'))
            let hours = Math.floor(diffTime / 3600)
            let minutes = Math.floor((diffTime - hours * 3600) / 60)
            let seconds = Math.floor((diffTime - hours * 3600 - minutes * 60))
            $('#until-end').html(hours + ':' + minutes + ':' + seconds)
        } else {
            $('#until-end').html('Already finished')
        }
    } else {
        $('#until-end').html('Start time not planned')
    }
  }, 1000)
}

function onlyUntilAbilityForRateChangeJs() {
  setInterval(function() {
    let end = Number(lastTimeRate) + Number(120000)
    if (Number(lastTimeRate) > 0) {
      if (moment().isBefore(end)) {
        let diffTime = moment(moment(end).diff(moment.utc(), 'seconds'))
        let hours = Math.floor(diffTime / 3600)
        let minutes = Math.floor((diffTime - hours * 3600) / 60)
        let seconds = Math.floor((diffTime - hours * 3600 - minutes * 60))
        $('#until-rateChange').html(hours + ':' + minutes + ':' + seconds)
      } else {
        $('#until-rateChange').html("Now it's possible to change rate")
      }
    } else {
      $('#until-rateChange').html("Rate didn't setup")
    }
  }, 1000)
}

function onlyUntilStart() {
    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.untilTheStartIcoStage.call({ from: web3.eth.accounts[0] }).then(function (untilStart) {
            $('#until-start').html(untilStart.toString())
        })
    })
}

function onlyUntilEnd() {
    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.untilTheEndIcoStage.call({ from: web3.eth.accounts[0] }).then(function (untilEnd) {
            $('#until-end').html(untilEnd.toString())
        })
    })
}

/*function onlyHasEnded() {
    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.hasEnded.call({ from: web3.eth.accounts[0] }).then(function (ended) {
            $('#has-ended').html(ended.toString())
        })
    })
}

function onlyPreIco() {
    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.stagePreIco.call({ from: web3.eth.accounts[0] }).then(function (preIco) {
            $('#pre-ico').html(preIco.toString())
        })
    })
}

function onlyIco() {
    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.stageIco.call({ from: web3.eth.accounts[0] }).then(function (ico) {
            $('#ico').html(ico.toString())
        })
    })
}

function onlyTokenAddress() {
    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.token.call({ from: web3.eth.accounts[0] }).then(function (token) {
            $('#token').html(token)
        })
    })
}

function onlyTokenTotal() {
    VacuumToken.deployed().then(function (contractInstance) {
        contractInstance.totalSupply.call({ from: web3.eth.accounts[0] }).then(function (total) {
                    $('#token-total').html(total.toString())
                })
            })
}

function onlySoldBtc() {
    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.soldTokensForBtcInvestors.call({ from: web3.eth.accounts[0] }).then(function (soldBtc) {
            $('#sold-btc').html(soldBtc.toString())
        })
    })
}

function onlyRemainTokens() {
    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.remainTokens.call({ from: web3.eth.accounts[0] }).then(function (remain) {
            $('#remain').html(remain.toString())
        })
    })
}

function onlySoldEth() {
    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.soldTokensForEthInvestors.call({ from: web3.eth.accounts[0] }).then(function (soldEth) {
            $('#sold-eth').html(soldEth.toString())
        })
    })
}

function onlyWeiRaised() {
    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.weiRaised.call({ from: web3.eth.accounts[0] }).then(function (weiRaised) {
            $('#wei-raised').html(weiRaised.toString())
        })
    })
}

function onlyRate() {
    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.calcCurrentRate({ from: web3.eth.accounts[0] }).then(function (rate) {
            $('#rate').html(rate.toString())
            currentRate = rate
        })
    })
}

function onlyIcoBalance() {
    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.icoBalance.call({ from: web3.eth.accounts[0] }).then(function (icoBalance) {
            $('#ico-balance').html(icoBalance.toString())
        })
    })
}

function onlyWallet() {
    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.getWallet.call({ from: web3.eth.accounts[0] }).then(function (wallet) {
            $('#wallet-address').html(wallet)
        })
    })
}

function onlyRestrictedWallet() {
    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.getRestrictedWallet.call({ from: web3.eth.accounts[0] }).then(function (restricted) {
            $('#restricted-address').html(restricted)
        })
    })
}

function onlyPreIcoTotal() {
    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.getPreIcoInvestorsCount.call({ from: web3.eth.accounts[0] }).then(function (preIcoTotal) {
            $('#pre-ico-total').html(preIcoTotal.toString())
        })
    })
}

function onlyPreIcoMintCount() {
    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.getPreIcoMintCount.call({ from: web3.eth.accounts[0] }).then(function (preIcoCount) {
            $('#pre-ico-count').html(preIcoCount.toString())
        })
    })
}

function onlyIcoTotal() {
    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.getIcoInvestorsCount.call({ from: web3.eth.accounts[0] }).then(function (icoTotal) {
            $('#ico-total').html(icoTotal.toString())
        })
    })
}

function onlyIcoMintCount() {
    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.getIcoMintCount.call({ from: web3.eth.accounts[0] }).then(function (icoCount) {
            $('#ico-count').html(icoCount.toString())
        })
    })
}*/

async function populateContractInfo () {

    onlyOwner()

    onlyIcoAddress()

    onlyTokenAddress()

    //onlyPreIco()

    //onlyIco()

    onlyStart()

    onlyPeriod()

    //onlyHasEnded()

    onlyPaused()
    
    onlyRate()

    onlyDiscount()

    onlyHardcap()

    onlyLastRateChange()

    onlyRemainTokens()

    transactionTracker()

    onlyTotalSypply()

    onlyTotalBurned()

    onlyBalanceForCurrentCustomer()

    //onlySoldEth()

    //onlySoldBtc()

    //onlyRemainTokens()

    //onlyWeiRaised()

    //onlyTokenAddress()

    //onlyTokenTotal()

    //onlyWallet()

    //onlyRestrictedWallet()

    //onlyIcoBalance()

    //onlyPreIcoTotal()

    /*onlyPreIcoMintCount()

    onlyIcoTotal()

    onlyIcoMintCount()

    transactionTracker()

    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.hardCap.call({ from: web3.eth.accounts[0] }).then(function (hardCap) {
            $('#hardcap').html(hardCap.toString())
        })
    })

    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.restrictedTokens.call({ from: web3.eth.accounts[0] }).then(function (restricted) {
            $('#restricted').html(restricted.toString())
        })
    })*/

}


window.setupRound = function () {
  let start = $('#start-value').val()
  let period = $('#period-value').val()
  let rate = $('#price-value').val()
  let discount = $('#discount-value').val()
  let hardcapRound = $('#hardcapRound-value').val()
  if (!start || !period || !rate || !discount || !hardcapRound) {
    $('#msg-ico').html('Empty values are not allowed!')
  } else {
    $('#msg-ico').html('Info has been submitted and is recording to the blockchain. Please wait.')
    $('#start-value').val('')
    $('#period-value').val('')
    $('#price-value').val('')
    $('#discount-value').val('')
    $('#hardcapRound-value').val('')
    startTime = ''
    endTime = ''
    EMERATokenSale.deployed().then(function (contractInstance) {
      contractInstance.setupNewRoundParams(start, period, rate, discount, hardcapRound, { gas: 200000, from: web3.eth.accounts[0] }).then(function () {
        onlyStart()
        onlyPeriod()
        onlyRate()
        onlyDiscount()
        onlyHardcap()
        onlyRemainTokens()
        onlyLastRateChange()
        //onlyHasEnded()
        //transactionTracker()
        $('#msg-ico').html('')
      }).catch(function (e) { if (e) { $('#msg-ico').html('Something goes wrong.') } })
    })
  }
}

window.setupNewPrice = function () {
  let newRate = $('#new-rate-setup').val()
  $('#msg-ico').html('Info has been submitted and is recording to the blockchain. Please wait.')
  $('#new-rate-setup').val('')
  EMERATokenSale.deployed().then(function (contractInstance) {
    contractInstance.tryToChangeRate(newRate, { gas: 200000, from: web3.eth.accounts[0] }).then(function () {
        onlyRate()
        onlyLastRateChange()
      $('#msg-ico').html('')
    }).catch(function (e) { if (e) { $('#msg-ico').html('Something goes wrong.') } })
  })
}

async function transactionTracker() {
    $('#log-rows').html('')
    let logs = await getTransactionsByAccount().then(function(data) {
        return data.slice()
    })
    for (let i = 0; i < logs.length; i++) {
        $('#log-rows').append('<tr><td><a href="https://rinkeby.etherscan.io/tx/' + logs[i].hash + '" target="_blank">' + logs[i].hash + '</a></td><td>' + logs[i].from + '</td><td>' + logs[i].to + '</td><td>' + logs[i].value + '</td></tr>')
    }
}

async function getTransactionsByAccount (startBlockNumber, endBlockNumber) {
    let myaccount = web3.eth.accounts[0];
    if (endBlockNumber == null) {
        endBlockNumber = await new Promise((resolve, reject) => {
            return web3.eth.getBlock("latest", function(error, result) {
                if(!error) {
                    resolve(result.number)
                } else {
                    console.error(error)
                }
            })
        }).then(function(data) {
            return data
        })
    }
    if (startBlockNumber == null) {
        startBlockNumber = endBlockNumber - 100
    }
    let array = []
    for (let i = startBlockNumber; i <= endBlockNumber; i++) {
        var block = await new Promise((resolve, reject) => {
            return web3.eth.getBlock(i, true, function(error, result) {
                if(!error) {
                    resolve(result)
                } else {
                    console.error(error)
                }
            })
        }).then(function(data) {
            return data
        })
        if (block != null && block.transactions != null) {
            block.transactions.forEach(function (e) {
                if (myaccount == e.from || (myaccount == e.to && e.to != null)) {
                    array.push(e)
                }
            })
        }
    }
    return array
}

window.pause = function () {
    $('#msg-ico').html('Info has been submitted and is recording to the blockchain. Please wait.')
    EMERATokenSale.deployed().then(function (contractInstance) {
        contractInstance.pause( { gas: 100000, from: web3.eth.accounts[0] }).then(function () {
            onlyPaused()
            transactionTracker()
            $('#msg-ico').html('')
        }).catch(function (e) { if (e) { $('#msg-ico').html('Something goes wrong.') } })
    })
}

window.unpause = function () {
    $('#msg-ico').html('Info has been submitted and is recording to the blockchain. Please wait.')
    EMERATokenSale.deployed().then(function (contractInstance) {
        contractInstance.unpause( { gas: 100000, from: web3.eth.accounts[0] }).then(function () {
            onlyPaused()
            transactionTracker()
            $('#msg-ico').html('')
        }).catch(function (e) { if (e) { $('#msg-ico').html('Something goes wrong.') } })
    })
}

/*window.setupWallet = function () {
    let withdrawal = $('#wallet-setup').val()
    $('#msg-ico').html('Info has been submitted and is recording to the blockchain. Please wait.')
    $('#wallet-setup').val('')
    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.setupWallet(withdrawal, { gas: 200000, from: web3.eth.accounts[0] }).then(function () {
            onlyWallet()
            transactionTracker()
            $('#msg-ico').html('')
        }).catch(function (e) { if (e) { $('#msg-ico').html('Something goes wrong.') } })
    })
}

window.setupRestrictedWallet = function () {
    let restricted = $('#restricted-wallet-setup').val()
    $('#msg-ico').html('Info has been submitted and is recording to the blockchain. Please wait.')
    $('#restricted-wallet-setup').val('')
    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.setupRestrictedWallet(restricted, { gas: 200000, from: web3.eth.accounts[0] }).then(function () {
            onlyRestrictedWallet()
            transactionTracker()
            $('#msg-ico').html('')
        }).catch(function (e) { if (e) { $('#msg-ico').html('Something goes wrong.') } })
    })
}

window.changeStage = function () {
    $('#msg-ico').html('Info has been submitted and is recording to the blockchain. Please wait.')
    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.changeFundrisingStage( { gas: 200000, from: web3.eth.accounts[0] }).then(function () {
            onlyPreIco()
            onlyIco()
            transactionTracker()
            $('#msg-ico').html('')
        }).catch(function (e) { if (e) { $('#msg-ico').html('Something goes wrong.') } })
    })
}

window.finishStage = function () {
    $('#msg-ico').html('Info has been submitted and is recording to the blockchain. Please wait.')
    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.finishFundrisingStage( { gas: 200000, from: web3.eth.accounts[0] }).then(function () {
            onlyPreIco()
            onlyIco()
            transactionTracker()
            $('#msg-ico').html('')
        }).catch(function (e) { if (e) { $('#msg-ico').html('Something goes wrong.') } })
    })
}

window.reserveToBtc = function () {
    let addrBtc = $('#btc-address').val()
    let tokensBtc = $('#btc-tokens').val()
    if (!addrBtc || !tokensBtc) {
        $('#msg-token').html('Empty values are not allowed!')
    } else {
        $('#msg-token').html('Info has been submitted and is recording to the blockchain. Please wait.')
        $('#btc-address').val('')
        $('#btc-tokens').val('')
        VacuumTokenSale.deployed().then(function (contractInstance) {
            contractInstance.purchaseToBtcInvestors(addrBtc, tokensBtc, { gas: 200000, from: web3.eth.accounts[0] }).then(function () {
                onlySoldBtc()
                onlyRemainTokens()
                onlyPreIcoTotal()
                onlyIcoTotal()
                transactionTracker()
                $('#msg-token').html('')
            }).catch(function (e) { if (e) { $('#msg-token').html('Something goes wrong.') } })
        })
    }
}

window.mintPreIcoTokens = function () {
    $('#msg-token').html('Info has been submitted and is recording to the blockchain. Please wait.')
    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.mintTokenPreICO( { from: web3.eth.accounts[0] }).then(function () {
            transactionTracker()
            onlyTokenTotal()
            onlyPreIcoMintCount()
            $('#msg-token').html('')
        }).catch(function (e) { if (e) { $('#msg-token').html('Something goes wrong.') } })
    })
}

window.mintIcoTokens = function () {
    $('#msg-token').html('Info has been submitted and is recording to the blockchain. Please wait.')
    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.mintTokenICO( { from: web3.eth.accounts[0] }).then(function () {
            transactionTracker()
            onlyTokenTotal()
            onlyIcoMintCount()
            $('#msg-token').html('')
        }).catch(function (e) { if (e) { $('#msg-token').html('Something goes wrong.') } })
    })
}

window.finishMint = function () {
    $('#msg-token').html('Info has been submitted and is recording to the blockchain. Please wait.')
    VacuumTokenSale.deployed().then(function (contractInstance) {
        contractInstance.finishMinting( { from: web3.eth.accounts[0] }).then(function () {
            transactionTracker()
            onlyTokenTotal()
            $('#msg-token').html('')
        }).catch(function (e) { if (e) { $('#msg-token').html('Something goes wrong.') } })
    })
}*/

window.transferOwner = function () {
    let newOwner = $('#owner-value').val()
    if (!newOwner) {
        $('#msg-transfer').html('Empty values are not allowed!')
    } else {
        $('#msg-transfer').html('Info has been submitted and is recording to the blockchain. Please wait.')
        $('#owner-value').val('')
        EMERATokenSale.deployed().then(function (contractInstance) {
            contractInstance.transferOwnership(newOwner, { gas: 100000, from: web3.eth.accounts[0] }).then(function () {
                onlyOwner()
                transactionTracker()
                $('#msg-transfer').html('')
            }).catch(function (e) { if (e) { $('#msg-transfer').html('Something goes wrong.') } })
        })
    }
}

window.burnTokens = function () {
  $('#msg-token').html('Info has been submitted and is recording to the blockchain. Please wait.')
  EMERAToken.deployed().then(function (contractInstance) {
    contractInstance.burnAll( { from: web3.eth.accounts[0] }).then(function () {
      transactionTracker()
      onlyTotalSypply()
      onlyTotalBurned()
      onlyBalanceForCurrentCustomer()
      $('#msg-token').html('')
    }).catch(function (e) { if (e) { $('#msg-token').html('Something goes wrong.') } })
  })
}

window.buyTokens = async function () {
    let amount = $('#wei-buy-value').val()
    if (Number(amount) < Number(10000000000000000)) {
        $('#msg-buy').html('The minimum purchase is 0.01 ETH.')
    } else {
        $('#msg-buy').html('Info has been submitted and is recording to the blockchain. Please wait.')
        $('#wei-buy-value').val('')
        await payed(amount)
        setTimeout(transactionTracker, 30000)
        setTimeout(afterPayed, 30000)
    }
}

async function payed (_amount) {
  await new Promise ((resolve, reject) => {
    web3.eth.sendTransaction( { gas: 600000, from: web3.eth.accounts[0], to: EMERATokenSale.address, value: _amount }, function(error, result) {
      if (!error) {
        resolve(result)
      } else {
        console.error(error);
      }
    })
  })
}



function afterPayed () {
    $('#msg-buy').html('')
}

window.transferTokens = function () {
    let address = $('#transfer-address').val()
    let amount = $('#transfer-value').val()
    let value = Number(amount) * 100000000
    if (!address || !value) {
        $('#msg-buy').html('Empty values are not allowed!')
    } else {
        $('#msg-buy').html('Info has been submitted and is recording to the blockchain. Please wait.')
        EMERAToken.deployed().then(function (contractInstance) {
            contractInstance.transfer( address, value, { gas: 100000, from: web3.eth.accounts[0] }).then(function () {
                transactionTracker()
                onlyBalanceForCurrentCustomer()
                $('#msg-buy').html('')
                $('#transfer-address').val('')
                $('#transfer-value').val('')
            }).catch(function (e) { if (e) { $('#msg-buy').html('Something goes wrong.') } })
        })
    }
}

$("#start-value").on("input", function(e) {
    inputStart = e.target.value
    showSettablePeriod (inputStart, inputPeriod)
})

$("#period-value").on("input", function(e) {
    inputPeriod = e.target.value
    showSettablePeriod (inputStart, inputPeriod)
})

function showSettablePeriod (_inputStart, _inputPeriod) {
    $('#msg-ico').html(moment.unix(_inputStart).utcOffset(0).format('MMMM DD YYYY, h:mm:ss') + '  --->  ' + moment.unix(Number(_inputStart) + (Number(_inputPeriod) * 60)).utcOffset(0).format('MMMM DD YYYY, h:mm:ss'))
}

function saleStatus () {
      onlyRemainTokens()
      onlyRate()
      onlyTotalSypply()
      onlyTotalBurned()
      onlyBalanceForCurrentCustomer()
}

window.refreshInfo = function () {
    populateContractInfo()
}

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source.")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Please, install Metamask plugin!");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    //window.web3 = new Web3(new Web3.providers.HttpProvider("http://34.231.64.186:8545"));
  }

  EMERATokenSale.setProvider(web3.currentProvider);
  EMERAToken.setProvider(web3.currentProvider);

  refreshInfo()
  onlyUntilStartJs()
  onlyUntilEndJs()
  onlyUntilAbilityForRateChangeJs()
  setInterval(saleStatus, 5000)
})
