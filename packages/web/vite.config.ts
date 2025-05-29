import tailwindcss from '@tailwindcss/vite';
import viteReact from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import tsConfigPaths from 'vite-tsconfig-paths';

// https://vite.dev/config/
export default defineConfig({
	server: {
		proxy: {
			'/api': {
				secure: false,
				changeOrigin: true,
				target: 'http://localhost:8001',
			},
			'/auth': {
				secure: false,
				changeOrigin: true,
				target: 'http://localhost:8001',
			},
		},
	},
	plugins: [
		viteReact({
			babel: {
				plugins: [['babel-plugin-react-compiler']],
			},
		}),
		tailwindcss(),
		tsConfigPaths(),
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
});
