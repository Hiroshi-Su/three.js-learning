import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import earthTextureImg from '@/assets/img/earth.jpg'
import moonTextureImg from '@/assets/img/moon.jpg'
import earthLightsTextureImg from '@/assets/img/earth-lights.jpg'
import earthCloudsTextureImg from '@/assets/img/earth-clouds.jpg'
import moonBumpTextureImg from '@/assets/img/moon-bump.jpg'
import earthBumpTextureImg from '@/assets/img/earth-bump.jpg'

import getFresnelMat from './getFresnelMat'
// import { getDestinationPoints } from '@/plugins/getDestinationPoints'
// import { getApplyGpsPosition } from './getApplyGpsPosition'

export class OrbitTheEarth {
  render: () => void

  // load: () => void

  init: () => void

  wrapper // canvas の親要素

  /**
   * コンストラクタ
   * @constructor
   * @param {HTMLElement} wrapper - canvas 要素を append する親要素
   */
  constructor(wrapper: HTMLElement) {
    /**
     * 月に掛けるスケール @@@
     */
    const MOON_SCALE = 0.27
    /**
     * 月と地球の間の距離 @@@
     */
    const MOON_DISTANCE = 3.0
    /**
     * カメラ定義のための定数
     */
    const CAMERA_PARAM = {
      fovy: 60,
      aspect: window.innerWidth / window.innerHeight,
      near: 0.1,
      far: 50.0,
      position: new THREE.Vector3(0.0, 1.0, 3.0),
      lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    }
    /**
     * レンダラー定義のための定数
     */
    const RENDERER_PARAM = {
      clearColor: 0x000000,
      width: window.innerWidth,
      height: window.innerHeight,
    }
    /**
     * 平行光源定義のための定数
     */
    // const DIRECTIONAL_LIGHT_PARAM = {
    //   color: 0xffffff,
    //   intensity: 1.0,
    //   position: new THREE.Vector3(1.0, 1.0, 1.0),
    // }
    /**
     * アンビエントライト定義のための定数
     */
    // const AMBIENT_LIGHT_PARAM = {
    //   color: 0xffffff,
    //   intensity: 0.3,
    // }
    /**
     * マテリアル定義のための定数
     */
    // const MATERIAL_PARAM = {
    //   color: 0xffffff,
    // }
    /**
     * フォグの定義のための定数
     */
    const FOG_PARAM = {
      color: 0xffffff,
      near: 10.0,
      far: 20.0,
    }
    /**
     * 人工衛星の移動速度 @@@
     */
    const SATELLITE_SPEED = 0.0095
    /**
     * 人工衛星の曲がる力 @@@
     */
    const SATELLITE_TURN_SCALE = 0.05
    /**
     * 旅客機と地球の間の距離 @@@
     */
    const PLANE_DISTANCE = 0.55
    /**
     * 旅客機の移動速度 @@@
     */
    const PLANE_SPEED = 0.008
    /**
     * 旅客機の曲がる力 @@@
     */
    const PLANE_TURN_SCALE = 0.05

    /**
     * 人工衛星と地球の間の距離 @@@
     */
    const ARTIFICIAL_SATELLITE_DISTANCE = 0.8
    /**
     * 人工衛星の移動速度 @@@
     */
    // const ArtificialSatellite_SPEED = 0.05
    /**
     * 人工衛星の曲がる力 @@@
     */
    // const ArtificialSatellite_TURN_SCALE = 0.08

    // 初期化時に canvas を append できるようにプロパティに保持
    this.wrapper = wrapper

    let renderer: THREE.WebGLRenderer // レンダラ
    let scene: THREE.Scene // シーン
    let camera: THREE.PerspectiveCamera // カメラ
    // let directionalLight: THREE.DirectionalLight // 平行光源（ディレクショナルライト）
    // let ambientLight: THREE.AmbientLight // 環境光（アンビエントライト）
    let controls: OrbitControls // オービットコントロール
    // let axesHelper: THREE.AxesHelper // 軸ヘルパー
    let isDown: boolean // キーの押下状態用フラグ
    let sphereGeometry: THREE.SphereGeometry // ジオメトリ
    // let sphereGeometry: THREE.IcosahedronGeometry // ジオメトリ
    let earth: THREE.Mesh // 地球
    let earthMaterial: THREE.MeshPhongMaterial // 地球用マテリアル
    // let earthMaterial: THREE.MeshStandardMaterial
    let earthTexture: THREE.Texture // 地球用テクスチャ
    let moon: THREE.Mesh // 月
    let moonMaterial: THREE.MeshPhongMaterial // 月用マテリアル
    let moonTexture: THREE.Texture // 月用テクスチャ
    let moonBumpTexture: THREE.Texture // 月面用テクスチャ
    let clock: THREE.Clock
    let satellite: THREE.Mesh // 人工衛星 @@@
    let satelliteMaterial: THREE.MeshBasicMaterial // 人工衛星用マテリアル @@@
    let satelliteDirection: THREE.Vector3 // 人工衛星の進行方向 @@@
    let plane: THREE.Mesh // 旅客機 @@@
    let coneGeometry: THREE.ConeGeometry // 旅客機用メッシュ
    let planeMaterial: THREE.MeshPhongMaterial // 旅客機用マテリアル @@@
    let planeDirection: THREE.Vector3 // 旅客機の進行方向 @@@
    let startFly: THREE.Vector3
    let endLand: THREE.Vector3
    let lightMesh: THREE.Mesh // 夜景
    let lightMat: THREE.MeshBasicMaterial // 夜景のマテリアル
    let earthLightsTexture: THREE.Texture // 地球夜景用テクスチャ
    let earthBumpTexture: THREE.Texture // 地球表面用テクスチャ
    let cloudsMesh: THREE.Mesh // 雲
    let cloudsMat: THREE.MeshStandardMaterial // 雲のマテリアル
    let earthCloudsTexture: THREE.Texture // 地球雲用テクスチャ
    let fresnelMesh: THREE.Mesh // 大気圏
    let artificialSatellite: THREE.Mesh // 人工衛星 @@@
    let artificialSatelliteMaterial: THREE.MeshBasicMaterial // 人工衛星用マテリアル @@@
    // let artificialSatelliteDirection: THREE.Vector3 // 人工衛星の進行方向 @@@
    let artificialSatelliteGroup: THREE.Group // 人工衛星用グループ
    // let startFly2: THREE.Vector3
    // let endLand2: THREE.Vector3
    let starGroup: THREE.Group
    let satellite2: THREE.Mesh // 人工衛星 @@@
    let satelliteMaterial2: THREE.MeshBasicMaterial // 人工衛星用マテリアル @@@
    let satelliteDirection2: THREE.Vector3 // 人工衛星の進行方向 @@@
    let japanPoint: THREE.Mesh
    let cityPoint: THREE.Mesh
    // let cityPoint0: THREE.Mesh
    let earthGroup: THREE.Group
    let earthGroupLarge: THREE.Group
    let cityX: number
    let cityY: number
    let cityZ: number
    let phi: number
    let theta: number

    const radius = 0.5

    // 主要都市緯度経度一覧
    const citiesPoints: [number, number][] = [
      [51.2838, 0], // イギリス
      [39, -116], // 北京
      [34, 118], // ロサンゼルス
      [-33, 151], // シドニー
      [-23, -46], // サンパウロ
      [1, 103], // シンガポール
      [90, 0], // 北極
      [-90, 0], // 南極
    ]

    // キーの押下や離す操作を検出できるようにする
    window.addEventListener(
      'keydown',
      keyEvent => {
        switch (keyEvent.key) {
          case ' ':
            isDown = true
            break
          default:
        }
      },
      false,
    )
    window.addEventListener(
      'keyup',
      () => {
        isDown = false
      },
      false,
    )

    // // マウスカーソルの動きを検出できるようにする @@@
    // window.addEventListener(
    //   'pointermove',
    //   pointerEvent => {
    //     // ポインター（マウスカーソル）のクライアント領域上の座標
    //     const pointerX = pointerEvent.clientX
    //     const pointerY = pointerEvent.clientY
    //     // 3D のワールド空間に合わせてスケールを揃える
    //     const scaleX = (pointerX / window.innerWidth) * 2.0 - 1.0
    //     const scaleY = (pointerY / window.innerHeight) * 2.0 - 1.0

    //     // ベクトルを単位化する @@@
    //     const vector = new THREE.Vector2(scaleX, scaleY)
    //     // ノーマライズ（単位化）
    //     vector.normalize()

    //     // スケールを揃えた値を月の座標に割り当てる
    //     // スクリーン空間のピクセル単位の座標が
    //     // 原点がスクリーンの中心にあり、-1.0 ～ 1.0 の範囲に変換
    //     moon.position.set(
    //       vector.x * MOON_DISTANCE,
    //       0.0,
    //       vector.y * MOON_DISTANCE,
    //     )
    //     // - ２を掛けて１を引く -------------------------------------------------
    //     // WebGL やグラフィックスプログラミングの文脈では、座標の値を加工するよう
    //     // なケースが多くあります。（要は座標変換）
    //     // なんらかの座標系（座標の取り扱いを決めた１つのルール）から、別の座標系
    //     // へと値を変換する際、座標を 0.0 ～ 1.0 の範囲になるように変換したり、似
    //     // たようなケースとして -1.0 ～ 1.0 に変換するような状況がよくあります。
    //     // 今回の例では「ブラウザのクライアント領域の座標系」から、三次元の世界で
    //     // 扱いやすいように座標を変換しましたが、画面の幅や高さで割ることでまず値
    //     // を 0.0 ～ 1.0 の範囲に収まるよう変換し、さらに続けて -1.0 ～ 1.0 に変換
    //     // するために２倍して１を引いています。
    //     // 単純計算なので、落ち着いて考えてみましょう。
    //     // ----------------------------------------------------------------------
    //   },
    //   false,
    // )

    // リサイズイベント
    window.addEventListener(
      'resize',
      () => {
        renderer.setSize(window.innerWidth, window.innerHeight)
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
      },
      false,
    )

    /**
     * アセット（素材）のロードを行う Promise
     */
    // this.load = (): Promise<void> => {
    //   return new Promise<void>(resolve => {
    //     // 地球用画像の読み込みとテクスチャ生成 @@@
    //     const earthPath = earthTextureImg.src
    //     const moonPath = moonTextureImg.src
    //     const loader = new THREE.TextureLoader()
    //     loader.load(earthPath, earthTexture => {
    //       // 地球用
    //       earthTexture = earthTexture
    //       loader.load(moonPath, moonTexture => {
    //         // 月用
    //         moonTexture = moonTexture
    //         resolve()
    //       })
    //     })
    //   })
    // }

    // 都市ごとのポイント生成
    const getCityPoint = (lat: number, lng: number) => {
      const city = new THREE.Mesh(
        new THREE.SphereGeometry(0.01, 20, 20),
        new THREE.MeshBasicMaterial({ color: 0xffff00 }),
      )
      // scene.add(cityPoint)
      // 仰角
      phi = (lat * Math.PI) / 180
      // 方位角
      theta = ((lng - 180) * Math.PI) / 180
      cityX = -1 * radius * Math.cos(phi) * Math.cos(theta)
      cityY = radius * Math.sin(phi)
      cityZ = radius * Math.cos(phi) * Math.sin(theta)
      city.position.set(cityX, cityY, cityZ)
      return city
    }

    /**
     * 軌道の座標を配列で返します。
     *
     * @param {THREE.Vector3} startPos 開始点です。
     * @param {THREE.Vector3} endPos 終了点です。
     * @param {number} segmentNum セグメント分割数です。
     * @returns {THREE.Vector3[]} 軌跡座標の配列です。
     * @see https://ics.media/entry/10657
     */
    const createOrbitPoints = (
      startPos: THREE.Vector3,
      endPos: THREE.Vector3,
      segmentNum: number,
    ) => {
      // 頂点を格納する配列
      const vertices = []
      const startVec = startPos.clone()
      const endVec = endPos.clone()

      // ２つのベクトルの回転軸
      const axis = startVec.clone().cross(endVec)
      // 軸ベクトルを単位ベクトルに
      axis.normalize()
      // ２つのベクトルが織りなす角度
      const angle = startVec.angleTo(endVec)

      // ２つの点を結ぶ弧を描くための頂点を打つ
      for (let i = 0; i < segmentNum; i += 1) {
        // axisを軸としたクォータニオンを生成
        const q = new THREE.Quaternion()
        q.setFromAxisAngle(axis, (angle / segmentNum) * i)
        // ベクトルを回転させる
        const vertex = startVec.clone().applyQuaternion(q)
        vertices.push(vertex)
      }

      // 終了点を追加
      vertices.push(endVec)
      return vertices
    }

    /**
     * 二点を結ぶラインを生成します
     * @param {THREE.Vector3} startPoint 開始点
     * @param {THREE.Vector3} endPoint 終了点
     * @returns {THREE.Line} 線
     * @see https://ics.media/entry/10657
     */
    const createLine = (startPoint: THREE.Vector3, endPoint: THREE.Vector3) => {
      // 線
      const points = createOrbitPoints(startPoint, endPoint, 15)
      const geometry = new THREE.BufferGeometry()
      geometry.setFromPoints(points)
      return new THREE.Line(
        geometry,
        new THREE.LineBasicMaterial({ linewidth: 5, color: 0x00ffff }),
      )
    }

    /**
     * 初期化処理
     */
    this.init = () => {
      // レンダラー
      const color = new THREE.Color(RENDERER_PARAM.clearColor)
      renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setClearColor(color)
      renderer.setSize(RENDERER_PARAM.width, RENDERER_PARAM.height)
      this.wrapper.appendChild(renderer.domElement)
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      // renderer.outputColorSpace = THREE.LinearSRGBColorSpace

      // シーン
      scene = new THREE.Scene()
      scene.fog = new THREE.Fog(FOG_PARAM.color, FOG_PARAM.near, FOG_PARAM.far)

      // カメラ
      camera = new THREE.PerspectiveCamera(
        CAMERA_PARAM.fovy,
        CAMERA_PARAM.aspect,
        CAMERA_PARAM.near,
        CAMERA_PARAM.far,
      )
      camera.position.copy(CAMERA_PARAM.position)
      camera.lookAt(CAMERA_PARAM.lookAt)

      // ディレクショナルライト（平行光源）
      // directionalLight = new THREE.DirectionalLight(
      //   DIRECTIONAL_LIGHT_PARAM.color,
      //   DIRECTIONAL_LIGHT_PARAM.intensity,
      // )
      // directionalLight.position.copy(DIRECTIONAL_LIGHT_PARAM.position)
      // scene.add(directionalLight)

      // アンビエントライト（環境光）
      // ambientLight = new THREE.AmbientLight(
      //   AMBIENT_LIGHT_PARAM.color,
      //   AMBIENT_LIGHT_PARAM.intensity,
      // )
      // scene.add(ambientLight)

      const sunLight = new THREE.DirectionalLight(0xffffff)
      sunLight.position.set(-2.0, 0.0, 1.5)
      scene.add(sunLight)

      // 球体のジオメトリを生成
      sphereGeometry = new THREE.SphereGeometry(0.5, 32, 32)
      // sphereGeometry = new THREE.IcosahedronGeometry(1, 12)

      // コーンのジオメトリを生成 @@@
      coneGeometry = new THREE.ConeGeometry(0.2, 0.5, 32)

      // 地球用画像の読み込みとテクスチャ生成 @@@
      const earthPath = earthTextureImg.src
      const moonPath = moonTextureImg.src
      const earthLightsPath = earthLightsTextureImg.src
      const earthCloudsPath = earthCloudsTextureImg.src
      const moonBumpPath = moonBumpTextureImg.src
      const earthBumpPath = earthBumpTextureImg.src
      const loader = new THREE.TextureLoader()
      // 地球用
      earthTexture = loader.load(earthPath)
      // 月用
      moonTexture = loader.load(moonPath)
      // 月面用
      moonBumpTexture = loader.load(moonBumpPath)
      // 地球夜景用
      earthLightsTexture = loader.load(earthLightsPath)
      // 地球雲用
      earthCloudsTexture = loader.load(earthCloudsPath)
      // 地球表面用
      earthBumpTexture = loader.load(earthBumpPath)

      // 地球のマテリアルとメッシュ @@@
      earthMaterial = new THREE.MeshPhongMaterial({
        map: earthTexture,
        bumpMap: earthBumpTexture,
        bumpScale: 3,
        // opacity: 0.3,
        // transparent: true,
      })
      // earthMaterial = new THREE.MeshStandardMaterial()
      // earthMaterial.map = earthTexture
      earth = new THREE.Mesh(sphereGeometry, earthMaterial)
      earth.scale.setScalar(1)
      earthGroup = new THREE.Group()
      earthGroupLarge = new THREE.Group()
      // Math.PI / 7.82は23.4°
      earthGroup.rotation.set(0.0, 0.0, -(23.4 * Math.PI) / 180)
      scene.add(earthGroup)
      scene.add(earthGroupLarge)
      earthGroup.add(earth)

      // 地球を覆う夜景
      lightMat = new THREE.MeshBasicMaterial({
        // color: 0x00ff00,
        map: earthLightsTexture,
        blending: THREE.AdditiveBlending,
        // opacity: 0.3,
        // transparent: true,
        // lightMapIntensity: 0,
        // reflectivity: 0.2,
      })
      lightMesh = new THREE.Mesh(sphereGeometry, lightMat)
      earthGroup.add(lightMesh)

      // 雲
      cloudsMat = new THREE.MeshStandardMaterial({
        // color: 0x00ff00,
        map: earthCloudsTexture,
        blending: THREE.AdditiveBlending,
        // opacity: 0.3,
        // transparent: true,
        // transparent: true,
        // lightMapIntensity: 0,
        // opacity: 0.9,
        // reflectivity: 0.2,
      })
      cloudsMesh = new THREE.Mesh(sphereGeometry, cloudsMat)
      cloudsMesh.scale.setScalar(1.005)
      earthGroup.add(cloudsMesh)

      // 大気圏
      const fresnelMat = getFresnelMat()
      fresnelMesh = new THREE.Mesh(sphereGeometry, fresnelMat)
      fresnelMesh.scale.setScalar(1.01)
      earthGroup.add(fresnelMesh)

      // earthGroupLarge.add(earthGroup)

      // 月のマテリアルとメッシュ @@@
      moonMaterial = new THREE.MeshPhongMaterial({
        map: moonTexture,
        bumpMap: moonBumpTexture,
        bumpScale: 3,
      })
      // moonMaterial.map = moonTexture
      moon = new THREE.Mesh(sphereGeometry, moonMaterial)
      scene.add(moon)
      // 月はやや小さくして、さらに位置も動かす @@@
      moon.scale.setScalar(MOON_SCALE)
      moon.position.set(MOON_DISTANCE, 0.0, 0.0)

      // 人工衛星のマテリアルとメッシュ @@@
      satelliteMaterial = new THREE.MeshBasicMaterial({ color: 0xff00dd })
      satellite = new THREE.Mesh(coneGeometry, satelliteMaterial)
      scene.add(satellite)
      satellite.scale.setScalar(0.2) // より小さく
      satellite.position.set(0.0, MOON_DISTANCE, 0.0) // +Z の方向に初期位置を設定
      // 進行方向の初期値（念の為、汎用性を考えて単位化するよう記述） @@@
      satelliteDirection = new THREE.Vector3(0.0, 1.0, 0.0).normalize()

      satelliteMaterial2 = new THREE.MeshBasicMaterial({ color: 0x0000ff })
      satellite2 = new THREE.Mesh(coneGeometry, satelliteMaterial2)
      scene.add(satellite2)
      satellite2.scale.setScalar(0.2) // より小さく
      satellite2.position.set(0.0, MOON_DISTANCE, 0.0) // +Z の方向に初期位置を設定
      // 進行方向の初期値（念の為、汎用性を考えて単位化するよう記述） @@@
      satelliteDirection2 = new THREE.Vector3(0.0, 1.0, 0.0).normalize()

      // 旅客機のマテリアルとメッシュ
      planeMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 })
      plane = new THREE.Mesh(coneGeometry, planeMaterial)
      // scene.add(plane)
      earthGroup.add(plane)
      plane.scale.setScalar(0.15) // より小さく
      plane.position.set(0.0, PLANE_DISTANCE, 0.0) // +Z の方向に初期位置を設定
      // 進行方向の初期値（念の為、汎用性を考えて単位化するよう記述） @@@
      planeDirection = new THREE.Vector3(0.0, 1.0, 0.0).normalize()

