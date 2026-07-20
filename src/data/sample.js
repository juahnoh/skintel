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

// 팁(조사 깊이) 정의
export const TIPS = [
  { mm: '4.5', label: '4.5mm', energyJ: 0.9, tone: '#6d5aa8', layer: 'SMAS 근막층' },
  { mm: '3.5', label: '3.5mm', energyJ: 0.6, tone: '#b76ba0', layer: '진피 심층' },
  { mm: '1.5', label: '1.5mm', energyJ: 0.3, tone: '#e0a1b4', layer: '진피 표층' },
]

// 얼굴 구역 패널(프로토콜의 C1·C2 / S1·S2 처럼 연결된 격자).
// region: 좌표 계산에 쓸 얼굴 영역 키(컴포넌트에서 랜드마크로 코너 계산)
// rows×cols 로 분할, counts 는 행 우선(위→아래, 안쪽→바깥쪽) 각 칸의 샷 수.
export const PANELS = [
  // 4.5mm — 볼·턱선 (심부 리프팅)
  { tip: '4.5', region: 'cheekJawL', rows: 3, cols: 2, counts: [34, 30, 22, 20, 16, 12],
    labels: ['좌 볼 상', '좌 광대', '좌 볼 중', '좌 볼 외', '좌 앞턱선', '좌 뒤턱선'] },
  { tip: '4.5', region: 'cheekJawR', rows: 3, cols: 2, counts: [34, 30, 22, 20, 16, 12],
    labels: ['우 볼 상', '우 광대', '우 볼 중', '우 볼 외', '우 앞턱선', '우 뒤턱선'] },
  { tip: '4.5', region: 'submental', rows: 1, cols: 1, counts: [14], labels: ['턱밑'] },
  // 3.5mm — 이마·광대 (진피 심층)
  { tip: '3.5', region: 'foreheadBand', rows: 1, cols: 3, counts: [18, 24, 18],
    labels: ['좌 이마', '중앙 이마', '우 이마'] },
  { tip: '3.5', region: 'cheekUpL', rows: 1, cols: 2, counts: [16, 14], labels: ['좌 광대 상', '좌 관자'] },
  { tip: '3.5', region: 'cheekUpR', rows: 1, cols: 2, counts: [16, 14], labels: ['우 광대 상', '우 관자'] },
  // 1.5mm — 눈가·잔주름 (진피 표층)
  { tip: '1.5', region: 'underEyeL', rows: 1, cols: 2, counts: [12, 10], labels: ['좌 눈밑', '좌 눈가'] },
  { tip: '1.5', region: 'underEyeR', rows: 1, cols: 2, counts: [12, 10], labels: ['우 눈밑', '우 눈가'] },
]

// 팁별 총 샷수(선) = 해당 팁 패널들의 칸 합계
export function tipTotal(mm) {
  return PANELS.filter((p) => p.tip === mm).reduce((s, p) => s + p.counts.reduce((a, c) => a + c, 0), 0)
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
  panels: PANELS,
  get totalLines() {
    return TIPS.reduce((s, t) => s + tipTotal(t.mm), 0)
  },
  // 하위 호환용 별칭
  get totalShots() {
    return this.totalLines
  },
  get totalEnergy() {
    return Math.round(TIPS.reduce((s, t) => s + tipTotal(t.mm) * t.energyJ, 0))
  },
  metrics: [
    { label: '리프팅', value: 50, color: '#ff9064' },
    { label: '탄력', value: 25, color: '#ff9064' },
    { label: '윤곽', value: 75, color: '#ff9064' },
  ],
  // 지난 시술(2회차) 대비 오늘
  compare: [
    { label: '턱선 커버리지', delta: 8, unit: '%' },
    { label: '볼 샷수', delta: 12, unit: '' },
    { label: '전체 커버리지', delta: 5, unit: '%' },
  ],
  compareNote: '지난 시술보다 턱선 커버리지가 8% 향상됐어요. 이마 구역이 이번에 더 집중적으로 시술되었어요.',
  // 인증 카드용 피부 개선 지표 (시술 전 대비)
  improve: [
    { label: '리프팅', delta: 18 },
    { label: '탄력', delta: 12 },
    { label: 'V라인', delta: 9 },
  ],
  beforePhoto: faceMain,
  afterPhoto: faceMain,
}

// 예약/방문 내역 (오늘 = 2025-07-01 기준). status: 예약확정 | 완료
export const bookings = [
  { id: 'b1', date: '2025-07-03', time: '14:00', menu: '울쎄라 리프팅', practitioner: '박서준 원장', status: '예약확정' },
  { id: 'b2', date: '2025-07-10', time: '11:00', menu: '울쎄라 리프팅', practitioner: '이수민 원장', status: '예약확정' },
  { id: 'b3', date: '2025-07-24', time: '16:30', menu: '울쎄라 리프팅', practitioner: '박서준 원장', status: '예약확정' },
  { id: 'b0', date: '2025-05-20', time: '10:30', menu: '울쎄라 리프팅', practitioner: '박서준 원장', status: '완료', reportId: 's1' },
]

// 환자 과거 시술 내역 (달력·내역 표시용)
export const treatmentHistory = [
  { id: 'h3', date: '2025-11-02', procedure: '울쎄라 리프팅', shots: 446, coverage: 92, durationMin: 42 },
  { id: 'h2', date: '2025-07-03', procedure: '울쎄라 리프팅', shots: 440, coverage: 94, durationMin: 41 },
  { id: 'h1', date: '2025-03-12', procedure: '울쎄라 리프팅', shots: 420, coverage: 88, durationMin: 39 },
]
