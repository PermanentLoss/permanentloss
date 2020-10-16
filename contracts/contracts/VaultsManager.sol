// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

pragma experimental ABIEncoderV2;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./OpynV2Helpers.sol";
import {IController, Actions} from "./interfaces/IController.sol";

contract VaultsManager is OpynV2Helpers {
    address[3] public validCollateral;

    enum Collateral {USDC, cUSDC, WETH}

    event CreatedVault(address owner);

    constructor(address _OpynV2AddressBook, address[3] memory _validCollateral)
        OpynV2Helpers(_OpynV2AddressBook)
    {
        validCollateral = _validCollateral;
    }

    function createCollateralizedVault(
        Collateral _assetToDeposit,
        uint256 _amount
    ) public {
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

        Actions.ActionArgs[] memory actions;

        actions[0] = Actions.ActionArgs({
            actionType: Actions.ActionType.OpenVault,
            owner: msg.sender,
            secondAddress: address(0),
            asset: address(0),
            vaultId: newVaultId,
            amount: 0,
            index: 0,
            data: "0x0000000000000000000000000000000000000000"
        });

        actions[1] = Actions.ActionArgs({
            actionType: Actions.ActionType.DepositCollateral,
            owner: msg.sender,
            secondAddress: msg.sender,
            asset: validCollateral[uint256(_assetToDeposit)],
            vaultId: newVaultId,
            amount: _amount,
            index: 0,
            data: "0x0000000000000000000000000000000000000000"
        });

        controller.operate(actions);

        emit CreatedVault(msg.sender);
    }
}
