import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CelebrationProps {
  show: boolean;
  onClose: () => void;
}

export const Celebration = ({ show, onClose }: CelebrationProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; emoji: string }>>([]);

  useEffect(() => {
    if (show) {
      // Generate random particles
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        emoji: ['🎉', '🎊', '✨', '🚀', '💎', '🔥'][Math.floor(Math.random() * 6)]
      }));
      setParticles(newParticles);

      // Auto close after 10 seconds (increased from 5 to give more time)
      const timer = setTimeout(() => {
        console.log('🎉 Auto-closing celebration after 10 seconds');
        onClose();
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Background particles */}
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              initial={{ 
                x: `${particle.x}vw`, 
                y: `${particle.y}vh`,
                scale: 0,
                rotate: 0
              }}
              animate={{ 
                x: `${particle.x + (Math.random() - 0.5) * 50}vw`,
                y: `${particle.y + (Math.random() - 0.5) * 50}vh`,
                scale: [0, 2, 1, 0],
                rotate: 360
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "reverse"
              }}
              className="absolute text-4xl pointer-events-none"
            >
              {particle.emoji}
            </motion.div>
          ))}

          {/* Main celebration content */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ 
              scale: [0, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              scale: { duration: 0.5 },
              rotate: { duration: 0.3, repeat: Infinity, repeatType: "reverse" }
            }}
            className="text-center space-y-8"
          >
            {/* Giant YEEHHHH text */}
            <motion.div
              animate={{ 
                textShadow: [
                  '0 0 20px hsl(var(--neon-pink))',
                  '0 0 40px hsl(var(--neon-blue))',
                  '0 0 60px hsl(var(--neon-green))',
                  '0 0 40px hsl(var(--neon-yellow))',
                  '0 0 20px hsl(var(--neon-pink))'
                ]
              }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-8xl md:text-9xl font-black gradient-text animate-flash"
            >
              YEEHHHH!
            </motion.div>

            {/* Celebration emojis */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="text-6xl"
            >
              🎉🚀💎🔥🎊
            </motion.div>

            {/* Success message */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="space-y-4"
            >
              <div className="text-3xl font-bold text-foreground">
                SWAP COMPLETED SUCCESSFULLY!
              </div>
              <div className="text-xl text-muted-foreground">
                You're officially a Shout-to-Swap legend! 🏆
              </div>
            </motion.div>

            {/* Pulsing border effect */}
            <motion.div
              animate={{ 
                boxShadow: [
                  '0 0 0 0 hsl(var(--neon-pink) / 0.7)',
                  '0 0 0 20px hsl(var(--neon-pink) / 0)',
                  '0 0 0 0 hsl(var(--neon-blue) / 0.7)',
                  '0 0 0 20px hsl(var(--neon-blue) / 0)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-neon-pink to-neon-blue"
            />

            {/* Close instruction */}
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-sm text-muted-foreground"
            >
              Click anywhere to continue the party! 🎪
            </motion.div>
          </motion.div>

          {/* Corner fireworks */}
          {[
            { top: '10%', left: '10%' },
            { top: '10%', right: '10%' },
            { bottom: '10%', left: '10%' },
            { bottom: '10%', right: '10%' }
          ].map((position, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ 
                scale: [0, 1, 0],
                rotate: [0, 180, 360]
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                delay: index * 0.5
              }}
              className="absolute text-4xl pointer-events-none"
              style={position}
            >
              🎆
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};