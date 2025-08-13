import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login.html'),
        loginStandalone: resolve(__dirname, 'login-standalone.html'),
        authCheck: resolve(__dirname, 'auth-check.html')
      }
    }
  },
  server: {
    open: true
  }
})
