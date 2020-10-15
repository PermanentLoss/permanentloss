// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "./OpynV2Helpers.sol";

import {Actions} from "./libs/Actions.sol";

contract VaultsManager is OpynV2Helpers {
    address[3] public validCollateral;
    mapping(address => uint256) public ownedVaults;

    enum Collateral {USDC, cUSDC, WETH}

    constructor(address _OpynV2AddressBook, address[3] memory _validCollateral)
        OpynV2Helpers(_OpynV2AddressBook)
    {
        validCollateral = _validCollateral;
    }

    function createCollateralizedVault(
        Collateral _assetToDeposit,
        uint256 _amount
    ) public {}
}
