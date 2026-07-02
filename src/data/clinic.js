// 의사용 대시보드 더미 데이터.
// 실제로는 시술 장비/EMR에서 집계되어 들어올 값들입니다.
import faceMain from '../assets/face-main.jpg'
import patient2 from '../assets/patient2.png'
import patient3 from '../assets/patient3.webp'
import patient4 from '../assets/patient4.jpg'

export const clinicInfo = {
  name: '로소타 피부과',
  device: '울쎄라 (Ulthera SPT)',
}

// 병원 전체 KPI
export const kpis = {
  todaySessions: 5,
  weekBookings: 24,
  avgCoverage: 89,
  adherence: 94, // 표준 프로토콜 준수율(%)
}

// 오늘의 시술 스케줄 (status: 대기 | 시술중 | 완료)
export const todaySchedule = [
  { time: '10:00', patient: '김지은', doctor: '박서준', procedure: '울쎄라 리프팅', status: '완료', coverage: 92 },
  { time: '11:30', patient: '이서연', doctor: '박서준', procedure: '울쎄라 리프팅', status: '시술중' },
  { time: '13:00', patient: '최유나', doctor: '정하늘', procedure: '울쎄라 리프팅', status: '대기' },
  { time: '14:30', patient: '한소희', doctor: '박서준', procedure: '울쎄라 리프팅', status: '대기' },
  { time: '16:00', patient: '정다은', doctor: '이수민', procedure: '울쎄라 리프팅', status: '대기' },
]

// 원장별 시술 품질 (준수율 = 표준 프로토콜 대비 커버리지 일치도)
export const doctors = [
  { id: 'd1', name: '박서준', title: '대표원장', specialty: '울쎄라 · 리프팅', color: '#6d5aa8',
    monthSessions: 42, avgCoverage: 91, adherence: 96, patients: 28 },
  { id: 'd2', name: '이수민', title: '원장', specialty: '울쎄라 · 탄력', color: '#b76ba0',
    monthSessions: 35, avgCoverage: 88, adherence: 92, patients: 22 },
  { id: 'd3', name: '정하늘', title: '원장', specialty: '울쎄라 · 윤곽', color: '#4a90d9',
    monthSessions: 29, avgCoverage: 86, adherence: 89, patients: 19 },
]

// 재방문 주기(리프팅 약 12개월) 도래 → 재방문 유도 대상
export const retention = [
  { name: '박지현', lastDate: '2024-06-20', months: 12, procedure: '울쎄라 리프팅', doctor: '박서준' },
  { name: '윤서아', lastDate: '2024-05-15', months: 13, procedure: '울쎄라 리프팅', doctor: '이수민' },
  { name: '김민경', lastDate: '2024-07-01', months: 12, procedure: '울쎄라 리프팅', doctor: '박서준' },
  { name: '이가은', lastDate: '2024-04-28', months: 14, procedure: '울쎄라 리프팅', doctor: '정하늘' },
]

// 월별 시술 추이 (가로 스크롤)
export const monthlyTrend = [
  { m: '9월', v: 61 },
  { m: '10월', v: 68 },
  { m: '11월', v: 74 },
  { m: '12월', v: 90 },
  { m: '1월', v: 72 },
  { m: '2월', v: 78 },
  { m: '3월', v: 92 },
  { m: '4월', v: 85 },
  { m: '5월', v: 101 },
  { m: '6월', v: 106 },
]

// 환자별 시술 진행 현황
export const patients = [
  {
    id: 'p1', name: '김지은', age: 29, grade: 'VIP', doctor: '박서준', color: '#8b6fc4', photo: faceMain,
    visits: 3, lastDate: '2025-05-20', lastProcedure: '울쎄라 리프팅',
    coverage: 92, coverageDelta: 5, totalShots: 446, reportId: 's1',
    history: [
      { n: 1, date: '2024-11-12', coverage: 81, shots: 380 },
      { n: 2, date: '2025-02-18', coverage: 87, shots: 412 },
      { n: 3, date: '2025-05-20', coverage: 92, shots: 446 },
    ],
  },
  {
    id: 'p2', name: '이서연', age: 34, grade: 'GOLD', doctor: '박서준', color: '#b76ba0', photo: patient2,
    visits: 2, lastDate: '2025-06-02', lastProcedure: '울쎄라 리프팅',
    coverage: 88, coverageDelta: 6, totalShots: 402,
    history: [
      { n: 1, date: '2025-03-10', coverage: 82, shots: 366 },
      { n: 2, date: '2025-06-02', coverage: 88, shots: 402 },
    ],
  },
  {
    id: 'p3', name: '박민정', age: 41, grade: 'VIP', doctor: '이수민', color: '#e0a15a',
    visits: 4, lastDate: '2025-06-15', lastProcedure: '울쎄라 리프팅',
    coverage: 90, coverageDelta: 3, totalShots: 900,
    history: [
      { n: 3, date: '2025-03-01', coverage: 85, shots: 820 },
      { n: 4, date: '2025-06-15', coverage: 90, shots: 900 },
    ],
  },
  {
    id: 'p4', name: '최유나', age: 27, grade: 'SILVER', doctor: '정하늘', color: '#4a90d9', photo: patient4,
    visits: 1, lastDate: '2025-06-20', lastProcedure: '울쎄라 리프팅',
    coverage: 84, coverageDelta: 0, totalShots: 300,
    history: [{ n: 1, date: '2025-06-20', coverage: 84, shots: 300 }],
  },
  {
    id: 'p5', name: '한소희', age: 31, grade: 'GOLD', doctor: '박서준', color: '#3fae8f', photo: patient3,
    visits: 3, lastDate: '2025-06-25', lastProcedure: '울쎄라 리프팅',
    coverage: 93, coverageDelta: 4, totalShots: 460,
    history: [
      { n: 1, date: '2024-12-05', coverage: 84, shots: 388 },
      { n: 2, date: '2025-03-22', coverage: 89, shots: 430 },
      { n: 3, date: '2025-06-25', coverage: 93, shots: 460 },
    ],
  },
  {
    id: 'p6', name: '정다은', age: 38, grade: 'VIP', doctor: '이수민', color: '#c96b8f',
    visits: 2, lastDate: '2025-06-28', lastProcedure: '울쎄라 리프팅',
    coverage: 86, coverageDelta: 5, totalShots: 880,
    history: [
      { n: 1, date: '2025-03-30', coverage: 81, shots: 800 },
      { n: 2, date: '2025-06-28', coverage: 86, shots: 880 },
    ],
  },
]
