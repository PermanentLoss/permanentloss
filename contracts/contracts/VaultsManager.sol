// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

pragma experimental ABIEncoderV2;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./OpynV2Helpers.sol";
import {IController, Actions} from "./interfaces/IController.sol";

contract VaultsManager is OpynV2Helpers {
    address[3] public validCollateral;
    mapping(address => mapping(uint256 => uint256)) public ownerVaultIdBalance;

    enum Collateral {USDC, cUSDC, WETH}

    event CollateralizedVaultOpened(
        address accountOwner,
        uint256 vaultId,
        uint256 amountDeposited
    );

    constructor(address _OpynV2AddressBook, address[3] memory _validCollateral)
        OpynV2Helpers(_OpynV2AddressBook)
    {
        validCollateral = _validCollateral;

        address MarginPool = OpynV2AddressBook.getMarginPool();
        IERC20 collateral;
        bool firstApproveSuccess;
        bool secondApproveSuccess;

        for (uint8 i = 0; i < validCollateral.length; i++) {
            collateral = IERC20(validCollateral[i]);

            firstApproveSuccess = collateral.approve(MarginPool, 0);
            require(
                firstApproveSuccess,
                "VaultsManager: Failed setting collateral approve to 0"
            );

            secondApproveSuccess = collateral.approve(
                MarginPool,
                type(uint256).max
            );
            require(
                secondApproveSuccess,
                "VaultsManager: Failed setting collateral approve to maximum uint256"
            );
        }
    }

    function openCollateralizedVault(
        Collateral _assetToDeposit,
        uint256 _amount
    ) public {
        IController controller = IController(OpynV2AddressBook.getController());

        require(
            !controller.systemFullyPaused(),
            "VaultsManager: The Opyn V2 system is currently fully paused"
        );

        uint256 newVaultId = controller.getAccountVaultCounter(address(this)) +
            1;

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

        ownerVaultIdBalance[msg.sender][newVaultId] = _amount;
        emit CollateralizedVaultOpened(msg.sender, newVaultId, _amount);

        Actions.ActionArgs[] memory actions = new Actions.ActionArgs[](2);

        actions[0] = Actions.ActionArgs({
            actionType: Actions.ActionType.OpenVault,
            owner: address(this),
            secondAddress: address(0),
            asset: address(0),
            vaultId: newVaultId,
            amount: 0,
            index: 0,
            data: "0x0000000000000000000000000000000000000000"
        });

        actions[1] = Actions.ActionArgs({
            actionType: Actions.ActionType.DepositCollateral,
            owner: address(this),
            secondAddress: address(this),
            asset: validCollateral[uint256(_assetToDeposit)],
            vaultId: newVaultId,
            amount: _amount,
            index: 0,
            data: "0x0000000000000000000000000000000000000000"
        });

        controller.operate(actions);
    }
}
