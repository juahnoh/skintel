// 데모용 샘플 데이터.
// 실제 시스템에서는 시술 장비(핸드피스+센서)가 기록한 데이터가 이 형태로 들어옵니다.
// 지금은 예시 값으로 채워 UI를 확인합니다.
import faceMain from '../assets/face-main.png'
import faceBefore from '../assets/face-before.png'

export const user = {
  name: '김지은',
  since: '2024.03',
  grade: 'VIP',
}

// 얼굴 위 트리트먼트 맵에 표시할 부위별 시술 기록.
// x, y 는 얼굴 이미지 컨테이너 기준 퍼센트 좌표.
const zones = [
  { key: 'forehead', label: '이마', x: 50, y: 15, shots: 70, energy: 145, depth: '4.5mm' },
  { key: 'glabella', label: '미간', x: 50, y: 29, shots: 24, energy: 48, depth: '4.5mm' },
  { key: 'eyeL', label: '좌 눈가', x: 34, y: 33, shots: 30, energy: 58, depth: '3.0mm' },
  { key: 'eyeR', label: '우 눈가', x: 66, y: 33, shots: 30, energy: 58, depth: '3.0mm' },
  { key: 'cheekL', label: '좌 볼', x: 29, y: 49, shots: 66, energy: 150, depth: '4.5mm' },
  { key: 'cheekR', label: '우 볼', x: 71, y: 49, shots: 64, energy: 148, depth: '4.5mm' },
  { key: 'nasoL', label: '좌 팔자', x: 41, y: 57, shots: 26, energy: 62, depth: '3.0mm' },
  { key: 'nasoR', label: '우 팔자', x: 59, y: 57, shots: 26, energy: 62, depth: '3.0mm' },
  { key: 'jawL', label: '좌 턱선', x: 31, y: 71, shots: 44, energy: 108, depth: '4.5mm' },
  { key: 'jawR', label: '우 턱선', x: 69, y: 71, shots: 44, energy: 105, depth: '4.5mm' },
  { key: 'chin', label: '턱', x: 50, y: 79, shots: 30, energy: 52, depth: '3.0mm' },
  { key: 'neck', label: '목', x: 50, y: 92, shots: 42, energy: 80, depth: '4.5mm' },
]

export const report = {
  id: 's1',
  patient: user.name,
  date: '2025-05-20',
  time: '10:30',
  practitioner: '박서준 원장',
  device: '울쎄라 (Ulthera SPT)',
  handpiece: 'DeepSEE 4.5 / 3.0mm',
  procedure: '울쎄라 리프팅',
  durationMin: 42,
  zones,
  get totalShots() {
    return this.zones.reduce((s, z) => s + z.shots, 0)
  },
  get totalEnergy() {
    return this.zones.reduce((s, z) => s + z.energy, 0)
  },
  metrics: [
    { label: '리프팅', value: 78, color: '#8b6fc4' },
    { label: '탄력', value: 64, color: '#e08aa8' },
    { label: '윤곽', value: 52, color: '#e0a15a' },
  ],
  beforePhoto: faceBefore,
  afterPhoto: faceMain,
}

// 예약/방문 내역 (오늘 = 2025-07-01 기준). status: 예약확정 | 완료
export const bookings = [
  { id: 'b1', date: '2025-07-03', time: '14:00', menu: '울쎄라 리프팅', practitioner: '박서준 원장', status: '예약확정' },
  { id: 'b2', date: '2025-07-10', time: '11:00', menu: '써마지 FLX', practitioner: '이수민 원장', status: '예약확정' },
  { id: 'b3', date: '2025-07-24', time: '16:30', menu: '슈링크 유니버스', practitioner: '박서준 원장', status: '예약확정' },
  { id: 'b0', date: '2025-05-20', time: '10:30', menu: '울쎄라 리프팅', practitioner: '박서준 원장', status: '완료', reportId: 's1' },
]

// 히트맵은 단색(베이지 골드)으로 통일하고, 에너지 세기는 '투명도'로 표현합니다.
export const ENERGY_COLOR = '#d7a24e'

// 에너지(J) → 불투명도. 낮으면 옅게, 높으면 진하게.
export function energyAlpha(energy) {
  const min = 45
  const max = 150
  const t = Math.max(0, Math.min(1, (energy - min) / (max - min)))
  return 0.28 + t * 0.62 // 0.28 ~ 0.9
}
