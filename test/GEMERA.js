/* eslint-disable */
import ether from './helpers/ether';
import { advanceBlock } from './helpers/advanceToBlock';
import { increaseTimeTo, duration } from './helpers/increaseTime';
import latestTime from './helpers/latestTime';
import EVMRevert from './helpers/EVMRevert';

const BigNumber = web3.BigNumber;
const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const GEMERAToken = artifacts.require('./GEMERAToken.sol');
const GEMERA = artifacts.require('./GEMERA.sol');

contract('GEMERA', function (accounts) {
  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
    this.token = await GEMERAToken.deployed();
    this.crowdsale = await GEMERA.deployed();

    this.startTime = latestTime() + duration.weeks(1);
    await this.crowdsale.setupNewRoundParams(this.startTime, duration.weeks(1), ether(0.0002), 10, 120000000, { from: accounts[0] });
  });

  it('approve ownership', async function () {
    await this.token.transferOwnership(this.crowdsale.address, { from: accounts[0] });
    await this.crowdsale.approveOwnership({ from: accounts[0] });
    assert.equal(await this.token.owner(), this.crowdsale.address);
  });

  it('white list', async function() {
    await increaseTimeTo(this.startTime);
    await this.crowdsale.setWhiteFlag(false);
    await this.crowdsale.sendTransaction({ from: accounts[1], value: ether(0.5) }).should.be.fulfilled;
    await this.crowdsale.sendTransaction({ from: accounts[2], value: ether(1.5) }).should.be.fulfilled;
    await this.crowdsale.setWhiteFlag(true);
    await this.crowdsale.sendTransaction({ from: accounts[1], value: ether(0.5) }).should.be.rejectedWith(EVMRevert);
    await this.crowdsale.sendTransaction({ from: accounts[2], value: ether(1.5) }).should.be.rejectedWith(EVMRevert);
    await this.crowdsale.whitelistAddress([accounts[1], accounts[2]], { from: accounts[0] });
    const count = await this.crowdsale.lengthWhiteList();
    count.should.be.bignumber.equal(2);
    await this.crowdsale.sendTransaction({ from: accounts[1], value: ether(0.5) }).should.be.fulfilled;
    await this.crowdsale.sendTransaction({ from: accounts[2], value: ether(1.5) }).should.be.fulfilled;
  });
});
