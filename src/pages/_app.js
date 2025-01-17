import { appWithTranslation } from 'next-i18next'
import { ThemeProvider } from 'next-themes'
import '../styles/globals.css'
import LanguageSelector from '../components/LanguageSelector'

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="flex items-center gap-2 fixed top-4 right-4">
        <LanguageSelector />
        {/* Your existing theme toggle button */}
      </div>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default appWithTranslation(MyApp)
