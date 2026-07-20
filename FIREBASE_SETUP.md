# Firebase (Firestore) 세팅 가이드

앱 데이터 계층은 `src/lib/firebase.js` + `src/lib/db.js` 에 있습니다.
Firestore 만 사용하며, config 는 `.env.local` 에서 읽습니다.

## 1. Firebase 프로젝트 생성

1. https://console.firebase.google.com → **프로젝트 추가**
2. 이름: `skintel` (원하는 이름) → 애널리틱스는 꺼도 됨 → 생성

## 2. 웹 앱 등록 + config 복사

1. 프로젝트 개요 → **앱 추가 → 웹(</>)**
2. 앱 닉네임 입력 후 등록 → 표시되는 `firebaseConfig` 값들을 복사
3. 프로젝트 루트에 `.env.local` 생성 (`.env.local.example` 참고) 후 채우기:

```
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=skintel-xxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=skintel-xxxx
VITE_FIREBASE_STORAGE_BUCKET=skintel-xxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123...
VITE_FIREBASE_APP_ID=1:123...:web:abc...
```

> `.env.local` 은 `.gitignore`(`*.local`) 로 커밋되지 않습니다.

## 3. Firestore 데이터베이스 만들기

1. 콘솔 → **Firestore Database → 데이터베이스 만들기**
2. 위치: `asia-northeast3 (서울)` 권장
3. 모드: **테스트 모드로 시작** (시딩 위해 임시로 read/write 허용)

## 4. 더미데이터 시딩

```bash
node --env-file=.env.local scripts/seed.mjs
```

성공 시: `clinic, 3 doctors, 1 patient, 1 treatment, 4 bookings` 생성.
콘솔 Firestore 에서 `clinics / patients / treatments / bookings` 확인.

## 5. 규칙·인덱스 배포 (firebase CLI)

```bash
npm i -g firebase-tools
firebase login
firebase use --add            # 위 프로젝트 선택
firebase deploy --only firestore:rules,firestore:indexes
```

- `firestore.rules` — 읽기 허용 / 클라이언트 쓰기 금지 (배포하면 테스트 모드가 닫힘)
- `firestore.indexes.json` — 쿼리용 복합 인덱스

## 6. (선택) 로컬 에뮬레이터로 개발

```bash
firebase emulators:start --only firestore
# 다른 터미널에서 (.env.local 에 VITE_USE_EMULATOR=1 설정 후)
node --env-file=.env.local scripts/seed.mjs
```

## 데이터 모델 & 시술 흐름

```
patients/{id}      · name, birthDate, phone, patientCode(5자리), assignedDoctorId, plannedProcedure, grade
sessions/{id}      · patientId, patientCode, clinicId, doctorId, procedure, device
                   · status: created → mesh_ready → in_progress → completed
                   · rawScan{path}                       ← 기기가 올린 원본 얼굴 메쉬
                   · avatar{status,obj,textures}         ← 외부 AI 모델링 결과 (pending→processing→ready)
                   · shotSummary{'4.5','3.5','1.5',total}, metrics, compare, photos
  └ shots/{id}     · seq, tip('4.5'|'3.5'|'1.5'), x, y, z, zone, t   ← 실시간 샷 좌표
clinics/{id}/doctors/{id}
bookings/{id}
```

**전체 파이프라인 → db.js 함수 매핑**
1. 환자 등록(코드 발급) → `registerPatient({name,birthDate,phone,assignedDoctorId,plannedProcedure,clinicId})` → `{ patientCode }`
2. 프로토콜 생성 → `createSession({patientId,patientCode,clinicId,doctorId,procedure,device})` → `sessionId` (`created`)
3. 기기가 얼굴 메쉬 캡처 → Storage 업로드 → `setRawScan(sessionId, {path})` (`mesh_ready`, avatar `pending`)
4. **[외부 AI 모델링]** raw → 아바타 .obj 생성 → 완료 시 `setAvatar(sessionId, {obj,textures})` (avatar `ready`) ← **마지막 연결부**
5. 시술자 패드: `subscribeSession(sessionId, cb)` 로 avatar `ready` 감지 → 아바타 로드
6. 시작 → `startSession(sessionId)` (`in_progress`)
7. 시술 중: 기기가 샷 좌표 전송 → `addShot`/`addShotsBatch`, 패드는 `subscribeShots(sessionId, cb)` 로 **실시간 표시**
8. 완료 → `completeSession(sessionId, {shotSummary,metrics,compare,coverage,durationMin})` → 리포트+병원 DB 축적

**읽기 예시**
```js
import { getPatientByCode, getLatestCompletedSession, getSessionShots } from './lib/db.js'

const patient = await getPatientByCode('20415')
const report  = await getLatestCompletedSession(patient.id)
const shots   = await getSessionShots('s1')   // 좌표 → 3D 얼굴에 실제 샷 렌더 가능
```

시드 ID: 병원 `rosota` · 환자 `p_jieun`(코드 `20415`) · 세션 `s1`(+샷 8건).

## 다음 단계 (아직 안 함)
- **Auth**: 환자/직원 로그인 → `firestore.rules` 의 프로덕션 규칙(주석) 활성화
- **Storage**: 시술 전/후 사진·3D 스캔 업로드 (`treatments.photos` / `faceScan` 경로 연결)
- 페이지들을 `sample.js` 더미 → `db.js` 호출로 교체
