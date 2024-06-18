import { useEffect } from 'react'
import styled from 'styled-components'
import { RandomBoxGeometries } from '@/plugins/randomBoxGeometries'

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
`
const CanvasWrapper = styled.div`
  width: 100%;
  height: 100%;
`
const RandomBoxGeometriesComponents: React.FC = () => {
  useEffect(() => {
    const wrapper = document.getElementById('webgl')
    if (wrapper) {
      const app = new RandomBoxGeometries(wrapper)
      app.render()
    }
    // window.addEventListener(
    //   'DOMContentLoaded',
    //   () => {
    //     const wrapper = document.getElementById('webgl')
    //     if (wrapper) {
    //       // const app = new RandomBoxGeometries(wrapper)
    //       // app.render()
    //     }
    //   },
    //   false,
    // )
  }, [])
  return (
    <Wrapper>
      <CanvasWrapper id='webgl' />
    </Wrapper>
  )
}

export default RandomBoxGeometriesComponents
