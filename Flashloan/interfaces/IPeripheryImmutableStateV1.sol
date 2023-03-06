// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity >=0.8.0;

/// @title Immutable state
/// @notice Functions that return immutable state of the router
interface IPeripheryImmutableStateV1 {
    /// @return Returns the address of the Uniswap V3 factory
    function dfynV2Factory() external view returns (address);

    /// @return Returns the address of WETH9
    function WETH9() external view returns (address);
}
