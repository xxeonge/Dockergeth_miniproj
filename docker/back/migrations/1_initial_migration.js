const Migrations = artifacts.require("../contracts/Certificate.sol");
module.exports = function (deployer) {
  deployer.deploy(Migrations);
};
