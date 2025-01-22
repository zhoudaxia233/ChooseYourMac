import { useState, useEffect } from 'react'
import Head from 'next/head'
import Layout from '../components/Layout'
import HardDriveAnalysis from '../components/HardDriveAnalysis'
import MemoryAnalysis from '../components/MemoryAnalysis'
import { getDaysSinceDate } from '../utils/dateUtils'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [daysSinceUpdate, setDaysSinceUpdate] = useState(0)
  const [lastUpdatedUTC, setLastUpdatedUTC] = useState('')

  useEffect(() => {
    fetch('/api/last-updated')
      .then(response => response.json())
      .then(data => {
        setDaysSinceUpdate(getDaysSinceDate(data.lastUpdated))
        setLastUpdatedUTC(data.formattedUTC)
      })
      .catch(error => console.error('Error loading last update:', error))
  }, [])

  return (
    <>
      <Head>
        <title>ChooseYourMac - Storage & Memory Calculator</title>
        <meta
          name="description"
          content="ChooseYourMac is an intuitive, interactive tool designed to help budget-conscious users find their ideal Mac by analyzing storage and memory needs based on software and usage. It’s the easiest Mac buying guide to avoid overspending while ensuring optimal performance."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Layout daysSinceUpdate={daysSinceUpdate} lastUpdatedUTC={lastUpdatedUTC}>
        <HardDriveAnalysis searchQuery={searchQuery} />
        <MemoryAnalysis />
      </Layout>
    </>
  )
}

export async function getServerSideProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}
