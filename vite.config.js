import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' → GitHub Pages 프로젝트 페이지(/<repo>/)와 로컬 미리보기 모두에서 동작
export default defineConfig({
  plugins: [react()],
  base: './',
})
