import { useMemo, useState } from 'react'
import { tipTotal } from '../data/sample.js'
import { useFaceLandmarks } from '../lib/faceLandmarks.js'
import faceMain from '../assets/face-main.jpg'

// 이미지 비율(820:1024)에 맞춘 SVG 좌표계. x:0~100, y:0~125
const VB_W = 100
const VB_H = 125
const lerp = (a, b, t) => a + (b - a) * t

// 얼굴 외곽(FACE_OVAL) 랜드마크 인덱스 — 이 폴리곤으로 클리핑해 구역이 얼굴 밖으로 안 나가게 함
const FACE_OVAL = [
  10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152,
  148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
]

const FIXED_REFS = { faceL: 0.17, faceR: 0.83, nx: 0.5, foreY: 0.2, eyeY: 0.4, mouthY: 0.62, chinY: 0.8 }

function computeRefs(lm) {
  if (!lm || lm.length < 400) return FIXED_REFS
  const p = (i) => lm[i]
  const avgY = (idxs) => idxs.reduce((s, i) => s + lm[i].y, 0) / idxs.length
  const faceA = p(234).x
  const faceB = p(454).x
  return {
    faceL: Math.min(faceA, faceB),
    faceR: Math.max(faceA, faceB),
    nx: p(1).x,
    foreY: p(10).y,
    eyeY: avgY([159, 145, 386, 374]),
    mouthY: avgY([13, 14]),
    chinY: p(152).y,
  }
}

function regionCorners(region, R) {
  const { faceL, faceR, nx, foreY, eyeY, mouthY, chinY } = R
  const xL = (t) => lerp(nx, faceL, t)
  const yE = (t) => lerp(eyeY, mouthY, t)
  const yJ = (t) => lerp(mouthY, chinY, t)
  const yF = (t) => lerp(foreY, eyeY, t)
  const mirror = (pts) => pts.map(([x, y]) => [2 * nx - x, y])

  switch (region) {
    case 'cheekJawL':
      return [[xL(0.42), yE(0.2)], [xL(0.92), yE(0.08)], [xL(0.8), yJ(0.5)], [xL(0.48), yJ(0.78)]]
    case 'cheekJawR':
      return mirror(regionCorners('cheekJawL', R))
    case 'cheekUpL':
      // 관자·광대 — 아래로 내리고 넓게
      return [[xL(0.46), yE(0.18)], [xL(0.97), yE(0.08)], [xL(0.9), yE(0.44)], [xL(0.46), yE(0.52)]]
    case 'cheekUpR':
      return mirror(regionCorners('cheekUpL', R))
    case 'underEyeL':
      // 눈 바깥·아래(눈가 주름)에만 — 눈동자 침범 금지
      return [[xL(0.62), yE(0.06)], [xL(0.92), yE(-0.02)], [xL(0.86), yE(0.22)], [xL(0.62), yE(0.28)]]
    case 'underEyeR':
      return mirror(regionCorners('underEyeL', R))
    case 'foreheadBand':
      return [
        [lerp(nx, faceL, 0.68), yF(0.1)],
        [lerp(nx, faceR, 0.68), yF(0.1)],
        [lerp(nx, faceR, 0.58), yF(0.52)],
        [lerp(nx, faceL, 0.58), yF(0.52)],
      ]
    case 'submental':
      return [
        [lerp(nx, faceL, 0.26), yJ(0.52)],
        [lerp(nx, faceR, 0.26), yJ(0.52)],
        [lerp(nx, faceR, 0.2), yJ(0.92)],
        [lerp(nx, faceL, 0.2), yJ(0.92)],
      ]
    default:
      return [[0.4, 0.4], [0.6, 0.4], [0.6, 0.6], [0.4, 0.6]]
  }
}

function bilinear(c, u, v) {
  const top = [lerp(c[0][0], c[1][0], u), lerp(c[0][1], c[1][1], u)]
  const bot = [lerp(c[3][0], c[2][0], u), lerp(c[3][1], c[2][1], u)]
  return [lerp(top[0], bot[0], v) * VB_W, lerp(top[1], bot[1], v) * VB_H]
}

