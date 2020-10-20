const VaultsManager = artifacts.require("VaultsManager");
const {expect} = require("chai");
const ERC20 = require("@openzeppelin/contracts/build/contracts/ERC20.json");
const {expectEvent, expectRevert} = require("@openzeppelin/test-helpers");
const ethers = require("ethers");
const {validCollateral} = require("../utils/collateral");
const ether = require("@openzeppelin/test-helpers/src/ether");

contract("VaultsManager", (accounts) => {
  let vaultsManager;

  // USDC uses 6 decimals
  const aHundredUSDC = (100 * 10 ** 6).toString();

  const Collateral = {USDC: 0, cUSDC: 1, WETH: 2};

  const newOtoken = [
    validCollateral[Collateral.WETH],
    validCollateral[Collateral.USDC],
    Collateral.USDC,
    ethers.BigNumber.from("20000000000"),
    ethers.BigNumber.from("1608796800"),
    true,
  ];

  const newOtokenAddress = "0x97bB0FCdFedE034E77ae3CF348f1C7653Ee3B94E";

  before(async () => {
    vaultsManager = await VaultsManager.deployed();

    const deployerWithUSDCAddr = "0x019460841193Ba8A74D32228AF33cba52e68Dfb4";

    const USDC = new web3.eth.Contract(
      ERC20.abi,
      validCollateral[Collateral.USDC]
    );

    // Send USDC to the first test account
    await USDC.methods
      .transfer(accounts[0], (parseInt(aHundredUSDC) * 1.5).toString())
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
        collateral: validCollateral[Collateral.USDC],
        vaultId: "1",
        amount: aHundredUSDC,
      });
    });
  });

  describe("testing the depositCollateral function", async () => {
    it("should deposit the given amount of collateral", async () => {
      const txReceipt = await vaultsManager.depositCollateral(
        Collateral.USDC,
        "1",
        (parseInt(aHundredUSDC) / 2).toString()
      );
      expectEvent(txReceipt, "CollateralDeposited", {
        accountOwner: accounts[0],
        collateral: validCollateral[Collateral.USDC],
        vaultId: "1",
        amount: (parseInt(aHundredUSDC) / 2).toString(),
      });
    });
  });

  describe("testing the withdrawCollateral function", async () => {
    it("should withdraw the requested amount of collateral", async () => {
      const txReceipt = await vaultsManager.withdrawCollateral(
        Collateral.USDC,
        "1",
        (parseInt(aHundredUSDC) / 2).toString()
      );
      expectEvent(txReceipt, "CollateralWithdrawn", {
        accountOwner: accounts[0],
        collateral: validCollateral[Collateral.USDC],
        vaultId: "1",
        amount: (parseInt(aHundredUSDC) / 2).toString(),
      });
    });
  });

  describe("testing the createOtoken function", async () => {
    it("should revert when trying to create an existing oToken", async () => {
      const alreadyCreatedOtoken = [
        validCollateral[Collateral.WETH],
        validCollateral[Collateral.USDC],
        Collateral.USDC,
        ethers.BigNumber.from("25000000000"),
        ethers.BigNumber.from("1606809600"),
        true,
      ];
      await expectRevert(
        vaultsManager.createOtoken(...alreadyCreatedOtoken),
        "VaultsManager: A token has already been created with these parameters"
      );
    });

    it("should create new oToken", async () => {
      const txReceipt = await vaultsManager.createOtoken(...newOtoken);
      expectEvent(txReceipt, "NewOtokenCreated", {
        newOtokenAddress: newOtokenAddress,
      });
    });
  });

  describe("testing the mintOtokensFromVault function", async () => {
    it("should mint otokens from a given vault", async () => {
      const txReceipt = await vaultsManager.mintOtokensFromVault(
        "1",
        newOtokenAddress,
        ethers.BigNumber.from(100)
      );
      expectEvent(txReceipt, "OtokensMinted", {
        otoken: newOtokenAddress,
        amount: "100",
        vaultId: "1",
        receiver: vaultsManager.address,
      });
    });
  });
});
