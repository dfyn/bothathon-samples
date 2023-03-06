// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity >=0.8.0;

/// @notice Dfyn pool deployment interface.
interface IPoolDeployer {
    function factory() external view returns (address);

    function poolInitCode() external view returns (bytes32);
}
