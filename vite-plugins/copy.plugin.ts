import {copyFileSync, writeFileSync} from 'node:fs'
import {join} from 'node:path'
import type {Plugin} from 'vite'

export function copyPackageJsonPlugin(): Plugin {
    return {
        name: 'copy-package-json',
        closeBundle() {
            try {
                const packageJson = require('../package.json')
                const distPackageJson = {
                    name: packageJson.name,
                    version: packageJson.version,
                    main: './es/packages/index.mjs',
                    module: './es/packages/index.mjs',
                    types: './types/index.d.ts',
                    exports: {
                        '.': {
                            types: './types/index.d.ts',
                            import: './es/packages/index.mjs',
                            require: './lib/packages/index.js',
                        },
                        './es': {
                            types: './types/index.d.ts',
                            import: './es/packages/index.mjs',
                        },
                        './lib': {
                            types: './types/index.d.ts',
                            require: './lib/packages/index.js',
                        },
                        './es/packages/*.mjs': {
                            types: './types/*.d.ts',
                            import: './es/packages/*.mjs',
                        },
                        './lib/packages/*.js': {
                            types: './types/*.d.ts',
                            require: './lib/packages/*.js',
                        },
                        './es/packages/*': {
                            types: [
                                './types/*.d.ts',
                                './types/index.d.ts',
                            ],
                            import: './es/packages/*.mjs',
                        },
                        './lib/packages/version.js': {
                            types: './types/version.d.ts',
                            require: './lib/packages/version.js',
                        },
                        './es/packages/version.mjs': {
                            types: [
                                './types/version.d.ts',
                            ],
                            import: './es/packages/version.mjs',
                        },
                        './*': './*',
                    },
                    peerDependencies: packageJson.peerDependencies,
                    description: packageJson.description,
                    keywords: packageJson.keywords,
                    author: packageJson.author,
                    contributors: packageJson.contributors,
                    license: packageJson.license,
                    repository: packageJson.repository,
                    bugs: packageJson.bugs,
                    homepage: packageJson.homepage,
                }

                // Write distPackageJson to dist directory
                writeFileSync(join(__dirname, '../dist', 'package.json'), JSON.stringify(distPackageJson, null, 2))
                console.log('package.json copied and modified successfully!')

                // If needed, can copy README.md and other files to dist directory
                copyFileSync(join(__dirname, '../README.md'), join(__dirname, '../dist', 'README.md'))
            } catch (error) {
                console.error('Error while copying and modifying package.json:', error)
            }
        },
    }
}
