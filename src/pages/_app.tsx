import React from 'react'
import type { AppProps } from 'next/app'
import '../styles/globals.css'
import { GoogleTagManager } from '@/lib/gtag'
// GoogleAnalytics,
import ScrollProvider from '@/lib/modules/scrollProvider'

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <GoogleTagManager />
      {/* GAのみ使いたいとき： <GoogleAnalytics /> */}
      <ScrollProvider>
        <Component {...pageProps} />
      </ScrollProvider>
    </>
  )
}

export default MyApp
