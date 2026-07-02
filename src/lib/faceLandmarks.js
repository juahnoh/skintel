import { useEffect, useState } from 'react'
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision'

// MediaPipe FaceLandmarker(브라우저용 얼굴 랜드마크 AI)로 사진에서 얼굴을 인식합니다.
// WASM/모델은 CDN에서 로드하며, 실패하면 null을 반환해 화면은 폴백 좌표로 동작합니다.
const WASM = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
const MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

let landmarkerPromise = null
function getLandmarker() {
  if (!landmarkerPromise) {
    landmarkerPromise = (async () => {
      const vision = await FilesetResolver.forVisionTasks(WASM)
      return FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL },
        runningMode: 'IMAGE',
        numFaces: 1,
      })
    })()
  }
  return landmarkerPromise
}

// 사진 URL을 받아 468개 얼굴 랜드마크(정규화 좌표 0~1)를 반환하는 훅.
export function useFaceLandmarks(src) {
  const [landmarks, setLandmarks] = useState(null)
  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const img = new Image()
        img.crossOrigin = 'anonymous'
        img.src = src
        await img.decode()
        if (!img.naturalWidth) return
        // 캔버스로 옮겨 그린 뒤 인식 (일부 환경에서 이미지 직접 인식이 실패하는 것 방지)
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        canvas.getContext('2d').drawImage(img, 0, 0)
        const landmarker = await getLandmarker()
        const res = landmarker.detect(canvas)
        const face = res?.faceLandmarks?.[0]
        if (alive && face) setLandmarks(face)
      } catch {
        /* CDN/모델 로드 실패 → 폴백 좌표 사용 */
      }
    })()
    return () => {
      alive = false
    }
  }, [src])
  return landmarks
}
