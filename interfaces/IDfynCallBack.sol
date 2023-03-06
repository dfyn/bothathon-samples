// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity >=0.8.0;

interface IDfynCallBack {
    function swapCallBack(
        bool isExactInput,
        bool unWrapVault,
        uint256 amountIn,
        uint256 amountOut,
        bytes calldata data
    ) external;
}
