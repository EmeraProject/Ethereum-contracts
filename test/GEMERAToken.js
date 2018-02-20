/* eslint-disable */
import ether from './helpers/ether';
import { advanceBlock } from './helpers/advanceToBlock';
import EVMRevert from './helpers/EVMRevert';

const BigNumber = web3.BigNumber;
const should = require('chai')
  .use(require('chai-as-promised'))
  .use(require('chai-bignumber')(BigNumber))
  .should();

const GEMERAToken = artifacts.require('./GEMERAToken.sol');

contract('GEMERAToken', function (accounts) {
  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
    this.token = await GEMERAToken.deployed();
  });

  it('titles', async function () {
    assert.equal(await this.token.name(), 'GEMERA TOKEN');
    assert.equal(await this.token.symbol(), 'GEMA');
    const decimals = await this.token.decimals();
    decimals.should.be.bignumber.equal(18);
  });

  it('restricted', async function () {
    await this.token.mint(accounts[0], 3000).should.be.fulfilled;
    await this.token.transfer(accounts[1], 1000).should.be.fulfilled;
    await this.token.setRestrictedAddress(accounts[1]);
    await this.token.transfer(accounts[1], 1000).should.be.rejectedWith(EVMRevert);
    await this.token.approve(accounts[1], 100);
    await this.token.transferFrom(accounts[0], accounts[1], 100).should.be.rejectedWith(EVMRevert);
  });

  it('burnable list', async function () {
    await this.token.burn(500).should.be.rejectedWith(EVMRevert);
    const burnableList = await this.token.getBurnAddresses();
    web3.eth.sendTransaction({ from: accounts[0], to: burnableList[0], value: ether(1) });
    await this.token.mint(burnableList[0], 1500);
    await this.token.burn(1000, { from: burnableList[0] }).should.be.fulfilled;
    let balance = await this.token.balanceOf(burnableList[0]);
    balance.should.be.bignumber.equal(500);
    await this.token.burnAll({ from: burnableList[0] }).should.be.fulfilled;
    balance = await this.token.balanceOf(burnableList[0]);
    balance.should.be.bignumber.equal(0);
  });

  it('ownable approved', async function () {
    assert.equal(await this.token.owner(), accounts[0]);
    await this.token.transferOwnership(accounts[1]).should.be.fulfilled;
    assert.equal(await this.token.owner(), accounts[0]);
    await this.token.approveOwnership({ from: accounts[1] });
    assert.equal(await this.token.owner(), accounts[1]);
  });
})
