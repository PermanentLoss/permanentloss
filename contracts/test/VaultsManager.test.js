const VaultsManager = artifacts.require("VaultsManager");
const {expect} = require("chai");
const ERC20 = require("@openzeppelin/contracts/build/contracts/ERC20.json");
const {expectEvent} = require("@openzeppelin/test-helpers");
const ethers = require("ethers");

contract("VaultsManager", (accounts) => {
  let vaultsManager;

  // USDC uses 6 decimals
  const aHundredUSDC = (100 * 10 ** 6).toString();

  const Collateral = {USDC: 0, cUSDC: 1, WETH: 2};

  before(async () => {
    vaultsManager = await VaultsManager.deployed();

    const deployerWithUSDCAddr = "0x019460841193Ba8A74D32228AF33cba52e68Dfb4";

    const USDCAddress = "0x4DBCdF9B62e891a7cec5A2568C3F4FAF9E8Abe2b";
    const USDC = new web3.eth.Contract(ERC20.abi, USDCAddress);

    // Send USDC to the first test account
    await USDC.methods
      .transfer(accounts[0], aHundredUSDC)
      .send({from: deployerWithUSDCAddr});

    // Approve the VaultsManager contract to use the test account's USDCs
    await USDC.methods
      .approve(vaultsManager.address, "0")
      .send({from: accounts[0]});
    await USDC.methods
      .approve(vaultsManager.address, ethers.constants.MaxUint256.toString())
      .send({from: accounts[0]});
  });

  describe("testing the openCollateralizedVault function", async () => {
    it("should open new vault and deposit the given amount of collateral", async () => {
      const txReceipt = await vaultsManager.openCollateralizedVault(
        Collateral.USDC,
        aHundredUSDC
      );
      expectEvent(txReceipt, "CollateralizedVaultOpened", {
        accountOwner: accounts[0],
        vaultId: "1",
        amountDeposited: aHundredUSDC,
      });
    });
  });
});
