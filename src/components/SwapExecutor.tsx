import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ethers } from 'ethers';
import {
  MONAD_CONFIG,
  ZEROX_CONFIG,
  TOKEN_ADDRESSES,
  ZEROX_TOKEN_ADDRESSES,
  TOKEN_METADATA,
  FALLBACK_CONFIG,
  DEMO_SWAP_CONFIG,
  type ZeroXQuoteResponse,
  type ZeroXPriceResponse,
  type ZeroXIssues
} from '@/config/monad';
import { zeroXService } from '@/services/zeroXService';

interface SwapExecutorProps {
  tokenSymbol: string;
  onSwapComplete: () => void;
  disabled?: boolean;
  provider?: ethers.BrowserProvider;
  userAddress?: string;
  voicePercentage: number;
}

export const SwapExecutor = ({ 
  tokenSymbol, 
  onSwapComplete, 
  disabled, 
  provider,
  userAddress,
  voicePercentage
}: SwapExecutorProps) => {
  const [isSwapping, setIsSwapping] = useState(false);
  const [swapComplete, setSwapComplete] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quote, setQuote] = useState<ZeroXQuoteResponse | null>(null);
  const [price, setPrice] = useState<ZeroXPriceResponse | null>(null);
  const [isGettingQuote, setIsGettingQuote] = useState(false);
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);
  const [needsAllowance, setNeedsAllowance] = useState<boolean>(false);
  const [allowanceTarget, setAllowanceTarget] = useState<string | null>(null);

  // Comprehensive debug logging
  console.log('💸 SwapExecutor Component Rendered:', {
    tokenSymbol,
    voicePercentage,
    userAddress: userAddress ? `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}` : 'null',
    provider: !!provider,
    disabled,
    isSwapping,
    swapComplete,
    error,
    quote: !!quote,
    isGettingQuote
  });


  // Calculate Monad amount based on voice percentage (0 to 0.1 range)
  const calculateMonadAmount = (voicePercent: number): string => {
    console.log('🧮 Calculating Monad amount for voice percentage:', voicePercent);
    
    // Handle undefined, null, or NaN values
    if (voicePercent === undefined || voicePercent === null || isNaN(voicePercent)) {
      console.warn('⚠️ Invalid voice percentage:', voicePercent, 'using default 0.5');
      voicePercent = 0.5; // Default to 50% if invalid
    }
    
    // Clamp voice percentage between 0 and 1
    const clampedPercent = Math.max(0, Math.min(1, voicePercent));
    console.log('📊 Clamped percentage:', clampedPercent);
    
    // Scale to 0-0.1 Monad range
    const monadAmount = clampedPercent * 0.1;
    console.log('💰 Calculated Monad amount:', monadAmount);
    
    // Round to 6 decimal places for precision
    const result = monadAmount.toFixed(6);
    console.log('✅ Final Monad amount:', result);
    return result;
  };

  // Get quote from 0x API
  const getSwapQuote = async (sellToken: string, buyToken: string, sellAmount: string) => {
    console.log('📈 Getting 0x swap quote:', { sellToken, buyToken, sellAmount, userAddress });
    try {
      const result = await zeroXService.getSwapQuoteWithAllowance(sellToken, buyToken, sellAmount, userAddress!);
      console.log('✅ 0x quote received:', result);
      return result;
    } catch (error) {
      console.error('❌ 0x quote generation failed:', error);
      throw new Error('Failed to generate 0x quote. Using demo mode.');
    }
  };

  const evaluateIssues = (issues?: ZeroXIssues | null) => {
    if (!issues?.allowance) {
      setNeedsAllowance(false);
      setAllowanceTarget(null);
      return;
    }

    const allowanceInfo = issues.allowance;
    setNeedsAllowance(true);
    setAllowanceTarget(allowanceInfo.spender);
  };

  const fetchIndicativePrice = async () => {
    if (!userAddress) return;

    console.log('🔄 fetchIndicativePrice called:', { userAddress, tokenSymbol, voicePercentage });

    setIsFetchingPrice(true);
    setError(null);

    try {
      const sellToken = ZEROX_TOKEN_ADDRESSES.MON;
      const buyToken = ZEROX_TOKEN_ADDRESSES[tokenSymbol as keyof typeof ZEROX_TOKEN_ADDRESSES] || ZEROX_TOKEN_ADDRESSES.USDC;
      const monadAmount = calculateMonadAmount(voicePercentage);
      const minimumAmount = Math.max(parseFloat(monadAmount), 0.0001).toFixed(6);
      const sellAmount = ethers.parseEther(minimumAmount);

      console.log('📊 0x price parameters:', { sellToken, buyToken, monadAmount: minimumAmount, sellAmount: sellAmount.toString() });

      const indicativePrice = await zeroXService.getPrice(sellToken, buyToken, sellAmount.toString(), userAddress);
      setPrice(indicativePrice);
      evaluateIssues(indicativePrice.issues);
    } catch (err) {
      console.error('❌ Failed to fetch indicative price:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch price. Please try again.');
    } finally {
      setIsFetchingPrice(false);
    }
  };

  // Get quote when component mounts or token changes
  const getQuote = async () => {
    console.log('🔄 getQuote called:', { userAddress, tokenSymbol, voicePercentage });
    
    if (!userAddress) {
      console.log('❌ No user address, skipping quote');
      return;
    }

    console.log('⏳ Starting 0x quote generation...');
    setIsGettingQuote(true);
    setError(null);

    try {
      const sellToken = ZEROX_TOKEN_ADDRESSES.MON; // Always sell MON (native token sentinel for 0x)
      const buyToken = ZEROX_TOKEN_ADDRESSES[tokenSymbol as keyof typeof ZEROX_TOKEN_ADDRESSES] || ZEROX_TOKEN_ADDRESSES.USDC;
      const monadAmount = calculateMonadAmount(voicePercentage);
      const minimumAmount = Math.max(parseFloat(monadAmount), 0.0001).toFixed(6);
      const sellAmount = ethers.parseEther(minimumAmount); // Use calculated amount based on voice

      console.log('📊 0x quote parameters:', { sellToken, buyToken, monadAmount: minimumAmount, sellAmount: sellAmount.toString() });

      const swapQuote = await getSwapQuote(sellToken, buyToken, sellAmount.toString());
      console.log('✅ 0x quote set successfully:', swapQuote);

      evaluateIssues(swapQuote.issues);

      if (!swapQuote.to && !swapQuote.transaction?.to) {
        console.warn('⚠️ 0x quote missing executable transaction target:', swapQuote);
        setQuote(null);
        setError('0x returned an indicative quote only. This token pair may be unsupported on the selected chain or the amount is too small.');
        return;
      }

      setQuote(swapQuote);
    } catch (error: any) {
      console.error('❌ Failed to get 0x quote:', error);
      // Show demo mode message for any quote failure
      setError(error instanceof Error ? error.message : DEMO_SWAP_CONFIG.message);
    } finally {
      console.log('🏁 0x quote generation finished');
      setIsGettingQuote(false);
    }
  };

  const executeSwap = async () => {
    if (!provider || !userAddress) {
      setError('Wallet not connected');
      return;
    }

    setIsSwapping(true);
    setError(null);
    
    try {
      const signer = await provider.getSigner();
      
      // Get current balance
      const balance = await provider.getBalance(userAddress);
      const balanceInEth = ethers.formatEther(balance);
      const monadAmount = calculateMonadAmount(voicePercentage);
      
      // Only proceed if user has enough balance
      if (parseFloat(balanceInEth) < parseFloat(monadAmount)) {
        throw new Error(`Insufficient balance. Need ${monadAmount} MON but have ${balanceInEth} MON. Please get testnet MON tokens from the faucet.`);
      }

      // Always try to execute a real transaction first
      if (quote) {
        const txTarget = quote.to || quote.transaction?.to;
        const txData = quote.data || quote.transaction?.data;
        const txValue = quote.value || quote.transaction?.value;
        const txGas = quote.gas || quote.transaction?.gas;
        const txGasPrice = quote.gasPrice || quote.transaction?.gasPrice;

        const hasExecutableSwap = !!(
          txTarget &&
          !/^0x0+$/.test(txTarget.replace(/^0x/, '')) &&
          txData &&
          txData !== '0x'
        );

        if (hasExecutableSwap) {
          console.log('🔄 Executing real 0x swap transaction:', {
            to: txTarget,
            value: txValue,
            gas: txGas,
            gasPrice: txGasPrice,
            dataPreview: txData.slice(0, 66) + '...'
          });

          const tx = await signer.sendTransaction({
            to: txTarget,
            data: txData,
            value: txValue ? BigInt(txValue) : 0n,
            gasLimit: txGas ? BigInt(txGas) : undefined,
            gasPrice: txGasPrice ? BigInt(txGasPrice) : undefined,
          });

          setTxHash(tx.hash);
          
          // Wait for transaction confirmation
          const receipt = await tx.wait();
          
          if (receipt.status === 1) {
            setSwapComplete(true);
            onSwapComplete();
            return;
          }

          throw new Error('Transaction failed');
        }

        console.warn('⚠️ 0x quote missing executable transaction data. Falling back to demo transfer.', quote);
      }

      // Fallback: Send a small amount to self to trigger wallet confirmation
      console.log('🔄 Fallback: Sending transaction to trigger wallet confirmation with', monadAmount, 'MON');
      
      // Send a small amount to self to trigger wallet confirmation
      const tx = await signer.sendTransaction({
        to: userAddress, // Send to self
        value: ethers.parseEther(monadAmount), // Send the calculated amount
        gasLimit: 21000, // Standard transfer gas limit
      });

      setTxHash(tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        setSwapComplete(true);
        onSwapComplete();
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('❌ Swap failed:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Swap failed. Please try again.';
      
      if (error.message.includes('insufficient funds')) {
        errorMessage = 'Insufficient funds for transaction. Please check your balance.';
      } else if (error.message.includes('user rejected')) {
        errorMessage = 'Transaction was rejected by user.';
      } else if (error.message.includes('Internal JSON-RPC error')) {
        errorMessage = 'Network error. Please try again or check your connection.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsSwapping(false);
    }
  };

  const reset = () => {
    setSwapComplete(false);
    setIsSwapping(false);
    setTxHash(null);
    setError(null);
    setQuote(null);
    setPrice(null);
    setNeedsAllowance(false);
    setAllowanceTarget(null);
  };

  // Get quote when component mounts or userAddress/voicePercentage changes
  useEffect(() => {
    console.log('🔄 useEffect triggered:', { userAddress, tokenSymbol, voicePercentage });
    if (userAddress) {
      console.log('✅ User address exists, calling getQuote');
      fetchIndicativePrice();
    } else {
      console.log('❌ No user address, not calling getQuote');
    }
  }, [userAddress, tokenSymbol, voicePercentage]);

  useEffect(() => {
    if (!voicePercentage || !userAddress) return;

    fetchIndicativePrice();
  }, [voicePercentage, userAddress, tokenSymbol]);

  if (swapComplete) {
    return (
      <div className="flex flex-col items-center space-y-6">
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="text-center"
        >
          <div className="text-4xl font-bold gradient-text animate-flash mb-4">
            SWAP SUCCESSFUL! 🎉
          </div>
          <div className="text-xl text-muted-foreground mb-2">
            {tokenSymbol} swap completed!
          </div>
          {txHash && (
            <div className="text-sm text-muted-foreground">
              Transaction: 
              <a 
                href={`${MONAD_CONFIG.testnet.blockExplorer}tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neon-blue hover:underline ml-1"
              >
                {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </a>
            </div>
          )}
        </motion.div>
        
        <Button
          onClick={reset}
          className="bg-gradient-to-r from-neon-green to-neon-blue text-foreground font-bold py-4 px-8 text-lg arcade-border hover:animate-pulse"
        >
          🔄 SWAP AGAIN
        </Button>
      </div>
    );
  }

  console.log('🎨 SwapExecutor rendering UI:', {
    swapComplete,
    isSwapping,
    error,
    quote: !!quote,
    isGettingQuote,
    voicePercentage
  });

  return (
    <div className="flex flex-col items-center space-y-6">
      <h2 className="text-3xl font-bold gradient-text">EXECUTE SWAP 💸</h2>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200 text-center max-w-md"
        >
          {error}
        </motion.div>
      )}
      
      <div className="bg-card/90 backdrop-blur-sm p-6 rounded-lg arcade-border text-center">
        <div className="text-xl text-muted-foreground mb-2">Ready to swap:</div>
        <div className="text-4xl font-bold text-primary mb-4">{tokenSymbol}</div>
        
        {/* Voice-based amount display */}
        <div className="bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 p-4 rounded-lg mb-4 border border-neon-blue/30">
          <div className="text-sm text-muted-foreground mb-1">
            Voice Intensity: {isNaN(voicePercentage) ? 'Unknown' : Math.round(voicePercentage * 100)}%
          </div>
          <div className="text-lg font-bold text-neon-blue">
            Swapping: {calculateMonadAmount(voicePercentage)} MON
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Range: 0 - 0.1 MON based on voice volume
          </div>
          {isNaN(voicePercentage) && (
            <div className="text-xs text-yellow-300 mt-1">
              ⚠️ Using default amount (voice detection may have failed)
            </div>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          Monad Blockchain • Testnet • 0x Protocol
        </div>
        {userAddress && (
          <div className="text-xs text-muted-foreground mt-2">
            Wallet: {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
          </div>
        )}
        
        {/* Quote Information */}
        {(isGettingQuote || isFetchingPrice) && (
          <div className="mt-4 text-sm text-muted-foreground animate-pulse">
            Getting 0x data...
          </div>
        )}
        
        {price && !isFetchingPrice && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">
              Indicative Price: {price.price}
            </div>
            <div className="text-xs text-muted-foreground">
              Estimated Receive: {(() => {
                try {
                  const decimals = TOKEN_METADATA[tokenSymbol as keyof typeof TOKEN_METADATA]?.decimals || 18;
                  return `${ethers.formatUnits(price.buyAmount, decimals)} ${tokenSymbol}`;
                } catch (err) {
                  return `${price.buyAmount} ${tokenSymbol}`;
                }
              })()}
            </div>
            {price.estimatedPriceImpact && (
              <div className="text-xs text-muted-foreground">
                Price Impact: {price.estimatedPriceImpact}
              </div>
            )}
          </div>
        )}

        {quote && !isGettingQuote && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <div className="text-sm text-muted-foreground">
              Sell: {calculateMonadAmount(voicePercentage)} MON (Voice: {Math.round(voicePercentage * 100)}%)
            </div>
            <div className="text-sm text-muted-foreground">
              Buy: {(() => {
                try {
                  // Handle scientific notation by converting to proper format
                  const buyAmount = quote.buyAmount;
                  const decimals = TOKEN_METADATA[tokenSymbol as keyof typeof TOKEN_METADATA]?.decimals || 18;
                  
                  // If it's in scientific notation, convert it
                  if (buyAmount.includes('e+') || buyAmount.includes('e-')) {
                    const num = parseFloat(buyAmount);
                    return num.toFixed(6) + ' ' + tokenSymbol;
                  }
                  
                  return ethers.formatUnits(buyAmount, decimals) + ' ' + tokenSymbol;
                } catch (error) {
                  console.error('Error formatting buy amount:', error);
                  return quote.buyAmount + ' ' + tokenSymbol;
                }
              })()}
            </div>
            {quote.sources && quote.sources.length > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                Sources: {quote.sources.map(s => s.name).join(', ')}
              </div>
            )}
          </div>
        )}

        {error && !isGettingQuote && (
          <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <div className="text-sm text-yellow-200">
              {error}
            </div>
            <div className="text-xs text-yellow-300 mt-1">
              Demo Amount: {calculateMonadAmount(voicePercentage)} MON (Voice: {Math.round(voicePercentage * 100)}%)
            </div>
          </div>
        )}

        {/* Transaction mode indicator */}
        {quote && quote.to === '0x0000000000000000000000000000000000000000' && !isGettingQuote && (
          <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg">
            <div className="text-sm text-yellow-200">
              ⚠️ Fallback Mode: Using self-transfer
            </div>
            <div className="text-xs text-yellow-300 mt-1">
              Will send {calculateMonadAmount(voicePercentage)} MON to yourself to trigger wallet confirmation
            </div>
          </div>
        )}
        
        {needsAllowance && allowanceTarget && (
          <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
            <div className="text-sm text-blue-200">
              Approval required for AllowanceHolder
            </div>
            <div className="text-xs text-blue-300 mt-1 break-words">
              Please approve spender: {allowanceTarget}
            </div>
          </div>
        )}

        {!quote && !isGettingQuote && (
          <div className="mt-4 p-3 bg-blue-500/20 border border-blue-500/50 rounded-lg">
            <div className="text-sm text-blue-200">
              🔄 Getting 0x Quote: Preparing transaction
            </div>
            <div className="text-xs text-blue-300 mt-1">
              Voice amount: {calculateMonadAmount(voicePercentage)} MON
            </div>
          </div>
        )}
      </div>

      {isSwapping ? (
        <div className="text-center space-y-4">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity }
            }}
            className="text-8xl"
          >
            💸
          </motion.div>
          
          <div className="text-2xl font-bold gradient-text animate-flash">
            SWAPPING...
          </div>
          
          <div className="flex justify-center space-x-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                animate={{ 
                  y: [0, -20, 0],
                  backgroundColor: [
                    'hsl(var(--neon-pink))',
                    'hsl(var(--neon-blue))',
                    'hsl(var(--neon-green))',
                    'hsl(var(--neon-yellow))'
                  ]
                }}
                transition={{
                  y: { 
                    duration: 0.6, 
                    repeat: Infinity, 
                    delay: i * 0.2 
                  },
                  backgroundColor: {
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.3
                  }
                }}
                className="w-4 h-4 rounded-full"
              />
            ))}
          </div>
          
          <div className="text-sm text-muted-foreground animate-pulse">
            Executing transaction on Monad via 0x...
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center space-y-4">
          {!quote && !isGettingQuote && (
            <Button
              onClick={getQuote}
              disabled={disabled || isGettingQuote}
              className="bg-gradient-to-r from-neon-blue to-neon-green text-foreground font-bold py-3 px-6 text-lg arcade-border hover:animate-pulse disabled:opacity-50"
            >
              🔄 GET 0X QUOTE
            </Button>
          )}
          
          {(quote || error) && (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={executeSwap}
                disabled={disabled}
                className="bg-gradient-to-r from-neon-pink to-neon-purple text-foreground font-bold py-6 px-12 text-2xl arcade-border hover:animate-pulse disabled:opacity-50"
              >
                💸 EXECUTE SWAP
              </Button>
            </motion.div>
          )}
          
          {quote && (
            <Button
              onClick={getQuote}
              disabled={isGettingQuote}
              className="bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground py-2 px-4 text-sm arcade-border transition-all duration-200"
            >
              🔄 Refresh 0x Quote
            </Button>
          )}
        </div>
      )}
    </div>
  );
};