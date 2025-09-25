import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface ShoutDetectorProps {
  onShoutDetected: (voicePercentage: number) => void;
  disabled?: boolean;
}

export const ShoutDetector = ({ onShoutDetected, disabled }: ShoutDetectorProps) => {
  const [isListening, setIsListening] = useState(false);
  const [volume, setVolume] = useState(0);
  const [shoutDetected, setShoutDetected] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number>();

  const SHOUT_THRESHOLD = 0.3; // Adjust this value to change sensitivity

  console.log('🎤 ShoutDetector rendered:', { isListening, volume, shoutDetected, disabled });

  const startListening = useCallback(async () => {
    console.log('🎤 Starting to listen for voice...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone access granted');
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      setIsListening(true);
      console.log('🎧 Audio analysis started');
      
      const checkVolume = () => {
        if (!analyserRef.current) return;
        
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((sum, value) => sum + value, 0) / bufferLength;
        const normalizedVolume = average / 255;
        
        setVolume(normalizedVolume);
        
        if (normalizedVolume > SHOUT_THRESHOLD && !shoutDetected) {
          console.log('🎉 SHOUT DETECTED!', { 
            normalizedVolume, 
            threshold: SHOUT_THRESHOLD, 
            percentage: Math.round(normalizedVolume * 100) + '%' 
          });
          setShoutDetected(true);
          setIsListening(false);
          onShoutDetected(normalizedVolume);
          
          // Stop the audio context
          stream.getTracks().forEach(track => track.stop());
          audioContext.close();
          console.log('🛑 Audio analysis stopped');
          return;
        }
        
        animationRef.current = requestAnimationFrame(checkVolume);
      };
      
      checkVolume();
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  }, [onShoutDetected, shoutDetected]);

  const stopListening = () => {
    setIsListening(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  };

  const reset = () => {
    setShoutDetected(false);
    setVolume(0);
    stopListening();
  };

  return (
    <div className="flex flex-col items-center space-y-6">
      <h2 className="text-3xl font-bold gradient-text">SHOUT TO SWAP! 🎤</h2>
      
      <div className="text-center">
        <p className="text-lg text-muted-foreground mb-4">
          Shout loud enough to activate the swap!
        </p>
        <p className="text-sm text-muted-foreground">
          Threshold: {Math.round(SHOUT_THRESHOLD * 100)}%
        </p>
      </div>

      {/* Volume Meter */}
      <div className="w-64 h-8 bg-muted rounded-lg overflow-hidden arcade-border">
        <motion.div
          className="h-full bg-gradient-to-r from-neon-green via-neon-yellow to-neon-pink"
          style={{ width: `${volume * 100}%` }}
          animate={{ 
            boxShadow: volume > SHOUT_THRESHOLD 
              ? '0 0 20px hsl(var(--neon-pink))' 
              : '0 0 5px hsl(var(--neon-blue))' 
          }}
        />
      </div>

      {/* Volume Percentage */}
      <div className="text-2xl font-bold">
        {isListening ? `${Math.round(volume * 100)}%` : '0%'}
      </div>

      {/* Microphone Animation */}
      <motion.div
        animate={{ 
          scale: isListening ? [1, 1.2, 1] : 1,
          rotate: isListening ? [0, 5, -5, 0] : 0
        }}
        transition={{ 
          duration: 0.5, 
          repeat: isListening ? Infinity : 0 
        }}
        className={`text-8xl ${shoutDetected ? 'animate-flash' : ''}`}
      >
        🎤
      </motion.div>

      {/* Control Buttons */}
      <div className="flex space-x-4">
        {!isListening && !shoutDetected && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={startListening}
              disabled={disabled}
              className="bg-gradient-to-r from-neon-blue to-neon-purple text-foreground font-bold py-4 px-8 text-lg arcade-border hover:animate-pulse disabled:opacity-50"
            >
              🎤 START LISTENING
            </Button>
          </motion.div>
        )}

        {isListening && (
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={stopListening}
              className="bg-gradient-to-r from-neon-orange to-neon-pink text-foreground font-bold py-4 px-8 text-lg arcade-border animate-pulse"
            >
              🛑 STOP
            </Button>
          </motion.div>
        )}

        {shoutDetected && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="text-center"
          >
            <div className="text-3xl font-bold gradient-text animate-flash mb-4">
              SHOUT DETECTED! 🎉
            </div>
            <Button
              onClick={reset}
              className="bg-gradient-to-r from-neon-green to-neon-blue text-foreground font-bold py-2 px-4 text-sm arcade-border"
            >
              🔄 RESET
            </Button>
          </motion.div>
        )}
      </div>

      {volume > SHOUT_THRESHOLD && isListening && (
        <motion.div
          animate={{ scale: [1, 1.5, 1], rotate: [0, 10, -10, 0] }}
          transition={{ duration: 0.3, repeat: Infinity }}
          className="text-4xl font-bold gradient-text animate-flash"
        >
          YEAHHHHH! 🔥
        </motion.div>
      )}
    </div>
  );
};