// 리포트 데이터: 구역×깊이×좌우 로 샷을 생성(3D 선맵) + 숫자 매트릭스 집계.
// 결정론적(seeded) 이라 매번 동일한 리포트가 나옴.
import { ZONE_DEFS, DEPTHS } from './zones.js'

// 구역별 목표 샷수 (bilateral 은 한쪽 기준, mid 는 총). 합계 446.
const TARGET = { MB: 14, B: 20, LO: 14, IO: 16, C1: 30, C2: 34, C3: 30, S1: 20, S2: 24, S3: 22, S4: 16 }

// region 별 깊이 분포
const DEPTH_FRAC = {
  brow: { '4.5': 0, '3.5': 0.5, '1.5': 0.5 },
  eye: { '4.5': 0, '3.5': 0.5, '1.5': 0.5 },
  cheek: { '4.5': 0.55, '3.5': 0.35, '1.5': 0.1 },
  jaw: { '4.5': 0.6, '3.5': 0.3, '1.5': 0.1 },
}

// 구역별 좌표 범위 (정규화 얼굴; 우측/중앙 기준, 좌측은 x 미러)
const ZONE_COORDS = {
  MB: { x: [-0.05, 0.05], y: [0.53, 0.6] },
  B: { x: [0.06, 0.22], y: [0.52, 0.6] },
  LO: { x: [0.24, 0.34], y: [0.38, 0.48] },
  IO: { x: [0.09, 0.26], y: [0.31, 0.37] },
  C1: { x: [0.08, 0.17], y: [0.12, 0.3] },
  C2: { x: [0.17, 0.26], y: [0.1, 0.3] },
  C3: { x: [0.26, 0.34], y: [0.12, 0.32] },
  S1: { x: [-0.09, 0.09], y: [-0.05, 0.03] },
  S2: { x: [0.06, 0.14], y: [-0.02, 0.1] },
  S3: { x: [0.14, 0.21], y: [-0.03, 0.09] },
  S4: { x: [0.21, 0.28], y: [-0.01, 0.11] },
}

