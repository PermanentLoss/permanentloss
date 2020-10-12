// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "./interfaces/IAddressBook.sol";
import "./interfaces/IOwnedUpgradeabilityProxy.sol";

/// @title Opyn v2 helper functions
/// @author The PermanentLoss contributors
/// @notice Helper functions to easily interact with the Opyn v2 margin protocol
contract OpynV2Helpers {
    /// @notice Provides addresses for all modules in Opyn v2
    IAddressBook public immutable OpynV2AddressBook;

    /// @notice Create a new contract that provides the Opyn v2 helper functions
    /// @param _OpynV2AddressBook The address of the AddressBook contract
    /// on the current network
    constructor(address _OpynV2AddressBook) {
        OpynV2AddressBook = IAddressBook(_OpynV2AddressBook);
    }

    /// @notice Get the address of the contract that controls the Gamma Protocol
    /// (Opyn v2) and the interaction of all sub contracts in the current network
    /// @dev Opyn v2 uses proxies to deploy upgradable contracts and this is why
    /// we can not return OpynV2AddressBook.getController() directly
    /// @return Address of the current Controller implementation contract
    function getOpynV2Controller() public view returns (address) {
        IOwnedUpgradeabilityProxy _ControllerProxy = IOwnedUpgradeabilityProxy(
            payable(OpynV2AddressBook.getController())
        );

        return _ControllerProxy.implementation();
    }
}
