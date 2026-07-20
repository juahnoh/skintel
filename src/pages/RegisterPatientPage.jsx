import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDoctors, registerPatient, createSession } from '../lib/db.js'
import { sendPatientCodeSMS } from '../lib/sms.js'

const CLINIC_ID = 'rosota'
const PROCEDURES = ['울쎄라', '울쎄라 리프팅']
const DEVICE = '울쎄라 (Ulthera SPT)'

export default function RegisterPatientPage() {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [form, setForm] = useState({
    name: '',
    birthDate: '',
    phone: '',
    assignedDoctorId: '',
    plannedProcedure: PROCEDURES[0],
  })
  const [step, setStep] = useState('form') // form | issued
  const [issued, setIssued] = useState(null) // { id, patientCode }
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [smsState, setSmsState] = useState('') // '' | sending | sent | fail

  async function sendSMS(code) {
    if (!form.phone.trim()) return
    setSmsState('sending')
    try {
      const r = await sendPatientCodeSMS({ phone: form.phone, code, name: form.name })
      setSmsState(r?.skipped ? '' : 'sent')
    } catch {
      setSmsState('fail')
    }
  }

  useEffect(() => {
    getDoctors(CLINIC_ID)
      .then((docs) => {
        setDoctors(docs)
        setForm((f) => ({ ...f, assignedDoctorId: f.assignedDoctorId || docs[0]?.id || '' }))
      })
      .catch(() => setError('원장 목록을 불러오지 못했어요 (Firebase 설정 확인)'))
  }, [])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))
  const doctorName = (id) => doctors.find((d) => d.id === id)?.name ?? ''

  async function submit() {
    if (!form.name.trim()) return setError('이름을 입력해주세요')
    setError('')
    setBusy(true)
    try {
      const res = await registerPatient({ ...form, clinicId: CLINIC_ID })
      setIssued(res)
      setStep('issued')
      sendSMS(res.patientCode) // 코드+링크 문자 자동 발송 (best-effort)
    } catch (e) {
      setError('등록 실패: ' + e.message)
    } finally {
      setBusy(false)
    }
  }

  async function startSession() {
    setBusy(true)
    try {
      const sessionId = await createSession({
        patientId: issued.id,
        patientCode: issued.patientCode,
        clinicId: CLINIC_ID,
        doctorId: form.assignedDoctorId,
        procedure: form.plannedProcedure,
        device: DEVICE,
      })
      navigate(`/op/session/${sessionId}`)
    } catch (e) {
      setError('세션 생성 실패: ' + e.message)
      setBusy(false)
    }
  }

  return (
    <div className="op">
      <div className="op-brand">
        <span className="op-logo" /> skintel
      </div>

      {step === 'form' ? (
        <>
          <h1 className="op-title center">신규 환자 등록</h1>

          <div className="op-card">
            <h2 className="op-card-title">기본 정보</h2>
            <div className="op-grid">
              <label className="op-field">
                <span>이름</span>
                <input className="active" value={form.name} onChange={set('name')} placeholder="김지은" autoFocus />
              </label>
              <label className="op-field">
                <span>생년월일</span>
                <input value={form.birthDate} onChange={set('birthDate')} placeholder="20010101" inputMode="numeric" />
              </label>
              <label className="op-field">
                <span>연락처</span>
                <input value={form.phone} onChange={set('phone')} placeholder="010-0000-0000" inputMode="tel" />
              </label>
            </div>
          </div>

          <div className="op-card">
            <h2 className="op-card-title">시술 정보</h2>
            <div className="op-grid">
              <label className="op-field">
                <span>담당 원장</span>
                <select value={form.assignedDoctorId} onChange={set('assignedDoctorId')}>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </label>
              <label className="op-field">
                <span>시술 예정</span>
                <select value={form.plannedProcedure} onChange={set('plannedProcedure')}>
                  {PROCEDURES.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {error && <div className="op-error">{error}</div>}
          <div className="op-actions">
            <button className="op-btn primary" onClick={submit} disabled={busy}>
              {busy ? '등록 중…' : '등록'}
            </button>
          </div>
        </>
      ) : (
        <>
          <h1 className="op-title">환자 코드가 발급되었어요.</h1>

          <div className="op-issued">
            <div className="op-card">
              <h2 className="op-card-title">등록 정보 확인</h2>
              <div className="op-grid">
                <div className="op-field"><span>이름</span><div className="op-readonly">{form.name}</div></div>
                <div className="op-field"><span>생년월일</span><div className="op-readonly">{form.birthDate || '—'}</div></div>
                <div className="op-field"><span>연락처</span><div className="op-readonly">{form.phone || '—'}</div></div>
                <div className="op-field"><span>담당 원장</span><div className="op-readonly">{doctorName(form.assignedDoctorId)}</div></div>
                <div className="op-field"><span>시술 예정</span><div className="op-readonly">{form.plannedProcedure}</div></div>
              </div>
            </div>

            <div className="op-code-card">
              <div className="op-code-label">환자 코드</div>
              <div className="op-code">{issued.patientCode}</div>
              <div className="op-sms">
                <span className="op-sms-state">
                  {smsState === 'sending' && '문자 발송 중…'}
                  {smsState === 'sent' && `✓ ${form.phone} 로 코드·링크 발송됨`}
                  {smsState === 'fail' && '문자 발송 실패 (설정 확인)'}
                  {smsState === '' && form.phone && '문자 미발송'}
                </span>
                <button
                  className="op-sms-btn"
                  onClick={() => sendSMS(issued.patientCode)}
                  disabled={!form.phone || smsState === 'sending'}
                >
                  코드 문자 {smsState === 'sent' ? '재발송' : '보내기'}
                </button>
              </div>
            </div>
          </div>

          {error && <div className="op-error">{error}</div>}
          <div className="op-actions center">
            <button className="op-btn ghost" onClick={() => setStep('form')} disabled={busy}>정보 수정</button>
            <button className="op-btn primary" onClick={startSession} disabled={busy}>
              {busy ? '세션 생성 중…' : '시술 시작 화면으로 →'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
