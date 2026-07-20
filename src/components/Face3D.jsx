import { Suspense, useMemo } from 'react'
import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls, Html, useGLTF } from '@react-three/drei'
import * as THREE from 'three'

import glbUrl from '../assets/Facemesh_w.texture/FaceMesh_draco.glb?url'
import maskUrl from '../assets/Facemesh_w.texture/Face_Mask.glb?url'
import diffuseUrl from '../assets/Facemesh_w.texture/FaceMesh_diffuse.webp?url'
import normalUrl from '../assets/Facemesh_w.texture/FaceMesh_normal.webp?url'
import roughUrl from '../assets/Facemesh_w.texture/FaceMesh_roughness.webp?url'

const DRACO_PATH = '/draco/gltf/' // glTF 전용 경량 디코더(188KB)

// 앱 시작 시 미리 로드 → 얼굴 페이지 진입 전에 캐시에 올려 첫 표시를 빠르게
useGLTF.preload(glbUrl, DRACO_PATH)
useGLTF.preload(maskUrl, DRACO_PATH)
useLoader.preload(THREE.TextureLoader, [diffuseUrl, normalUrl, roughUrl])

// 구역 색 (이름 접두)
function zoneColor(name) {
  if (name[0] === 'C') return '#3fd0ff' // 볼
  if (name[0] === 'S') return '#c58bff' // 턱선
  if (name === 'IO' || name === 'LO') return '#ff7a9c' // 눈가
  if (name === 'MB' || name[0] === 'B') return '#ffb74d' // 이마·눈썹
  return '#7fd6a0' // P2 등
}

// 얼굴 마스크(구역 지오메트리)를 얼굴 정규화 변환에 맞춰 정렬 + 구역별 색/외곽선 + 좌우 미러.
function buildMask(maskScene, s, center) {
  const one = maskScene.clone(true)
  one.scale.setScalar(s)
  one.position.set(-center.x * s, -center.y * s, -center.z * s)
  one.traverse((c) => {
    if (c.isMesh) {
      c.material = new THREE.MeshBasicMaterial({
        color: zoneColor(c.name),
        transparent: true,
        opacity: 0.36,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
      c.userData.zone = c.name
      c.userData.side = 'R' // 기준(base) = 우측
      c.renderOrder = 2
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(c.geometry, 30),
        new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.7 }),
      )
      edges.name = 'zoneedge'
      c.add(edges)
    }
  })

  // 반대쪽: 정규화 얼굴 중심(x=0) 기준 미러 (좌측)
  // clone(true)은 머티리얼을 공유하므로, 좌우 독립 강조를 위해 머티리얼을 복제한다.
  const other = one.clone(true)
  other.traverse((c) => {
    if (c.isMesh) {
      c.material = c.material.clone()
      c.userData.side = 'L'
    }
  })
  const otherWrap = new THREE.Group()
  otherWrap.scale.x = -1
  otherWrap.add(other)

  const group = new THREE.Group()
  group.add(one)
  group.add(otherWrap)
  return group
}

// 깊이별 색
const TIP_COLORS = { '4.5': '#3fd0ff', '3.5': '#ffb74d', '1.5': '#ff7a9c' }

// 시술 구역 (정규화 얼굴 좌표: y0.5=눈썹, 0.4=눈, 0.3=눈밑, 0.1=입). 좌우 미러링.
const DOT_ZONES = [
  { tip: '3.5', x0: 0.04, x1: 0.28, y0: 0.54, y1: 0.64 }, // 이마
  { tip: '3.5', x0: 0.22, x1: 0.32, y0: 0.33, y1: 0.47 }, // 관자·상부볼
  { tip: '1.5', x0: 0.09, x1: 0.27, y0: 0.3, y1: 0.375 }, // 눈밑
  { tip: '4.5', x0: 0.09, x1: 0.33, y0: 0.13, y1: 0.31 }, // 볼
  { tip: '4.5', x0: 0.1, x1: 0.27, y0: -0.02, y1: 0.09 }, // 턱선
]

