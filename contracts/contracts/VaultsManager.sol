// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

pragma experimental ABIEncoderV2;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeMath} from "@openzeppelin/contracts/math/SafeMath.sol";

import "./OpynV2Helpers.sol";
import {IController, Actions} from "./interfaces/IController.sol";

contract VaultsManager is OpynV2Helpers {
    using SafeMath for uint256;

    address[3] public validCollateral;
    IController public controller;
    mapping(address => mapping(uint256 => uint256))[3]
        public ownerVaultIdBalance;

    enum Collateral {USDC, cUSDC, WETH}

    event CollateralizedVaultOpened(
        address accountOwner,
        address collateral,
        uint256 vaultId,
        uint256 amount
    );

    event CollateralDeposited(
        address accountOwner,
        address collateral,
        uint256 vaultId,
        uint256 amount
    );

    event CollateralWithdrawn(
        address accountOwner,
        address collateral,
        uint256 vaultId,
        uint256 amount
    );

    constructor(address _OpynV2AddressBook, address[3] memory _validCollateral)
        OpynV2Helpers(_OpynV2AddressBook)
    {
        validCollateral = _validCollateral;
        controller = IController(OpynV2AddressBook.getController());

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

    function _transferCollateral(Collateral _assetToTransfer, uint256 _amount)
        internal
    {
        IERC20 collateral = IERC20(validCollateral[uint256(_assetToTransfer)]);

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
    }

    function openCollateralizedVault(
        Collateral _assetToDeposit,
        uint256 _amount
    ) public {
        require(
            !controller.systemFullyPaused(),
            "VaultsManager: The Opyn V2 system is currently fully paused"
        );

        uint256 newVaultId = controller.getAccountVaultCounter(address(this)) +
            1;

        _transferCollateral(_assetToDeposit, _amount);

        ownerVaultIdBalance[uint256(_assetToDeposit)][msg
            .sender][newVaultId] = _amount;
        emit CollateralizedVaultOpened(
            msg.sender,
            validCollateral[uint256(_assetToDeposit)],
            newVaultId,
            _amount
        );

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

    function depositCollateral(
        Collateral _collateralToDeposit,
        uint256 _vaultId,
        uint256 _amount
    ) public {
        _transferCollateral(_collateralToDeposit, _amount);

        ownerVaultIdBalance[uint256(_collateralToDeposit)][msg
            .sender][_vaultId] = ownerVaultIdBalance[uint256(
            _collateralToDeposit
        )][msg.sender][_vaultId]
            .add(_amount);

        emit CollateralDeposited(
            msg.sender,
            validCollateral[uint256(_collateralToDeposit)],
            _vaultId,
            _amount
        );

        Actions.ActionArgs[] memory actions = new Actions.ActionArgs[](1);

        actions[0] = Actions.ActionArgs({
            actionType: Actions.ActionType.DepositCollateral,
            owner: address(this),
            secondAddress: address(this),
            asset: validCollateral[uint256(_collateralToDeposit)],
            vaultId: _vaultId,
            amount: _amount,
            index: 0,
            data: "0x0000000000000000000000000000000000000000"
        });

        controller.operate(actions);
    }

    function withdrawCollateral(
        Collateral _collateralToWithdraw,
        uint256 _vaultId,
        uint256 _amount
    ) public {
        ownerVaultIdBalance[uint256(_collateralToWithdraw)][msg
            .sender][_vaultId] = ownerVaultIdBalance[uint256(
            _collateralToWithdraw
        )][msg.sender][_vaultId]
            .sub(_amount);

        emit CollateralWithdrawn(
            msg.sender,
            validCollateral[uint256(_collateralToWithdraw)],
            _vaultId,
            _amount
        );

        Actions.ActionArgs[] memory actions = new Actions.ActionArgs[](1);

        actions[0] = Actions.ActionArgs({
            actionType: Actions.ActionType.WithdrawCollateral,
            owner: address(this),
            secondAddress: msg.sender,
            asset: validCollateral[uint256(_collateralToWithdraw)],
            vaultId: _vaultId,
            amount: _amount,
            index: 0,
            data: "0x0000000000000000000000000000000000000000"
        });

        controller.operate(actions);
    }
}
