// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DEXPair.sol";
import "./interfaces/IDEXFactory.sol";

/**
 * @title DEXFactory
 * @dev Factory contract for creating TOKEN/$FEV trading pairs
 * Manages pair creation and protocol fee settings
 */
contract DEXFactory is IDEXFactory {
    address public feeTo;
    address public feeToSetter;

    mapping(address => mapping(address => address)) public getPair;
    address[] public allPairs;

    error IdenticalAddresses();
    error ZeroAddress();
    error PairExists();
    error Forbidden();

    constructor(address _feeToSetter) {
        feeToSetter = _feeToSetter;
    }

    function allPairsLength() external view returns (uint256) {
        return allPairs.length;
    }

    /**
     * @dev Creates a new TOKEN/$FEV pair
     * @param tokenA First token address
     * @param tokenB Second token address
     * @return pair Address of the created pair
     */
    function createPair(address tokenA, address tokenB) external returns (address pair) {
        if (tokenA == tokenB) revert IdenticalAddresses();

        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);

        if (token0 == address(0)) revert ZeroAddress();
        if (getPair[token0][token1] != address(0)) revert PairExists();

        bytes memory bytecode = type(DEXPair).creationCode;
        bytes32 salt = keccak256(abi.encodePacked(token0, token1));

        assembly {
            pair := create2(0, add(bytecode, 32), mload(bytecode), salt)
        }

        DEXPair(pair).initialize(token0, token1);

        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair;
        allPairs.push(pair);

        emit PairCreated(token0, token1, pair, allPairs.length);
    }

    /**
     * @dev Sets the fee recipient address
     * @param _feeTo Address that will receive protocol fees
     */
    function setFeeTo(address _feeTo) external {
        if (msg.sender != feeToSetter) revert Forbidden();
        feeTo = _feeTo;
    }

    /**
     * @dev Sets the address that can change fee settings
     * @param _feeToSetter New fee setter address
     */
    function setFeeToSetter(address _feeToSetter) external {
        if (msg.sender != feeToSetter) revert Forbidden();
        feeToSetter = _feeToSetter;
    }
}
