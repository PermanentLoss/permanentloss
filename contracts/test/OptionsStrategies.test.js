const OptionsStrategies = artifacts.require("OptionsStrategies");
const {expect} = require("chai");

contract("OptionsStrategies", () => {
  let optionsStrategies;

  before(async () => {
    optionsStrategies = await OptionsStrategies.deployed();
  });

  describe("testing the getOpynV2Controller function", async () => {
    it("should return the address found on the documentation", async () => {
      const opynV2ControllerAddress =
        "0x5faCA6DF39c897802d752DfCb8c02Ea6959245Fc";
      expect(await optionsStrategies.getOpynV2Controller()).equal(
        opynV2ControllerAddress
      );
    });
  });
});
