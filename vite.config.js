import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 如果部署在 GitHub Pages (例如 username.github.io/repo-name/)
  // 請將 base 改為 './' 或 '/repo-name/' 
  // 這能解決發佈後找不到 JS/CSS 的 404 問題
  base: './', 
})
