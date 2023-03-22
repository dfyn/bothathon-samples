// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity >=0.8.0;
import "./IConcentratedLiquidityPool.sol";

interface ILimitOrderStruct {
    struct ConcStruct {
        uint256 currentPrice;
        uint256 amountIn;
        uint256 amountOut;
        bool exactIn;
        uint256 currentLiquidity;
    }
    struct CreateLimitOrderParams {
        int24 tick;
        int24 lowerOld;
        int24 upperOld;
        bool zeroForOne;
        uint256 amountIn;
        uint160 price;
        int24 nearestTick;
        uint256 tickCount;
    }

    struct ExecuteLimitOrderParams {
        int24 tick;
        bool cross;
        bool exactIn;
        bool zeroForOne;
        uint256 sqrtpriceX96;
        uint256 amountIn;
        uint256 amountOut;
        uint256 limitOrderAmountOut;
        uint256 limitOrderAmountIn;
        uint256 limitOrderFee;
        uint256 token0LimitOrderFee;
        uint256 token1LimitOrderFee;
    }

    enum LimitOrderStatus {
        closed,
        active
    }

    struct LimitOrder {
        IConcentratedLiquidityPool pool;
        int24 tick;
        LimitOrderStatus status;
        bool zeroForOne;
        uint128 amountIn;
        uint128 amountOut;
        uint128 chargeAmount;
        uint128 rebateAmount;
        // uint128 forwarderRebateAmount;
        uint256 id;
        uint256 sqrtpriceX96;
        uint256 claimedAmount;
        uint256 claimableGrowth0;
        uint256 claimableGrowth1;

        // address forwarder;
    }
}

interface ILimitOrder {
    function limitOrderTicks(int24 _tick) external view returns (IConcentratedLiquidityPoolStruct.LimitOrderTickData memory);

    function updateLimitOrderFee(uint24 _barFee) external;

    function createLimitOrder(
        int24 tick,
        int24 lowerOld,
        int24 upperOld,
        uint256 amountIn,
        bool native,
        bool zeroForOne
    ) external;

    function claimLimitOrder(int24 tick, bool zeroForOne) external;

    function cancelLimitOrder(
        uint256 amount,
        int24 tick,
        bool zeroForOne
    ) external;
}
