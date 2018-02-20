// Import the page's CSS. Webpack will know what to do with it.
import '../stylesheets/app.css'
// Import libraries we need.
import { default as Web3 } from 'web3'
import { default as contract } from 'truffle-contract'
import { default as moment } from 'moment'

// contract name VacuumTokenSale
import tokenArtifacts from '../../build/contracts/GEMERAtoken.json'
import crowdsaleArtifacts from '../../build/contracts/GEMERA.json'

const tokenContract = contract(tokenArtifacts)
const crowdsaleContract = contract(crowdsaleArtifacts)

const decimals = 1E8
const format = 'MMMM DD YYYY, h:mm:ss'

let { web3 } = window
let tokenInstance
let crowdsaleInstance

let startTime
let endTime
let lastTimeRate
let inputStart
let inputPeriod

window.addEventListener('load', async function () {
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

  tokenContract.setProvider(web3.currentProvider)
  crowdsaleContract.setProvider(web3.currentProvider)

  tokenInstance = await tokenContract.deployed()
  crowdsaleInstance = await crowdsaleContract.deployed()

  window.refreshInfo()
  onlyUntilStartJs()
  onlyUntilEndJs()
  onlyUntilAbilityForRateChangeJs()
  setInterval(saleStatus, 5000)
})

async function onlyIcoAddress () {
  $('#ico-address').html(crowdsaleInstance.address)
}

async function onlyTokenAddress () {
  const token = await crowdsaleInstance.token()
  $('#tokenAddress').html(token)
}

async function onlyOwner () {
  const owner = await crowdsaleInstance.owner()
  $('#owner').html(owner)
}

async function onlyPaused () {
  const paused = await crowdsaleInstance.paused()
  $('#paused').html(paused.toString())
}

async function onlyFWhite () {
  const fWhite = await crowdsaleInstance.fWhite()
  const btn = $('#btn-white')
  if (fWhite) {
    btn.text('Disable whitelist')
    btn.attr('class', 'btn btn-success')
  } else {
    btn.text('Enable whitelist')
    btn.attr('class', 'btn btn-danger')
  }
  $('#fwhite').html(fWhite.toString())
}

async function onlyStart () {
  const start = await crowdsaleInstance.start()
  const ts = moment.unix(start)
  startTime = Number(ts)
  $('#start').html(startTime > 0 ? (ts.utcOffset(0)).format(format) : 'Start time not planned')
}

async function onlyLastRateChange () {
  const lastTimeRateChange = await crowdsaleInstance.lastTimeRateChange()
  let ts = moment.unix(lastTimeRateChange)
  lastTimeRate = Number(ts)
  $('#lastTimeRate').html(lastTimeRate > 0 ? (ts.utcOffset(0)).format(format) : 'Rate didn`t setup')
}

async function onlyPeriod () {
  const period = await crowdsaleInstance.period()
  endTime = (Number(period) * 60000) // * 60 * 24)
  $('#period').html(period.toString())
}

async function onlyRate () {
  const rate = await crowdsaleInstance.rate()
  $('#currentRate').html(rate.toString())
}

async function onlyDiscount () {
  const bonusPercentage = await crowdsaleInstance.bonusPercentage()
  $('#discount').html(bonusPercentage.toString())
}

async function onlyHardcap () {
  const hardCapRound = await crowdsaleInstance.hardCapRound()
  $('#hardcap').html((hardCapRound / decimals).toString())
}

async function onlyRemainTokens () {
  const remainTokens = await crowdsaleInstance.remainTokens()
  $('#remain').html((remainTokens / decimals).toString())
}

async function onlyTotalSypply () {
  const totalSupply = await tokenInstance.totalSupply()
  $('#totalSupply').html((totalSupply / decimals).toString())
}

async function onlyTotalBurned () {
  const burned = await tokenInstance.burned()
  $('#totalBurned').html((burned / decimals).toString())
}

async function onlyBalanceForCurrentCustomer () {
  const balance = await tokenInstance.balanceOf(web3.eth.accounts[0])
  $('#totalCurrentAddress').html((balance / decimals).toString())
}

