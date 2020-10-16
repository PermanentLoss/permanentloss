// SPDX-License-Identifier: MIT
// !! THIS FILE WAS AUTOGENERATED BY abi-to-sol. SEE BELOW FOR SOURCE. !!
pragma solidity ^0.7.0;
pragma experimental ABIEncoderV2;

interface IOwnedUpgradeabilityProxy {
    event ProxyOwnershipTransferred(address previousOwner, address newOwner);
    event Upgraded(address indexed implementation);

    fallback() external payable;

    receive() external payable;

    function implementation() external view returns (address impl);

    function proxyOwner() external view returns (address owner);

    function transferProxyOwnership(address _newOwner) external;

    function upgradeTo(address _implementation) external;

    function upgradeToAndCall(address _implementation, bytes memory _data)
        external
        payable;
}
