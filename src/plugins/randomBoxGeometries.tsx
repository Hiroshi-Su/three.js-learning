import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils'

import SkyTexture from '@/assets/img/sky.jpg'
import CraneTexture from '@/assets/img/crane.jpg'

export class ThreeApp {
  render: () => void // レンダー

  renderer // レンダラ

  scene // シーン

  camera // カメラ

  directionalLight // 平行光源（ディレクショナルライト）

  ambientLight // 環境光（アンビエントライト）

  material // マテリアル

  boxGeometry // ボックスジオメトリ

  box // ボックスメッシュ

  controls // オービットコントロール

  axesHelper // 軸ヘルパー

  isDown // キーの押下状態用フラグ

  /**
   * コンストラクタ
   * @constructor
   * @param {HTMLElement} wrapper - canvas 要素を append する親要素
   */

  constructor(wrapper: HTMLElement) {
    /**
     * カメラ定義のための定数
     */
    const CAMERA_PARAM = {
      // fovy は Field of View Y のことで、縦方向の視野角を意味する
      fovy: 60,
      // 描画する空間のアスペクト比（縦横比）
      aspect: window.innerWidth / window.innerHeight,
      // 描画する空間のニアクリップ面（最近面）
      near: 0.1,
      // 描画する空間のファークリップ面（最遠面）
      far: 100.0,
      // カメラの座標
      position: new THREE.Vector3(0.0, 2.0, 5.0),
      // カメラの注視点
      lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    }
    /**
     * レンダラー定義のための定数
     */
    const RENDERER_PARAM = {
      clearColor: 0x666666, // 画面をクリアする色
      width: window.innerWidth, // レンダラーに設定する幅
      height: window.innerHeight, // レンダラーに設定する高さ
    }
    /**
     * 平行光源定義のための定数
     */
    const DIRECTIONAL_LIGHT_PARAM = {
      color: 0xffffff, // 光の色
      intensity: 1.0, // 光の強度
      position: new THREE.Vector3(1.0, 1.0, 1.0), // 光の向き
    }
    /**
     * アンビエントライト定義のための定数
     */
    const AMBIENT_LIGHT_PARAM = {
      color: 0xffffff, // 光の色
      intensity: 0.1, // 光の強度
    }
    /**
     * マテリアル定義のための定数
     */
    // const MATERIAL_PARAM = {
    //   color: 0x3399ff, // マテリアルの基本色
    // }

    // レンダラー
    const color = new THREE.Color(RENDERER_PARAM.clearColor)
    this.renderer = new THREE.WebGLRenderer()
    this.renderer.setClearColor(color)
    this.renderer.setSize(RENDERER_PARAM.width, RENDERER_PARAM.height)
    wrapper.appendChild(this.renderer.domElement)

    // シーン
    this.scene = new THREE.Scene()

    /**
     * Textures
     */
    const textureLoader = new THREE.TextureLoader()
    const skyTexture = textureLoader.load(SkyTexture.src)
    const craneTexture = textureLoader.load(CraneTexture.src)
    this.scene.background = skyTexture

    // カメラ
    this.camera = new THREE.PerspectiveCamera(
      CAMERA_PARAM.fovy,
      CAMERA_PARAM.aspect,
      CAMERA_PARAM.near,
      CAMERA_PARAM.far,
    )
    this.camera.position.copy(CAMERA_PARAM.position)
    // this.camera.lookAt(CAMERA_PARAM.lookAt)

    // ディレクショナルライト（平行光源）
    this.directionalLight = new THREE.DirectionalLight(
      DIRECTIONAL_LIGHT_PARAM.color,
      DIRECTIONAL_LIGHT_PARAM.intensity,
    )
    this.directionalLight.position.copy(DIRECTIONAL_LIGHT_PARAM.position)
    this.scene.add(this.directionalLight)

    // アンビエントライト（環境光）
    this.ambientLight = new THREE.AmbientLight(
      AMBIENT_LIGHT_PARAM.color,
      AMBIENT_LIGHT_PARAM.intensity,
    )
    this.scene.add(this.ambientLight)

    // マテリアル
    // this.material = new THREE.MeshPhongMaterial(MATERIAL_PARAM)
    this.material = new THREE.MeshBasicMaterial({
      map: craneTexture,
    })

    // ジオメトリからメッシュを生成
    this.boxGeometry = new THREE.BoxGeometry(0.8, 0.8, 0.8)
    // this.box = new THREE.Mesh(this.boxGeometry, this.material)
    // this.scene.add(this.box)

    // countの数だけboxを並べる
    const boxes: THREE.Mesh[] = []
    const count = 3000
    for (let i = 0; i < count; i += 1) {
      this.box = new THREE.Mesh(this.boxGeometry, this.material)
      this.box.position.x = Math.random() * 100 - 50
      this.box.position.y = Math.random() * 100 - 50
      this.box.position.z = Math.random() * 100 - 50
      this.scene.add(this.box)
      boxes.push(this.box)
    }

    const linedBoxes: THREE.BoxGeometry[] = []
    // 1辺あたりに配置するオブジェクトの個数
    const cellNum = 20
    // Box
    for (let i = 0; i < cellNum; i += 1) {
      for (let j = 0; j < cellNum; j += 1) {
        for (let k = 0; k < cellNum; k += 1) {
          // 立方体個別の要素を作成
          const geometryBox = new THREE.BoxGeometry(0.4, 0.4, 0.4)

          // XYZ座標を設定
          const geometryTranslated = geometryBox.translate(
            1 * (i - cellNum / 2),
            1 * (j - cellNum / 2),
            1 * (k - cellNum / 2),
          )

          // ジオメトリを保存
          linedBoxes.push(geometryTranslated)
        }
      }
    }
    // ジオメトリを生成
    const geometry = BufferGeometryUtils.mergeGeometries(linedBoxes)

    // マテリアルを作成
    const material = new THREE.MeshNormalMaterial()
    // メッシュを作成
    const mesh = new THREE.Mesh(geometry, material)
    this.scene.add(mesh)

    // 軸ヘルパー
    const axesBarLength = 5.0
    this.axesHelper = new THREE.AxesHelper(axesBarLength)
    this.scene.add(this.axesHelper)

    // コントロール
    this.controls = new OrbitControls(this.camera, this.renderer.domElement)

    // this のバインド
    // this.render = this.render.bind(this)

    // キーの押下状態を保持するフラグ
    this.isDown = false

    // キーの押下や離す操作を検出できるようにする
    window.addEventListener(
      'keydown',
      keyEvent => {
        switch (keyEvent.key) {
          case ' ':
            this.isDown = true
            break
          default:
        }
      },
      false,
    )
    window.addEventListener(
      'keyup',
      () => {
        // keyEvent
        this.isDown = false
      },
      false,
    )

    // リサイズイベント
    window.addEventListener(
      'resize',
      () => {
        // レンダラの大きさを設定
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        // カメラが撮影する視錐台のアスペクト比を再設定
        this.camera.aspect = window.innerWidth / window.innerHeight
        // カメラのパラメータが変更されたときは行列を更新する
        // ※なぜ行列の更新が必要なのかについては、将来的にもう少し詳しく解説します
        this.camera.updateProjectionMatrix()
      },
      false,
    )

    // const clock = new THREE.Clock()

    let mouseX = 0 // マウス座標
    // マウス座標はマウスが動いた時のみ取得できる
    document.addEventListener('mousemove', event => {
      mouseX = event.pageX
    })

    /**
     * 描画処理
     */
    let rot = 0 // 角度
    this.render = () => {
      // コントロールを更新
      this.controls.update()

      // 時間取得
      // const elapsedTime = clock.getElapsedTime()

      // マウスの位置に応じて角度を設定
      // マウスのX座標がステージの幅の何%の位置にあるか調べてそれを360度で乗算する
      const targetRot = (mouseX / window.innerWidth) * 360
      // イージングの公式を用いて滑らかにする
      // 値 += (目標値 - 現在の値) * 減速値
      rot += (targetRot - rot) * 0.02

      // ラジアンに変換する
      const radian = (rot * Math.PI) / 180
      // 角度に応じてカメラの位置を設定
      this.camera.position.x = 50 * Math.sin(radian)
      this.camera.position.z = 50 * Math.cos(radian)
      // this.camera.position.y = 50 * Math.sin(radian)
      // this.camera.position.x = Math.sin(elapsedTime * 0.4) * 50
      // this.camera.position.z = Math.cos(elapsedTime * 0.4) * 50

      // 地球は常に回転させておく
      mesh.rotation.y += 0.01
      mesh.rotation.x += 0.01
      mesh.rotation.z += 0.01
      for (let i = 0; i < boxes.length; i += 1) {
        boxes[i].rotation.y += 0.01
        // boxes[i].rotation.x += 0.01
        // boxes[i].rotation.z += 0.01
      }

      // 原点方向を見つめる
      this.camera.lookAt(CAMERA_PARAM.lookAt)

      // フラグに応じてオブジェクトの状態を変化させる
      if (this.isDown === true) {
        // Y 軸回転
        // this.box.rotation.y += 0.05
        for (let i = 0; i < boxes.length; i += 1) {
          boxes[i].rotation.y += 0.05
        }
        mesh.rotation.y += 0.01
        mesh.rotation.x += 0.01
        mesh.rotation.z += 0.01
      }

      // レンダラーで描画
      this.renderer.render(this.scene, this.camera)

      // 恒常ループの設定
      requestAnimationFrame(this.render)
    }
  }
}

export default ThreeApp
