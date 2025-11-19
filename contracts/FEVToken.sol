// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FEVToken
 * @dev FEVA Protocol native token with fixed supply of 1 billion tokens
 * This is the base currency for all trading pairs on the FEVA DEX
 */
contract FEVToken is ERC20, Ownable {
    /// @dev Total supply is 1 billion tokens with 18 decimals
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;

    /**
     * @dev Constructor mints entire supply to deployer
     * @param initialOwner Address that will receive the total supply and ownership
     */
    constructor(address initialOwner) ERC20("FEVA Token", "FEV") Ownable(initialOwner) {
        _mint(initialOwner, TOTAL_SUPPLY);
    }

    /**
     * @dev Burns tokens from caller's balance
     * @param amount Amount of tokens to burn
     */
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /**
     * @dev Burns tokens from specified account (requires allowance)
     * @param account Account to burn tokens from
     * @param amount Amount of tokens to burn
     */
    function burnFrom(address account, uint256 amount) external {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
    }
}
