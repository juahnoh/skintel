// 환자 코드 SMS 발송 (Solapi). 콜러블 함수.
// 배포 전: 시크릿 설정 + 발신번호 등록 필요 (SMS_SETUP.md 참고).
const { onCall, HttpsError } = require('firebase-functions/v2/https')
const { defineSecret, defineString } = require('firebase-functions/params')
const { SolapiMessageService } = require('solapi')

const SOLAPI_API_KEY = defineSecret('SOLAPI_API_KEY')
const SOLAPI_API_SECRET = defineSecret('SOLAPI_API_SECRET')
const SOLAPI_SENDER = defineSecret('SOLAPI_SENDER') // 등록된 발신번호
const APP_URL = defineString('APP_URL', { default: 'https://skintel-ec412.web.app' })

const onlyDigits = (s) => String(s || '').replace(/\D/g, '')

exports.sendPatientCode = onCall(
  { region: 'asia-northeast3', secrets: [SOLAPI_API_KEY, SOLAPI_API_SECRET, SOLAPI_SENDER] },
  async (req) => {
    const { phone, code, name } = req.data || {}
    const to = onlyDigits(phone)
    if (!to || !code) throw new HttpsError('invalid-argument', 'phone·code 필요')

    const link = `${APP_URL.value()}/#/enter?code=${code}`
    const text = `[스킨텔] ${name ? name + '님 ' : ''}시술 리포트가 준비됐어요.\n코드 ${code}\n${link}`

    const service = new SolapiMessageService(SOLAPI_API_KEY.value(), SOLAPI_API_SECRET.value())
    try {
      await service.sendOne({ to, from: onlyDigits(SOLAPI_SENDER.value()), text })
      return { ok: true }
    } catch (e) {
      throw new HttpsError('internal', 'SMS 발송 실패: ' + (e?.message || e))
    }
  },
)
