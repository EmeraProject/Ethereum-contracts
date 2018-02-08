const GEMERAToken = artifacts.require('./GEMERAToken.sol');
const GEMERA = artifacts.require('./GEMERA.sol');

module.exports = function(deployer) {
  deployer.deploy(GEMERAToken).then(() => {
    return deployer.deploy(GEMERA, GEMERAToken.address);
  });
};
