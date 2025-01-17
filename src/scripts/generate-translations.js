import { translations } from '../i18n/source.js'
import fs from 'fs'
import path from 'path'

const languages = ['en', 'zh', 'ja']

// Generate JSON files for each language
languages.forEach(lang => {
  const content = {}

  // Convert the source format to flat JSON
  Object.entries(translations).forEach(([key, value]) => {
    if (key !== '_desc') {
      content[key] = value[lang]
    }
  })

  // Write to file
  const dir = path.join(process.cwd(), 'public', 'locales', lang)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(
    path.join(dir, 'common.json'),
    JSON.stringify(content, null, 2)
  )
})
