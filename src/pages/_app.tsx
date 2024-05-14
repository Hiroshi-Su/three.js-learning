import React from 'react'
import type { AppProps } from 'next/app'
import '../styles/globals.css'
import { GoogleTagManager } from '@/lib/gtag'
// GoogleAnalytics,

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return (
    <>
      <GoogleTagManager />
      {/* GAのみ使いたいとき： <GoogleAnalytics /> */}
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
