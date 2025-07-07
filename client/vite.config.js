import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "path"
import { writeFileSync, copyFileSync, mkdirSync, existsSync, readFileSync } from "fs"
import { readdirSync } from "fs"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-extension-files',
      writeBundle() {
        // Create icons directory if it doesn't exist
        if (!existsSync('dist/icons')) {
          mkdirSync('dist/icons', { recursive: true })
        }

        // Copy manifest.json
        if (existsSync('manifest.json')) {
          copyFileSync('manifest.json', 'dist/manifest.json')
        }
        
        // Copy icons if they exist
        const iconSizes = ['16', '32', '48', '128']
        iconSizes.forEach(size => {
          const iconPath = `icons/icon${size}.png`
          if (existsSync(iconPath)) {
            copyFileSync(iconPath, `dist/icons/icon${size}.png`)
          }
        })

        // Find the CSS file and update HTML files
        const cssFile = Array.from(existsSync('dist/assets') ? readdirSync('dist/assets') : [])
          .find(file => file.endsWith('.css'))
        
        if (cssFile) {
          // Update popup.html
          let popupHtml = readFileSync('popup.html', 'utf-8')
          popupHtml = popupHtml.replace(
            /<link rel="stylesheet" href="[^"]*"/,
            `<link rel="stylesheet" href="./assets/${cssFile}"`
          )
          writeFileSync('dist/popup.html', popupHtml)

          // Update dashboard.html
          let dashboardHtml = readFileSync('dashboard.html', 'utf-8')
          dashboardHtml = dashboardHtml.replace(
            /<link rel="stylesheet" href="[^"]*"/,
            `<link rel="stylesheet" href="./assets/${cssFile}"`
          )
          writeFileSync('dist/dashboard.html', dashboardHtml)
        } else {
          // Fallback: copy HTML files as-is
          if (existsSync('popup.html')) {
            copyFileSync('popup.html', 'dist/popup.html')
          }
          if (existsSync('dashboard.html')) {
            copyFileSync('dashboard.html', 'dist/dashboard.html')
          }
        }
      }
    }
  ],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        dashboard: resolve(__dirname, "src/main.tsx"),
        popup: resolve(__dirname, "src/popup.tsx"),
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name].[hash].js",
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return "assets/[name].[hash].css"
          }
          return "assets/[name].[hash][extname]"
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
})
