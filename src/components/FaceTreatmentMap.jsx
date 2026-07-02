import { useMemo, useState } from 'react'
import { tipLines } from '../data/sample.js'
import { useFaceLandmarks } from '../lib/faceLandmarks.js'
import faceMain from '../assets/face-main.jpg'

// 이미지 비율(820:1024)에 맞춘 SVG 좌표계. x:0~100, y:0~125
const VB_W = 100
const VB_H = 125

const lerp = (a, b, t) => a + (b - a) * t

// 인식된 얼굴 랜드마크(정규화 0~1)로부터 각 부위 중심을 얼굴 상대 좌표로 계산.
// 반환값은 뷰박스 좌표(cx:0~100, cy:0~125). 인식 실패 시 null.
function computePositions(lm) {
  if (!lm || lm.length < 400) return null
  const p = (i) => ({ x: lm[i].x, y: lm[i].y })
  const g = (idxs) => {
    let x = 0
    let y = 0
    idxs.forEach((i) => {
      x += lm[i].x
      y += lm[i].y
    })
    return { x: x / idxs.length, y: y / idxs.length }
  }

  const eyeA = g([33, 133, 159, 145])
  const eyeB = g([362, 263, 386, 374])
  const [eyeL, eyeR] = eyeA.x < eyeB.x ? [eyeA, eyeB] : [eyeB, eyeA]
  const mouth = g([13, 14, 61, 291])
  const chin = p(152)
  const fore = p(10)
  const nose = p(1)
  const fA = p(234)
  const fB = p(454)
  const [faceL, faceR] = fA.x < fB.x ? [fA, fB] : [fB, fA]
  const eyeY = (eyeL.y + eyeR.y) / 2

  const N = {
    cheekL: { x: lerp(faceL.x, nose.x, 0.4), y: lerp(eyeY, mouth.y, 0.72) },
    cheekR: { x: lerp(faceR.x, nose.x, 0.4), y: lerp(eyeY, mouth.y, 0.72) },
    jawL: { x: lerp(faceL.x, chin.x, 0.42), y: lerp(mouth.y, chin.y, 0.45) },
    jawR: { x: lerp(faceR.x, chin.x, 0.42), y: lerp(mouth.y, chin.y, 0.45) },
    submental: { x: nose.x, y: lerp(mouth.y, chin.y, 0.82) },

    forehead: { x: nose.x, y: lerp(fore.y, eyeY, 0.45) },
    cheekUpL: { x: lerp(faceL.x, nose.x, 0.5), y: lerp(eyeY, mouth.y, 0.38) },
    cheekUpR: { x: lerp(faceR.x, nose.x, 0.5), y: lerp(eyeY, mouth.y, 0.38) },
    nasoL: { x: lerp(nose.x, faceL.x, 0.32), y: lerp(eyeY, mouth.y, 0.82) },
    nasoR: { x: lerp(nose.x, faceR.x, 0.32), y: lerp(eyeY, mouth.y, 0.82) },

    eyeL: { x: lerp(eyeL.x, faceL.x, 0.34), y: eyeL.y },
    eyeR: { x: lerp(eyeR.x, faceR.x, 0.34), y: eyeR.y },
    foreheadFine: { x: nose.x, y: lerp(fore.y, eyeY, 0.72) },
    glabella: { x: nose.x, y: lerp(eyeY, fore.y, 0.3) },
  }
  const out = {}
  for (const k in N) out[k] = { cx: N[k].x * VB_W, cy: N[k].y * VB_H }
  return out
}

// 프로토콜처럼 부위를 '구역(zone) 외곽선'으로 나누고, 각 구역에 샷수 원을 표기.
// 구역은 리프팅 벡터(angle) 방향으로 기울어진 사각형(경계선)으로 그린다.
function ZoneRegion({ cx, cy, zone, tone }) {
  const { w = 10, h = 10, angle = 0 } = zone
  return (
    <rect
      x={cx - w / 2}
      y={cy - h / 2}
      width={w}
      height={h}
      rx="2.4"
      transform={`rotate(${angle} ${cx} ${cy})`}
      fill={tone}
      fillOpacity="0.16"
      stroke={tone}
      strokeOpacity="0.85"
      strokeWidth="0.7"
    />
  )
}

// 각 구역의 샷수를 프로토콜처럼 '색 원 + 흰 숫자'로 표기.
function ZoneBadge({ cx, cy, zone, tone }) {
  return (
    <g transform={`translate(${cx} ${cy})`}>
      <circle r="5.4" fill={tone} stroke="#fff" strokeWidth="0.8" />
      <text textAnchor="middle" dominantBaseline="central" fontSize="4.8" fontWeight="800" fill="#fff">
        {zone.count}
      </text>
    </g>
  )
}

// 팁(조사 깊이)을 선택하면 해당 깊이의 조사 위치가 선으로 표시됩니다.
export default function FaceTreatmentMap({ tips }) {
  const [ti, setTi] = useState(0)
  const lm = useFaceLandmarks(faceMain)
  const pos = useMemo(() => computePositions(lm), [lm])
  const tip = tips[ti]

  const xy = (z) => (pos && pos[z.key] ? pos[z.key] : { cx: z.x, cy: z.y * 1.25 })

  return (
    <div className="tmap">
      <div className="tip-selector">
        {tips.map((t, i) => (
          <button
            key={t.mm}
            className={`tip-chip${i === ti ? ' on' : ''}`}
            style={{ '--tone': t.tone }}
            onClick={() => setTi(i)}
          >
            <span className="tip-chip-mm">{t.label}</span>
            <span className="tip-chip-lines">{tipLines(t)} 샷</span>
          </button>
        ))}
      </div>

      <div className="tmap-face" style={{ aspectRatio: '820 / 1024' }}>
        <img src={faceMain} alt="시술 부위 맵" />
        <svg className="tmap-svg" viewBox={`0 0 ${VB_W} ${VB_H}`} preserveAspectRatio="none">
          {tip.zones.map((z) => {
            const { cx, cy } = xy(z)
            return <ZoneRegion key={z.key} cx={cx} cy={cy} zone={z} tone={tip.tone} />
          })}
          {tip.zones.map((z) => {
            const { cx, cy } = xy(z)
            return <ZoneBadge key={`${z.key}-b`} cx={cx} cy={cy} zone={z} tone={tip.tone} />
          })}
        </svg>
        <span className={`tmap-ai${pos ? ' on' : ''}`}>
          {pos ? '✓ AI 얼굴 인식' : '기본 배치'}
        </span>
      </div>

      <div className="tip-info" style={{ '--tone': tip.tone }}>
        <div className="tip-info-title">
          <span className="tip-dot" />
          {tip.label} 팁 · {tip.layer}
        </div>
        <div className="muted">샷당 {tip.energyJ}J · 총 {tipLines(tip)} 샷 (선)</div>
      </div>

      <div className="tip-zones">
        {tip.zones.map((z) => (
          <div key={z.key} className="tip-zone" style={{ '--tone': tip.tone }}>
            <span>{z.label}</span>
            <strong>{z.count}</strong>
          </div>
        ))}
      </div>
    </div>
  )
}
