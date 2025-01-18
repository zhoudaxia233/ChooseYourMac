import { appWithTranslation } from 'next-i18next'
import { ThemeProvider } from 'next-themes'
import '../styles/globals.css'
import LanguageSelector from '../components/LanguageSelector'
import { Toaster } from 'react-hot-toast'

function getInitialLocale() {
  if (typeof window !== 'undefined') {
    const browserLang = navigator.language.split('-')[0]
    const supportedLocales = ['en', 'zh', 'ja']
    return supportedLocales.includes(browserLang) ? browserLang : 'en'
  }
  return 'en'
}

function MyApp({ Component, pageProps }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <Toaster position="bottom-right" />
      <div className="fixed top-4 right-4 flex items-center gap-2 z-50">
        <LanguageSelector />
      </div>
      <Component {...pageProps} defaultLocale={getInitialLocale()} />
    </ThemeProvider>
  )
}

export default appWithTranslation(MyApp)
