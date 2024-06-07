import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
// import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils'

import SkyTexture from '@/assets/img/sky.jpg'

export class ThreeApp2 {
  render: () => void // レンダー

  renderer // レンダラ

  scene // シーン

  camera // カメラ

  directionalLight // 平行光源（ディレクショナルライト）

  ambientLight // 環境光（アンビエントライト）

  material // マテリアル

  boxGeometry // ボックスジオメトリ

  box // ボックスメッシュ

  sphereGeometry // スフィアジオメトリ

  sphere // スフィアメッシュ

  groupParent // グループ親

  groupChild // グループ親

  controls // オービットコントロール

  // axesHelper // 軸ヘルパー

  isDown // キーの押下状態用フラグ

  switch: boolean // 回転の制御用フラグ

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
      position: new THREE.Vector3(0.0, 2.0, 0.0),
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
    const MATERIAL_PARAM = {
      color: 0x3399ff, // マテリアルの基本色
    }

    this.switch = false

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
    // const craneTexture = textureLoader.load(CraneTexture.src)
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
    this.material = new THREE.MeshPhongMaterial(MATERIAL_PARAM)
    // this.material = new THREE.MeshBasicMaterial({
    //   map: craneTexture,
    // })

    // ジオメトリ
    this.boxGeometry = new THREE.BoxGeometry(2, 2, 2)
    this.sphereGeometry = new THREE.SphereGeometry(1.5, 32, 32)

    // グループ
    this.groupParent = new THREE.Group()
    this.groupChild = new THREE.Group()
    this.scene.add(this.groupParent)
    this.scene.add(this.groupChild)

    let rot = 0 // 角度
    // メッシュを生成
    // 一つのbox
    // this.box = new THREE.Mesh(this.boxGeometry, this.material)
    // this.box.position.set(5, 5, 0)
    // this.box.rotation.set(0, 0, 15)
    // this.scene.add(this.box)
    // const groupC = this.groupChild.add(this.box)
    // this.groupParent.add(groupC)

    // 一つのsphere
    this.sphere = new THREE.Mesh(this.sphereGeometry, this.material)
    this.sphere.position.set(0, 0, 0)
    this.scene.add(this.sphere)

    // countの数だけboxを並べる
    // const boxes: THREE.Mesh[] = []
    const count = 5
    for (let i = 0; i < count; i += 1) {
      this.box = new THREE.Mesh(this.boxGeometry, this.material)
      this.box.position.x = 3 * (i - count)
      this.box.position.y = 3 * (i - count)
      this.box.position.z = 0
      this.box.rotation.set(0, 0, 15)
      this.scene.add(this.box)
      // boxes.push(this.box)
      const groupC = this.groupChild.add(this.box)
      this.groupParent.add(groupC)
    }
    this.groupChild.add(this.sphere)
    this.groupChild.position.set(0, 0, 10)

    // const linedBoxes: THREE.BoxGeometry[] = []
    // 1辺あたりに配置するオブジェクトの個数
    // const cellNum = 20
    // Box
    // 立方体個別の要素を作成
    // const geometry = new THREE.BoxGeometry(0.4, 0.4, 0.4)
    // for (let i = 0; i < cellNum; i += 1) {
    //   for (let j = 0; j < cellNum; j += 1) {
    //     for (let k = 0; k < cellNum; k += 1) {
    //       // 立方体個別の要素を作成
    //       const geometryBox = new THREE.BoxGeometry(0.4, 0.4, 0.4)

    //       // XYZ座標を設定
    //       const geometryTranslated = geometryBox.translate(
    //         1 * (i - cellNum / 2),
    //         1 * (j - cellNum / 2),
    //         1 * (k - cellNum / 2),
    //       )

    //       // ジオメトリを保存
    //       linedBoxes.push(geometryTranslated)
    //     }
    //   }
    // }
    // ジオメトリを生成
    // const geometry = BufferGeometryUtils.mergeGeometries(linedBoxes)

    // マテリアルを作成
    // const material = new THREE.MeshNormalMaterial()
    // メッシュを作成
    // const mesh = new THREE.Mesh(geometry, material)
    // this.scene.add(mesh)

