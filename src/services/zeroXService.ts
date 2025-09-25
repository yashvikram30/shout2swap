import { ZEROX_CONFIG, type ZeroXQuoteRequest, type ZeroXQuoteResponse, type ZeroXPriceResponse } from '@/config/monad';

// 0x Swap API service class
export class ZeroXService {
  private apiKey: string;
  private baseUrl: string;
  private chainId: number;

  constructor() {
    this.apiKey = ZEROX_CONFIG.apiKey;
    // Use proxy endpoint in development to avoid CORS issues
    this.baseUrl = import.meta.env.DEV ? '/api/0x' : ZEROX_CONFIG.baseUrl;
    this.chainId = ZEROX_CONFIG.chainId;
    
    // Debug logging
    console.log('ZeroXService initialized:', {
      apiKey: this.apiKey ? `${this.apiKey.slice(0, 8)}...` : 'undefined',
      baseUrl: this.baseUrl,
      chainId: this.chainId,
      envVar: import.meta.env.VITE_0X_API_KEY ? `${import.meta.env.VITE_0X_API_KEY.slice(0, 8)}...` : 'undefined'
    });
  }

  // Check if 0x API is properly configured
  isConfigured(): boolean {
    const envApiKey = import.meta.env.VITE_0X_API_KEY;
    const hasValidApiKey = (this.apiKey && this.apiKey !== 'YOUR_0X_API_KEY' && this.apiKey !== '') ||
                          (envApiKey && envApiKey !== 'YOUR_0X_API_KEY' && envApiKey !== '');
    
    console.log('0x API Configuration Check:', {
      storedApiKey: this.apiKey ? `${this.apiKey.slice(0, 8)}...` : 'undefined',
      envApiKey: envApiKey ? `${envApiKey.slice(0, 8)}...` : 'undefined',
      isConfigured: hasValidApiKey
    });
    
    return hasValidApiKey;
  }

