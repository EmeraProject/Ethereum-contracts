const jsonfile = require('jsonfile');
const GEMERAToken = artifacts.require('./GEMERAToken.sol');
const GEMERA = artifacts.require('./GEMERA.sol');

module.exports = function(deployer) {
  const config = jsonfile.readFileSync('./config.json');
  if (
    config.addresses.withdraw.length === 5 &&
    config.addresses.burn.length === 50
  ) {
    deployer.deploy(GEMERAToken, config.addresses.burn).then(() => {
      return deployer.deploy(GEMERA, GEMERAToken.address, config.addresses.withdraw);
    });
  } else {
    throw 'Error: check config!';
  }
};
