// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./OpynV2Helpers.sol";
import {IController, Actions} from "./interfaces/IController.sol";

contract VaultsManager is OpynV2Helpers {
    address[3] public validCollateral;

    event NewBalance(uint256 newBalance);

    enum Collateral {USDC, cUSDC, WETH}

    constructor(address _OpynV2AddressBook, address[3] memory _validCollateral)
        OpynV2Helpers(_OpynV2AddressBook)
    {
        validCollateral = _validCollateral;
    }

    function createCollateralizedVault(
        Collateral _assetToDeposit,
        uint256 _amount
    ) public returns (uint256) {
        IController controller = IController(getOpynV2Controller());

        require(
            !controller.systemFullyPaused(),
            "VaultsManager: The Opyn V2 system is currently fully paused"
        );

        uint256 newVaultId = controller.getAccountVaultCounter(msg.sender) + 1;

        IERC20 collateral = IERC20(validCollateral[uint256(_assetToDeposit)]);

        require(
            collateral.balanceOf(msg.sender) >= _amount,
            "VaultsManager: Insufficient collateral balance"
        );
        require(
            collateral.allowance(msg.sender, address(this)) >= _amount,
            "VaultsManager: Needs to call approve first"
        );

        bool transferSuccess = collateral.transferFrom(
            msg.sender,
            address(this),
            _amount
        );
        require(
            transferSuccess,
            "VaultsManager: Failed transfering collateral"
        );

        emit NewBalance(collateral.balanceOf(address(this)));

        return collateral.balanceOf(address(this));
    }
}
