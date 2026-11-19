import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  if (command === 'build' && mode === 'production' && !env.VITE_API_URL?.trim()) {
    throw new Error('Set VITE_API_URL to the deployed API URL before building.')
  }

  return {
    plugins: [react()],
  }
})
