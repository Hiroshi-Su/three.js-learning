import type { NextPage } from 'next'
// import { useEffect } from 'react'
import styled from 'styled-components'
// import RandomBoxGeometriesComponents from '@/components/randomBoxGeometriesComponents'
// import RotateAsGroupComponents from '@/components/rotateAsGroupComponent'
import OrbitTheEarthComponents from '@/components/orbitTheEarthComponents'

const Page = styled.div`
  width: 100vw;
  height: 100vh;
`
const Inner = styled.div`
  width: 100%;
  height: 100%;
`
// const CanvasWrapper = styled.div`
//   width: 100%;
//   height: 100%;
// `

const Home: NextPage = () => {
  return (
    <Page>
      <Inner>
        {/* <RandomBoxGeometriesComponents /> */}
        {/* <RotateAsGroupComponents /> */}
        <OrbitTheEarthComponents />
      </Inner>
    </Page>
  )
}

export default Home
