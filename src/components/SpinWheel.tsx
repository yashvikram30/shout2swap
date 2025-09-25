import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BUYABLE_TOKENS } from '@/config/monad';

interface SpinWheelProps {
  onTokenSelected: (token: (typeof BUYABLE_TOKENS)[number]) => void;
  disabled?: boolean;
}

export const SpinWheel = ({ onTokenSelected, disabled }: SpinWheelProps) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedToken, setSelectedToken] = useState<(typeof BUYABLE_TOKENS)[number] | null>(null);

  const handleSpin = () => {
    if (isSpinning) return;
    
    setIsSpinning(true);
    setSelectedToken(null);

    // Random selection after spin animation
    setTimeout(() => {
      const randomToken = BUYABLE_TOKENS[Math.floor(Math.random() * BUYABLE_TOKENS.length)];
      setSelectedToken(randomToken);
      setIsSpinning(false);
      onTokenSelected(randomToken);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <h2 className="text-3xl font-bold gradient-text">SPIN THE WHEEL 🎰</h2>
      
      <div className="relative">
        {/* Wheel */}
        <motion.div
          animate={{ rotate: isSpinning ? 1800 : 0 }}
          transition={{ 
            duration: 3, 
            ease: [0.23, 1, 0.320, 1] 
          }}
          className="w-64 h-64 rounded-full arcade-border bg-gradient-to-br from-neon-pink via-neon-purple to-neon-blue relative overflow-hidden"
        >
          {BUYABLE_TOKENS.map((token, index) => {
            const angle = (index * 360) / BUYABLE_TOKENS.length;
            return (
              <div
                key={token.symbol}
                className="absolute top-1/2 left-1/2 origin-bottom w-32 h-32 text-center"
                style={{
                  transform: `translate(-50%, -100%) rotate(${angle}deg)`,
                }}
              >
                <div className="bg-card/80 backdrop-blur-sm p-2 rounded-lg border-2 border-primary/50 m-2">
                  <div className="font-bold text-sm">{token.symbol}</div>
                  <div className="text-xs text-muted-foreground">{token.name}</div>
                </div>
              </div>
            );
          })}
        </motion.div>

        {/* Center pointer */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl z-10">
          🎯
        </div>
      </div>

      {/* Spin Button */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={handleSpin}
          disabled={disabled || isSpinning}
          className="bg-gradient-to-r from-neon-green to-neon-yellow text-foreground font-bold py-4 px-12 text-xl arcade-border hover:animate-pulse disabled:opacity-50"
        >
          {isSpinning ? '🌀 SPINNING...' : '🎰 SPIN IT!'}
        </Button>
      </motion.div>

      {/* Selected Token Display */}
      {selectedToken && !isSpinning && (
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="bg-card/90 backdrop-blur-sm p-6 rounded-lg arcade-border text-center"
        >
          <div className="text-2xl font-bold gradient-text mb-2">
            SELECTED TOKEN
          </div>
          <div className="text-4xl font-bold text-primary">{selectedToken.symbol}</div>
          <div className="text-lg text-muted-foreground">{selectedToken.name}</div>
        </motion.div>
      )}
    </div>
  );
};
