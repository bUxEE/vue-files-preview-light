import path from 'node:path'
import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import AutoImport from 'unplugin-auto-import/vite'
import {copyPackageJsonPlugin} from './vite-plugins/copy.plugin'

const pathSrc = path.resolve(__dirname, 'src')
const pathPackages = path.resolve(__dirname, 'packages')

// Vite configuration
export default defineConfig({
    resolve: {
        alias: {
            '@src': pathSrc,
            '@packages': pathPackages,
        },
    },
    plugins: [
        vue(),
        dts({
            insertTypesEntry: true,
            outDir: 'dist/types',
            include: ['./packages/**/*.ts', './packages/**/*.tsx', './packages/**/*.vue'], // Add this line
            tsconfigPath: './tsconfig.json', // Explicitly specify tsconfig file path
        }),
        copyPackageJsonPlugin(),
        AutoImport({
            imports: [
                'vue',
                {
                    '@vueuse/core': [
                        'onKeyStroke',
                    ],
                },
            ],
            dts: path.resolve(pathPackages, 'auto-imports.d.ts'),
        }),
    ],
    build: {
        sourcemap: true,
        lib: {
            name: 'vue-files-preview',
            entry: './packages/index.ts',
        },
        commonjsOptions: {
            esmExternals: true,
        },
        rollupOptions: {
            external: ['vue'],
            output: [
                {
                    globals: {
                        vue: 'Vue',
                    },
                    // Build format
                    format: 'es',
                    // Output file name
                    entryFileNames: '[name].mjs',
                    // Keep build directory structure matching our directory
                    preserveModules: true,
                    exports: 'auto',
                    // Configure build root directory
                    dir: './dist/es',
                },
                {
                    globals: {
                        vue: 'Vue',
                    },
                    // Build format
                    format: 'cjs',
                    // Output file name
                    entryFileNames: '[name].js',
                    // Keep build directory structure matching our directory
                    preserveModules: true,
                    exports: 'auto',
                    // Configure build root directory
                    dir: './dist/lib',
                },
            ],
        },
        minify: true,
    },
})
