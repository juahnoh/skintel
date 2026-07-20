// Firestore 데이터 접근 계층.
// 시술 흐름: 환자등록(코드발급) → 세션생성(created) → faceMesh(mesh_ready)
//            → 시작(in_progress) → 샷 좌표 스트리밍 → 완료(completed)
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  addDoc,
  updateDoc,
  writeBatch,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from './firebase.js'

export const COL = {
  clinics: 'clinics',
  doctors: 'doctors', // clinics/{id}/doctors
  patients: 'patients',
  sessions: 'sessions', // 시술 세션 (프로토콜~완료 리포트)
  shots: 'shots', // sessions/{id}/shots — 실시간 샷 좌표
  bookings: 'bookings',
}

export const SESSION_STATUS = {
  created: 'created', // 프로토콜 생성 (시작 전)
  meshReady: 'mesh_ready', // raw 얼굴 메쉬 클라우드 업로드 완료
  inProgress: 'in_progress', // 시작 — 샷 카운트 중
  completed: 'completed', // 시술 종료
}

// 아바타 생성 상태 (외부 AI 모델링). raw 스캔 → 아바타 .obj
export const AVATAR_STATUS = {
  pending: 'pending', // 업로드됨, AI 대기열
  processing: 'processing', // AI 생성 중
  ready: 'ready', // 아바타 .obj 준비 완료
  failed: 'failed',
}

const snap = (d) => (d.exists() ? { id: d.id, ...d.data() } : null)
const list = (qs) => qs.docs.map((d) => ({ id: d.id, ...d.data() }))

/* ============ 환자 ============ */

// 5자리 환자 코드 생성 (중복 확인). 예: "20415"
export async function generatePatientCode() {
  for (let i = 0; i < 8; i++) {
    const code = String(Math.floor(10000 + Math.random() * 90000))
    const qs = await getDocs(
      query(collection(db, COL.patients), where('patientCode', '==', code), limit(1)),
    )
    if (qs.empty) return code
  }
  throw new Error('환자 코드 생성 실패 (중복 과다)')
}

// 신규 환자 등록 → 코드 발급. { name, birthDate, phone, assignedDoctorId, plannedProcedure, clinicId }
export async function registerPatient(data) {
  const patientCode = await generatePatientCode()
  const ref = await addDoc(collection(db, COL.patients), {
    ...data,
    patientCode,
    createdAt: serverTimestamp(),
  })
  return { id: ref.id, patientCode }
}

export async function getPatient(patientId) {
  return snap(await getDoc(doc(db, COL.patients, patientId)))
}

export async function getPatientByCode(patientCode) {
  const qs = await getDocs(
    query(collection(db, COL.patients), where('patientCode', '==', patientCode), limit(1)),
  )
  return list(qs)[0] ?? null
}

/* ============ 세션 (시술) ============ */

// 프로토콜 생성 → status: created
export async function createSession({ patientId, patientCode, clinicId, doctorId, procedure, device }) {
  const ref = await addDoc(collection(db, COL.sessions), {
    patientId,
    patientCode,
    clinicId,
    doctorId,
    procedure,
    device,
    status: SESSION_STATUS.created,
    date: new Date().toISOString().slice(0, 10),
    createdAt: serverTimestamp(),
  })
  return ref.id
}

// 기기가 캡처한 raw 얼굴 메쉬를 클라우드(Storage)에 올린 뒤 경로 기록.
// → status: mesh_ready, 아바타 생성 대기(pending) 로 큐잉.
export function setRawScan(sessionId, rawScan) {
  return updateDoc(doc(db, COL.sessions, sessionId), {
    rawScan, // { path } Storage 경로 (원본 스캔)
    status: SESSION_STATUS.meshReady,
    meshReadyAt: serverTimestamp(),
    'avatar.status': AVATAR_STATUS.pending,
  })
}

// 외부 AI 모델링이 아바타 생성 완료 후 되써주는 지점 (마지막 연결부).
export function setAvatarStatus(sessionId, status) {
  return updateDoc(doc(db, COL.sessions, sessionId), { 'avatar.status': status })
}
export function setAvatar(sessionId, avatar) {
  return updateDoc(doc(db, COL.sessions, sessionId), {
    avatar: { status: AVATAR_STATUS.ready, readyAt: serverTimestamp(), ...avatar }, // { obj, textures }
  })
}

// 시작 → status: in_progress. plannedShots = { '4.5', '3.5', '1.5', total } 목표 샷수(선택)
export function startSession(sessionId, plannedShots) {
  const data = { status: SESSION_STATUS.inProgress, startedAt: serverTimestamp() }
  if (plannedShots) data.plannedShots = plannedShots
  return updateDoc(doc(db, COL.sessions, sessionId), data)
}

