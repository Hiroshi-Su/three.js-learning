import { useEffect } from 'react'
import styled from 'styled-components'
import { OrbitTheEarth } from '@/plugins/orbitTheEarth'

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
`
const CanvasWrapper = styled.div`
  width: 100%;
  height: 100%;
`
const OrbitTheEarthComponents: React.FC = () => {
  const setThreeApp = () => {
    const wrapper = document.getElementById('webgl')
    if (wrapper) {
      const app = new OrbitTheEarth(wrapper)
      // await app.load()
      // app.load()
      // 初期化処理をコンストラクタから分離 @@@
      app.init()
      app.render()
    }
  }
  useEffect(() => {
    setThreeApp()
  }, [])
  return (
    <Wrapper>
      <CanvasWrapper id='webgl' />
    </Wrapper>
  )
}

export default OrbitTheEarthComponents
