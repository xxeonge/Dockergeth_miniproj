const Migrations = artifacts.require("../contracts/BlockchainBox.sol");
module.exports = function (deployer) {
  deployer.deploy(Migrations);
};