# 0x Swap API Integration

This project now includes full 0x Swap API integration for real token swaps on Monad blockchain.

## 🚀 Features

- **Real Token Swaps**: Execute actual token exchanges using 0x's aggregated liquidity
- **Best Price Discovery**: Finds optimal prices across 100+ DEXs and market makers
- **Smart Order Routing**: Automatically splits orders across multiple sources
- **Quote System**: Get real-time quotes before executing swaps
- **Monad Support**: Native support for Monad testnet (Chain ID: 10143)

## 📋 Setup Instructions

### 1. Get 0x API Key

1. Visit [0x Dashboard](https://dashboard.0x.org/create-account)
2. Create an account and get your API key
3. Add the key to your environment variables

### 2. Environment Configuration

Create a `.env` file in your project root:

```bash
# 0x Swap API Configuration
VITE_0X_API_KEY=your_0x_api_key_here
```

### 3. Token Addresses

Real Monad testnet token addresses are already configured in `src/config/monad.ts`:

```typescript
export const TOKEN_ADDRESSES = {
  MON: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // Native MON token sentinel for 0x
  USDC: '0xf817257fed379853cDe0fa4F97AB987181B1E5Ea', // USDC on Monad testnet
  WBTC: '0xcf5a6076cfa32686c0Df13aBaDa2b40dec133F1d', // WBTC on Monad testnet
};
```

## 🔧 How It Works

### 1. Quote Request
- User selects a token from the spin wheel
- System automatically requests a quote from 0x API
- Shows real-time pricing and liquidity sources

### 2. Swap Execution
- User clicks "EXECUTE SWAP" button
- System uses the 0x quote to create a transaction
- Transaction is sent to Monad blockchain
- User receives actual tokens

### 3. Transaction Tracking
- Shows transaction hash
- Links to Monad block explorer
- Displays swap details and sources

## 📊 API Integration Details

### AllowanceHolder Endpoints

We now rely on the [AllowanceHolder flow](https://0x.org/docs/0x-swap-api/guides/build-token-swap-dapp-nextjs) for smoother UX, approvals, and monetization support.

```typescript
GET https://api.0x.org/swap/allowance-holder/price // Indicative price
GET https://api.0x.org/swap/allowance-holder/quote // Firm quote
```

**Core parameters:**
- `sellToken`: Token to sell. For native MON we use the `0xeeee...` sentinel.
- `buyToken`: Token to buy (selected from the spin wheel configuration).
- `sellAmount`: Amount to sell (voice driven, scaled between 0 → 0.1 MON).
- `taker`: User wallet address (enables RFQ and optimized routing).
- `slippagePercentage`: Configurable tolerance (defaults to 0.5%).
- `affiliateAddress` / `affiliateFeeBps`: Optional revenue share configuration.
- `tradeSurplusRecipient`: Optional address to receive positive slippage (custom plans only).

### Response Format
```typescript
{
  buyAmount: string;
  sellAmount: string;
  transaction?: {
    to?: string;
    data?: string;
    value?: string;
    gas?: string;
  };
  allowanceTarget: string;
  issues?: {
    allowance?: {
      spender: string;
      token: string;
      currentAllowance?: string;
    };
  };
  sources: Array<{ name: string; proportion: string }>;
  estimatedGas: string;
  estimatedPriceImpact?: string;
  guaranteedPrice?: string;
}
```

## 🎮 User Experience

### 1. Wallet Connection
- User connects wallet (MetaMask, Phantom, etc.)
- System automatically adds Monad testnet

### 2. Token Selection
- User spins the wheel to select a token
- System immediately fetches a quote from 0x

### 3. Quote Display
- Shows exact amounts: "Sell: 0.001 MON, Buy: X USDC"
- Displays liquidity sources: "Uniswap V3, Curve, etc."
- Real-time pricing updates

### 4. Approvals & Swap Execution
- When allowance is missing, UI surfaces the AllowanceHolder spender and prompts user to approve via wallet.
- After approval, user clicks "EXECUTE SWAP" to submit the firm quote transaction.
- Wallet prompts for confirmation and submits to Monad (testnet) blockchain.
- Success confirmation with transaction link.

## 🔍 Supported Features

### Liquidity Sources
- Uniswap V2/V3/V4
- Curve
- SushiSwap
- RingSwap
- And 100+ more sources

### Token Support
- Native MON token
- ERC-20 tokens on Monad
- Cross-chain compatibility

### Error Handling
- Insufficient balance detection
- Network connectivity issues
- Quote expiration handling
- Transaction failure recovery

## 🛠️ Development

### Key Files
- `src/config/monad.ts` - 0x configuration and token addresses
- `src/services/zeroXService.ts` - 0x API service
- `src/components/SwapExecutor.tsx` - Main swap logic
- `src/components/WalletConnectButton.tsx` - Wallet integration

### Testing
1. Get testnet MON tokens from [Monad Faucet](https://testnet.monad.xyz)
2. Connect wallet to Monad testnet
3. Spin wheel to select token
4. Get quote and execute swap
5. Verify transaction on [Monad Explorer](https://testnet.monadexplorer.com)

## 📈 Benefits

- **Real DeFi Integration**: Actual token swaps, not simulations
- **Best Execution**: Aggregated liquidity from multiple sources
- **Professional Grade**: Used by major DeFi applications
- **User Protection**: Built-in slippage protection
- **Revenue Opportunity**: Built-in fee support

## 🔗 Resources

- [0x Documentation](https://0x.org/docs/0x-swap-api/introduction)
- [0x Dashboard](https://dashboard.0x.org/create-account)
- [Monad Documentation](https://docs.monad.xyz)
- [Monad Testnet Faucet](https://testnet.monad.xyz)
- [Monad Block Explorer](https://testnet.monadexplorer.com)

## ⚠️ Important Notes

1. **API Key Required**: You must have a valid 0x API key
2. **Token Addresses**: Update with real Monad testnet addresses
3. **Testnet Only**: Currently configured for Monad testnet
4. **Gas Fees**: Users need MON tokens for transaction fees
5. **Quote Expiration**: Quotes expire after a certain time

## 🚀 Next Steps

1. Get your 0x API key
2. Update token addresses with real Monad testnet addresses
3. Test the integration with testnet tokens
4. Deploy to production when ready

Your Shout & Spin game now has professional-grade DeFi integration! 🎉
