// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "./interfaces/IAddressBook.sol";
import "./interfaces/IOwnedUpgradeabilityProxy.sol";

contract OpynV2Helpers {
    IAddressBook public immutable OpynV2AddressBook;

    constructor(address _OpynV2AddressBook) {
        OpynV2AddressBook = IAddressBook(_OpynV2AddressBook);
    }

    function getOpynV2Controller() public view returns (address) {
        IOwnedUpgradeabilityProxy _ControllerProxy = IOwnedUpgradeabilityProxy(
            payable(OpynV2AddressBook.getController())
        );

        return _ControllerProxy.implementation();
    }
}
