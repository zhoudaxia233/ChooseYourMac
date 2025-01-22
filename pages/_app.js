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
      'ChooseYourMac is an intuitive, interactive tool designed to help budget-conscious users find their ideal Mac by analyzing storage and memory needs based on software and usage. It’s the easiest Mac buying guide to avoid overspending while ensuring optimal performance.',
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
