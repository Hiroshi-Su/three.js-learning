import type { NextPage } from 'next'
import { useEffect } from 'react'
import styled from 'styled-components'
import { ThreeApp } from '@/plugins/randomBoxGeometries'

const Page = styled.div`
  width: 100vw;
  height: 100vh;
`
const Inner = styled.div`
  width: 100%;
  height: 100%;
`
const CanvasWrapper = styled.div`
  width: 100%;
  height: 100%;
`

const Home: NextPage = () => {
  useEffect(() => {
    const wrapper = document.getElementById('webgl')
    if (wrapper) {
      const app = new ThreeApp(wrapper)
      app.render()
    }
    // window.addEventListener(
    //   'DOMContentLoaded',
    //   () => {
    //     const wrapper = document.getElementById('webgl')
    //     if (wrapper) {
    //       // const app = new ThreeApp(wrapper)
    //       // app.render()
    //     }
    //   },
    //   false,
    // )
  }, [])
  return (
    <Page>
      <Inner>
        <CanvasWrapper id='webgl' />
      </Inner>
    </Page>
  )
}

export default Home
