const OpynV2Helpers = artifacts.require("OpynV2Helpers");
const {expect} = require("chai");

contract("OpynV2Helpers", (accounts) => {
  let opynV2Helpers;

  before(async () => {
    opynV2Helpers = await OpynV2Helpers.deployed();
  });

  describe("testing the getOpynV2Controller function", async () => {
    it("should return the address found on the documentation", async () => {
      const opynV2ControllerAddress =
        "0x5faCA6DF39c897802d752DfCb8c02Ea6959245Fc";
      expect(await opynV2Helpers.getOpynV2Controller()).equal(
        opynV2ControllerAddress
      );
    });
  });
});
