// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity >=0.8.0;

/// @notice Dfyn NFT interface.
interface IDfynNFT {
    function ownerOf(uint256) external view returns (address);
}
