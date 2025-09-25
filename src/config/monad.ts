const parseEnvInt = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const ZEROX_DEFAULT_CHAIN_ID = parseEnvInt(import.meta.env.VITE_0X_CHAIN_ID, 8453); // Default to Base mainnet per 0x guide
const ZEROX_SKIP_VALIDATION = import.meta.env.VITE_0X_SKIP_VALIDATION === 'true';

const ZEROX_DEFAULT_PARAMS: Record<string, string> = {};

const affiliateAddress = import.meta.env.VITE_0X_AFFILIATE_ADDRESS;
const affiliateFeeBps = import.meta.env.VITE_0X_AFFILIATE_FEE_BPS;
const affiliateFee = import.meta.env.VITE_0X_AFFILIATE_FEE;
const tradeSurplusRecipient = import.meta.env.VITE_0X_TRADE_SURPLUS_RECIPIENT;

if (affiliateAddress) {
  ZEROX_DEFAULT_PARAMS.affiliateAddress = affiliateAddress;
}

if (affiliateFeeBps) {
  ZEROX_DEFAULT_PARAMS.affiliateFeeBps = affiliateFeeBps;
} else if (affiliateFee) {
  ZEROX_DEFAULT_PARAMS.affiliateFee = affiliateFee;
}

if (tradeSurplusRecipient) {
  ZEROX_DEFAULT_PARAMS.tradeSurplusRecipient = tradeSurplusRecipient;
}

export const MONAD_CONFIG = {
  testnet: {
    chainId: 10143,
    rpcUrl: 'https://testnet-rpc.monad.xyz',
    name: 'Monad Testnet',
    symbol: 'MON',
    blockExplorer: 'https://testnet.monadexplorer.com/',
  },
  mainnet: {
    chainId: 10144, // Mainnet chain ID (when available)
    rpcUrl: 'https://rpc.monad.xyz',
    name: 'Monad Mainnet',
    symbol: 'MON',
    blockExplorer: 'https://monadexplorer.com/',
  }
};

export const SUPPORTED_WALLETS = [
  'metamask',
  'phantom',
  'backpack',
  'okx',
  'rainbow'
] as const;

export type SupportedWallet = typeof SUPPORTED_WALLETS[number];

export interface WalletInfo {
  name: string;
  icon: string;
  gradient: string;
}

export const WALLET_INFO: Record<SupportedWallet, WalletInfo> = {
  metamask: {
    name: 'MetaMask',
    icon: '🦊',
    gradient: 'from-neon-purple to-neon-pink'
  },
  phantom: {
    name: 'Phantom',
    icon: '👻',
    gradient: 'from-neon-blue to-neon-green'
  },
  backpack: {
    name: 'Backpack',
    icon: '🎒',
    gradient: 'from-neon-yellow to-neon-orange'
  },
  okx: {
    name: 'OKX Wallet',
    icon: '⚡',
    gradient: 'from-neon-green to-neon-blue'
  },
  rainbow: {
    name: 'Rainbow',
    icon: '🌈',
    gradient: 'from-neon-pink to-neon-purple'
  }
};

// 0x Swap API Configuration
export const ZEROX_CONFIG = {
  apiKey: import.meta.env.VITE_0X_API_KEY || 'YOUR_0X_API_KEY', // Get from https://dashboard.0x.org/create-account
  baseUrl: 'https://api.0x.org/swap',
  chainId: ZEROX_DEFAULT_CHAIN_ID,
  timeoutMs: 10000, // 10 seconds timeout
  version: 'v2', // 0x API version
  skipValidation: ZEROX_SKIP_VALIDATION,
  defaultParams: ZEROX_DEFAULT_PARAMS
};

// Fallback configuration for when 0x API is not available
const isApiKeyConfigured = () => {
  const envApiKey = import.meta.env.VITE_0X_API_KEY;
  return (ZEROX_CONFIG.apiKey && ZEROX_CONFIG.apiKey !== 'YOUR_0X_API_KEY' && ZEROX_CONFIG.apiKey !== '') ||
         (envApiKey && envApiKey !== 'YOUR_0X_API_KEY' && envApiKey !== '');
};

