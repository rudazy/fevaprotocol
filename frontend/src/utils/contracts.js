// Simplified ABIs for core contract interactions
// Full ABIs should be imported from artifacts after contract deployment

export const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function approve(address spender, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function transfer(address to, uint256 amount) returns (bool)',
];

export const DEX_ROUTER_ABI = [
  'function factory() view returns (address)',
  'function FEV() view returns (address)',
  'function addLiquidity(address token, uint256 amountTokenDesired, uint256 amountFEVDesired, uint256 amountTokenMin, uint256 amountFEVMin, address to, uint256 deadline) returns (uint256 amountToken, uint256 amountFEV, uint256 liquidity)',
  'function removeLiquidity(address token, uint256 liquidity, uint256 amountTokenMin, uint256 amountFEVMin, address to, uint256 deadline) returns (uint256 amountToken, uint256 amountFEV)',
  'function swapExactTokensForFEV(uint256 amountIn, uint256 amountOutMin, address token, address to, uint256 deadline) returns (uint256 amountOut)',
  'function swapExactFEVForTokens(uint256 amountIn, uint256 amountOutMin, address token, address to, uint256 deadline) returns (uint256 amountOut)',
  'function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) view returns (uint256 amountOut)',
  'function getAmountIn(uint256 amountOut, uint256 reserveIn, uint256 reserveOut) view returns (uint256 amountIn)',
];

export const DEX_FACTORY_ABI = [
  'function getPair(address tokenA, address tokenB) view returns (address pair)',
  'function createPair(address tokenA, address tokenB) returns (address pair)',
  'function allPairs(uint256) view returns (address)',
  'function allPairsLength() view returns (uint256)',
];

export const DEX_PAIR_ABI = [
  'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)',
  'function token0() view returns (address)',
  'function token1() view returns (address)',
  'function balanceOf(address owner) view returns (uint256)',
  'function totalSupply() view returns (uint256)',
];

export const TOKEN_FACTORY_ABI = [
  'function createToken(string memory name, string memory symbol, string memory logoUrl, string memory websiteUrl, string memory twitterUrl, string memory telegramUrl, string memory description) returns (address token)',
  'function getTokenMetadata(address tokenAddress) view returns (tuple(address tokenAddress, address creator, string name, string symbol, string logoUrl, string websiteUrl, string twitterUrl, string telegramUrl, string description, uint256 createdAt))',
  'function getAllTokensCount() view returns (uint256)',
  'function getTokens(uint256 offset, uint256 limit) view returns (address[] memory)',
];
