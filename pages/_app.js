import { appWithTranslation } from 'next-i18next'
import { ThemeProvider } from 'next-themes'
import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'
import Head from 'next/head'

function MyApp({ Component, pageProps }) {
  // Base website schema
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Choose Your Mac',
    url: 'https://chooseyourmac.info',
    description:
      'The easiest Mac buying guide for budget-conscious users. Find your perfect Mac without overspending with our intuitive tools for storage and memory performance analysis.',
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
        <Component {...pageProps} />
      </ThemeProvider>
    </>
  )
}

export default appWithTranslation(MyApp)
