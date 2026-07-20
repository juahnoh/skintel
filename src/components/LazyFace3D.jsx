import { Suspense, lazy } from 'react'

// three.js(≈1.6MB)를 초기 번들에서 분리 → 스플래시/랜딩은 즉시, 얼굴은 필요할 때 로드.
const Face3D = lazy(() => import('./Face3D.jsx'))

// 얼굴 청크를 미리 받아두기 (idle 시 호출) → 얼굴 페이지 진입을 빠르게
export function prefetchFace3D() {
  import('./Face3D.jsx')
}

export default function LazyFace3D(props) {
  return (
    <Suspense fallback={<div className="face3d-fallback">3D 얼굴 불러오는 중…</div>}>
      <Face3D {...props} />
    </Suspense>
  )
}