async function updateWhiteList () {
  const count = (await crowdsaleInstance.lengthWhiteList()).toNumber()
  if (count > 0) {
    let user = ''
    let status = false
    const tbody = $('#white-list-table > tbody').empty()
    for (let i = 0; i < count; i++) {
      user = await crowdsaleInstance.whiteUsers(i)
      status = await crowdsaleInstance.whiteList(user)
      tbody.append(
        $('<tr />').append(
          $(`<td>${user}</td>`),
          $(`<td>${status[0]}</td>`)
        )
      )
    }
  }
}

function onlyUntilStartJs () {
  setInterval(function () {
    let begin = Number(startTime)
    if (begin > 0) {
      if (moment().isBefore(begin)) {
        let diffTime = moment(moment(begin).diff(moment.utc(), 'seconds'))
        let hours = Math.floor(diffTime / 3600)
        let minutes = Math.floor((diffTime - hours * 3600) / 60)
        let seconds = Math.floor((diffTime - hours * 3600 - minutes * 60))
        $('#until-start').html(`${hours}:${minutes}:${seconds}`)
      } else {
        $('#until-start').html('Has already begun')
      }
    } else {
      $('#until-start').html('Start time not planned')
    }
  }, 1000)
}

function onlyUntilEndJs () {
  setInterval(function () {
    let end = (Number(startTime) + Number(endTime))
    if (Number(startTime) > 0) {
      if (moment().isBefore(end)) {
        let diffTime = moment(moment(end).diff(moment.utc(), 'seconds'))
        let hours = Math.floor(diffTime / 3600)
        let minutes = Math.floor((diffTime - hours * 3600) / 60)
        let seconds = Math.floor((diffTime - hours * 3600 - minutes * 60))
        $('#until-end').html(`${hours}:${minutes}:${seconds}`)
      } else {
        $('#until-end').html('Already finished')
      }
    } else {
      $('#until-end').html('Start time not planned')
    }
  }, 1000)
}

function onlyUntilAbilityForRateChangeJs () {
  setInterval(function () {
    let end = Number(lastTimeRate) + Number(120000)
    if (Number(lastTimeRate) > 0) {
      if (moment().isBefore(end)) {
        let diffTime = moment(moment(end).diff(moment.utc(), 'seconds'))
        let hours = Math.floor(diffTime / 3600)
        let minutes = Math.floor((diffTime - hours * 3600) / 60)
        let seconds = Math.floor((diffTime - hours * 3600 - minutes * 60))
        $('#until-rateChange').html(`${hours}:${minutes}:${seconds}`)
      } else {
        $('#until-rateChange').html("Now it's possible to change rate")
      }
    } else {
      $('#until-rateChange').html("Rate didn't setup")
    }
  }, 1000)
}

async function populateContractInfo () {
  onlyOwner()
  onlyIcoAddress()
  onlyTokenAddress()
  onlyStart()
  onlyPeriod()
  onlyPaused()
  onlyFWhite()
  onlyRate()
  onlyDiscount()
  onlyHardcap()
  onlyLastRateChange()
  onlyRemainTokens()
  transactionTracker()
  onlyTotalSypply()
  onlyTotalBurned()
  onlyBalanceForCurrentCustomer()
  updateWhiteList()
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
    crowdsaleInstance.setupNewRoundParams(start, period, rate, discount, hardcapRound,
        { gas: 200000, from: web3.eth.accounts[0] }).then(function () {
          onlyStart()
          onlyPeriod()
          onlyRate()
          onlyDiscount()
          onlyHardcap()
          onlyRemainTokens()
          onlyLastRateChange()
          $('#msg-ico').html('')
        }).catch(function (e) { if (e) { $('#msg-ico').html('Something goes wrong.') } })
  }
}

