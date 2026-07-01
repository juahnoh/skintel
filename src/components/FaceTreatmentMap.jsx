import { useState } from 'react'
import { ENERGY_COLOR, energyAlpha } from '../data/sample.js'
import faceMain from '../assets/face-main.png'

// 얼굴 이미지 위에 부위별 시술량을 히트맵(블롭)으로 얹은 트리트먼트 맵.
// 부위를 탭하면 아래 상세(샷/에너지/깊이)가 바뀝니다.
export default function FaceTreatmentMap({ zones }) {
  const [active, setActive] = useState(null)
  const sel = zones.find((z) => z.key === active)

  return (
    <div className="tmap">
      <div className="tmap-face">
        <img src={faceMain} alt="시술 부위 맵" />
        <div className="tmap-overlay">
          {zones.map((z) => {
            const isOn = z.key === active
            const alpha = energyAlpha(z.energy)
            return (
              <button
                key={z.key}
                className={`tmap-blob${isOn ? ' on' : ''}`}
                style={{
                  left: `${z.x}%`,
                  top: `${z.y}%`,
                  '--blob': ENERGY_COLOR,
                  opacity: isOn ? Math.min(1, alpha + 0.15) : alpha,
                }}
                onClick={() => setActive(isOn ? null : z.key)}
                aria-label={z.label}
              >
                <span className="tmap-dot" />
              </button>
            )
          })}
        </div>

        <div className="tmap-legend">
          <span className="tmap-legend-title">에너지</span>
          <div className="tmap-legend-bar" />
          <div className="tmap-legend-scale">
            <span>낮음</span>
            <span>높음</span>
          </div>
        </div>
      </div>

      <div className={`tmap-detail${sel ? ' show' : ''}`}>
        {sel ? (
          <>
            <div className="tmap-detail-name">
              <span
                className="tmap-detail-swatch"
                style={{ background: ENERGY_COLOR, opacity: energyAlpha(sel.energy) }}
              />
              {sel.label}
            </div>
            <div className="tmap-detail-stats">
              <div>
                <strong>{sel.shots}</strong>
                <span>샷</span>
              </div>
              <div>
                <strong>{sel.energy}</strong>
                <span>J</span>
              </div>
              <div>
                <strong>{sel.depth}</strong>
                <span>깊이</span>
              </div>
            </div>
          </>
        ) : (
          <div className="tmap-detail-hint">부위를 탭하면 상세 시술량을 볼 수 있어요</div>
        )}
      </div>
    </div>
  )
}
