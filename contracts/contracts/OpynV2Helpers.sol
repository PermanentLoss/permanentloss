// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "./interfaces/IAddressBook.sol";

/// @title Opyn v2 helper functions
/// @author The PermanentLoss contributors
/// @notice Helper functions to easily interact with the Opyn v2 margin protocol
contract OpynV2Helpers {
    /// @notice Provides addresses for all modules in Opyn v2
    IAddressBook public OpynV2AddressBook;

    /// @notice Create a new contract that provides the Opyn v2 helper functions
    /// @param _OpynV2AddressBook The address of the AddressBook contract
    /// on the current network
    constructor(address _OpynV2AddressBook) {
        OpynV2AddressBook = IAddressBook(_OpynV2AddressBook);
    }
}
