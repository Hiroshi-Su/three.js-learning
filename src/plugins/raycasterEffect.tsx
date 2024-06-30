// = 024 ======================================================================
// 3D プログラミングをしていると、マウスカーソルでクリックしてオブジェクトを選択
// するなどの「マウスを利用した 3D 空間への干渉」を行いたくなる場面に比較的よく
// 出くわします。
// 本来、このような「三次元空間への干渉」はそこそこしっかり数学を活用しないと実
// 現が難しいものですが、three.js には Raycaster と呼ばれる仕組みがあり、これを
// 用いることで数学の知識があまりなくても、比較的容易に三次元空間への干渉処理を
// 実装することができます。
// ここでは、クリックという操作を契機に、マウスカーソルで指し示したオブジェクト
// の色を変化させてみましょう。
// ============================================================================

import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import earthTextureImg from '@/assets/img/earth.jpg'

// window.addEventListener('DOMContentLoaded', async () => {
//   const wrapper = document.querySelector('#webgl');
//   const app = new ThreeApp(wrapper);
//   await app.load();
//   app.init();
//   app.render();
// }, false);

export class RaycasterEffect {
  render: () => void

  init: () => void

  wrapper // canvas の親要素

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
      fovy: 60,
      aspect: window.innerWidth / window.innerHeight,
      near: 0.1,
      far: 50.0,
      position: new THREE.Vector3(0.0, 2.0, 20.0),
      lookAt: new THREE.Vector3(0.0, 0.0, 0.0),
    }
    /**
     * レンダラー定義のための定数
     */
    const RENDERER_PARAM = {
      clearColor: 0xffffff,
      width: window.innerWidth,
      height: window.innerHeight,
    }
    /**
     * 平行光源定義のための定数
     */
    const DIRECTIONAL_LIGHT_PARAM = {
      color: 0xffffff,
      intensity: 1.0,
      position: new THREE.Vector3(1.0, 1.0, 1.0),
    }
    /**
     * アンビエントライト定義のための定数
     */
    const AMBIENT_LIGHT_PARAM = {
      color: 0xffffff,
      intensity: 0.1,
    }
    /**
     * マテリアル定義のための定数
     */
    const MATERIAL_PARAM = {
      color: 0xffffff,
      side: THREE.DoubleSide,
    }
    /**
     * レイが交差した際のマテリアル定義のための定数 @@@
     */
    const INTERSECTION_MATERIAL_PARAM = {
      color: 0x00ff00,
    }
    /**
     * フォグの定義のための定数
     */
    // const FOG_PARAM = {
    //   color: 0xffffff,
    //   near: 15.0,
    //   far: 25.0,
    // }

    // 初期化時に canvas を append できるようにプロパティに保持
    this.wrapper = wrapper

    let renderer: THREE.WebGLRenderer // レンダラ
    let scene: THREE.Scene // シーン
    let camera: THREE.PerspectiveCamera // カメラ
    let directionalLight // 平行光源（ディレクショナルライト）
    let ambientLight // 環境光（アンビエントライト）
    let material: THREE.MeshBasicMaterial // マテリアル
    let hitMaterial: THREE.MeshPhongMaterial // レイが交差した際のマテリアル @@@
    // let torusGeometry: THREE.TorusGeometry // トーラスジオメトリ
    // let torusArray: THREE.Mesh[] = [] // トーラスメッシュの配列
    let texture: THREE.Texture // テクスチャ
    let controls: OrbitControls // オービットコントロール
    let axesHelper: THREE.AxesHelper // 軸ヘルパー
    // let isDown: boolean // キーの押下状態用フラグ
    // let group: THREE.Group // グループ
    let planeGeometry: THREE.PlaneGeometry // planeジオメトリ
    let planeArray: THREE.Mesh[] = [] // planeジオメトリの配列
    // let planeArray2: THREE.Mesh[] = [] // planeジオメトリの配列
    // let planeArrayLarge: THREE.Mesh[][] = [] // planeジオメトリの配列
    let planeGroup: THREE.Group // グループ
    let planeGroup2: THREE.Group // グループ
    // let planeGroupLarge: THREE.Group // グループ
    let hitMateriaPlane: THREE.MeshBasicMaterial
    let intersectsPlane: THREE.Intersection[]

    // planeメッシュ
    const planeCount = 10
    // const totalGroup = 5
    // 角度
    const deg = 360 / planeCount
    // ラジアン
    const rad = (deg * Math.PI) / 180

    // Raycaster のインスタンスを生成する @@@
    const raycaster: THREE.Raycaster = new THREE.Raycaster()
    // マウスのクリックイベントの定義 @@@
    window.addEventListener(
      'click',
      mouseEvent => {
        // スクリーン空間の座標系をレイキャスター用に正規化する（-1.0 ~ 1.0 の範囲）
        const x = (mouseEvent.clientX / window.innerWidth) * 2.0 - 1.0
        const y = (mouseEvent.clientY / window.innerHeight) * 2.0 - 1.0
        // スクリーン空間は上下が反転している点に注意（Y だけ符号を反転させる）
        const v = new THREE.Vector2(x, -y)
        // レイキャスターに正規化済みマウス座標とカメラを指定する
        raycaster.setFromCamera(v, camera)

        // // scene に含まれるすべてのオブジェクト（ここでは Mesh）を対象にレイキャストする
        // const intersects = raycaster.intersectObjects(torusArray)
        // // レイが交差しなかった場合を考慮し一度マテリアルを通常時の状態にリセットしておく
        // torusArray.forEach(mesh => {
        //   // eslint-disable-next-line no-param-reassign
        //   mesh.material = material
        // })

        // for plane
        // scene に含まれるすべてのオブジェクト（ここでは Mesh）を対象にレイキャストする
        const intersectsObjsPlane = raycaster.intersectObjects(planeArray)
        // レイが交差しなかった場合を考慮し一度マテリアルを通常時の状態にリセットしておく
        planeArray.forEach(mesh => {
          // eslint-disable-next-line no-param-reassign
          mesh.material = material
        })

        // - intersectObjects でレイキャストした結果は配列 ----------------------
        // 名前が似ているので紛らわしいのですが Raycaster には intersectObject と
        // intersectObjects があります。複数形の s がついているかどうかの違いがあ
        // り、複数形の場合は引数と戻り値のいずれも配列になります。
        // この配列の長さが 0 である場合はカーソル位置に向かって放ったレイは、どの
        // オブジェクトとも交差しなかったと判断できます。また、複数のオブジェクト
        // とレイが交差した場合も、three.js 側で並び替えてくれるので 0 番目の要素
        // を参照すれば必ず見た目上の最も手前にあるオブジェクトを参照できます。
        // 戻り値の中身は object というプロパティを経由することで対象の Mesh など
        // のオブジェクトを参照できる他、交点の座標などもわかります。
        // ----------------------------------------------------------------------
        // if (intersects.length > 0) {
        //   const intersectedObject = intersects[0].object as THREE.Mesh
        //   intersectedObject.material = hitMaterial
        // }

        if (intersectsObjsPlane.length > 0) {
          console.log(intersectsObjsPlane, 'intersectsObjsPlane')
          const intersectedObjectPlane = intersectsObjsPlane[0]
            .object as THREE.Mesh
          intersectedObjectPlane.material = hitMateriaPlane
        }
        // - Raycaster は CPU 上で動作する --------------------------------------
        // WebGL は描画処理に GPU を活用することで高速に動作します。
        // しかし JavaScript は CPU 上で動作するプログラムであり、Raycaster が内部
        // で行っている処理はあくまでも CPU 上で行われます。
        // 原理的には「メッシュを構成するポリゴンとレイが衝突するか」を JavaScript
        // でループして判定していますので、シーン内のメッシュの量やポリゴンの量が
        // 増えると、それに比例して Raycaster のコストも増加します。
        // ----------------------------------------------------------------------
      },
      false,
    )

    const canvas = document.getElementById('canvas')
    if (canvas) {
      canvas.addEventListener(
        'mousemove',
        mouseEvent => {
          // スクリーン空間の座標系をレイキャスター用に正規化する（-1.0 ~ 1.0 の範囲）
          const x = (mouseEvent.clientX / window.innerWidth) * 2.0 - 1.0
          const y = (mouseEvent.clientY / window.innerHeight) * 2.0 - 1.0
          // スクリーン空間は上下が反転している点に注意（Y だけ符号を反転させる）
          const v = new THREE.Vector3(x, -y, 1)
          v.unproject(camera) // オブジェクト座標
          // レイキャスターに正規化済みマウス座標とカメラを指定する
          // raycaster.setFromCamera(v, camera)
          const ray = new THREE.Raycaster(
            camera.position,
            v.sub(camera.position).normalize(),
          )
          // console.log(ray, 'ray')
          intersectsPlane = ray.intersectObjects(planeArray)
          // レイが交差しなかった場合を考慮し一度マテリアルを通常時の状態にリセットしておく
          planeArray.forEach((mesh, i) => {
            // eslint-disable-next-line no-param-reassign
            // const planeCount = 10
            // const radian = (i / planeCount) * Math.PI * 2
            mesh.position.set(
              8.5 * Math.cos(rad * i), // X座標
              0, // Y座標
              8.5 * Math.sin(rad * i), // Z座標
            )
          })
          planeArray.forEach(mesh => {
            // eslint-disable-next-line no-param-reassign
            mesh.material = material
          })

          if (intersectsPlane.length > 0) {
            // console.log(intersectsPlane, 'intersectsPlane')
            const intersectedObjectPlane = intersectsPlane[0]
              .object as THREE.Mesh
            // ホバーしたものの色変える
            intersectedObjectPlane.material = hitMateriaPlane
            console.log(intersectedObjectPlane.position, 'position')

            // ホバーしたものをy軸に0.2
            intersectedObjectPlane.position.y = 0.2
            // const vector3 = new THREE.Vector3(1, 1, 1.2)
            // intersectedObjectPlane.position.multiply(vector3)
          }
        },
        false,
      )
    }

    // キーの押下や離す操作を検出できるようにする
    // window.addEventListener(
    //   'keydown',
    //   keyEvent => {
    //     switch (keyEvent.key) {
    //       case ' ':
    //         isDown = true
    //         break
    //       default:
    //     }
    //   },
    //   false,
    // )
    // window.addEventListener(
    //   'keyup',
    //   () => {
    //     isDown = false
    //   },
    //   false,
    // )

    // スクロール操作を検出できるようにする
    let preDeltaY: number
    let curDeltaY: number
    window.addEventListener(
      'wheel',
      (event: WheelEvent) => {
        preDeltaY = 0
        curDeltaY = event.deltaY
        if (curDeltaY >= preDeltaY) {
          planeGroup.rotation.y += 0.05
          preDeltaY = event.deltaY
        } else if (curDeltaY < preDeltaY) {
          planeGroup.rotation.y -= 0.05
          preDeltaY = event.deltaY
        }
      },
      false,
    )

    // ウィンドウのリサイズを検出できるようにする
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
     * 初期化処理
     */
    this.init = () => {
      // レンダラー
      const color = new THREE.Color(RENDERER_PARAM.clearColor)
      renderer = new THREE.WebGLRenderer()
      renderer.setClearColor(color)
      renderer.setSize(RENDERER_PARAM.width, RENDERER_PARAM.height)
      wrapper.appendChild(renderer.domElement)

      // シーン
      scene = new THREE.Scene()

      // フォグ
      // scene.fog = new THREE.Fog(FOG_PARAM.color, FOG_PARAM.near, FOG_PARAM.far)

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
      directionalLight = new THREE.DirectionalLight(
        DIRECTIONAL_LIGHT_PARAM.color,
        DIRECTIONAL_LIGHT_PARAM.intensity,
      )
      directionalLight.position.copy(DIRECTIONAL_LIGHT_PARAM.position)
      scene.add(directionalLight)

      // アンビエントライト（環境光）
      ambientLight = new THREE.AmbientLight(
        AMBIENT_LIGHT_PARAM.color,
        AMBIENT_LIGHT_PARAM.intensity,
      )
      scene.add(ambientLight)

      // テクスチャ
      const loader = new THREE.TextureLoader()
      texture = loader.load(earthTextureImg.src)

      // マテリアル
      material = new THREE.MeshBasicMaterial(MATERIAL_PARAM)
      material.map = texture
      // 交差時に表示するためのマテリアルを定義 @@@
      hitMaterial = new THREE.MeshPhongMaterial(INTERSECTION_MATERIAL_PARAM)
      hitMaterial.map = texture

      hitMateriaPlane = new THREE.MeshBasicMaterial(INTERSECTION_MATERIAL_PARAM)
      hitMateriaPlane.map = texture

      // グループ
      // group = new THREE.Group()
      // scene.add(group)
      planeGroup = new THREE.Group()
      scene.add(planeGroup)
      planeGroup2 = new THREE.Group()
      scene.add(planeGroup2)
      // planeGroupLarge = new THREE.Group()
      // scene.add(planeGroupLarge)

      // トーラスメッシュ
      // const torusCount = 5
      // const transformScale = 5.0
      // torusGeometry = new THREE.TorusGeometry(0.5, 0.2, 8, 16)
      // torusArray = []
      // for (let i = 0; i < torusCount; i += 1) {
      //   const torus = new THREE.Mesh(torusGeometry, material)
      //   torus.position.x = (Math.random() * 2.0 - 1.0) * transformScale
      //   torus.position.y = (Math.random() * 2.0 - 1.0) * transformScale
      //   torus.position.z = (Math.random() * 2.0 - 1.0) * transformScale
      //   group.add(torus)
      //   torusArray.push(torus)
      // }

      // // planeメッシュ
      // const planeCount = 10
      // // const totalGroup = 5
      // // 角度
      // const deg = 360 / planeCount
      // // ラジアン
      // const rad = (deg * Math.PI) / 180
      // 半径
      const r = 8.5
      // const diameter = planeCount / 10
      planeGeometry = new THREE.PlaneGeometry(1, 1)
      planeArray = []
      // planeArray2 = []
      // planeArrayLarge = [planeArray]

      for (let i = 0; i < planeCount; i += 1) {
        const plane = new THREE.Mesh(planeGeometry, material)
        // const radian = (i / planeCount) * Math.PI * 2
        plane.position.set(
          r * Math.cos(rad * i), // X座標
          0, // Y座標
          r * Math.sin(rad * i), // Z座標
        )

        // 向きを中心に設定
        // plane.rotation.y = 5
        // plane.lookAt(0, 0, 0)
        // console.log(planeGroup, 'planeGroup')
        planeGroup.add(plane)
        planeArray.push(plane)
      }
      // planeGroupLarge.add(planeGroup)
      // for (let k = 0; k < planeCount; k += 1) {
      //   const plane = new THREE.Mesh(planeGeometry, material)
      //   // const radian = (k / planeCount) * Math.PI * 2
      //   plane.position.set(
      //     r * Math.cos(rad * k), // X座標
      //     0, // Y座標
      //     r * Math.sin(rad * k), // Z座標
      //   )

      //   //向きを中心に設定
      //   // plane.rotation.y = 5
      //   // plane.lookAt(0, 0, 0)
      //   // console.log(planeGroup2, 'planeGroup2')
      //   planeGroup2.add(plane)
      //   planeArray2.push(plane)
      // }
      // planeGroupLarge.add(planeGroup2)

      // それぞれのgroupのy軸の位置変える
      // for (let j = 0; j < planeArrayLarge.length; j += 1) {
      //   planeGroupLarge.children[j].position.set(
      //     0, // X座標
      //     j * 2, // Y座標
      //     0, // Z座標
      //   )
      //   console.log(planeGroupLarge, 'planeGroupLarge')

      //   // planeGroup.position.y = j * 0.5
      //   // planeGroupLarge.add(planeGroup)
      //   // planeArrayLarge.push(planeArray)
      // }

      // 軸ヘルパー
      const axesBarLength = 5.0
      axesHelper = new THREE.AxesHelper(axesBarLength)
      scene.add(axesHelper)

      // コントロール
      controls = new OrbitControls(camera, renderer.domElement)
      controls.enableZoom = false

      // キーの押下状態を保持するフラグ
      // isDown = false
    }

    /**
     * アセット（素材）のロードを行う Promise
     */
    // load() {
    //   return new Promise((resolve) => {
    //     const imagePath = './sample.jpg';
    //     const loader = new THREE.TextureLoader();
    //     loader.load(imagePath, (texture) => {
    //       texture = texture;
    //       resolve();
    //     });
    //   });
    // }

    /**
     * 描画処理
     */
    this.render = () => {
      // 恒常ループ
      requestAnimationFrame(this.render)

      // コントロールを更新
      controls.update()

      // フラグに応じてオブジェクトの状態を変化させる
      // if (isDown === true) {
      //   group.rotation.y += 0.05
      // }

      // console.log(intersectsPlane, 'intersectsPlane')
      // if (intersectsPlane) {
      //   if (intersectsPlane.length > 0) {
      //     console.log(intersectsPlane, 'intersectsPlane')
      //     const intersectedObjectPlane = intersectsPlane[0].object as THREE.Mesh
      //     intersectedObjectPlane.material = hitMateriaPlane
      //   }
      // }

      // レンダラーで描画
      renderer.render(scene, camera)
    }

    // this のバインド
    this.render = this.render.bind(this)
  }
}

export default RaycasterEffect
