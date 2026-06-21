import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'https://apna-white-board-backend-server.onrender.com',
      '/socket.io': { target: 'https://apna-white-board-backend-server.onrender.com', ws: true },
    },
  },
})
