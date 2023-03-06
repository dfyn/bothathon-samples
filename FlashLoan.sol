// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity >=0.8.0;
import "@boringcrypto/boring-solidity/contracts/libraries/BoringERC20.sol";
import "././interfaces/IFlashLoan.sol";
import "././interfaces/IVaultMinimal.sol";

// A sample flashloan contract template for dfyn v2

contract FlashLoan is IFlashBorrower {
    using BoringERC20 for IERC20;
    address public vault;
    event Loan(address borrower, address token,uint amount,uint fee);

    constructor(address _vault) {
        vault = _vault;
    }

    function onFlashLoan(
        address sender,
        IERC20 token,
        uint256 amount,
        uint256 fee,
        bytes calldata data
    ) external {
        uint256 profit;
        // (data1,data2)=abi.decode(data)
        //Do whatever logic & update profit

        uint256 amountToReturn = amount + fee;
        token.safeTransfer(vault, amountToReturn);
        token.safeTransfer(sender, profit);
        emit Loan(sender,address(token),amount,fee);
    }
}