// 제외 영역(타원) — 귀·입술·코·눈. cx>0 는 |x| 기준 좌우 공통.
const EXCLUDE = [
  { cx: 0, cy: 0.05, rx: 0.15, ry: 0.08 },
  { cx: 0, cy: 0.27, rx: 0.075, ry: 0.17 },
  { cx: 0.18, cy: 0.4, rx: 0.12, ry: 0.06 },
  { cx: 0.4, cy: 0.42, rx: 0.12, ry: 0.22 },
]
function isExcluded(x, y) {
  const ax = Math.abs(x)
  return EXCLUDE.some((e) => {
    const dx = (ax - e.cx) / e.rx
    const dy = (y - e.cy) / e.ry
    return dx * dx + dy * dy < 1
  })
}

// 점 스프라이트 텍스처 (모듈 캐시)
let _circle
function circleTex() {
  if (_circle) return _circle
  const s = 64
  const cv = document.createElement('canvas')
  cv.width = cv.height = s
  const ctx = cv.getContext('2d')
  const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.5, 'rgba(255,255,255,1)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, s, s)
  _circle = new THREE.CanvasTexture(cv)
  return _circle
}

// 시술 구역 더미 점 (레이캐스트로 얼굴 표면에). 깊이별 Points 그룹.
function buildZoneDots(meshes) {
  const ray = new THREE.Raycaster()
  const dir = new THREE.Vector3(0, 0, -1)
  const step = 0.016
  const byTip = { '4.5': [], '3.5': [], '1.5': [] }
  for (const z of DOT_ZONES) {
    for (const side of [1, -1]) {
      for (let gx = z.x0; gx <= z.x1 + 1e-6; gx += step) {
        for (let gy = z.y0; gy <= z.y1 + 1e-6; gy += step) {
          const x = side * gx
          if (isExcluded(x, gy)) continue
          ray.set(new THREE.Vector3(x, gy, 2), dir)
          const hits = ray.intersectObjects(meshes, false)
          if (hits.length) {
            const p = hits[0].point
            byTip[z.tip].push(p.x, p.y, p.z + 0.012)
          }
        }
      }
    }
  }
  const group = new THREE.Group()
  for (const tip of Object.keys(byTip)) {
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(byTip[tip], 3))
    const pts = new THREE.Points(
      geo,
      new THREE.PointsMaterial({
        size: 0.014,
        map: circleTex(),
        transparent: true,
        alphaTest: 0.25,
        depthWrite: false,
        color: TIP_COLORS[tip],
        opacity: 0.95,
        sizeAttenuation: true,
      }),
    )
    pts.name = `dots-${tip}`
    group.add(pts)
  }
  return group
}

// 실측 샷 점 (좌표 스트리밍). shots: [{ x, y, z, tip }]
function buildLiveShots(shots) {
  const pos = []
  const col = []
  const c = new THREE.Color()
  for (const s of shots) {
    pos.push(s.x, s.y, (s.z ?? 0.4) + 0.014)
    c.set(TIP_COLORS[s.tip] || '#ffffff')
    col.push(c.r, c.g, c.b)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  return new THREE.Points(
    geo,
    new THREE.PointsMaterial({
      size: 0.022,
      map: circleTex(),
      vertexColors: true,
      transparent: true,
      alphaTest: 0.25,
      depthWrite: false,
      sizeAttenuation: true,
    }),
  )
}

// 샷을 짧은 선분으로 (울쎄라 1샷=1선). shots: [{ x, y, z, tip }]
function buildLineShots(shots) {
  const pos = []
  const col = []
  const c = new THREE.Color()
  const len = 0.02
  for (const s of shots) {
    const z = (s.z ?? 0.4) + 0.014
    const tilt = s.x * 0.06
    pos.push(s.x - tilt, s.y - len / 2, z, s.x + tilt, s.y + len / 2, z)
    c.set(TIP_COLORS[s.tip] || '#ffffff')
    col.push(c.r, c.g, c.b, c.r, c.g, c.b)
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
  geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3))
  return new THREE.LineSegments(
    geo,
    new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.92, depthWrite: false }),
  )
}

