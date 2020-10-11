const OpynV2Helpers = artifacts.require("OpynV2Helpers");

module.exports = async (deployer) => {
  const OpynV2AddressBook = "0x7630e7dE53E3d1f298f653d27fcF3710c602331C";

  await deployer.deploy(OpynV2Helpers, OpynV2AddressBook);
};
