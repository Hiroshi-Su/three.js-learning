import { useEffect, useState } from 'react'

const useWindowResize = () => {
  const [windowSize, setWindowSize] = useState<{
    width: number
    height: number
  }>({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // iOS Safariでスクロールしただけでリサイズイベントが発生する問題
    // https://qiita.com/tonkotsuboy_com/items/d32ec6e7a1f6f592d415
    // const { userAgent } = navigator
    // if (
    //   userAgent.indexOf('iPhone') >= 0 ||
    //   userAgent.indexOf('iPad') >= 0 ||
    //   userAgent.indexOf('Android') >= 0
    // ) {
    //   window.addEventListener('orientationchange', handleResize)
    // } else
    window.addEventListener('resize', handleResize)
    handleResize()

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return windowSize
}

export default useWindowResize
