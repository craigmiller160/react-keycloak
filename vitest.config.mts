import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
	plugins: [react()],
	test: {
		watch: false,
		environment: 'jsdom',
		setupFiles: './test/setup.ts'
	}
});