  // Make HTTP request to 0x API
  private async makeRequest(endpoint: string, params: Record<string, string | undefined>): Promise<any> {
    if (!this.isConfigured()) {
      throw new Error('0x API not configured. Please add your API key.');
    }

    // Handle both absolute and relative URLs properly
    const base = this.baseUrl.endsWith('/') ? this.baseUrl.slice(0, -1) : this.baseUrl;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    const fullUrl = this.baseUrl.startsWith('http')
      ? `${base}${path}`
      : `${window.location.origin}${base}${path}`;
      
    const url = new URL(fullUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.append(key, value);
      }
    });

    console.log('Making 0x API request:', {
      url: url.toString(),
      params,
      headers: {
        '0x-api-key': this.apiKey ? `${this.apiKey.slice(0, 8)}...` : 'undefined',
        '0x-version': ZEROX_CONFIG.version
      }
    });

    const headers: Record<string, string> = {
      '0x-version': ZEROX_CONFIG.version,
      'Content-Type': 'application/json',
    };

    if (this.apiKey && this.apiKey !== 'YOUR_0X_API_KEY') {
      headers['0x-api-key'] = this.apiKey;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ZEROX_CONFIG.timeoutMs);

    let response: Response;
    try {
      response = await fetch(url.toString(), {
        method: 'GET',
        headers,
        signal: controller.signal
      });
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error('0x API request timed out. Please try again.');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('0x API request failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`0x API request failed: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('0x API response received:', data);
    return data;
  }

  // Get swap quote from 0x API
  private buildParams(baseParams: Record<string, string>): Record<string, string> {
    const params: Record<string, string> = {
      chainId: this.chainId.toString(),
      ...ZEROX_CONFIG.defaultParams,
      ...baseParams,
    };

    if (ZEROX_CONFIG.skipValidation) {
      params.skipValidation = 'true';
    }

    return params;
  }

  private sanitizeQuoteError(error: any): never {
    const err = error instanceof Error ? error : new Error('Unknown 0x error');
    const message = err.message || 'Unknown 0x error';

    if (message.toLowerCase().includes('insufficient liquidity')) {
      throw new Error('Insufficient liquidity for selected token pair. Try a smaller amount or a different token.');
    }

    if (message.toLowerCase().includes('validation failed')) {
      throw new Error('Quote validation failed. Ensure tokens and amounts are correct.');
    }

    if (message.toLowerCase().includes('allowance')) {
      throw new Error('Allowance required. Please approve the token before swapping.');
    }

    throw err;
  }

  async getSwapQuote(
    sellToken: string,
    buyToken: string,
    sellAmount: string,
    takerAddress?: string,
    slippagePercentage: number = 0.5
  ): Promise<ZeroXQuoteResponse> {
    console.log('🔄 Getting 0x swap quote:', { 
      sellToken, 
      buyToken, 
      sellAmount, 
      takerAddress, 
      slippagePercentage,
      chainId: this.chainId
    });

    try {
      const params = this.buildParams({
        sellToken,
        buyToken,
        sellAmount,
        slippagePercentage: slippagePercentage.toString(),
        ...(takerAddress ? { taker: takerAddress } : {}),
      });

      const quote = await this.makeRequest('/allowance-holder/quote', params);
      
      console.log('✅ 0x quote received:', quote);
      return quote;
    } catch (error) {
      console.error('❌ 0x quote generation failed:', error);
      this.sanitizeQuoteError(error);
    }
  }

  // Get indicative price from 0x API
  async getPrice(
    sellToken: string,
    buyToken: string,
    sellAmount: string,
    takerAddress?: string
  ): Promise<ZeroXPriceResponse> {
    console.log('💰 Getting 0x price:', { 
      sellToken, 
      buyToken, 
      sellAmount, 
      takerAddress,
      chainId: this.chainId
    });

    try {
      const params = this.buildParams({
        sellToken,
        buyToken,
        sellAmount,
        ...(takerAddress ? { taker: takerAddress } : {}),
      });

      const price = await this.makeRequest('/allowance-holder/price', params);
      
      console.log('✅ 0x price received:', price);
      return price;
    } catch (error) {
      console.error('❌ 0x price generation failed:', error);
      throw new Error(`Failed to get 0x price: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get token allowance (for ERC-20 tokens)
  async getTokenAllowance(
    tokenAddress: string,
    ownerAddress: string,
    spenderAddress: string
  ): Promise<string> {
    try {
      const params = this.buildParams({
        tokenAddress,
        ownerAddress,
        spenderAddress,
      });

      const allowance = await this.makeRequest('/allowance', params);
      return allowance.allowance;
    } catch (error) {
      console.error('Failed to get token allowance:', error);
      return '0';
    }
  }

  // Get supported tokens
  async getSupportedTokens(): Promise<any> {
    try {
      const params = this.buildParams({});
      return await this.makeRequest('/tokens', params);
    } catch (error) {
      console.error('Failed to get supported tokens:', error);
      throw error;
    }
  }

  // Get token prices for multiple tokens
  async getTokenPrices(
    tokenAddresses: string[],
    symbol?: string,
    side?: 'buy' | 'sell'
  ): Promise<any> {
    try {
      const params = this.buildParams({
        token: tokenAddresses.join(','),
        ...(symbol ? { symbol } : {}),
        ...(side ? { side } : {}),
      });

      return await this.makeRequest('/allowance-holder/price', params);
    } catch (error) {
      console.error('Failed to get token prices:', error);
      throw error;
    }
  }

  // Get swap quote with allowance holder (for better UX)
  async getSwapQuoteWithAllowance(
    sellToken: string,
    buyToken: string,
    sellAmount: string,
    takerAddress?: string,
    slippagePercentage: number = 0.5
  ): Promise<ZeroXQuoteResponse> {
    console.log('🔄 Getting 0x swap quote with allowance holder:', { 
      sellToken, 
      buyToken, 
      sellAmount, 
      takerAddress, 
      slippagePercentage,
      chainId: this.chainId
    });

    try {
      const params = this.buildParams({
        sellToken,
        buyToken,
        sellAmount,
        slippagePercentage: slippagePercentage.toString(),
        ...(takerAddress ? { taker: takerAddress } : {}),
      });

      let quote;
      try {
        quote = await this.makeRequest('/allowance-holder/quote', params);
      } catch (error) {
        console.warn('Allowance-holder quote failed, falling back to regular quote:', error);
        quote = await this.makeRequest('/quote', params);
      }

      console.log('✅ 0x quote with allowance holder received:', quote);
      return quote;
    } catch (error) {
      console.error('❌ 0x quote with allowance holder failed:', error);
      this.sanitizeQuoteError(error);
    }
  }
}

// Export singleton instance
export const zeroXService = new ZeroXService();
