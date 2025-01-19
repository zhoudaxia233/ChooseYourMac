import { appWithTranslation } from 'next-i18next'
import { ThemeProvider } from 'next-themes'
import '../styles/globals.css'
import LanguageSelector from '../components/LanguageSelector'
import { Toaster } from 'react-hot-toast'
import Head from 'next/head'

function getInitialLocale() {
  if (typeof window !== 'undefined') {
    const browserLang = navigator.language.split('-')[0]
    const supportedLocales = ['en', 'zh', 'ja']
    return supportedLocales.includes(browserLang) ? browserLang : 'en'
  }
  return 'en'
}

function MyApp({ Component, pageProps }) {
  // Base website schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Choose Your Mac',
    url: 'https://chooseyourmac.info',
    description:
      'The easiest MacBook buying guide for budget-conscious users. Find your perfect MacBook without overspending with our intuitive tools for storage and memory performance.',
  }

  return (
    <>
      <Head>
        <meta
          name="google-site-verification"
          content="SxusvZ7BGYRi-rn1CqZyVEouwZ9hUkjxfPa2K_u8gx0"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </Head>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <Toaster position="bottom-right" />
        <div className="fixed top-4 right-4 flex items-center gap-2 z-50">
          <LanguageSelector />
        </div>
        <Component {...pageProps} defaultLocale={getInitialLocale()} />
      </ThemeProvider>
    </>
  )
}

export default appWithTranslation(MyApp)
