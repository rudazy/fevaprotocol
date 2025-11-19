// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MemeToken
 * @dev Standard ERC20 token created by TokenFactory with fixed 1 billion supply
 */
contract MemeToken is ERC20, Ownable {
    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 10**18;

    constructor(
        string memory name,
        string memory symbol,
        address creator
    ) ERC20(name, symbol) Ownable(creator) {
        _mint(creator, TOTAL_SUPPLY);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    function burnFrom(address account, uint256 amount) external {
        _spendAllowance(account, msg.sender, amount);
        _burn(account, amount);
    }
}

/**
 * @title TokenFactory
 * @dev Factory for deploying memecoins with metadata storage
 * All created tokens have a fixed supply of 1 billion
 */
contract TokenFactory {
    struct TokenMetadata {
        address tokenAddress;
        address creator;
        string name;
        string symbol;
        string logoUrl;
        string websiteUrl;
        string twitterUrl;
        string telegramUrl;
        string description;
        uint256 createdAt;
    }

    // Token address => metadata
    mapping(address => TokenMetadata) public tokenMetadata;

    // Array of all created tokens
    address[] public allTokens;

    // Creator address => their created tokens
    mapping(address => address[]) public creatorTokens;

    event TokenCreated(
        address indexed tokenAddress,
        address indexed creator,
        string name,
        string symbol,
        uint256 timestamp
    );

    event MetadataUpdated(
        address indexed tokenAddress,
        address indexed updater
    );

    error Unauthorized();
    error InvalidToken();

    /**
     * @dev Creates a new memecoin with metadata
     * @param name Token name
     * @param symbol Token symbol
     * @param logoUrl URL to token logo image
     * @param websiteUrl Official website URL
     * @param twitterUrl Twitter/X profile URL
     * @param telegramUrl Telegram group URL
     * @param description Token description
     * @return token Address of the created token
     */
    function createToken(
        string memory name,
        string memory symbol,
        string memory logoUrl,
        string memory websiteUrl,
        string memory twitterUrl,
        string memory telegramUrl,
        string memory description
    ) external returns (address token) {
        // Deploy new token
        MemeToken newToken = new MemeToken(name, symbol, msg.sender);
        token = address(newToken);

        // Store metadata
        tokenMetadata[token] = TokenMetadata({
            tokenAddress: token,
            creator: msg.sender,
            name: name,
            symbol: symbol,
            logoUrl: logoUrl,
            websiteUrl: websiteUrl,
            twitterUrl: twitterUrl,
            telegramUrl: telegramUrl,
            description: description,
            createdAt: block.timestamp
        });

        // Update tracking
        allTokens.push(token);
        creatorTokens[msg.sender].push(token);

        emit TokenCreated(token, msg.sender, name, symbol, block.timestamp);
    }

    /**
     * @dev Updates metadata for a token (only creator can update)
     * @param tokenAddress Address of the token to update
     * @param logoUrl New logo URL
     * @param websiteUrl New website URL
     * @param twitterUrl New Twitter URL
     * @param telegramUrl New Telegram URL
     * @param description New description
     */
    function updateMetadata(
        address tokenAddress,
        string memory logoUrl,
        string memory websiteUrl,
        string memory twitterUrl,
        string memory telegramUrl,
        string memory description
    ) external {
        TokenMetadata storage metadata = tokenMetadata[tokenAddress];

        if (metadata.tokenAddress == address(0)) revert InvalidToken();
        if (metadata.creator != msg.sender) revert Unauthorized();

        metadata.logoUrl = logoUrl;
        metadata.websiteUrl = websiteUrl;
        metadata.twitterUrl = twitterUrl;
        metadata.telegramUrl = telegramUrl;
        metadata.description = description;

        emit MetadataUpdated(tokenAddress, msg.sender);
    }

    /**
     * @dev Gets metadata for a token
     * @param tokenAddress Address of the token
     * @return metadata Token metadata struct
     */
    function getTokenMetadata(address tokenAddress) external view returns (TokenMetadata memory) {
        return tokenMetadata[tokenAddress];
    }

    /**
     * @dev Gets all tokens created by a specific address
     * @param creator Address of the creator
     * @return Array of token addresses
     */
    function getCreatorTokens(address creator) external view returns (address[] memory) {
        return creatorTokens[creator];
    }

    /**
     * @dev Gets total number of tokens created
     * @return Total count of created tokens
     */
    function getAllTokensCount() external view returns (uint256) {
        return allTokens.length;
    }

    /**
     * @dev Gets a batch of tokens with pagination
     * @param offset Starting index
     * @param limit Number of tokens to return
     * @return Array of token addresses
     */
    function getTokens(uint256 offset, uint256 limit) external view returns (address[] memory) {
        if (offset >= allTokens.length) {
            return new address[](0);
        }

        uint256 end = offset + limit;
        if (end > allTokens.length) {
            end = allTokens.length;
        }

        uint256 length = end - offset;
        address[] memory result = new address[](length);

        for (uint256 i = 0; i < length; i++) {
            result[i] = allTokens[offset + i];
        }

        return result;
    }
}
