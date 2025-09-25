# Codex API Integration

This project now includes complete Codex API integration for token discovery, pricing, and swap simulation on Monad blockchain.

## 🚀 Features

- **Token Discovery**: Find and discover tokens using Codex's comprehensive database
- **Real-time Pricing**: Get accurate token prices from Codex's price oracles
- **Swap Simulation**: Simulate token swaps using Codex pricing data
- **Network Support**: Native support for Monad testnet (Chain ID: 10143)
- **GraphQL API**: Modern GraphQL interface for efficient data fetching

## 📋 Setup Instructions

### 1. Get Codex API Key

1. Visit [Codex Dashboard](https://dashboard.codex.io)
2. Create an account and navigate to API Keys
3. Copy your API key
4. Add the key to your environment variables

### 2. Environment Configuration

Copy `env.template` to `.env` and add your Codex API key:

```bash
# Codex API Configuration
VITE_CODEX_API_KEY=your_codex_api_key_here

# Monad Configuration
VITE_MONAD_RPC_URL=https://testnet-rpc.monad.xyz
VITE_MONAD_CHAIN_ID=10143
```

### 3. Install Dependencies

The Codex integration uses GraphQL requests, so no additional dependencies are required beyond what's already in your project.

## 🔧 How It Works

### 1. Token Discovery
- Codex provides comprehensive token information
- Get token metadata, prices, and market data
- Support for multiple networks including Monad

### 2. Price Discovery
- Real-time token prices from Codex oracles
- Historical price data
- Price comparisons across networks

### 3. Swap Simulation
- Simulate token swaps using Codex pricing
- Calculate estimated buy amounts
- Provide realistic swap quotes

## 📊 API Integration Details

### GraphQL Endpoint
```
https://graph.codex.io/graphql
```

### Authentication
Include your API key in the `Authorization` header:
```typescript
headers: {
  'Authorization': 'your-api-key',
  'Content-Type': 'application/json'
}
```

### Key Queries

#### Get Token Information
```graphql
query GetToken($address: String!, $networkId: Int!) {
  token(address: $address, networkId: $networkId) {
    address
    symbol
    name
    decimals
    price {
      value
      currency
    }
  }
}
```

#### Get Available Networks
```graphql
query GetNetworks {
  getNetworks {
    id
    name
    chainId
  }
}
```

## 🎮 User Experience

### 1. Token Selection
- User spins the wheel to select a token
- System fetches token information from Codex
- Displays real-time pricing data

### 2. Quote Generation
- System calculates swap quotes using Codex pricing
- Shows estimated buy amounts
- Displays price sources and accuracy

### 3. Swap Execution
- User can execute simulated swaps
- Real transaction execution on Monad blockchain
- Success confirmation with transaction links

## 🔍 Supported Features

### Token Data
- Token metadata (symbol, name, decimals)
- Real-time pricing
- Historical price data
- Market information

### Network Support
- Monad Testnet (Chain ID: 10143)
- Ethereum Mainnet
- Other supported networks

### Error Handling
- API key validation
- Network connectivity issues
- Token not found errors
- Rate limiting handling

## 🛠️ Development

### Key Files
- `src/config/monad.ts` - Codex configuration and interfaces
- `src/services/codexService.ts` - Codex API service
- `src/components/SwapExecutor.tsx` - Updated swap component

### Service Architecture
```typescript
class CodexService {
  // Check API configuration
  isConfigured(): boolean
  
  // Get token information
  getToken(address: string, networkId: number)
  
  // Get token price
  getTokenPrice(address: string, networkId: number)
  
  // Simulate swap quote
  getSwapQuote(sellToken, buyToken, sellAmount, takerAddress)
}
```

## 📈 Benefits

- **Comprehensive Data**: Access to extensive token database
- **Real-time Pricing**: Accurate, up-to-date price information
- **Modern API**: GraphQL interface for efficient queries
- **Easy Integration**: Simple service-based architecture
- **Cost Effective**: Competitive pricing for API usage

## 🔗 Resources

- [Codex Documentation](https://docs.codex.io)
- [Codex Dashboard](https://dashboard.codex.io)
- [GraphQL Explorer](https://graph.codex.io/graphql)
- [Monad Documentation](https://docs.monad.xyz)

## ⚠️ Important Notes

1. **API Key Required**: You must have a valid Codex API key
2. **Rate Limits**: Be aware of API rate limits
3. **Testnet Focus**: Currently optimized for Monad testnet
4. **Pricing Accuracy**: Prices are estimates based on Codex oracles
5. **Swap Simulation**: This is simulation, not actual DEX integration

## 🚀 Next Steps

1. Get your Codex API key from the dashboard
2. Add the key to your environment variables
3. Test the integration with different tokens
4. Explore additional Codex features like historical data
5. Consider upgrading to premium features if needed

## 🔄 Migration from 0x API

The project has been completely migrated from 0x API to Codex:

### What Changed
- ✅ Removed all 0x API configuration
- ✅ Replaced with Codex API configuration
- ✅ Updated SwapExecutor component
- ✅ Created Codex service layer
- ✅ Updated all UI messages and references

### What Stayed the Same
- ✅ All existing functionality preserved
- ✅ Same user interface and experience
- ✅ Same swap execution flow
- ✅ Same error handling patterns

Your Shout & Spin game now has professional-grade token discovery and pricing integration! 🎉