window.setupNewPrice = function () {
  const newRate = $('#new-rate-setup').val()
  $('#msg-ico').html('Info has been submitted and is recording to the blockchain. Please wait.')
  $('#new-rate-setup').val('')
  crowdsaleInstance.tryToChangeRate(newRate, { gas: 200000, from: web3.eth.accounts[0] }).then(function () {
    onlyRate()
    onlyLastRateChange()
    $('#msg-ico').html('')
  }).catch(function (e) { if (e) { $('#msg-ico').html('Something goes wrong.') } })
}

window.cancelRound = function () {
  $('#msg-ico').html('Info has been submitted and is recording to the blockchain. Please wait.')
  crowdsaleInstance.cancelRoundBeforeStart({ gas: 200000, from: web3.eth.accounts[0] }).then(function () {
    onlyStart()
    onlyPeriod()
    onlyRate()
    onlyDiscount()
    onlyHardcap()
    onlyRemainTokens()
    onlyLastRateChange()
    $('#msg-ico').html('')
  }).catch(function (e) { if (e) { $('#msg-ico').html('Something goes wrong.') } })
}

window.mintYearly = function () {
  $('#msg-ico').html('Info has been submitted and is recording to the blockchain. Please wait.')
  crowdsaleInstance.additionalTokenYearlyCreation({ gas: 200000, from: web3.eth.accounts[0] }).then(function () {
    onlyRemainTokens()
    $('#msg-ico').html('')
  }).catch(function (e) { if (e) { $('#msg-ico').html('Something goes wrong.') } })
}

window.eraseRemainedTokens = function () {
  $('#msg-ico').html('Info has been submitted and is recording to the blockchain. Please wait.')
  crowdsaleInstance.resetremainingtokens({ gas: 200000, from: web3.eth.accounts[0] }).then(function () {
    onlyRemainTokens()
    $('#msg-ico').html('')
  }).catch(function (e) { if (e) { $('#msg-ico').html('Something goes wrong.') } })
}

async function transactionTracker () {
  $('#log-rows').html('')
  let logs = await getTransactionsByAccount().then(function (data) {
    return data.slice()
  })
  for (let i = 0; i < logs.length; i++) {
    $('#log-rows').append(
      $('<tr />').append(
        $(`<td><a href="https://rinkeby.etherscan.io/tx/${logs[i].hash}" target="_blank">${logs[i].hash}</a></td>`),
        $(`<td>${logs[i].from}</td>`),
        $(`<td>${logs[i].to}</td>`),
        $(`<td>${logs[i].value}</td>`)
      )
    )
  }
}

async function getTransactionsByAccount (startBlockNumber, endBlockNumber) {
  const myaccount = web3.eth.accounts[0]
  if (endBlockNumber == null) {
    endBlockNumber = await new Promise((resolve, reject) => {
      return web3.eth.getBlock('latest', function (error, result) {
        if (!error) {
          resolve(result.number)
        } else {
          console.error(error)
        }
      })
    }).then(function (data) {
      return data
    })
  }
  if (startBlockNumber == null) startBlockNumber = endBlockNumber - 100
  const array = []
  for (let i = startBlockNumber; i <= endBlockNumber; i++) {
    const block = await new Promise((resolve, reject) => {
      return web3.eth.getBlock(i, true, function (error, result) {
        if (!error) {
          resolve(result)
        } else {
          console.error(error)
        }
      })
    }).then(function (data) {
      return data
    })
    if (block != null && block.transactions != null) {
      block.transactions.forEach(function (e) {
        if (myaccount === e.from || (myaccount === e.to && e.to != null)) {
          array.push(e)
        }
      })
    }
  }
  return array
}

window.pause = function () {
  $('#msg-ico').html('Info has been submitted and is recording to the blockchain. Please wait.')
  crowdsaleInstance.pause({ gas: 100000, from: web3.eth.accounts[0] }).then(function () {
    onlyPaused()
    transactionTracker()
    $('#msg-ico').html('')
  }).catch(function (e) { if (e) { $('#msg-ico').html('Something goes wrong.') } })
}