      // 人工衛星のマテリアルとメッシュ
      artificialSatelliteGroup = new THREE.Group()
      artificialSatelliteMaterial = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
      })
      artificialSatellite = new THREE.Mesh(
        sphereGeometry,
        artificialSatelliteMaterial,
      )
      artificialSatellite.receiveShadow = true
      artificialSatelliteGroup.add(artificialSatellite)
      // 人工衛生用点光源
      const pointLight = new THREE.PointLight(0x00ff00, 1, 0, 0.0)
      artificialSatelliteGroup.add(pointLight)
      scene.add(artificialSatelliteGroup)
      artificialSatelliteGroup.scale.setScalar(0.08) // より小さく
      artificialSatelliteGroup.position.set(
        0.0,
        0.0,
        ARTIFICIAL_SATELLITE_DISTANCE,
      ) // +Z の方向に初期位置を設定
      // 進行方向の初期値（念の為、汎用性を考えて単位化するよう記述） @@@
      // artificialSatelliteDirection = new THREE.Vector3(
      //   0.0,
      //   0.0,
      //   1.0,
      // ).normalize()

      // ジオメトリからメッシュを生成
      const icosahedronGeometry = new THREE.IcosahedronGeometry(0.03, 1)
      // this.box = new THREE.Mesh(this.boxGeometry, this.material)
      // this.scene.add(this.box)
      // マテリアルを作成
      const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
      })

      // countの数だけboxを並べる
      // const boxes: THREE.Mesh[] = []
      starGroup = new THREE.Group()
      const count = 3000
      for (let i = 0; i < count; i += 1) {
        const box = new THREE.Mesh(icosahedronGeometry, material)
        box.position.x = Math.random() * 100 - 50
        box.position.y = Math.random() * 100 - 50
        box.position.z = Math.random() * 100 - 50
        // scene.add(box)
        // boxes.push(box)
        starGroup.add(box)
      }
      scene.add(starGroup)

      // 都市ポイント(日本)
      const lat = 37.4900318
      const lng = 136.4664008

      // // 仰角
      // phi = (lat * Math.PI) / 180
      // // 方位角
      // theta = ((lng - 180) * Math.PI) / 180
      // cityX = -1 * radius * Math.cos(phi) * Math.cos(theta)
      // cityY = radius * Math.sin(phi)
      // cityZ = radius * Math.cos(phi) * Math.sin(theta)
      // cityPoint.position.set(cityX, cityY, cityZ)

      // earthGroupLarge.add(cityPoint)
      japanPoint = getCityPoint(lat, lng)
      japanPoint.scale.setScalar(1.1)
      earthGroup.add(japanPoint)

      // 世界の都市のposition
      // const cities = []
      citiesPoints.forEach(points => {
        cityPoint = getCityPoint(points[0], points[1])
        cityPoint.scale.setScalar(1.1)
        earthGroup.add(cityPoint)
        const line = createLine(japanPoint.position, cityPoint.position)
        line.scale.setScalar(1.02)
        earthGroup.add(line)
        // const city = new getDestinationPoints(0xff0000, points)
        // cities.push(city)
        // // console.log(cities)
        // console.log(points, city)
        // scene.add(city)
        // getApplyGpsPosition(city, city.getCoords())
      })
      // cityPoint0 = getCityPoint(citiesPoints[0][0], citiesPoints[0][1])

      // コントロール
      controls = new OrbitControls(camera, renderer.domElement)

      // // ヘルパー
      // const axesBarLength = 5.0
      // axesHelper = new THREE.AxesHelper(axesBarLength)
      // axesHelper.rotation.set(0.0, 0.0, -(23.4 * Math.PI) / 180)
      // scene.add(axesHelper)

      // キーの押下状態を保持するフラグ
      isDown = false

      // - Clock オブジェクト ---------------------------------------------------
      // three.js の Clock オブジェクトを使うと、時間の経過を効率よく取得・調査す
      // ることができます。
      // 内部的に時刻の計測を開始しているか、というフラグがあり初期値は false です
      // が、経過時間を取得する Clock.getElapsedTime などを呼び出すと同時に、自動
      // 的にタイマーがスタートするようになっています。
      // 明示的にいずれかのタイミングでスタートさせたい場合は Clock.start メソッド
      // を用いることで、タイマーのリセットを行うと同時に計測を開始できます。
      // ------------------------------------------------------------------------
      // Clock オブジェクトの生成 @@@
      clock = new THREE.Clock()
    }

    /**
     * 描画処理
     */
    this.render = () => {
      // 恒常ループ
      requestAnimationFrame(this.render)

      // コントロールを更新
      controls.update()

      // フラグに応じてオブジェクトの状態を変化させる
      if (isDown === true) {
        // earth.rotation.y += 0.05
        // moon.rotation.y += 0.05
      }

      // earth.rotation.y += 0.002
      moon.rotation.y += 0.01
      // lightMesh.rotation.y += 0.002
      cloudsMesh.rotation.y += 0.003
      // fresnelMesh.rotation.y += 0.002
      starGroup.rotation.y += 0.002
      earthGroup.rotation.y += 0.002
      cityPoint.rotation.y += 0.002

      // 前回のフレームからの経過時間の取得 @@@
      const time = clock.getElapsedTime()
      // 経過時間をそのままラジアンとしてサインとコサインを求める
      const sin = Math.sin(time * 0.2) // 半径1の円周上のY座標(該当するラジアンの高さ)
      const cos = Math.cos(time * 0.2) // 半径1の円周上のX座標（該当するラジアンの幅）
      moon.position.set(cos * MOON_DISTANCE, 0.0, sin * MOON_DISTANCE)
      plane.position.set(cos * PLANE_DISTANCE, 0.0, sin * PLANE_DISTANCE)
      artificialSatelliteGroup.position.set(
        cos * ARTIFICIAL_SATELLITE_DISTANCE,
        cos * ARTIFICIAL_SATELLITE_DISTANCE,
        sin * ARTIFICIAL_SATELLITE_DISTANCE,
      )
      // cityPoint.position.set(cityX * cos, cityY * cos, cityZ)
      // cityPoint.position.set(cos * 0.5, cityY, sin * 0.5)

      // 人工衛星は月を自動追尾する @@@
      // (A) 現在（前のフレームまで）の進行方向を変数に保持しておく @@@
      const previousDirectionSatellite = satelliteDirection.clone()
      // (終点 - 始点) という計算を行うことで、２点間を結ぶベクトルを定義
      // const subVector = this.moon.position.clone.subVectors(this.moon.position, this.satellite.position); // 別の書き方 cloneがないとmoonの座標が変わってしまう
      const subVector = new THREE.Vector3().subVectors(
        moon.position,
        satellite.position,
      )
      // 長さに依存せず、向きだけを考えたい場合はベクトルを単位化する
      subVector.normalize()
      // 人工衛星の進行方向ベクトルに、向きベクトルを小さくスケールして加算する @@@
      subVector.multiplyScalar(SATELLITE_TURN_SCALE)
      satelliteDirection.add(subVector)
      // (B) 加算したことでベクトルの長さが変化するので、単位化してから人工衛星の座標に加算する
      satelliteDirection.normalize()
      const direction = satelliteDirection.clone()
      // 現在の人工衛星の座標に、向きベクトルを小さくスケールして加算する
      satellite.position.add(direction.multiplyScalar(SATELLITE_SPEED))
      // (C) 変換前と変換後の２つのベクトルから外積で法線ベクトルを求める @@@
      const normalAxis = new THREE.Vector3().crossVectors(
        previousDirectionSatellite,
        satelliteDirection,
      )
      normalAxis.normalize()
      // (D) 変換前と変換後のふたつのベクトルから内積でコサインを取り出す
      const cosSatellite = previousDirectionSatellite.dot(satelliteDirection)
      // (D) コサインをラジアンに戻す
      const radians = Math.acos(cosSatellite)
      // 求めた法線ベクトルとラジアンからクォータニオンを定義
      const qtn = new THREE.Quaternion().setFromAxisAngle(normalAxis, radians)
      // 人工衛星の現在のクォータニオンに乗算する
      satellite.quaternion.premultiply(qtn)

      // (A) 現在（前のフレームまで）の進行方向を変数に保持しておく @@@
      const previousDirectionSatellite2 = satelliteDirection2.clone()
      // (終点 - 始点) という計算を行うことで、２点間を結ぶベクトルを定義
      // const subVector = this.moon.position.clone.subVectors(this.moon.position, this.satellite.position); // 別の書き方 cloneがないとmoonの座標が変わってしまう
      const subVector2 = new THREE.Vector3().subVectors(
        moon.position,
        satellite2.position,
      )
      // 長さに依存せず、向きだけを考えたい場合はベクトルを単位化する
      subVector2.normalize()
      // 人工衛星の進行方向ベクトルに、向きベクトルを小さくスケールして加算する @@@
      subVector2.multiplyScalar(SATELLITE_TURN_SCALE)
      satelliteDirection2.add(subVector2)
      // (B) 加算したことでベクトルの長さが変化するので、単位化してから人工衛星の座標に加算する
      satelliteDirection2.normalize()
      const direction2 = satelliteDirection2.clone()
      // 現在の人工衛星の座標に、向きベクトルを小さくスケールして加算する
      satellite2.position.add(direction2.multiplyScalar(SATELLITE_SPEED * 0.7))
      // (C) 変換前と変換後の２つのベクトルから外積で法線ベクトルを求める @@@
      const normalAxis2 = new THREE.Vector3().crossVectors(
        previousDirectionSatellite2,
        satelliteDirection2,
      )
      normalAxis2.normalize()
      // (D) 変換前と変換後のふたつのベクトルから内積でコサインを取り出す
      const cosSatellite2 = previousDirectionSatellite2.dot(satelliteDirection2)
      // (D) コサインをラジアンに戻す
      const radians2 = Math.acos(cosSatellite2)
      // 求めた法線ベクトルとラジアンからクォータニオンを定義
      const qtn2 = new THREE.Quaternion().setFromAxisAngle(
        normalAxis2,
        radians2,
      )
      // 人工衛星の現在のクォータニオンに乗算する
      satellite2.quaternion.premultiply(qtn2)

      // 旅客機の動き
      // (A) 現在（前のフレームまで）の進行方向を変数に保持しておく @@@
      const previousDirectionPlane = planeDirection.clone()
      startFly = new THREE.Vector3(0.0, 0.0, 0.0)
      endLand = new THREE.Vector3(
        sin * -1 * PLANE_DISTANCE,
        0.0,
        cos * PLANE_DISTANCE,
      )
      // const previousStartFly = startFly.clone()
      // const previousEndLand = endLand.clone()
      // (終点 - 始点) という計算を行うことで、２点間を結ぶベクトルを定義
      const subVectorPlane = new THREE.Vector3().subVectors(
        // japanPoint.position,
        // plane.position,
        // cityPoint0.position,
        endLand,
        startFly,
      )
      subVectorPlane.normalize()
      // 旅客機の進行方向ベクトルに、向きベクトルを小さくスケールして加算する @@@
      subVectorPlane.multiplyScalar(PLANE_TURN_SCALE)
      planeDirection.add(subVectorPlane)
      // (B) 加算したことでベクトルの長さが変化するので、単位化してから人工衛星の座標に加算する
      planeDirection.normalize()
      const directionPlane = planeDirection.clone()
      plane.position.add(directionPlane.multiplyScalar(PLANE_SPEED))
      // (C) 変換前と変換後の２つのベクトルから外積で法線ベクトルを求める @@@
      const normalAxisPlane = new THREE.Vector3().crossVectors(
        previousDirectionPlane,
        planeDirection,
      )
      normalAxisPlane.normalize()
      // // (D) 変換前と変換後のふたつのベクトルから内積でコサインを取り出す
      // const cosPlane = previousDirectionPlane.dot(planeDirection)
      // // (D) コサインをラジアンに戻す
      // const radiansPlane = Math.acos(cosPlane)
      const angle = previousDirectionPlane.angleTo(planeDirection)
      // 求めた法線ベクトルとラジアンからクォータニオンを定義
      const qtnPlane = new THREE.Quaternion().setFromAxisAngle(
        normalAxisPlane,
        angle,
      )
      // 人工衛星の現在のクォータニオンに乗算する
      plane.quaternion.premultiply(qtnPlane)

      // // 人工衛星の動き
      // startFly2 = new THREE.Vector3(0.0, 0.0, 0.0)
      // endLand2 = new THREE.Vector3(0.5, 0.5, 0.5)
      // const subVectorArtificialSatellite = new THREE.Vector3().subVectors(
      //   startFly2,
      //   endLand2,
      // )
      // subVectorArtificialSatellite.normalize()
      // // 人工衛星の進行方向ベクトルに、向きベクトルを小さくスケールして加算する @@@
      // subVectorArtificialSatellite.multiplyScalar(
      //   ArtificialSatellite_TURN_SCALE,
      // )
      // artificialSatelliteDirection.add(subVectorArtificialSatellite)
      // // 加算したことでベクトルの長さが変化するので、単位化してから人工衛星の座標に加算する
      // artificialSatelliteDirection.normalize()
      // const directionArtificialSatellite = artificialSatelliteDirection.clone()
      // artificialSatelliteGroup.position.add(
      //   directionArtificialSatellite.multiplyScalar(ArtificialSatellite_SPEED),
      // )

      // console.log(directionArtificialSatellite, 'directionArtificialSatellite')

      // レンダラーで描画
      renderer.render(scene, camera)
    }

    // 再帰呼び出しのための this 固定
    this.render = this.render.bind(this)
  }
}

export default OrbitTheEarth
