const OptionsStrategies = artifacts.require("OptionsStrategies");
const VaultsManager = artifacts.require("VaultsManager");

module.exports = async (deployer) => {
  const OpynV2AddressBook = "0x7630e7dE53E3d1f298f653d27fcF3710c602331C";

  await deployer.deploy(OptionsStrategies, OpynV2AddressBook);

  const USDC = "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b";
  const cUSDC = "0x5B281A6DdA0B271e91ae35DE655Ad301C976edb1";
  const WETH = "0xc778417E063141139Fce010982780140Aa0cD5Ab";

  const validCollateral = [USDC, cUSDC, WETH];

  await deployer.deploy(VaultsManager, OpynV2AddressBook, validCollateral);
};
