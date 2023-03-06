// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity >=0.8.0;

/// @notice Dfyn pool callback interface.
interface IDfynCallee {
    function DfynSwapCallback(bytes calldata data) external;

    function DfynMintCallback(bytes calldata data) external;
}
