import { useEffect } from 'react'
import styled from 'styled-components'
import RaycasterEffect from '@/plugins/raycasterEffect'

const Wrapper = styled.div`
  width: 100vw;
  height: 100vh;
`
const CanvasWrapper = styled.div`
  width: 100%;
  height: 100%;
`
const RaycasterEffectComponents: React.FC = () => {
  const setThreeApp = () => {
    const wrapper = document.getElementById('canvas')
    if (wrapper) {
      const app = new RaycasterEffect(wrapper)
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
      <CanvasWrapper id='canvas' />
    </Wrapper>
  )
}

export default RaycasterEffectComponents
