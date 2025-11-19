// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./interfaces/IDEXRouter.sol";
import "./interfaces/IDEXFactory.sol";
import "./interfaces/IDEXPair.sol";

/**
 * @title DEXRouter
 * @dev Router contract for token swaps and liquidity operations
 * All pairs are TOKEN/$FEV (not ETH pairs)
 */
contract DEXRouter is IDEXRouter {
    using SafeERC20 for IERC20;

    address public immutable factory;
    address public immutable FEV;

    error Expired();
    error InsufficientAAmount();
    error InsufficientBAmount();
    error InsufficientOutputAmount();
    error InsufficientInputAmount();
    error ExcessiveInputAmount();

    modifier ensure(uint256 deadline) {
        if (block.timestamp > deadline) revert Expired();
        _;
    }

    constructor(address _factory, address _FEV) {
        factory = _factory;
        FEV = _FEV;
    }

    /**
     * @dev Adds liquidity to a TOKEN/$FEV pair
     */
    function addLiquidity(
        address token,
        uint256 amountTokenDesired,
        uint256 amountFEVDesired,
        uint256 amountTokenMin,
        uint256 amountFEVMin,
        address to,
        uint256 deadline
    ) external ensure(deadline) returns (uint256 amountToken, uint256 amountFEV, uint256 liquidity) {
        (amountToken, amountFEV) = _addLiquidity(
            token,
            FEV,
            amountTokenDesired,
            amountFEVDesired,
            amountTokenMin,
            amountFEVMin
        );

        address pair = _pairFor(token, FEV);

        IERC20(token).safeTransferFrom(msg.sender, pair, amountToken);
        IERC20(FEV).safeTransferFrom(msg.sender, pair, amountFEV);

        liquidity = IDEXPair(pair).mint(to);
    }

    /**
     * @dev Removes liquidity from a TOKEN/$FEV pair
     */
    function removeLiquidity(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountFEVMin,
        address to,
        uint256 deadline
    ) external ensure(deadline) returns (uint256 amountToken, uint256 amountFEV) {
        address pair = _pairFor(token, FEV);

        IERC20(pair).safeTransferFrom(msg.sender, pair, liquidity);
        (uint256 amount0, uint256 amount1) = IDEXPair(pair).burn(to);

        (address token0,) = _sortTokens(token, FEV);
        (amountToken, amountFEV) = token == token0 ? (amount0, amount1) : (amount1, amount0);

        if (amountToken < amountTokenMin) revert InsufficientAAmount();
        if (amountFEV < amountFEVMin) revert InsufficientBAmount();
    }

    /**
     * @dev Swaps exact tokens for FEV
     */
    function swapExactTokensForFEV(
        uint256 amountIn,
        uint256 amountOutMin,
        address token,
        address to,
        uint256 deadline
    ) external ensure(deadline) returns (uint256 amountOut) {
        address pair = _pairFor(token, FEV);
        (uint256 reserveToken, uint256 reserveFEV) = _getReserves(token, FEV);

        amountOut = getAmountOut(amountIn, reserveToken, reserveFEV);
        if (amountOut < amountOutMin) revert InsufficientOutputAmount();

        IERC20(token).safeTransferFrom(msg.sender, pair, amountIn);

        (address token0,) = _sortTokens(token, FEV);
        (uint256 amount0Out, uint256 amount1Out) = token == token0 ? (uint256(0), amountOut) : (amountOut, uint256(0));

        IDEXPair(pair).swap(amount0Out, amount1Out, to, "");
    }

    /**
     * @dev Swaps exact FEV for tokens
     */
    function swapExactFEVForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address token,
        address to,
        uint256 deadline
    ) external ensure(deadline) returns (uint256 amountOut) {
        address pair = _pairFor(token, FEV);
        (uint256 reserveToken, uint256 reserveFEV) = _getReserves(token, FEV);

        amountOut = getAmountOut(amountIn, reserveFEV, reserveToken);
        if (amountOut < amountOutMin) revert InsufficientOutputAmount();

        IERC20(FEV).safeTransferFrom(msg.sender, pair, amountIn);

        (address token0,) = _sortTokens(token, FEV);
        (uint256 amount0Out, uint256 amount1Out) = token == token0 ? (amountOut, uint256(0)) : (uint256(0), amountOut);

        IDEXPair(pair).swap(amount0Out, amount1Out, to, "");
    }

    /**
     * @dev Swaps tokens for exact FEV
     */
    function swapTokensForExactFEV(
        uint256 amountOut,
        uint256 amountInMax,
        address token,
        address to,
        uint256 deadline
    ) external ensure(deadline) returns (uint256 amountIn) {
        address pair = _pairFor(token, FEV);
        (uint256 reserveToken, uint256 reserveFEV) = _getReserves(token, FEV);

        amountIn = getAmountIn(amountOut, reserveToken, reserveFEV);
        if (amountIn > amountInMax) revert ExcessiveInputAmount();

        IERC20(token).safeTransferFrom(msg.sender, pair, amountIn);

        (address token0,) = _sortTokens(token, FEV);
        (uint256 amount0Out, uint256 amount1Out) = token == token0 ? (uint256(0), amountOut) : (amountOut, uint256(0));

        IDEXPair(pair).swap(amount0Out, amount1Out, to, "");
    }

    /**
     * @dev Swaps FEV for exact tokens
     */
    function swapFEVForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address token,
        address to,
        uint256 deadline
    ) external ensure(deadline) returns (uint256 amountIn) {
        address pair = _pairFor(token, FEV);
        (uint256 reserveToken, uint256 reserveFEV) = _getReserves(token, FEV);

        amountIn = getAmountIn(amountOut, reserveFEV, reserveToken);
        if (amountIn > amountInMax) revert ExcessiveInputAmount();

        IERC20(FEV).safeTransferFrom(msg.sender, pair, amountIn);

        (address token0,) = _sortTokens(token, FEV);
        (uint256 amount0Out, uint256 amount1Out) = token == token0 ? (amountOut, uint256(0)) : (uint256(0), amountOut);

        IDEXPair(pair).swap(amount0Out, amount1Out, to, "");
    }

    // Quote functions
    function quote(uint256 amountA, uint256 reserveA, uint256 reserveB) public pure returns (uint256 amountB) {
        if (amountA == 0) revert InsufficientInputAmount();
        if (reserveA == 0 || reserveB == 0) revert InsufficientInputAmount();
        amountB = (amountA * reserveB) / reserveA;
    }

    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256 amountOut) {
        if (amountIn == 0) revert InsufficientInputAmount();
        if (reserveIn == 0 || reserveOut == 0) revert InsufficientInputAmount();

        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;
        amountOut = numerator / denominator;
    }

    function getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut) public pure returns (uint256 amountIn) {
        if (amountOut == 0) revert InsufficientOutputAmount();
        if (reserveIn == 0 || reserveOut == 0) revert InsufficientInputAmount();

        uint256 numerator = reserveIn * amountOut * 1000;
        uint256 denominator = (reserveOut - amountOut) * 997;
        amountIn = (numerator / denominator) + 1;
    }

    // Internal functions
    function _addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin
    ) internal returns (uint256 amountA, uint256 amountB) {
        if (IDEXFactory(factory).getPair(tokenA, tokenB) == address(0)) {
            IDEXFactory(factory).createPair(tokenA, tokenB);
        }

        (uint256 reserveA, uint256 reserveB) = _getReserves(tokenA, tokenB);

        if (reserveA == 0 && reserveB == 0) {
            (amountA, amountB) = (amountADesired, amountBDesired);
        } else {
            uint256 amountBOptimal = quote(amountADesired, reserveA, reserveB);
            if (amountBOptimal <= amountBDesired) {
                if (amountBOptimal < amountBMin) revert InsufficientBAmount();
                (amountA, amountB) = (amountADesired, amountBOptimal);
            } else {
                uint256 amountAOptimal = quote(amountBDesired, reserveB, reserveA);
                assert(amountAOptimal <= amountADesired);
                if (amountAOptimal < amountAMin) revert InsufficientAAmount();
                (amountA, amountB) = (amountAOptimal, amountBDesired);
            }
        }
    }

    function _sortTokens(address tokenA, address tokenB) internal pure returns (address token0, address token1) {
        (token0, token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
    }

    function _pairFor(address tokenA, address tokenB) internal view returns (address pair) {
        pair = IDEXFactory(factory).getPair(tokenA, tokenB);
    }

    function _getReserves(address tokenA, address tokenB) internal view returns (uint256 reserveA, uint256 reserveB) {
        (address token0,) = _sortTokens(tokenA, tokenB);
        address pair = _pairFor(tokenA, tokenB);
        (uint256 reserve0, uint256 reserve1,) = IDEXPair(pair).getReserves();
        (reserveA, reserveB) = tokenA == token0 ? (reserve0, reserve1) : (reserve1, reserve0);
    }
}