    // 軸ヘルパー
    // const axesBarLength = 5.0
    // this.axesHelper = new THREE.AxesHelper(axesBarLength)
    // this.scene.add(this.axesHelper)

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

    // let mouseX = 0 // マウス座標
    // マウス座標はマウスが動いた時のみ取得できる
    // document.addEventListener('mousemove', event => {
    //   mouseX = event.pageX
    // })

    /**
     * 描画処理
     */

    this.render = () => {
      // コントロールを更新
      this.controls.update()

      // 時間取得
      // const elapsedTime = clock.getElapsedTime()

      // マウスの位置に応じて角度を設定
      // マウスのX座標がステージの幅の何%の位置にあるか調べてそれを360度で乗算する
      // const targetRot = (mouseX / window.innerWidth) * 360
      // イージングの公式を用いて滑らかにする
      // 値 += (目標値 - 現在の値) * 減速値
      // rot += (targetRot - rot) * 0.02

      // ラジアンに変換する
      const radian = (rot * Math.PI) / 180
      // 角度に応じてカメラの位置を設定
      this.camera.position.x = 50 * Math.sin(radian)
      this.camera.position.z = 50 * Math.cos(radian)
      // this.camera.position.y = 50 * Math.sin(radian)
      // this.camera.position.x = Math.sin(elapsedTime * 0.4) * 50
      // this.camera.position.z = Math.cos(elapsedTime * 0.4) * 50

      // 地球は常に回転させておく
      // mesh.rotation.y += 0.01
      // mesh.rotation.x += 0.01
      // mesh.rotation.z += 0.01
      // for (let i = 0; i < boxes.length; i += 1) {
      //   boxes[i].rotation.y += 0.01
      //   // boxes[i].rotation.x += 0.01
      //   // boxes[i].rotation.z += 0.01
      // }

      // 原点方向を見つめる
      this.camera.lookAt(CAMERA_PARAM.lookAt)

      // フラグに応じてオブジェクトの状態を変化させる
      const yDirection = 0.01

      if (this.groupParent.rotation.y === 0) {
      } else if (this.groupParent.rotation.y < -1.35) {
        this.switch = false
      } else if (this.groupParent.rotation.y > 1.35) {
        this.switch = true
      }

      if (this.isDown === true) {
        console.log(this.switch, 'this.switch')
        // Y,Z 軸回転

        // this.groupParent.rotation.y -= yDirection
        if (this.switch) {
          this.groupParent.rotation.y -= yDirection
        } else {
          this.groupParent.rotation.y -= yDirection * -1
        }
        // if (this.groupParent.rotation.y <= 0) {
        //   this.groupParent.rotation.y -= 0.01
        //   if (this.groupParent.rotation.y <= -1.35) {
        //     // this.groupParent.rotation.y += 0.01
        //     this.groupParent.rotation.y * -1
        //   } else if (this.groupParent.rotation.y > -1.35) {
        //     // this.groupParent.rotation.y -= 0.01
        //     this.groupParent.rotation.y * -1
        //   }
        // }
        // if (this.groupParent.rotation.y >= 0) {
        //   this.groupParent.rotation.y += 0.01
        //   if (this.groupParent.rotation.y >= 1.35) {
        //     this.groupParent.rotation.y -= 0.01
        //   }
        // }

        // if (this.groupParent.rotation.y === -1.35) {
        //   this.groupParent.rotation.y += 0.01
        // } else if (this.groupParent.rotation.y === 1.35) {
        //   this.groupParent.rotation.y -= 0.01
        // }

        this.groupChild.rotation.z -= 0.1

        console.log(this.groupParent.rotation.y, 'this.groupParent.rotation.y')
        // for (let i = 0; i < boxes.length; i += 1) {
        //   boxes[i].rotation.y += 0.05
        // }
        // mesh.rotation.y += 0.01
        // mesh.rotation.x += 0.01
        // mesh.rotation.z += 0.01
      }

      // レンダラーで描画
      this.renderer.render(this.scene, this.camera)

      // 恒常ループの設定
      requestAnimationFrame(this.render)
    }
  }
}

export default ThreeApp2
