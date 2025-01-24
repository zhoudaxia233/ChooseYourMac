import fs from 'fs'
import path from 'path'
import { promisify } from 'util'

const writeFile = promisify(fs.writeFile)

async function main() {
  const publicDir = path.join(process.cwd(), 'public')
  const jsonFiles = fs
    .readdirSync(publicDir)
    .filter(file => file.endsWith('.json'))
    .map(file => path.join(publicDir, file))

  const mtimes = jsonFiles.reduce((acc, file) => {
    const stats = fs.statSync(file)
    acc[path.basename(file)] = stats.mtime.toISOString()
    return acc
  }, {})

  const output = {
    generatedAt: new Date().toISOString(),
    latestUpdate: Math.max(
      ...Object.values(mtimes).map(d => new Date(d).getTime())
    ),
    files: mtimes,
  }

  await writeFile(
    path.join(publicDir, 'meta.json'),
    JSON.stringify(output, null, 2)
  )
}

main().catch(console.error)
