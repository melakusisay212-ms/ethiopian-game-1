import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// Bundles everything (code, styles, images) into one dist/index.html
// so the downloaded build opens by double-click, offline, or on a phone.
export default defineConfig({ base: './', plugins: [viteSingleFile()] });