export const FALLBACK_CONFIG = {
  enabled: !isApiKeyConfigured(), // Only enable fallback if API key is not configured
  message: "0x API not configured. Using demo mode."
};

// Real Monad Testnet token addresses (only supported tokens)
export const TOKEN_ADDRESSES = {
  MON: '0xb4884f4af4c9282fb8e299ece7a126eee784086b', // Native MON token
  WETH: '0xB5a30b0FDc5EA94A52fDc42e3E9760Cb8449Fb37',
  USDC: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea',
  USDT: '0x88b8E2161DEDC77EF4ab7585569D2415a1C1055D',
  WBTC: '0xcf5a6076cfa32686c0Df13aBaDa2b40dec133F1d',
} as const;

// Mapping to 0x API token identifiers
export const ZEROX_TOKEN_ADDRESSES: Record<keyof typeof TOKEN_ADDRESSES, string> = {
  MON: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
  WETH: TOKEN_ADDRESSES.WETH,
  USDC: TOKEN_ADDRESSES.USDC,
  USDT: TOKEN_ADDRESSES.USDT,
  WBTC: TOKEN_ADDRESSES.WBTC,
};

// For demo purposes, we'll use a simple self-transfer when 0x API is not available
export const DEMO_SWAP_CONFIG = {
  enabled: true,
  amount: '0.0001', // Very small amount for demo
  message: 'Demo Mode: Simulating swap (0x API not configured)'
};

// Token metadata for display
export const TOKEN_METADATA = {
  MON: { symbol: 'MON', name: 'Monad', decimals: 18 },
  WETH: { symbol: 'WETH', name: 'Wrapped Ether', decimals: 18 },
  USDC: { symbol: 'USDC', name: 'USD Coin', decimals: 6 },
  USDT: { symbol: 'USDT', name: 'Tether USD', decimals: 6 },
  WBTC: { symbol: 'WBTC', name: 'Wrapped Bitcoin', decimals: 8 },
} as const;

// 0x Swap API interfaces
export interface ZeroXQuoteRequest {
  sellToken: string;
  buyToken: string;
  sellAmount?: string;
  buyAmount?: string;
  takerAddress?: string;
  taker?: string;
  slippagePercentage?: number;
  skipValidation?: boolean;
}

export interface ZeroXIssueAllowance {
  spender: string;
  token: string;
  owner?: string;
  amount?: string;
  currentAllowance?: string;
  type?: string;
  message?: string;
}

export interface ZeroXIssues {
  allowance?: ZeroXIssueAllowance;
  [key: string]: any;
}

export interface ZeroXPriceResponse {
  price: string;
  buyAmount: string;
  sellAmount: string;
  estimatedPriceImpact?: string;
  allowanceTarget?: string;
  value?: string;
  gas?: string;
  gasPrice?: string;
  estimatedGas?: string;
  issues?: ZeroXIssues;
  transaction?: {
    to?: string;
    data?: string;
    value?: string;
    gas?: string;
    gasPrice?: string;
  };
}

export interface ZeroXQuoteResponse {
  buyAmount: string;
  sellAmount: string;
  to: string;
  data: string;
  value: string;
  gas: string;
  gasPrice: string;
  transaction?: {
    to?: string;
    data?: string;
    value?: string;
    gas?: string;
    gasPrice?: string;
  };
  sources: Array<{
    name: string;
    proportion: string;
  }>;
  allowanceTarget: string;
  buyToken: string;
  sellToken: string;
  minimumProtocolFee: string;
  protocolFee: string;
  estimatedGas: string;
  estimatedGasTokenRefund: string;
  orders: Array<{
    makerToken: string;
    takerToken: string;
    makerAmount: string;
    takerAmount: string;
    order: any;
  }>;
  issues?: ZeroXIssues;
  estimatedPriceImpact?: string;
  guaranteedPrice?: string;
}

// Legacy interface for compatibility
export interface SwapQuoteRequest extends ZeroXQuoteRequest {}
export interface SwapQuoteResponse extends ZeroXQuoteResponse {}
