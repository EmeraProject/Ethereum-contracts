var EmeraTokenSale = artifacts.require("./EMERATokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(EmeraTokenSale, {from: web3.eth.accounts[0]});
};
