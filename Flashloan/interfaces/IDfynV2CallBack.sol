// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity >=0.8.0;

interface IDfynV2CallBack {
    function swapCallBack(
        address,
        address,
        address,
        uint256
    ) external view;
}
