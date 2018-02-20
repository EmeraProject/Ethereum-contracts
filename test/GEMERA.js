/* eslint-disable */
import ether from './helpers/ether';
import { advanceBlock } from './helpers/advanceToBlock';
import { increaseTimeTo, duration } from './helpers/increaseTime';
import latestTime from './helpers/latestTime';
import EVMRevert from './helpers/EVMRevert';
import jsonfile from 'jsonfile';

const BigNumber = web3.BigNumber;
const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const GEMERAToken = artifacts.require('./GEMERAToken.sol');
const GEMERA = artifacts.require('./GEMERA.sol');
const config = jsonfile.readFileSync('./config.json');

contract('GEMERA', function (accounts) {
  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
  });

  beforeEach(async function () {
    this.token = await GEMERAToken.new(config.addresses.burn);
    this.crowdsale = await GEMERA.new(this.token.address, config.addresses.withdraw);
    this.decimals = Math.pow(10, await this.token.decimals());

    this.startTime = latestTime() + duration.weeks(1);
    await this.crowdsale.setupNewRoundParams(this.startTime, duration.weeks(1), ether(0.0002), 10, 1E6);

    // Approve ownership
    await this.token.transferOwnership(this.crowdsale.address).should.be.fulfilled;
    await this.crowdsale.approveOwnership().should.be.fulfilled;
    assert.equal(await this.token.owner(), this.crowdsale.address);
  });

  it('check new round params', async function() {
    const [ startTime, period, rate, bonusPercentage, hardCapRound ] = await Promise.all([
      this.crowdsale.start(), this.crowdsale.period(), this.crowdsale.rate(),
      this.crowdsale.bonusPercentage(), this.crowdsale.hardCapRound()
    ]);
    startTime.should.be.bignumber.equal(this.startTime);
    period.should.be.bignumber.equal(duration.weeks(1));
    rate.should.be.bignumber.equal(ether(0.0002));
    bonusPercentage.should.be.bignumber.equal(10);
    hardCapRound.should.be.bignumber.equal(1E6 * this.decimals);
  });

  it('set new rate', async function() {
    await increaseTimeTo(latestTime() + duration.minutes(5));
    await this.crowdsale.tryToChangeRate(ether(0.1)).should.be.fulfilled;
    const rate = await this.crowdsale.rate();
    rate.should.be.bignumber.equal(ether(0.1));
  });

  it('white list', async function() {
    // Add user
    await increaseTimeTo(this.startTime + duration.minutes(1));
    let fWhite = await await this.crowdsale.fWhite();
    fWhite.should.be.false;
    await this.crowdsale.sendTransaction({ from: accounts[1], value: ether(0.5) }).should.be.fulfilled;
    await this.crowdsale.sendTransaction({ from: accounts[2], value: ether(1.5) }).should.be.fulfilled;
    await this.crowdsale.switchWhiteFlag();
    fWhite = await await this.crowdsale.fWhite();
    fWhite.should.be.true;
    await this.crowdsale.sendTransaction({ from: accounts[1], value: ether(0.5) }).should.be.rejectedWith(EVMRevert);
    await this.crowdsale.sendTransaction({ from: accounts[2], value: ether(1.5) }).should.be.rejectedWith(EVMRevert);
    await this.crowdsale.whitelistAddress([accounts[1], accounts[2]]);
    const count = await this.crowdsale.lengthWhiteList();
    count.should.be.bignumber.equal(2);
    await this.crowdsale.sendTransaction({ from: accounts[1], value: ether(0.5) }).should.be.fulfilled;
    await this.crowdsale.sendTransaction({ from: accounts[2], value: ether(1.5) }).should.be.fulfilled;

    // Delete user
    let status = await this.crowdsale.whiteList(accounts[1]);
    status[0].should.be.true;
    await this.crowdsale.deleteUserFromWhitelist([accounts[1]]);
    status = await this.crowdsale.whiteList(accounts[1]);
    status[0].should.be.false;
  });

  it('buy tokens', async function() {
    await increaseTimeTo(this.startTime + duration.minutes(1));
    await this.crowdsale.sendTransaction({ from: accounts[3], value: ether(0.742) }).should.be.fulfilled;
    let myBalance = await this.token.balanceOf(accounts[3]);
    myBalance.should.be.bignumber.equal(4081 * this.decimals);

    await this.crowdsale.sendTransaction({ from: accounts[4], value: ether(0.010000245) }).should.be.fulfilled;
    myBalance = await this.token.balanceOf(accounts[4]);
    myBalance.should.be.bignumber.equal(55.0013475 * this.decimals);
  });

  it('remaining tokens', async function() {
    await increaseTimeTo(latestTime() + duration.minutes(5));
    await this.crowdsale.tryToChangeRate(ether(0.0000001));
    await increaseTimeTo(this.startTime + duration.minutes(1));
    await this.crowdsale.sendTransaction({ from: accounts[1], value: ether(0.08) }).should.be.fulfilled;
    const remain = await this.crowdsale.remainTokens();
    remain.should.be.bignumber.equal(120000 * this.decimals);
  });
});
