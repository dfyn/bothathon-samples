// SPDX-License-Identifier: GPL-3.0-or-later

pragma solidity >=0.8.0;

import "./IVaultMinimal.sol";
import "./IMasterDeployer.sol";

// import "./ILimitOrder.sol";

/// @notice Dfyn's concentrated liquidity pool contract Structs.
interface IConcentratedLiquidityPoolStruct {
    struct Tick {
        int24 previousTick;
        int24 nextTick;
        uint128 liquidity;
        uint256 feeGrowthOutside0; // Per unit of liquidity.
        uint256 feeGrowthOutside1;
        uint160 secondsGrowthOutside;
    }
    struct InsertTickParams {
        uint128 amount;
        int24 nearestTick;
        uint160 currentPrice;
        uint256 tickCount;
        int24 tickAtPrice;
    }
    struct Position {
        uint128 liquidity;
        uint256 feeGrowthInside0Last;
        uint256 feeGrowthInside1Last;
    }
    struct MintParams {
        int24 lowerOld;
        int24 lower;
        int24 upperOld;
        int24 upper;
        uint128 amount0Desired;
        uint128 amount1Desired;
        bool native;
    }

    struct SwapCache {
        bool exactIn;
        int24 nextTickToCross;
        uint256 protocolFee;
        uint256 feeGrowthGlobalA;
        uint256 feeGrowthGlobalB;
        uint256 currentPrice;
        uint256 nearestPriceCached;
        uint256 currentLiquidity;
        uint256 limitOrderAmountOut;
        uint256 limitOrderAmountIn;
        uint256 limitOrderReserve;
        uint256 amountIn;
        uint256 amountOut;
        uint256 totalAmount;
        uint256 limitOrderFeeGrowth;
        uint256 token0LimitOrderFee;
        uint256 token1LimitOrderFee;
    }

    struct SwapCacheLocal {
        bool cross;
        uint256 nextTickPrice;
        uint256 fee;
        uint256 amountIn;
        uint256 amountOut;
    }
    struct SwapExecuteCache {
        uint256 fee;
        uint256 amountIn;
        uint256 max;
        uint256 newPrice;
    }

    struct LimitOrderTickData {
        uint256 token0Liquidity;
        uint256 token1Liquidity;
        uint256 token0Claimable;
        uint256 token1Claimable;
        uint256 token0ClaimableGrowth;
        uint256 token1ClaimableGrowth;
        bool isActive;
    }
}

/// @notice Dfyn's Concentrated Liquidity Pool interface.
interface IConcentratedLiquidityPool is IConcentratedLiquidityPoolStruct {
    function ticks(int24 _tick) external view returns (Tick memory);

    function initialize(
        bytes memory _deployData,
        address _masterDeployer,
        address _limitOrderManager,
        uint160 _price
    ) external;

    function positions(
        address owner,
        int24 lower,
        int24 upper
    ) external view returns (Position memory);

    function feeGrowthGlobal0() external view returns (uint256);

    function feeGrowthGlobal1() external view returns (uint256);

    function rangeFeeGrowth(int24 lowerTick, int24 upperTick) external view returns (uint256 feeGrowthInside0, uint256 feeGrowthInside1);

    function setPrice(uint160 price) external;

    function setLimitOrderCharge(bool _isRebate, uint24 _rate) external;

    function updateSwapFee(uint24 _swapFee) external;

    function updateProtocolFee() external;

    function limitOrderFee() external returns (uint256);

    function limitOrderCharge() external returns (uint24);

    function rebateRate() external returns (uint24);

    function collect(int24 lower, int24 upper) external returns (uint256 amount0fees, uint256 amount1fees);

    function mint(MintParams memory data) external returns (uint256 liquidityMinted);

    function burn(
        int24 lower,
        int24 upper,
        uint128 amount
    )
        external
        returns (
            uint256 token0Amount,
            uint256 token1Amount,
            uint256 token0Fees,
            uint256 token1Fees
        );

    function getImmutables()
        external
        view
        returns (
            uint128 _MAX_TICK_LIQUIDITY,
            uint24 _tickSpacing,
            uint24 _swapFee,
            address _barFeeTo,
            IVaultMinimal _vault,
            IMasterDeployer _masterDeployer,
            address _token0,
            address _token1
        );

    function getPriceAndNearestTicks() external view returns (uint160 _price, int24 _nearestTick);

    function getTokenProtocolFees() external view returns (uint128 _token0ProtocolFee, uint128 _token1ProtocolFee);

    function getReserves() external view returns (uint128 _reserve0, uint128 _reserve1);

    function getAssets() external view returns (address[] memory tokens);

    function getSecondsGrowthAndLastObservation() external view returns (uint160 _secondGrowthGlobal, uint32 _lastObservation);

    function limitOrderTicks(int24 _tick) external view returns (LimitOrderTickData memory);

    // function updateLimitOrderFee(uint24 _barFee) external;
    function updateLimitOrderFee(
        uint128 _amount,
        bool _isToken0,
        bool _isIncrement
    ) external;

    function createLimitOrder(
        int24 tick,
        int24 lowerOld,
        int24 upperOld,
        uint256 amountIn,
        bool native,
        bool zeroForOne,
        uint128 rebate
    ) external;

    function claimLimitOrder(
        uint256 amount,
        int24 tick,
        bool zeroForOne,
        uint128 fee,
        uint128 rebate
    ) external;

    function cancelLimitOrder(
        uint256 amount,
        int24 tick,
        bool zeroForOne,
        uint128 rebate
    ) external;

    function initialize(
        bytes memory _deployData,
        address _masterDeployer,
        address _limitOrderManager
    ) external;
}