// 구역 사각형(울쎄라 그리드)을 얼굴 표면에 얹음 — 격자 레이캐스트로 굴곡 따라감 + 흰 외곽선.
function buildZoneRects(meshes, rects) {
  const ray = new THREE.Raycaster()
  const dir = new THREE.Vector3(0, 0, -1)
  const group = new THREE.Group()
  const NX = 1
  const NY = 2
  for (const r of rects) {
    const grid = []
    for (let j = 0; j <= NY; j++) {
      const row = []
      for (let i = 0; i <= NX; i++) {
        const x = r.x0 + (i / NX) * (r.x1 - r.x0)
        const y = r.y0 + (j / NY) * (r.y1 - r.y0)
        ray.set(new THREE.Vector3(x, y, 2), dir)
        const hit = ray.intersectObjects(meshes, false)[0]
        row.push(hit ? hit.point.clone().setZ(hit.point.z + 0.008) : null)
      }
      grid.push(row)
    }
    // 채움(반투명)
    const pos = []
    for (let j = 0; j < NY; j++) {
      for (let i = 0; i < NX; i++) {
        const a = grid[j][i], b = grid[j][i + 1], c = grid[j + 1][i + 1], d = grid[j + 1][i]
        if (!a || !b || !c || !d) continue
        pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z, a.x, a.y, a.z, c.x, c.y, c.z, d.x, d.y, d.z)
      }
    }
    if (pos.length) {
      const g = new THREE.BufferGeometry()
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3))
      const fill = new THREE.Mesh(
        g,
        new THREE.MeshBasicMaterial({ color: r.color || '#ffffff', transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide }),
      )
      fill.name = 'zonefill'
      fill.userData.zone = r.id
      group.add(fill)
    }
    // 외곽선(흰색)
    const border = []
    const push = (p) => p && border.push(p)
    for (let i = 0; i <= NX; i++) push(grid[0][i])
    for (let j = 1; j <= NY; j++) push(grid[j][NX])
    for (let i = NX - 1; i >= 0; i--) push(grid[NY][i])
    for (let j = NY - 1; j >= 1; j--) push(grid[j][0])
    if (border.length > 2) {
      const bg = new THREE.BufferGeometry().setFromPoints(border)
      group.add(new THREE.LineLoop(bg, new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.85 })))
    }
  }
  return group
}