function panelCells(panel, R) {
  const c = regionCorners(panel.region, R)
  const { rows, cols } = panel
  const cells = []
  for (let r = 0; r < rows; r++) {
    for (let col = 0; col < cols; col++) {
      const idx = r * cols + col
      cells.push({
        id: `${panel.region}-${idx}`,
        points: [
          bilinear(c, col / cols, r / rows),
          bilinear(c, (col + 1) / cols, r / rows),
          bilinear(c, (col + 1) / cols, (r + 1) / rows),
          bilinear(c, col / cols, (r + 1) / rows),
        ],
        count: panel.counts[idx],
        label: panel.labels[idx],
      })
    }
  }
  return cells
}

const toPath = (points) => points.map((p) => p.join(',')).join(' ')

// 팁을 선택하고, 구역을 탭하면 아래에 구역명·샷수가 표시됩니다.
export default function FaceTreatmentMap({ tips, panels }) {
  const [ti, setTi] = useState(0)
  const [sel, setSel] = useState(null)
  const lm = useFaceLandmarks(faceMain)
  const refs = useMemo(() => computeRefs(lm), [lm])
  const tip = tips[ti]

  // 얼굴 외곽 클립 경로 (랜드마크 있으면 실루엣, 없으면 타원)
  const clip = useMemo(() => {
    if (lm && lm.length > 400) return toPath(FACE_OVAL.map((i) => [lm[i].x * VB_W, lm[i].y * VB_H]))
    return null
  }, [lm])

  const cells = useMemo(
    () => panels.filter((p) => p.tip === tip.mm).flatMap((p) => panelCells(p, refs)),
    [panels, tip, refs],
  )

  function selectCell(c) {
    setSel((prev) => (prev && prev.id === c.id ? null : { ...c, tip: tip.mm, energyJ: tip.energyJ }))
  }

  return (
    <div className="tmap">
      <div className="tip-selector">
        {tips.map((t, i) => (
          <button
            key={t.mm}
            className={`tip-chip${i === ti ? ' on' : ''}`}
            style={{ '--tone': t.tone }}
            onClick={() => {
              setTi(i)
              setSel(null)
            }}
          >
            <span className="tip-chip-mm">{t.label}</span>
            <span className="tip-chip-lines">{tipTotal(t.mm)} 샷</span>
          </button>
        ))}
      </div>

      <div className="tmap-face" style={{ aspectRatio: '820 / 1024' }}>
        <img src={faceMain} alt="시술 부위 맵" />
        <svg className="tmap-svg" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none">
          <defs>
            <clipPath id="faceClip">
              {clip ? <polygon points={clip} /> : <ellipse cx="50" cy="63" rx="33" ry="46" />}
            </clipPath>
          </defs>
          <g clipPath="url(#faceClip)">
            {cells.map((cell) => {
              const on = sel && sel.id === cell.id
              return (
                <polygon
                  key={cell.id}
                  points={toPath(cell.points)}
                  fill={tip.tone}
                  fillOpacity={on ? 0.55 : 0.26}
                  stroke="#fff"
                  strokeOpacity={on ? 0.6 : 0.5}
                  strokeWidth={on ? 1 : 0.6}
                  style={{ cursor: 'pointer' }}
                  onClick={() => selectCell(cell)}
                />
              )
            })}
          </g>
        </svg>
        <span className={`tmap-ai${lm ? ' on' : ''}`}>{lm ? '✓ AI 얼굴 인식' : '기본 배치'}</span>
      </div>

      <div className={`tmap-detail${sel ? ' show' : ''}`} style={{ '--tone': tip.tone }}>
        {sel ? (
          <>
            <div className="tmap-detail-name">
              <span className="tmap-detail-swatch" style={{ background: tip.tone }} />
              {sel.label}
            </div>
            <div className="tmap-detail-stats">
              <div><strong>{sel.count}</strong><span>샷</span></div>
              <div><strong>{tip.label}</strong><span>깊이</span></div>
              <div><strong>{Math.round(sel.count * tip.energyJ)}</strong><span>J</span></div>
            </div>
          </>
        ) : (
          <div className="tmap-detail-hint">구역을 탭하면 부위명과 샷수를 볼 수 있어요</div>
        )}
      </div>

      <div className="tip-info" style={{ '--tone': tip.tone }}>
        <div className="tip-info-title">
          <span className="tip-dot" />
          {tip.label} 팁 · {tip.layer}
        </div>
        <div className="muted">샷당 {tip.energyJ}J · 총 {tipTotal(tip.mm)} 샷 (선)</div>
      </div>
    </div>
  )
}
