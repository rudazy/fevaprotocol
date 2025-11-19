// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IDEXRouter
 * @dev Interface for FEVA DEX Router - handles swaps and liquidity operations
 */
interface IDEXRouter {
    // View functions
    function factory() external view returns (address);
    function FEV() external view returns (address);

    // Liquidity functions
    function addLiquidity(
        address token,
        uint256 amountTokenDesired,
        uint256 amountFEVDesired,
        uint256 amountTokenMin,
        uint256 amountFEVMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountToken, uint256 amountFEV, uint256 liquidity);

    function removeLiquidity(
        address token,
        uint256 liquidity,
        uint256 amountTokenMin,
        uint256 amountFEVMin,
        address to,
        uint256 deadline
    ) external returns (uint256 amountToken, uint256 amountFEV);

    // Swap functions
    function swapExactTokensForFEV(
        uint256 amountIn,
        uint256 amountOutMin,
        address token,
        address to,
        uint256 deadline
    ) external returns (uint256 amountOut);

    function swapExactFEVForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address token,
        address to,
        uint256 deadline
    ) external returns (uint256 amountOut);

    function swapTokensForExactFEV(
        uint256 amountOut,
        uint256 amountInMax,
        address token,
        address to,
        uint256 deadline
    ) external returns (uint256 amountIn);

    function swapFEVForExactTokens(
        uint256 amountOut,
        uint256 amountInMax,
        address token,
        address to,
        uint256 deadline
    ) external returns (uint256 amountIn);

    // Quote functions
    function quote(uint256 amountA, uint256 reserveA, uint256 reserveB) external pure returns (uint256 amountB);
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) external pure returns (uint256 amountOut);
    function getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut) external pure returns (uint256 amountIn);
}
