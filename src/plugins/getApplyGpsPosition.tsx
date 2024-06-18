import { GetGeoUtil } from '@/plugins/getGeoUtil'
import { Object3D } from 'three'

/**
 * 座標を更新します。
 *
 * @param object3d 座標を変更したい3Dオブジェクト
 * @param coords 緯度（度数法）・ 経度（度数法）・半径を格納したオブジェクト
 */
export const getApplyGpsPosition = (
  object3d: Object3D,
  coords: { latitude: number; longitude: number; radius: number },
): void => {
  const position = GetGeoUtil.translateGeoCoords(
    coords.latitude,
    coords.longitude,
    coords.radius,
  )
  object3d.position.copy(position)
}

export default getApplyGpsPosition