window.unpause = function () {
  $('#msg-ico').html('Info has been submitted and is recording to the blockchain. Please wait.')
  crowdsaleInstance.unpause({ gas: 100000, from: web3.eth.accounts[0] }).then(function () {
    onlyPaused()
    transactionTracker()
    $('#msg-ico').html('')
  }).catch(function (e) { if (e) { $('#msg-ico').html('Something goes wrong.') } })
}

window.transferOwner = function () {
  const newOwner = $('#owner-value').val()
  if (!newOwner) {
    $('#msg-transfer').html('Empty values are not allowed!')
  } else {
    $('#msg-transfer').html('Info has been submitted and is recording to the blockchain. Please wait.')
    $('#owner-value').val('')
    crowdsaleInstance.transferOwnership(newOwner, { gas: 100000, from: web3.eth.accounts[0] }).then(function () {
      onlyOwner()
      transactionTracker()
      $('#msg-transfer').html('')
    }).catch(function (e) { if (e) { $('#msg-transfer').html('Something goes wrong.') } })
  }
}

window.switchWhiteFlag = async function () {
  await crowdsaleInstance.switchWhiteFlag({ from: web3.eth.accounts[0] })
  onlyFWhite()
}

window.whitelistAddress = async function () {
  const users = $('#white-addresses').val()
  if (users) {
    const arr = users.replace(/\s/g, '').split(',')
    await crowdsaleInstance.whitelistAddress(arr, { from: web3.eth.accounts[0], gas: 6000000 })
    updateWhiteList()
  } else {
    $('#msg-white').html('Empty values are not allowed!')
  }
}

window.deleteUserFromWhitelist = async function () {
  const users = $('#white-addresses').val()
  if (users) {
    const arr = users.replace(/\s/g, '').split(',')
    await crowdsaleInstance.deleteUserFromWhitelist(arr, { from: web3.eth.accounts[0], gas: 6000000 })
    updateWhiteList()
  } else {
    $('#msg-white').html('Empty values are not allowed!')
  }
}

window.burnTokens = function () {
  $('#msg-token').html('Info has been submitted and is recording to the blockchain. Please wait.')
  tokenInstance.burnAll({ from: web3.eth.accounts[0] }).then(function () {
    transactionTracker()
    onlyTotalSypply()
    onlyTotalBurned()
    onlyBalanceForCurrentCustomer()
    $('#msg-token').html('')
  }).catch(function (e) { if (e) { $('#msg-token').html('Something goes wrong.') } })
}

window.buyTokens = async function () {
  const amount = $('#wei-buy-value').val()
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
  await new Promise((resolve, reject) => {
    web3.eth.sendTransaction({
      gas: 600000,
      from: web3.eth.accounts[0],
      to: crowdsaleInstance.address,
      value: _amount
    }, function (error, result) {
      if (!error) {
        resolve(result)
      } else {
        console.error(error)
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
  let value = Number(amount) * decimals
  if (!address || !value) {
    $('#msg-buy').html('Empty values are not allowed!')
  } else {
    $('#msg-buy').html('Info has been submitted and is recording to the blockchain. Please wait.')
    tokenInstance.transfer(address, value, { gas: 100000, from: web3.eth.accounts[0] }).then(function () {
      transactionTracker()
      onlyBalanceForCurrentCustomer()
      $('#msg-buy').html('')
      $('#transfer-address').val('')
      $('#transfer-value').val('')
    }).catch(function (e) { if (e) { $('#msg-buy').html('Something goes wrong.') } })
  }
}

$('#start-value').on('input', function (e) {
  inputStart = e.target.value
  showSettablePeriod(inputStart, inputPeriod)
})

$('#period-value').on('input', function (e) {
  inputPeriod = e.target.value
  showSettablePeriod(inputStart, inputPeriod)
})

function showSettablePeriod (_inputStart, _inputPeriod) {
  const start = moment
    .unix(_inputStart)
    .utcOffset(0)
    .format(format)
  const end = moment
    .unix(Number(_inputStart) + (Number(_inputPeriod) * 60))
    .utcOffset(0)
    .format(format)
  $('#msg-ico').html(`${start}  --->  ${end}`)
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
