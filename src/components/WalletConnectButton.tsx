import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ethers } from 'ethers';
import { MONAD_CONFIG, SUPPORTED_WALLETS, WALLET_INFO, type SupportedWallet } from '@/config/monad';

interface WalletConnectButtonProps {
  onConnect: (wallet: string, address: string, provider: ethers.BrowserProvider) => void;
}

export const WalletConnectButton = ({ onConnect }: WalletConnectButtonProps) => {
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const addMonadNetwork = async (provider: ethers.BrowserProvider) => {
    try {
      await provider.send('wallet_addEthereumChain', [{
        chainId: `0x${MONAD_CONFIG.testnet.chainId.toString(16)}`,
        chainName: MONAD_CONFIG.testnet.name,
        nativeCurrency: {
          name: MONAD_CONFIG.testnet.name,
          symbol: MONAD_CONFIG.testnet.symbol,
          decimals: 18,
        },
        rpcUrls: [MONAD_CONFIG.testnet.rpcUrl],
        blockExplorerUrls: [MONAD_CONFIG.testnet.blockExplorer],
      }]);
    } catch (error) {
      console.error('Failed to add Monad network:', error);
    }
  };

  const connectWallet = async (walletType: SupportedWallet) => {
    setConnecting(true);
    setError(null);

    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('No wallet detected. Please install MetaMask or another compatible wallet.');
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Request account access
      const accounts = await provider.send('eth_requestAccounts', []);
      
      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const address = accounts[0];
      
      // Check if we're on the correct network
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== MONAD_CONFIG.testnet.chainId) {
        await addMonadNetwork(provider);
      }

      onConnect(walletType, address, provider);
    } catch (error: any) {
      setError(error.message || 'Failed to connect wallet');
      console.error('Wallet connection error:', error);
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <h2 className="text-3xl font-bold gradient-text mb-4">CONNECT WALLET</h2>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200 text-center max-w-md"
        >
          {error}
        </motion.div>
      )}

      <div className="flex flex-wrap gap-4 justify-center">
        {SUPPORTED_WALLETS.map((wallet) => {
          const walletInfo = WALLET_INFO[wallet];
          return (
            <motion.div
              key={wallet}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                onClick={() => connectWallet(wallet)}
                disabled={connecting}
                className={`bg-gradient-to-r ${walletInfo.gradient} text-foreground font-bold py-4 px-8 text-lg arcade-border hover:shadow-lg transition-all duration-300 hover:animate-pulse disabled:opacity-50`}
              >
                {connecting ? '🔌 CONNECTING...' : `${walletInfo.icon} ${walletInfo.name.toUpperCase()}`}
              </Button>
            </motion.div>
          );
        })}
      </div>
      
      {connecting && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="text-4xl"
        >
          🎮
        </motion.div>
      )}

      <div className="text-sm text-muted-foreground text-center max-w-md">
        Connect your wallet to play Shout & Spin on Monad Testnet. 
        Get testnet MON tokens from the{' '}
        <a 
          href="https://testnet.monad.xyz" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-neon-blue hover:underline"
        >
          Monad Faucet
        </a>.
      </div>
    </div>
  );
};