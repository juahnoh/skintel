// 데모용 샘플 데이터.
// 실제 시스템에서는 시술 장비(핸드피스+센서)가 기록한 데이터가 이 형태로 들어옵니다.
// 울쎄라는 1 shot = 1 line(선) 으로 조사되므로, 시술 위치를 '선'으로 표현합니다.
import faceMain from '../assets/face-main.jpg'

export const user = {
  name: '김지은',
  since: '2024.03',
  grade: 'VIP',
}

export const clinic = {
  name: '로소타 피부과',
  device: '울쎄라 (Ulthera SPT)',
}

// 팁(조사 깊이)별 시술 데이터.
// x: 가로 중심 %(0~100), y: 세로 중심 %(0~100, 이미지 높이 기준)
// w,h: 부위 영역 크기(뷰박스 단위, x는 0~100 / y는 0~125 스케일)
// angle: 조사선(라인) 방향(도), count: 실제 샷 수(배지 표기)
export const TIPS = [
  {
    mm: '4.5',
    label: '4.5mm',
    energyJ: 0.9,
    tone: '#6d5aa8', // 심부 - 딥 바이올렛
    layer: 'SMAS 근막층',
    zones: [
      { key: 'cheekL', label: '좌 볼', x: 33, y: 55, w: 13, h: 17, count: 60, angle: 62 },
      { key: 'cheekR', label: '우 볼', x: 67, y: 55, w: 13, h: 17, count: 60, angle: -62 },
      { key: 'jawL', label: '좌 턱선', x: 34, y: 68, w: 14, h: 7, count: 18, angle: 28 },
      { key: 'jawR', label: '우 턱선', x: 66, y: 68, w: 14, h: 7, count: 18, angle: -28 },
      { key: 'submental', label: '턱밑', x: 50, y: 81, w: 16, h: 6, count: 14, angle: 0 },
    ],
  },
  {
    mm: '3.5',
    label: '3.5mm',
    energyJ: 0.6,
    tone: '#b76ba0', // 중간 - 모브
    layer: '진피 심층',
    zones: [
      { key: 'forehead', label: '이마', x: 50, y: 23, w: 32, h: 9, count: 40, angle: 0 },
      { key: 'cheekUpL', label: '좌 광대', x: 34, y: 46, w: 11, h: 8, count: 24, angle: 52 },
      { key: 'cheekUpR', label: '우 광대', x: 66, y: 46, w: 11, h: 8, count: 24, angle: -52 },
      { key: 'nasoL', label: '좌 팔자', x: 43, y: 61, w: 5, h: 11, count: 16, angle: 14 },
      { key: 'nasoR', label: '우 팔자', x: 57, y: 61, w: 5, h: 11, count: 16, angle: -14 },
    ],
  },
  {
    mm: '1.5',
    label: '1.5mm',
    energyJ: 0.3,
    tone: '#e0a1b4', // 표층 - 로즈
    layer: '진피 표층',
    zones: [
      { key: 'eyeL', label: '좌 눈가', x: 26, y: 42, w: 8, h: 8, count: 20, angle: 42 },
      { key: 'eyeR', label: '우 눈가', x: 74, y: 42, w: 8, h: 8, count: 20, angle: -42 },
      { key: 'foreheadFine', label: '이마 잔주름', x: 50, y: 30, w: 28, h: 4, count: 16, angle: 0 },
      { key: 'glabella', label: '미간', x: 50, y: 36, w: 4, h: 6, count: 10, angle: 0 },
    ],
  },
]

export function tipLines(tip) {
  return tip.zones.reduce((a, z) => a + z.count, 0)
}

export const report = {
  id: 's1',
  patient: user.name,
  date: '2025-05-20',
  time: '10:30',
  practitioner: '박서준 원장',
  device: '울쎄라 (Ulthera SPT)',
  handpiece: 'DeepSEE 4.5 / 3.5 / 1.5mm',
  procedure: '울쎄라 리프팅',
  durationMin: 42,
  coverage: 92, // 얼굴 커버리지 %
  tips: TIPS,
  get totalLines() {
    return TIPS.reduce((s, t) => s + tipLines(t), 0)
  },
  // 하위 호환용 별칭
  get totalShots() {
    return this.totalLines
  },
  get totalEnergy() {
    return Math.round(TIPS.reduce((s, t) => s + tipLines(t) * t.energyJ, 0))
  },
  metrics: [
    { label: '리프팅', value: 78, color: '#8b6fc4' },
    { label: '탄력', value: 64, color: '#e08aa8' },
    { label: '윤곽', value: 52, color: '#e0a15a' },
  ],
  // 지난 시술(2회차) 대비 오늘
  compare: [
    { label: '턱선 커버리지', delta: 8, unit: '%' },
    { label: '볼 샷수', delta: 12, unit: '' },
    { label: '전체 커버리지', delta: 5, unit: '%' },
  ],
  compareNote: '지난 시술보다 턱선 커버리지가 8% 향상됐어요. 이마 구역이 이번에 더 집중적으로 시술되었어요.',
  beforePhoto: faceMain,
  afterPhoto: faceMain,
}

// 예약/방문 내역 (오늘 = 2025-07-01 기준). status: 예약확정 | 완료
export const bookings = [
  { id: 'b1', date: '2025-07-03', time: '14:00', menu: '울쎄라 리프팅', practitioner: '박서준 원장', status: '예약확정' },
  { id: 'b2', date: '2025-07-10', time: '11:00', menu: '써마지 FLX', practitioner: '이수민 원장', status: '예약확정' },
  { id: 'b3', date: '2025-07-24', time: '16:30', menu: '슈링크 유니버스', practitioner: '박서준 원장', status: '예약확정' },
  { id: 'b0', date: '2025-05-20', time: '10:30', menu: '울쎄라 리프팅', practitioner: '박서준 원장', status: '완료', reportId: 's1' },
]
