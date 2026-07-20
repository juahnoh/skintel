// Ultherapy 구역 체계 (skintel 표준). 샷 = 깊이(depth) × 구역(zone) 로 분류.

export const DEPTHS = [
  { mm: '4.5', color: '#3fd0ff', dots: 3, layer: 'SMAS 근막층' },
  { mm: '3.5', color: '#ffb74d', dots: 2, layer: '진피 심층' },
  { mm: '1.5', color: '#ff7a9c', dots: 1, layer: '진피 표층' },
]

// 세부 구역. bilateral=true → 좌/우(_L/_R), false → 중앙(mid).
// region: brow(이마·눈썹) / eye(눈가) / cheek(볼) / jaw(턱선)
export const ZONE_DEFS = [
  { id: 'MB', region: 'brow', label: '미간 눈썹', bilateral: false },
  { id: 'B', region: 'eye', label: '눈썹', bilateral: true },
  { id: 'LO', region: 'eye', label: '가쪽 눈가', bilateral: true },
  { id: 'IO', region: 'eye', label: '아래 눈가', bilateral: true },
  { id: 'C1', region: 'cheek', label: '앞 볼', bilateral: true },
  { id: 'C2', region: 'cheek', label: '중간 볼', bilateral: true },
  { id: 'C3', region: 'cheek', label: '뒤 볼', bilateral: true },
  { id: 'S1', region: 'jaw', label: '턱밑 중앙', bilateral: false },
  { id: 'S2', region: 'jaw', label: '앞 턱선', bilateral: true },
  { id: 'S3', region: 'jaw', label: '중간 턱선', bilateral: true },
  { id: 'S4', region: 'jaw', label: '뒤 턱선', bilateral: true },
]

export const REGION_LABEL = { brow: '이마·눈썹', eye: '눈가', cheek: '볼', jaw: '턱선' }

// 시술중 '부위별 진행' 행 = 마스크 구역 코드 (MB/B1/C1/…). 목표치 + 시뮬 좌표 + 깊이.
export const PROGRESS_ROWS = [
  { key: 'MB', target: 16, depths: ['3.5', '1.5'], x: [-0.05, 0.05], y: [0.53, 0.6], bilateral: false },
  { key: 'B1', target: 28, depths: ['3.5', '1.5'], x: [0.06, 0.22], y: [0.52, 0.6], bilateral: true },
  { key: 'IO', target: 24, depths: ['1.5', '3.5'], x: [0.09, 0.26], y: [0.31, 0.37], bilateral: true },
  { key: 'LO', target: 20, depths: ['1.5', '3.5'], x: [0.24, 0.34], y: [0.38, 0.48], bilateral: true },
  { key: 'C1', target: 40, depths: ['4.5', '3.5'], x: [0.08, 0.17], y: [0.12, 0.3], bilateral: true },
  { key: 'C2', target: 44, depths: ['4.5', '3.5'], x: [0.17, 0.26], y: [0.1, 0.3], bilateral: true },
  { key: 'C3', target: 40, depths: ['4.5', '3.5'], x: [0.26, 0.34], y: [0.12, 0.32], bilateral: true },
  { key: 'P2', target: 16, depths: ['4.5', '3.5'], x: [0.2, 0.3], y: [0.2, 0.3], bilateral: true },
  { key: 'S1', target: 16, depths: ['4.5', '3.5'], x: [-0.09, 0.09], y: [-0.05, 0.03], bilateral: false },
  { key: 'S2', target: 36, depths: ['4.5', '3.5'], x: [0.06, 0.14], y: [-0.02, 0.1], bilateral: true },
  { key: 'S3', target: 32, depths: ['4.5', '3.5'], x: [0.14, 0.21], y: [-0.03, 0.09], bilateral: true },
  { key: 'S4', target: 36, depths: ['4.5', '3.5'], x: [0.21, 0.28], y: [-0.01, 0.11], bilateral: true },
]

export const PLANNED_TOTAL = PROGRESS_ROWS.reduce((s, r) => s + r.target, 0) // 348

const rnd = (a, b) => a + Math.random() * (b - a)
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]

// 샷 시뮬레이션 (실제로는 기기가 좌표+깊이 스트리밍). 각 샷에 depth·zone(mask code)·side 부여.
export function simulateShots(count, startSeq) {
  const out = []
  for (let i = 0; i < count; i++) {
    const row = pick(PROGRESS_ROWS)
    const side = row.bilateral ? (Math.random() < 0.5 ? 'L' : 'R') : 'mid'
    const rx = rnd(row.x[0], row.x[1])
    out.push({
      seq: startSeq + i,
      tip: pick(row.depths),
      zone: row.key, // 마스크 구역 코드
      row: row.key,
      side,
      x: side === 'L' ? -Math.abs(rx) : side === 'R' ? Math.abs(rx) : rx,
      y: rnd(row.y[0], row.y[1]),
      z: 0.4,
    })
  }
  return out
}

// 좌표 x 로 좌우 판정
export const sideFromX = (x) => (x === 0 ? 'mid' : x > 0 ? 'R' : 'L')