function mulberry32(a) {
  return function () {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function buildReport() {
  const rng = mulberry32(20250520)
  const matrix = {} // key -> { id, key, region, side, '4.5','3.5','1.5', total }
  const shots = []
  for (const z of ZONE_DEFS) {
    const sides = z.bilateral ? ['L', 'R'] : ['mid']
    const co = ZONE_COORDS[z.id]
    const frac = DEPTH_FRAC[z.region]
    for (const side of sides) {
      const key = side === 'mid' ? z.id : `${z.id}_${side}`
      const cell = { id: z.id, key, region: z.region, side, '4.5': 0, '3.5': 0, '1.5': 0, total: 0 }
      for (const d of DEPTHS) {
        const n = Math.round(TARGET[z.id] * (frac[d.mm] || 0))
        cell[d.mm] = n
        cell.total += n
        for (let i = 0; i < n; i++) {
          const rx = co.x[0] + rng() * (co.x[1] - co.x[0])
          const x = side === 'L' ? -Math.abs(rx) : side === 'R' ? Math.abs(rx) : rx
          const y = co.y[0] + rng() * (co.y[1] - co.y[0])
          shots.push({ x, y, z: 0.4, tip: d.mm, zone: key, region: z.region, side })
        }
      }
      matrix[key] = cell
    }
  }
  const total = Object.values(matrix).reduce((s, c) => s + c.total, 0)
  return { matrix, shots, total }
}

// 매트릭스 표시용: region 그룹 → 행(구역+좌우)
export const REGION_GROUPS = [
  { region: 'brow', label: '이마·눈썹', keys: ['MB', 'B_L', 'B_R'] },
  { region: 'eye', label: '눈가', keys: ['LO_L', 'LO_R', 'IO_L', 'IO_R'] },
  { region: 'cheek', label: '볼', keys: ['C1_L', 'C1_R', 'C2_L', 'C2_R', 'C3_L', 'C3_R'] },
  { region: 'jaw', label: '턱선', keys: ['S1', 'S2_L', 'S2_R', 'S3_L', 'S3_R', 'S4_L', 'S4_R'] },
]

export function rowLabel(cell) {
  if (cell.side === 'mid') return cell.id
  return `${cell.id} ${cell.side === 'L' ? '좌' : '우'}`
}

// 아바타 표시용 깔끔한 구역 막대 (울쎄라 그리드). 볼(세로 3바) + 턱선(4바) + 이마 1바.
// 눈·코·입은 침범하지 않음. 우측 기준 좌표, 좌측은 미러.
const GRID_R = [
  { id: 'B', x: [0.07, 0.2], y: [0.55, 0.62], color: '#e9d8c4' }, // 이마
  { id: 'C1', x: [0.085, 0.145], y: [0.15, 0.36], color: '#ff9a6b' }, // 앞 볼
  { id: 'C2', x: [0.155, 0.215], y: [0.14, 0.36], color: '#ffbd94' }, // 중간 볼
  { id: 'C3', x: [0.225, 0.285], y: [0.16, 0.36], color: '#c58bff' }, // 뒤 볼
  { id: 'S2', x: [0.06, 0.12], y: [-0.03, 0.11], color: '#e9d8c4' }, // 앞 턱
  { id: 'S3', x: [0.13, 0.19], y: [-0.04, 0.1], color: '#e9d8c4' }, // 중간 턱
  { id: 'S4', x: [0.2, 0.27], y: [-0.02, 0.12], color: '#e9d8c4' }, // 뒤 턱
]
const MID = [{ id: 'S1', x: [-0.055, 0.055], y: [-0.09, 0.02], color: '#e9d8c4' }] // 턱밑 중앙

export const ZONE_RECTS = [
  ...MID.map((r) => ({ id: r.id, x0: r.x[0], x1: r.x[1], y0: r.y[0], y1: r.y[1], color: r.color })),
  ...GRID_R.flatMap((r) => [
    { id: `${r.id}_R`, x0: r.x[0], x1: r.x[1], y0: r.y[0], y1: r.y[1], color: r.color },
    { id: `${r.id}_L`, x0: -r.x[1], x1: -r.x[0], y0: r.y[0], y1: r.y[1], color: r.color },
  ]),
]

// 마스크(Face_Mask.glb) 구역 이름 + 매트릭스 매핑 (좌/우 합산)
export const MASK_ZONES = ['MB', 'B1', 'C1', 'C2', 'C3', 'IO', 'LO', 'P2', 'S1', 'S2', 'S3', 'S4']

// 환자용 친화 용어 (C/S 코드 대신)
export const MASK_LABEL = {
  MB: '미간', B1: '눈썹', C1: '앞 볼', C2: '중간 볼', C3: '뒤 볼',
  IO: '눈 아래', LO: '눈가', P2: '광대·측면',
  S1: '턱밑 중앙', S2: '앞 턱선', S3: '중간 턱선', S4: '뒤 턱선',
}
const MASK_MAP = {
  MB: ['MB'], B1: ['B_L', 'B_R'],
  C1: ['C1_L', 'C1_R'], C2: ['C2_L', 'C2_R'], C3: ['C3_L', 'C3_R'],
  IO: ['IO_L', 'IO_R'], LO: ['LO_L', 'LO_R'],
  S1: ['S1'], S2: ['S2_L', 'S2_R'], S3: ['S3_L', 'S3_R'], S4: ['S4_L', 'S4_R'],
  P2: [],
}
export function shotsForMaskZone(matrix, name) {
  const out = { '4.5': 0, '3.5': 0, '1.5': 0, total: 0 }
  for (const k of MASK_MAP[name] || []) {
    const c = matrix[k]
    if (c) {
      out['4.5'] += c['4.5']; out['3.5'] += c['3.5']; out['1.5'] += c['1.5']; out.total += c.total
    }
  }
  return out
}
