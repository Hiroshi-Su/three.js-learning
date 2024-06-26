import { useEffect } from 'react'
import styled from 'styled-components'
import { RotateAsGroup } from '@/plugins/rotateAsGroup'

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
`
const CanvasWrapper = styled.div`
  width: 100%;
  height: 100%;
`
const RotateAsGroupComponents: React.FC = () => {
  useEffect(() => {
    const wrapper = document.getElementById('webgl')
    if (wrapper) {
      const app = new RotateAsGroup(wrapper)
      app.render()
    }
  }, [])
  return (
    <Wrapper>
      <CanvasWrapper id='webgl' />
    </Wrapper>
  )
}

export default RotateAsGroupComponents