// FBX 스캔 메쉬 + PBR 텍스처. zoneRects(구역면·클릭) / lineShots / liveShots / 구역 더미 점.
function FaceModel({ showMesh, selectedTip, liveShots, lineShots, zoneRects, maskZones, activeZones, onZoneClick, selectedZone, selectedSide }) {
  const { scene } = useGLTF(glbUrl, DRACO_PATH)
  const { scene: maskScene } = useGLTF(maskUrl, DRACO_PATH)
  const [map, normalMap, roughnessMap] = useLoader(THREE.TextureLoader, [
    diffuseUrl,
    normalUrl,
    roughUrl,
  ])

  const { root, zoneDots, rectsGroup, maskGroup } = useMemo(() => {
    map.colorSpace = THREE.SRGBColorSpace
    for (const t of [map, normalMap, roughnessMap]) {
      t.flipY = false // glTF/GLB UV 는 flipY=false (FBX 와 반대)
      t.anisotropy = 16
    }

    const obj = scene.clone(true)
    const meshes = []
    obj.traverse((c) => {
      if (c.isMesh) meshes.push(c)
    })
    const mat = new THREE.MeshStandardMaterial({ map, normalMap, roughnessMap, roughness: 1, metalness: 0 })
    mat.normalScale.set(0.7, 0.7)
    for (const c of meshes) {
      c.material = mat
      const wire = new THREE.Mesh(
        c.geometry,
        new THREE.MeshBasicMaterial({ wireframe: true, color: '#e6f8ff', transparent: true, opacity: 0.16, depthWrite: false }),
      )
      wire.name = 'scanWire'
      c.add(wire)
    }

    const box = new THREE.Box3().setFromObject(obj)
    const size = box.getSize(new THREE.Vector3())
    const center = box.getCenter(new THREE.Vector3())
    const s = 1.9 / (size.y || 1)
    obj.scale.setScalar(s)
    obj.position.set(-center.x * s, -center.y * s, -center.z * s)
    obj.updateMatrixWorld(true)

    return {
      root: obj,
      zoneDots: buildZoneDots(meshes),
      rectsGroup: zoneRects ? buildZoneRects(meshes, zoneRects) : null,
      maskGroup: maskZones ? buildMask(maskScene, s, center) : null,
    }
  }, [scene, maskScene, map, normalMap, roughnessMap, zoneRects, maskZones])

  const liveDots = useMemo(() => (liveShots ? buildLiveShots(liveShots) : null), [liveShots])
  const lineDots = useMemo(() => (lineShots ? buildLineShots(lineShots) : null), [lineShots])

  const overlayOn = liveShots || lineShots || zoneRects || maskZones
  root.traverse((c) => {
    if (c.name === 'scanWire') c.visible = showMesh
  })
  // 오버레이가 있으면 구역 더미 숨김. selectedTip 'all' 이면 전체 구역 표시.
  zoneDots.children.forEach((c) => {
    c.visible = !overlayOn && (selectedTip === 'all' || c.name === `dots-${selectedTip}`)
  })
  if (rectsGroup) {
    rectsGroup.traverse((c) => {
      if (c.name === 'zonefill') c.material.opacity = c.userData.zone === selectedZone ? 0.6 : 0.24
    })
  }
  // 마스크: 구역별 표시/숨김(activeZones) + 선택 강조 (선택 side 있으면 그쪽만)
  if (maskGroup) {
    maskGroup.traverse((c) => {
      if (c.userData.zone) {
        c.visible = !activeZones || activeZones.has(c.userData.zone)
        const sel =
          c.userData.zone === selectedZone && (!selectedSide || c.userData.side === selectedSide)
        c.material.opacity = sel ? 0.62 : 0.34
      }
    })
  }

  const handleClick = (e) => {
    const zone = e.object?.userData?.zone
    if (zone && onZoneClick) {
      e.stopPropagation()
      onZoneClick(zone, e.object.userData.side || null)
    }
  }

  return (
    <group>
      <primitive object={root} />
      <primitive object={zoneDots} />
      {rectsGroup && <primitive object={rectsGroup} onClick={handleClick} />}
      {maskGroup && <primitive object={maskGroup} onClick={handleClick} />}
      {liveDots && <primitive object={liveDots} />}
      {lineDots && <primitive object={lineDots} />}
    </group>
  )
}

// 뷰별 카메라/회전 프리셋: front(정면) / left·right(3/4 측면)
const VIEWS = {
  front: { pos: [0, 0.3, 3.05], az: [-Math.PI * 0.14, Math.PI * 0.14] },
  right: { pos: [2.0, 0.28, 2.3], az: [Math.PI * 0.14, Math.PI * 0.42] },
  left: { pos: [-2.0, 0.28, 2.3], az: [-Math.PI * 0.42, -Math.PI * 0.14] },
}

export default function Face3D({ mode = 'mesh', selectedTip = '3.5', liveShots = null, lineShots = null, zoneRects = null, maskZones = false, activeZones = null, view = 'front', onZoneClick = null, selectedZone = null, selectedSide = null }) {
  const v = VIEWS[view] || VIEWS.front
  return (
    <Canvas
      className="fmap-canvas"
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
      camera={{ position: v.pos, fov: 30 }}
    >
      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#ffffff', '#e7dcd3', 0.35]} />
      <directionalLight position={[2, 3, 4]} intensity={1.3} />
      <directionalLight position={[-3, 1, 1.5]} intensity={0.5} />
      <directionalLight position={[0, 1.5, -3]} intensity={0.35} />
      <Suspense
        fallback={
          <Html center>
            <div className="fmap-loading">3D 얼굴 불러오는 중…</div>
          </Html>
        }
      >
        <FaceModel showMesh={mode === 'mesh'} selectedTip={selectedTip} liveShots={liveShots} lineShots={lineShots} zoneRects={zoneRects} maskZones={maskZones} activeZones={activeZones} onZoneClick={onZoneClick} selectedZone={selectedZone} selectedSide={selectedSide} />
      </Suspense>
      <OrbitControls
        makeDefault
        target={[0, 0.15, 0]}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI * 0.42}
        maxPolarAngle={Math.PI * 0.58}
        minAzimuthAngle={v.az[0]}
        maxAzimuthAngle={v.az[1]}
      />
    </Canvas>
  )
}
