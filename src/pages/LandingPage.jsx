import { useNavigate } from 'react-router-dom'
import faceMain from '../assets/face-main.jpg'

// 앱 시작 랜딩(온보딩) 화면. 하단 바 없이 풀스크린.
export default function LandingPage() {
  const navigate = useNavigate()
  const start = () => navigate('/home')

  return (
    <div className="landing">
      <img className="landing-photo" src={faceMain} alt="" />
      <div className="landing-fade" />

      <div className="landing-content">
        <div className="landing-brand">SKINTEL</div>
        <h1 className="landing-title">
          데이터로 기록하는<br />
          나만의 피부 시술 여정
        </h1>

        <div className="landing-progress">
          <span className="on" />
          <span />
          <span />
        </div>

        <div className="landing-controls">
          <button className="start-pill" onClick={start}>
            시작하기
          </button>
        </div>
      </div>
    </div>
  )
}
