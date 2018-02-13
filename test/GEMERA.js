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
const GEMERA = artifacts.require('./GEMERA.sol');

contract('GEMERA', function (accounts) {
  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by testrpc
    await advanceBlock();
    this.token = await GEMERAToken.deployed();
    this.crowdsale = await GEMERA.deployed();
  });

  it('approve ownership', async function () {
    await this.token.transferOwnership(this.crowdsale.address, { from: accounts[0] });
    await this.crowdsale.approveOwnership({ from: accounts[0] });
    assert.equal(await this.token.owner(), this.crowdsale.address);
  });
});
