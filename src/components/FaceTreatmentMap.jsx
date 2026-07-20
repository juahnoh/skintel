import { useState } from 'react'
import { MASK_ZONES, MASK_LABEL } from '../lib/report.js'
import Face3D from './LazyFace3D.jsx'

// 홈 아바타: 실제 구역 마스크(Face_Mask). 얼굴에서 구역 탭 → 샷 정보,
// 아래 칩으로 구역 개별 표시/숨김.
export default function FaceTreatmentMap({ onZoneClick, selectedZone }) {
  const [mode, setMode] = useState('skin')
  const [active, setActive] = useState(() => new Set(MASK_ZONES))

  const toggle = (z) =>
    setActive((s) => {
      const n = new Set(s)
      n.has(z) ? n.delete(z) : n.add(z)
      return n
    })
  const allOn = active.size === MASK_ZONES.length

  return (
    <section className="fmap">
      <div className="fmap-face" style={{ aspectRatio: '820 / 1024' }}>
        <Face3D
          mode={mode}
          maskZones
          activeZones={active}
          onZoneClick={onZoneClick}
          selectedZone={selectedZone}
        />

        {/* Mesh / Skin 토글 */}
        <div className="fmap-toggle">
          <button className={mode === 'mesh' ? 'on' : ''} onClick={() => setMode('mesh')}>
            Mesh
          </button>
          <button className={mode === 'skin' ? 'on' : ''} onClick={() => setMode('skin')}>
            Skin
          </button>
        </div>
      </div>

      {/* 구역 개별 표시/숨김 */}
      <div className="fzt-bar">
        <button
          className={`fzt all${allOn ? ' on' : ''}`}
          onClick={() => setActive(allOn ? new Set() : new Set(MASK_ZONES))}
        >
          전체
        </button>
        {MASK_ZONES.map((z) => (
          <button
            key={z}
            className={`fzt${active.has(z) ? ' on' : ''}${selectedZone === z ? ' sel' : ''}`}
            onClick={() => toggle(z)}
          >
            {MASK_LABEL[z] || z}
          </button>
        ))}
      </div>
    </section>
  )
}
