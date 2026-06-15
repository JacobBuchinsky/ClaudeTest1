import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` MUST match the repo name so assets resolve at
// https://jacobbuchinsky.github.io/ClaudeTest1/
export default defineConfig({
  plugins: [react()],
  base: '/ClaudeTest1/',
})