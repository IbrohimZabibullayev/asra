import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
    // Load env file based on `mode` in the current working directory.
    // Set the third parameter to '' to load all envs regardless of the `VITE_` prefix.
    const env = loadEnv(mode, process.cwd(), '');
    const apiUrl = env.VITE_API_URL || 'http://127.0.0.1:3001';

    return {
        plugins: [react()],
        server: {
            port: 5173,
            proxy: {
                '/api': {
                    target: apiUrl,
                    changeOrigin: true
                },
                '/uploads': {
                    target: apiUrl,
                    changeOrigin: true
                }
            }
        }
    }
})
