import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ethers } from 'ethers';
import { WalletConnectButton } from '@/components/WalletConnectButton';
import { SpinWheel } from '@/components/SpinWheel';
import { ShoutDetector } from '@/components/ShoutDetector';
import { SwapExecutor } from '@/components/SwapExecutor';
import { Celebration } from '@/components/Celebration';

type GameStep = 'wallet' | 'spin' | 'shout' | 'swap' | 'celebrate';
type Token = { symbol: string; name: string; color: string };

const Index = () => {
  const [currentStep, setCurrentStep] = useState<GameStep>('wallet');
  const [connectedWallet, setConnectedWallet] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletProvider, setWalletProvider] = useState<ethers.BrowserProvider | null>(null);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [voicePercentage, setVoicePercentage] = useState<number>(0);

  // Debug logging for state changes
  console.log('🔍 Index Component State:', {
    currentStep,
    connectedWallet,
    walletAddress: walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'null',
    walletProvider: !!walletProvider,
    selectedToken,
    showCelebration,
    voicePercentage
  });

  // State validation - prevent inconsistent states
  if (currentStep === 'swap' && (!walletAddress || !walletProvider || !selectedToken)) {
    console.warn('⚠️ Invalid state detected: swap step without required data, resetting to wallet');
    setCurrentStep('wallet');
  }

  const handleWalletConnect = (wallet: string, address: string, provider: ethers.BrowserProvider) => {
    console.log('🔗 Wallet Connected:', { wallet, address: `${address.slice(0, 6)}...${address.slice(-4)}`, provider: !!provider });
    setConnectedWallet(wallet);
    setWalletAddress(address);
    setWalletProvider(provider);
    setCurrentStep('spin');
    console.log('✅ Step changed to: spin');
  };

  const handleTokenSelected = (token: Token) => {
    console.log('🎰 Token Selected:', token);
    setSelectedToken(token);
    setCurrentStep('shout');
    console.log('✅ Step changed to: shout');
  };

  const handleShoutDetected = (voicePercent: number) => {
    console.log('🎤 Shout Detected:', { voicePercent, percentage: Math.round(voicePercent * 100) + '%' });
    setVoicePercentage(voicePercent);
    setCurrentStep('swap');
    console.log('✅ Step changed to: swap');
  };

  const handleSwapComplete = () => {
    console.log('💸 Swap Complete!');
    setShowCelebration(true);
    setCurrentStep('celebrate');
    console.log('✅ Step changed to: celebrate');
    
    // Celebration will stay open until user manually closes it
    console.log('🎉 Celebration will stay open until manually closed');
  };

  const handleCelebrationClose = () => {
    console.log('🎉 Celebration closed, resetting game');
    setShowCelebration(false);
    // Reset the game
    setCurrentStep('wallet');
    setConnectedWallet('');
    setWalletAddress('');
    setWalletProvider(null);
    setSelectedToken(null);
    setVoicePercentage(0);
  };

  const resetGame = () => {
    setCurrentStep('wallet');
    setConnectedWallet('');
    setWalletAddress('');
    setWalletProvider(null);
    setSelectedToken(null);
    setShowCelebration(false);
    setVoicePercentage(0);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/20 to-background" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 10 + i * 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 text-center py-8">
        <motion.h1
          animate={{ 
            textShadow: [
              '0 0 20px hsl(var(--neon-pink))',
              '0 0 40px hsl(var(--neon-blue))',
              '0 0 60px hsl(var(--neon-green))',
              '0 0 40px hsl(var(--neon-yellow))',
              '0 0 20px hsl(var(--neon-pink))'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-6xl md:text-7xl font-black gradient-text mb-4"
        >
          SHOUT-TO-SWAP
        </motion.h1>
        <p className="text-xl text-muted-foreground">
          The most EPIC way to trade on Monad! 🚀
        </p>
        
        {/* Debug Info */}
        {/* <div className="mt-4 p-3 bg-black/50 rounded-lg text-xs text-green-400 font-mono">
          <div>🔍 DEBUG: Step = {currentStep}</div>
          <div>🎯 Token = {selectedToken ? selectedToken.symbol : 'none'}</div>
          <div>🎤 Voice = {Math.round(voicePercentage * 100)}%</div>
          <div>🔗 Wallet = {walletAddress ? 'connected' : 'disconnected'}</div>
        </div> */}
        
        {/* Progress indicator */}
        <div className="flex justify-center mt-6 space-x-4">
          {['wallet', 'spin', 'shout', 'swap'].map((step, index) => (
            <div
              key={step}
              className={`w-4 h-4 rounded-full border-2 ${
                currentStep === step || 
                ['wallet', 'spin', 'shout', 'swap'].indexOf(currentStep) > index
                  ? 'bg-primary border-primary animate-pulse' 
                  : 'border-muted-foreground'
              }`}
            />
          ))}
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex items-center justify-center min-h-[70vh] px-4">
        <AnimatePresence mode="wait">
          {currentStep === 'wallet' && (
            <motion.div
              key="wallet"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.5 }}
            >
              <WalletConnectButton onConnect={handleWalletConnect} />
            </motion.div>
          )}

          {currentStep === 'spin' && (
            <motion.div
              key="spin"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.5 }}
            >
              <SpinWheel onTokenSelected={handleTokenSelected} />
            </motion.div>
          )}

          {currentStep === 'shout' && selectedToken && (
            <motion.div
              key="shout"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.5 }}
            >
              <ShoutDetector onShoutDetected={handleShoutDetected} />
            </motion.div>
          )}

          {currentStep === 'swap' && selectedToken && walletAddress && walletProvider && (
            <motion.div
              key="swap"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.5 }}
            >
              {(() => {
                console.log('🎯 Rendering SwapExecutor with props:', {
                  tokenSymbol: selectedToken.symbol,
                  voicePercentage,
                  userAddress: walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'null',
                  provider: !!walletProvider,
                  selectedToken
                });
                return null;
              })()}
              <SwapExecutor
                tokenSymbol={selectedToken.symbol}
                onSwapComplete={handleSwapComplete}
                provider={walletProvider}
                userAddress={walletAddress}
                voicePercentage={voicePercentage}
              />
            </motion.div>
          )}

          {/* Debug: Show when swap step is active but no component rendered */}
          {currentStep === 'swap' && !selectedToken && (
            <div className="text-center text-red-500 p-4 border-2 border-red-500 rounded-lg">
              <h2 className="text-xl font-bold">🚨 DEBUG: Swap step active but no selected token</h2>
              <p>Current step: {currentStep}</p>
              <p>Selected token: {selectedToken ? selectedToken.symbol : 'null'}</p>
              <p>Voice percentage: {voicePercentage}</p>
            </div>
          )}

        </AnimatePresence>
      </main>

      {/* Status bar */}
      {connectedWallet && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-4 left-4 bg-card/90 backdrop-blur-sm p-3 rounded-lg arcade-border text-sm"
        >
          <div className="flex items-center space-x-2">
            <span className="text-primary">🔗</span>
            <span>Connected: {connectedWallet.toUpperCase()}</span>
          </div>
          {walletAddress && (
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-muted-foreground">📍</span>
              <span className="text-xs">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
            </div>
          )}
          {selectedToken && (
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-accent">🎯</span>
              <span>Token: {selectedToken.symbol}</span>
            </div>
          )}
        </motion.div>
      )}

      {/* Reset button */}
      {currentStep !== 'wallet' && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetGame}
          className="fixed bottom-4 right-4 bg-muted/80 hover:bg-muted text-muted-foreground hover:text-foreground p-3 rounded-lg arcade-border text-sm transition-all duration-200"
        >
          🔄 Reset Game
        </motion.button>
      )}

      {/* Celebration overlay */}
      <Celebration show={showCelebration} onClose={handleCelebrationClose} />
    </div>
  );
};

export default Index;