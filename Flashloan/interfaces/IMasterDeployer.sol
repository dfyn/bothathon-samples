// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity >=0.8.0;

/// @notice Dfyn pool deployer interface.
interface IMasterDeployer {
    function dfynFee() external view returns (uint256);

    function limitOrderFee() external view returns (uint256);

    function dfynFeeTo() external view returns (address);

    function vault() external view returns (address);

    function migrator() external view returns (address);

    function pools(address pool) external view returns (bool);

    function deployPool(address factory, bytes calldata deployData) external returns (address);

    function protocolFee() external view returns (uint256, uint256);
}
