// Simple test to verify environment variable loading
import { config } from 'dotenv';

// Load environment variables
config();

console.log('Environment Variables Test:');
console.log('VITE_CODEX_API_KEY:', process.env.VITE_CODEX_API_KEY ? `${process.env.VITE_CODEX_API_KEY.slice(0, 8)}...` : 'undefined');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MODE:', process.env.MODE);
