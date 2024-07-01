import React, { useEffect, useState, useCallback, useRef } from 'react'
import Lenis from 'lenis'
import { useRouter } from 'next/router'
import useWindowResize from '@/lib/hooks/handleWindowResize'

type Props = {
  children: React.ReactNode
}

export const ScrollBarContext = React.createContext<Lenis | null>(null)

export const ScrollProvider: React.FC<Props> = ({ children }) => {
  const scrollWrapper = useRef<HTMLDivElement | null>(null)
  const router = useRouter()
  const [LenisInstance, setLenisInstance] = useState<Lenis | null>(null)
  const screenSize = useWindowResize()

  // const setScrollElement = useSetRecoilState<HTMLDivElement>(scrollElementState)
  // const setScrolledToTopState = useSetRecoilState<boolean>(scrolledToTopState)

  // const [scrollEl, setScrollElement] = useState<HTMLDivElement>()

  // useEffect(() => {
  //   if (scrollWrapper.current) {
  //     setScrollElement(scrollWrapper.current)
  //   }
  // })

  const raf = useCallback(
    (time: number) => {
      LenisInstance?.raf(time)
      requestAnimationFrame(raf)
    },
    [LenisInstance],
  )

  useEffect(() => {
    if (screenSize.width > 768) {
      if (!LenisInstance) {
        setLenisInstance(new Lenis({ lerp: 0.18, duration: 2 }))
      }
      requestAnimationFrame(raf)
      return () => {
        LenisInstance?.destroy()
      }
    }
  }, [LenisInstance, raf, screenSize.width])

  // ルート変更時のスクロール位置リセット
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (LenisInstance) {
        // const targetElement = document.getElementById(`top`)
        // if (targetElement) {
        //   const targetOffsetTop =
        //     window.scrollY + targetElement.getBoundingClientRect().top
        //   console.log(targetOffsetTop, 'targetOffsetTop')
        //   // LenisInstance.scrollTo(0, { immediate: true })
        //   window.scrollTo({
        //     top: targetOffsetTop,
        //     behavior: 'instant',
        //   })
        //   // setTimeout(() => {
        //   //   setScrolledToTopState(true)
        //   // }, 500)
        // }
      }

      if (url !== router.asPath) {
        if (url !== '/') {
          if (screenSize.width <= 768) {
            const scrollTarget = document.getElementById('scroll-wrapper')
            if (scrollTarget) {
              scrollTarget.scrollTop = 0
            }
          }
        }
      }
    }

    // if (router.route === '/') {
    //   handleRouteChange()
    // }

    router.events.on('routeChangeComplete', url => handleRouteChange(url))

    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router, router.events, LenisInstance])

  useEffect(() => {
    const doc = document.documentElement
    doc.style.setProperty('--vh', `${screenSize.height}px`)
  }, [screenSize.height])

  return (
    <>
      <ScrollBarContext.Provider value={LenisInstance}>
        <div id='scroll-wrapper' ref={scrollWrapper} className='scroll-wrapper'>
          {children}
        </div>
      </ScrollBarContext.Provider>
      <style jsx>
        {`
          .scroll-wrapper {
            width: 100%;
            height: auto;
            position: relative;
            scroll-behavior: auto;
          }
        `}
      </style>
    </>
  )
}

export default ScrollProvider
