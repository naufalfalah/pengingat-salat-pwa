import sharp from 'sharp'
import { readFileSync, mkdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root      = join(__dirname, '..')
const svg       = readFileSync(join(root, 'public', 'icon.svg'))

mkdirSync(join(root, 'public', 'icons'), { recursive: true })

await sharp(svg).resize(192, 192).png().toFile(join(root, 'public', 'icons', 'icon-192.png'))
console.log('✓ icon-192.png')

await sharp(svg).resize(512, 512).png().toFile(join(root, 'public', 'icons', 'icon-512.png'))
console.log('✓ icon-512.png')

// Juga ganti favicon.svg dengan icon yang sama
import { copyFileSync } from 'fs'
copyFileSync(join(root, 'public', 'icon.svg'), join(root, 'public', 'favicon.svg'))
console.log('✓ favicon.svg diperbarui')
