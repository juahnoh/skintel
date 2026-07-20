// Firestore 시딩 스크립트 — 더미데이터를 실제/에뮬레이터 DB 에 넣음.
// 실행: node scripts/seed.mjs   (.env.local 을 자동 로드)
//   (시딩 동안은 Firestore 규칙을 test 모드로 열어두거나, 에뮬레이터 사용)
import { readFileSync } from 'node:fs'
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  writeBatch,
  serverTimestamp,
  connectFirestoreEmulator,
} from 'firebase/firestore'

// .env.local 로드 (Node <20.6 도 지원하도록 직접 파싱)
try {
  for (const line of readFileSync(new URL('../.env.local', import.meta.url), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
} catch {
  /* .env.local 없으면 무시 */
}

const cfg = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}
if (!cfg.projectId) {
  console.error('❌ .env.local 의 VITE_FIREBASE_* 가 비어있습니다.')
  process.exit(1)
}

const db = getFirestore(initializeApp(cfg))
if (process.env.VITE_USE_EMULATOR === '1') connectFirestoreEmulator(db, '127.0.0.1', 8080)

const CLINIC_ID = 'rosota'
const PATIENT_ID = 'p_jieun'
const PATIENT_CODE = '20415'
const SESSION_ID = 's1'

const TIPS = [
  { mm: '4.5', label: '4.5mm', energyJ: 0.9, layer: 'SMAS 근막층' },
  { mm: '3.5', label: '3.5mm', energyJ: 0.6, layer: '진피 심층' },
  { mm: '1.5', label: '1.5mm', energyJ: 0.3, layer: '진피 표층' },
]

const PANELS = [
  { tip: '4.5', region: 'cheekJawL', rows: 3, cols: 2, counts: [34, 30, 22, 20, 16, 12], labels: ['좌 볼 상', '좌 광대', '좌 볼 중', '좌 볼 외', '좌 앞턱선', '좌 뒤턱선'] },
  { tip: '4.5', region: 'cheekJawR', rows: 3, cols: 2, counts: [34, 30, 22, 20, 16, 12], labels: ['우 볼 상', '우 광대', '우 볼 중', '우 볼 외', '우 앞턱선', '우 뒤턱선'] },
  { tip: '4.5', region: 'submental', rows: 1, cols: 1, counts: [14], labels: ['턱밑'] },
  { tip: '3.5', region: 'foreheadBand', rows: 1, cols: 3, counts: [18, 24, 18], labels: ['좌 이마', '중앙 이마', '우 이마'] },
  { tip: '3.5', region: 'cheekUpL', rows: 1, cols: 2, counts: [16, 14], labels: ['좌 광대 상', '좌 관자'] },
  { tip: '3.5', region: 'cheekUpR', rows: 1, cols: 2, counts: [16, 14], labels: ['우 광대 상', '우 관자'] },
  { tip: '1.5', region: 'underEyeL', rows: 1, cols: 2, counts: [12, 10], labels: ['좌 눈밑', '좌 눈가'] },
  { tip: '1.5', region: 'underEyeR', rows: 1, cols: 2, counts: [12, 10], labels: ['우 눈밑', '우 눈가'] },
]

const clinic = { name: '로소타 피부과', device: '울쎄라 (Ulthera SPT)' }

const doctors = [
  { id: 'd1', name: '박서준', title: '대표원장', specialty: '울쎄라 · 리프팅', color: '#6d5aa8', stats: { monthSessions: 42, avgCoverage: 91, adherence: 96, patients: 28 } },
  { id: 'd2', name: '이수민', title: '원장', specialty: '울쎄라 · 탄력', color: '#b76ba0', stats: { monthSessions: 35, avgCoverage: 88, adherence: 92, patients: 22 } },
  { id: 'd3', name: '정하늘', title: '원장', specialty: '울쎄라 · 윤곽', color: '#4a90d9', stats: { monthSessions: 29, avgCoverage: 86, adherence: 89, patients: 19 } },
]

// 신규 환자 등록 폼과 동일 필드 (이름/생년월일/연락처/담당원장/시술예정) + 발급 코드
const patient = {
  name: '김지은',
  birthDate: '20010101',
  phone: '010-0000-0000',
  patientCode: PATIENT_CODE,
  since: '2024.03',
  grade: 'VIP',
  clinicId: CLINIC_ID,
  assignedDoctorId: 'd1',
  plannedProcedure: '울쎄라',
}

// 완료된 시술 세션(=리포트)
const session = {
  patientId: PATIENT_ID,
  patientCode: PATIENT_CODE,
  clinicId: CLINIC_ID,
  doctorId: 'd1',
  date: '2025-05-20',
  time: '10:30',
  procedure: '울쎄라 리프팅',
  device: '울쎄라 (Ulthera SPT)',
  handpiece: 'DeepSEE 4.5 / 3.5 / 1.5mm',
  durationMin: 42,
  coverage: 92,
  status: 'completed',
  tips: TIPS,
  panels: PANELS,
  shotSummary: { '4.5': 282, '3.5': 120, '1.5': 44, total: 446 },
  metrics: [
    { label: '리프팅', value: 50 },
    { label: '탄력', value: 25 },
    { label: '윤곽', value: 75 },
  ],
  compare: [
    { label: '턱선 커버리지', delta: 8, unit: '%' },
    { label: '볼 샷수', delta: 12, unit: '' },
    { label: '전체 커버리지', delta: 5, unit: '%' },
  ],
  photos: { before: 'scans/p_jieun/before.jpg', after: 'scans/p_jieun/after.jpg' },
  rawScan: { path: 'scans/p_jieun/raw/FaceMesh.fbx' }, // 기기가 올린 원본 스캔
  avatar: {
    status: 'ready', // 외부 AI 모델링 완료
    obj: 'scans/p_jieun/avatar/avatar.obj',
    textures: { diffuse: 'scans/p_jieun/avatar/diffuse.png', normal: 'scans/p_jieun/avatar/normal.png' },
  },
}

// 실시간 샷 좌표 샘플 (정규화 얼굴 좌표계 x/y/z). 실제로는 디바이스가 스트리밍.
const SHOTS = [
  { seq: 1, tip: '3.5', zone: 'foreheadBand', x: 0.1, y: 0.6, z: 0.42 },
  { seq: 2, tip: '3.5', zone: 'foreheadBand', x: -0.1, y: 0.6, z: 0.42 },
  { seq: 3, tip: '4.5', zone: 'cheekJawR', x: 0.22, y: 0.24, z: 0.4 },
  { seq: 4, tip: '4.5', zone: 'cheekJawL', x: -0.22, y: 0.24, z: 0.4 },
  { seq: 5, tip: '4.5', zone: 'cheekJawR', x: 0.2, y: 0.05, z: 0.38 },
  { seq: 6, tip: '1.5', zone: 'underEyeR', x: 0.16, y: 0.34, z: 0.41 },
  { seq: 7, tip: '1.5', zone: 'underEyeL', x: -0.16, y: 0.34, z: 0.41 },
  { seq: 8, tip: '4.5', zone: 'submental', x: 0.0, y: -0.02, z: 0.36 },
]

const bookings = [
  { id: 'b1', date: '2025-07-03', time: '14:00', menu: '울쎄라 리프팅', doctorId: 'd1', status: '예약확정' },
  { id: 'b2', date: '2025-07-10', time: '11:00', menu: '울쎄라 리프팅', doctorId: 'd2', status: '예약확정' },
  { id: 'b3', date: '2025-07-24', time: '16:30', menu: '울쎄라 리프팅', doctorId: 'd1', status: '예약확정' },
  { id: 'b0', date: '2025-05-20', time: '10:30', menu: '울쎄라 리프팅', doctorId: 'd1', status: '완료', sessionId: SESSION_ID },
]

async function main() {
  console.log(`🌱 seeding project: ${cfg.projectId}${process.env.VITE_USE_EMULATOR === '1' ? ' (emulator)' : ''}`)

  await setDoc(doc(db, 'clinics', CLINIC_ID), { ...clinic, createdAt: serverTimestamp() })
  for (const d of doctors) {
    const { id, ...rest } = d
    await setDoc(doc(db, 'clinics', CLINIC_ID, 'doctors', id), rest)
  }

  await setDoc(doc(db, 'patients', PATIENT_ID), { ...patient, createdAt: serverTimestamp() })

  await setDoc(doc(db, 'sessions', SESSION_ID), {
    ...session,
    createdAt: serverTimestamp(),
    startedAt: serverTimestamp(),
    completedAt: serverTimestamp(),
  })

  // 샷 서브컬렉션 (배치)
  const batch = writeBatch(db)
  const shotsCol = collection(db, 'sessions', SESSION_ID, 'shots')
  for (const s of SHOTS) batch.set(doc(shotsCol), { ...s, t: serverTimestamp() })
  await batch.commit()

  for (const b of bookings) {
    const { id, ...rest } = b
    await setDoc(doc(db, 'bookings', id), {
      ...rest,
      patientId: PATIENT_ID,
      clinicId: CLINIC_ID,
      createdAt: serverTimestamp(),
    })
  }

  console.log(`✅ done: clinic, 3 doctors, patient(code ${PATIENT_CODE}), session ${SESSION_ID}(+${SHOTS.length} shots), 4 bookings`)
  process.exit(0)
}

main().catch((e) => {
  console.error('❌ seed failed:', e)
  process.exit(1)
})
