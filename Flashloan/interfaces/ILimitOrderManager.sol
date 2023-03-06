// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity >=0.8.0;

import "./IConcentratedLiquidityPool.sol";

/// @notice Dfyn concentrated liquidity pool manager contract Structs.
interface ILimitOrderManager {
    function limitOrderCallback(
        address token,
        uint256 amount,
        bool native
    ) external;
}
