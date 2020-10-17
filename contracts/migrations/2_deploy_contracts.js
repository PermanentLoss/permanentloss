const OptionsStrategies = artifacts.require("OptionsStrategies");
const VaultsManager = artifacts.require("VaultsManager");
const {validCollateral} = require("../utils/collateral");

module.exports = async (deployer) => {
  const OpynV2AddressBook = "0x7630e7dE53E3d1f298f653d27fcF3710c602331C";

  await deployer.deploy(OptionsStrategies, OpynV2AddressBook);

  await deployer.deploy(VaultsManager, OpynV2AddressBook, validCollateral);
};