// 샷 1발 기록 (실시간). shot: { seq, tip, x, y, z, zone }
export function addShot(sessionId, shot) {
  return addDoc(collection(db, COL.sessions, sessionId, COL.shots), {
    ...shot,
    t: serverTimestamp(),
  })
}

// 샷 배치 기록 (N발 모아서 전송 — 쓰기 비용 절감). shots: [{ seq, tip, x, y, z, zone }]
export async function addShotsBatch(sessionId, shots) {
  const batch = writeBatch(db)
  const col = collection(db, COL.sessions, sessionId, COL.shots)
  for (const s of shots) batch.set(doc(col), { ...s, t: serverTimestamp() })
  await batch.commit()
}

// 완료 → status: completed. summary: { shotSummary, metrics, compare, coverage, durationMin }
export function completeSession(sessionId, summary) {
  return updateDoc(doc(db, COL.sessions, sessionId), {
    ...summary,
    status: SESSION_STATUS.completed,
    completedAt: serverTimestamp(),
  })
}

export async function getSession(sessionId) {
  return snap(await getDoc(doc(db, COL.sessions, sessionId)))
}

export async function getSessionShots(sessionId) {
  const qs = await getDocs(
    query(collection(db, COL.sessions, sessionId, COL.shots), orderBy('seq', 'asc')),
  )
  return list(qs)
}

// 실시간 샷 구독 — 시술 중 시술자 패드에 좌표를 라이브로 표시. 반환값은 구독 해제 함수.
export function subscribeShots(sessionId, cb) {
  const q = query(collection(db, COL.sessions, sessionId, COL.shots), orderBy('seq', 'asc'))
  return onSnapshot(q, (qs) => cb(list(qs)))
}

// 실시간 세션 구독 — status/아바타 준비 상태 변화 감지 (아바타 ready 되면 패드에 로드).
export function subscribeSession(sessionId, cb) {
  return onSnapshot(doc(db, COL.sessions, sessionId), (d) => cb(snap(d)))
}

// 진행 중/생성됨 세션을 코드로 조회 (디바이스가 코드로 세션 이어받기)
export async function getActiveSessionByCode(patientCode) {
  const qs = await getDocs(
    query(
      collection(db, COL.sessions),
      where('patientCode', '==', patientCode),
      where('status', 'in', [
        SESSION_STATUS.created,
        SESSION_STATUS.meshReady,
        SESSION_STATUS.inProgress,
      ]),
      orderBy('createdAt', 'desc'),
      limit(1),
    ),
  )
  return list(qs)[0] ?? null
}

// 환자의 완료된 세션(=리포트) 최신순
export async function getSessionsByPatient(patientId) {
  const qs = await getDocs(
    query(collection(db, COL.sessions), where('patientId', '==', patientId), orderBy('date', 'desc')),
  )
  return list(qs)
}

export async function getLatestCompletedSession(patientId) {
  const qs = await getDocs(
    query(
      collection(db, COL.sessions),
      where('patientId', '==', patientId),
      where('status', '==', SESSION_STATUS.completed),
      orderBy('completedAt', 'desc'),
      limit(1),
    ),
  )
  return list(qs)[0] ?? null
}

/* ============ 병원 대시보드 ============ */

export async function getClinic(clinicId) {
  return snap(await getDoc(doc(db, COL.clinics, clinicId)))
}

export async function getDoctors(clinicId) {
  return list(await getDocs(collection(db, COL.clinics, clinicId, COL.doctors)))
}

// 특정 날짜 세션 스케줄 (시술중/완료 상태 포함)
export async function getSessionsByDate(clinicId, date) {
  const qs = await getDocs(
    query(
      collection(db, COL.sessions),
      where('clinicId', '==', clinicId),
      where('date', '==', date),
      orderBy('createdAt', 'asc'),
    ),
  )
  return list(qs)
}

/* ============ 예약 ============ */

export async function getBookingsByPatient(patientId) {
  return list(
    await getDocs(
      query(collection(db, COL.bookings), where('patientId', '==', patientId), orderBy('date', 'asc')),
    ),
  )
}

export async function getUpcomingBooking(patientId, today) {
  const qs = await getDocs(
    query(
      collection(db, COL.bookings),
      where('patientId', '==', patientId),
      where('status', '==', '예약확정'),
      where('date', '>=', today),
      orderBy('date', 'asc'),
      limit(1),
    ),
  )
  return list(qs)[0] ?? null
}

export function addBooking(data) {
  return addDoc(collection(db, COL.bookings), { ...data, createdAt: serverTimestamp() })
}
