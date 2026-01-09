import { defineConfig } from 'vite'

export default defineConfig({
  // Ensure we can import JSON from outside src if needed, 
  // though standard Vite supports this.
  resolve: {
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json']
  },
  server: {
    open: false
  }
})
