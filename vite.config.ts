import { defineConfig } from 'vite'
import { resolve, dirname } from 'node:path'
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import swc from 'vite-plugin-swc-transform'
import tailwindcss from '@tailwindcss/vite'
import dts from 'vite-plugin-dts'

const __dirname = dirname(fileURLToPath(import.meta.url))
const componentsDir = resolve(__dirname, 'src/components')
const componentEntries = Object.fromEntries(
  readdirSync(componentsDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => [d.name, resolve(componentsDir, d.name, 'index.ts')])
)
const reactDir = resolve(__dirname, 'src/react')
const reactEntries = Object.fromEntries(
  readdirSync(reactDir, { withFileTypes: true })
    .filter((d) => d.isFile() && d.name.endsWith('.ts') && d.name !== 'index.ts')
    .map((d) => [`react/${d.name.replace('.ts', '')}`, resolve(reactDir, d.name)])
)

const libEntries = {
  'web-components': resolve(__dirname, 'src/index.ts'),
  ...componentEntries,
  react: resolve(__dirname, 'src/react/index.ts'),
  ...reactEntries,
}

export default defineConfig(({ command }) => ({
  plugins: [
    tailwindcss(),
    // SWC transforms .ts with legacy decorators so Lit @customElement/@property work in dev and build
    swc({
      swcOptions: {
        jsc: {
          target: 'es2022',
          parser: { syntax: 'typescript', decorators: true, decoratorsBeforeExport: true },
          transform: {
            legacyDecorator: true,
            useDefineForClassFields: false,
          },
        },
      },
    }),
    ...(command === 'build'
      ? [
          dts({
            include: ['src'],
            exclude: ['src/demo.ts'],
            outDir: 'dist',
          }),
        ]
      : []),
  ],
  // Only use library build when running `vite build`; dev serves as normal app so .ts is transformed
  ...(command === 'build'
    ? {
        build: {
          lib: {
            entry: libEntries,
            name: 'WebComponents',
            fileName: (_, entryName) => `${entryName}.js`,
            formats: ['es'],
          },
          rollupOptions: {
            external: ['lit', /^lit\//, 'react', '@lit/react'],
          },
        },
      }
    : {
        optimizeDeps: {
          include: ['lit', 'lit/decorators.js'],
        },
      }),
}))
