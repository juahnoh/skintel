# 환자 코드 SMS 발송 세팅 (Solapi + Cloud Functions)

환자 등록 시 입력한 전화번호로 **코드 + 리포트 링크**를 문자로 보냅니다.
링크(`.../#/enter?code=20415`)를 열면 코드가 자동 입력됩니다.

## 0. 사전 준비
- **Firebase Blaze(종량제) 요금제** — Cloud Functions 외부 호출에 필요 (소액, 무료 할당량 큼)
- **Solapi 계정** (https://solapi.com) → API Key / API Secret 발급
- **발신번호 등록** — Solapi 콘솔에서 발신번호 사전 등록(법적 필수). 등록된 번호만 `from` 으로 사용 가능

## 1. 함수 의존성 설치
```bash
cd functions
npm install
cd ..
```

## 2. 시크릿 설정 (Solapi 키·발신번호)
```bash
firebase functions:secrets:set SOLAPI_API_KEY      # Solapi API Key 붙여넣기
firebase functions:secrets:set SOLAPI_API_SECRET   # Solapi API Secret
firebase functions:secrets:set SOLAPI_SENDER       # 등록된 발신번호 (예: 0212345678)
```

## 3. 앱 링크 주소 설정 (문자에 들어갈 링크)
`functions/index.js` 의 `APP_URL` 기본값이 `https://skintel-ec412.web.app` 입니다.
Hosting 배포 주소가 다르면 배포 시 지정:
```bash
firebase deploy --only functions
# 또는 .env 로: functions/.env 에  APP_URL=https://내앱주소
```

## 4. 배포
```bash
firebase deploy --only functions
```

## 5. 동작
- 시술자 **신규 환자 등록** → 코드 발급 시 자동으로 문자 발송 (전화번호 입력된 경우)
- 발급 화면의 **"코드 문자 보내기/재발송"** 버튼으로 수동 발송도 가능
- 함수가 미배포/미설정이면 등록은 정상 동작하고 문자만 조용히 skip

## 문자 예시
```
[스킨텔] 김지은님 시술 리포트가 준비됐어요.
코드 20415
https://skintel-ec412.web.app/#/enter?code=20415
```

## 로컬 테스트 (에뮬레이터, 실제 발송 안 함)
```bash
firebase emulators:start --only functions
```
> 실제 문자 발송은 배포 환경에서. 에뮬레이터에선 Solapi 호출이 실패할 수 있으니 실발송은 배포 후 테스트하세요.
