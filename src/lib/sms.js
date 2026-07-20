// 환자 코드 SMS 발송 — Cloud Function(sendPatientCode) 호출.
// 함수 미배포/미설정이면 조용히 skip (등록 흐름은 막지 않음).
import { getFunctions, httpsCallable } from 'firebase/functions'
import { app } from './firebase.js'

export async function sendPatientCodeSMS({ phone, code, name }) {
  if (!app || !phone || !code) return { skipped: true }
  const fns = getFunctions(app, 'asia-northeast3')
  const res = await httpsCallable(fns, 'sendPatientCode')({ phone, code, name })
  return res.data
}
