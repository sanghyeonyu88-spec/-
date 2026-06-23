"use client";

import { useState, useEffect, useRef } from "react";

interface Prediction {
  id: string;
  name: string;
  korScore: number;
  zafScore: number;
  timestamp: number;
  likes: number;
}

// 2026-06-26 18:00 KST = 09:00 UTC
const MATCH_DATE = new Date("2026-06-26T09:00:00.000Z");

function useCountdown(target: Date) {
  const [state, setState] = useState({
    days: 0, hours: 0, minutes: 0, seconds: 0, isPast: false,
  });

  useEffect(() => {
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setState({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }
      setState({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000)  / 60000),
        seconds: Math.floor((diff % 60000)    / 1000),
        isPast:  false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  return state;
}

function FlipDial({
  value,
  onChange,
  accentColor,
}: {
  value: number;
  onChange: (v: number) => void;
  accentColor: string;
}) {
  const [animKey, setAnimKey] = useState(0);
  const prev = useRef(value);

  useEffect(() => {
    if (value !== prev.current) {
      setAnimKey((k) => k + 1);
      prev.current = value;
    }
  }, [value]);

  return (
    <div className="flip-dial">
      <button
        type="button"
        className="flip-dial__btn"
        onClick={() => onChange(Math.min(20, value + 1))}
        aria-label="점수 올리기"
      >
        ▲
      </button>
      <div
        className="flip-dial__track"
        style={{
          borderColor: accentColor,
          boxShadow: `0 0 28px ${accentColor}1e, inset 0 0 20px rgba(0,0,0,.4)`,
          color: accentColor,
        }}
      >
        <span
          key={animKey}
          className="flip-dial__number"
          style={{ color: accentColor }}
        >
          {value}
        </span>
      </div>
      <button
        type="button"
        className="flip-dial__btn"
        onClick={() => onChange(Math.max(0, value - 1))}
        aria-label="점수 내리기"
      >
        ▼
      </button>
    </div>
  );
}

function timeAgo(ts: number): string {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

function PredictionCard({
  p,
  onLike,
}: {
  p: Prediction;
  onLike: (id: string) => void;
}) {
  const diff = p.korScore - p.zafScore;
  const result =
    diff > 0 ? "한국 승" : diff < 0 ? "남아공 승" : "무승부";
  const resultColor =
    diff > 0 ? "#CE1126" : diff < 0 ? "#FFB81C" : "#5A6070";

  return (
    <div className="prediction-card">
      <div className="card-header">
        <span className="card-name">{p.name}</span>
        <span className="card-time">{timeAgo(p.timestamp)}</span>
      </div>
      <div className="card-score">
        <span className="card-score-number" style={{ color: "#CE1126" }}>
          {p.korScore}
        </span>
        <span className="card-score-sep">:</span>
        <span className="card-score-number" style={{ color: "#FFB81C" }}>
          {p.zafScore}
        </span>
      </div>
      <div className="card-footer">
        <span className="card-result" style={{ color: resultColor }}>
          {result}
        </span>
        <button
          className="card-like"
          onClick={() => onLike(p.id)}
          aria-label={`좋아요 ${p.likes}개`}
        >
          ♥ {p.likes}
        </button>
      </div>
    </div>
  );
}

export default function WorldCupPredictor() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [name, setName] = useState("");
  const [korScore, setKorScore] = useState(2);
  const [zafScore, setZafScore] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const countdown = useCountdown(MATCH_DATE);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wc2026-predictions");
      if (raw) setPredictions(JSON.parse(raw));
    } catch {}
  }, []);

  function save(list: Prediction[]) {
    setPredictions(list);
    try {
      localStorage.setItem("wc2026-predictions", JSON.stringify(list));
    } catch {}
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    const entry: Prediction = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: name.trim(),
      korScore,
      zafScore,
      timestamp: Date.now(),
      likes: 0,
    };
    save([entry, ...predictions]);
    setName("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  }

  function handleLike(id: string) {
    save(predictions.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)));
  }

  const total   = predictions.length;
  const korWins = predictions.filter((p) => p.korScore > p.zafScore).length;
  const draws   = predictions.filter((p) => p.korScore === p.zafScore).length;
  const zafWins = predictions.filter((p) => p.korScore < p.zafScore).length;

  const avgKor = total > 0
    ? (predictions.reduce((s, p) => s + p.korScore, 0) / total).toFixed(1)
    : "–";
  const avgZaf = total > 0
    ? (predictions.reduce((s, p) => s + p.zafScore, 0) / total).toFixed(1)
    : "–";

  const korW  = total > 0 ? (korWins / total) * 100 : 33.3;
  const drawW = total > 0 ? (draws   / total) * 100 : 33.4;
  const zafW  = total > 0 ? (zafWins / total) * 100 : 33.3;

  return (
    <div className="app">
      <div className="stadium-lights" aria-hidden="true" />

      <header className="site-header">
        <div className="header-inner">
          <span className="tournament-badge">2026 FIFA WORLD CUP™</span>
          <div className="countdown-bar">
            {countdown.isPast ? (
              <span className="kickoff-live">경기 진행중 ⚽</span>
            ) : (
              <>
                <span className="countdown-label">킥오프까지</span>
                {(
                  [
                    [countdown.days,    "일"],
                    [countdown.hours,   "시간"],
                    [countdown.minutes, "분"],
                    [countdown.seconds, "초"],
                  ] as [number, string][]
                ).map(([v, u]) => (
                  <div key={u} className="countdown-unit">
                    <span className="countdown-number">
                      {String(v).padStart(2, "0")}
                    </span>
                    <span className="countdown-unit-label">{u}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </header>

      <section className="match-hero" aria-label="경기 정보">
        <div className="match-hero-inner">
          <div className="team-block team-block--kor">
            <div className="team-flag" aria-hidden="true">🇰🇷</div>
            <div className="team-name-kr">대한민국</div>
            <div className="team-name-en">KOREA</div>
          </div>

          <div className="vs-block">
            <div className="vs-text" aria-hidden="true">VS</div>
            <div className="match-info">
              <div className="match-date">2026년 6월 26일</div>
              <div className="match-venue">그룹 스테이지</div>
            </div>
            <div className="pitch-icon" aria-hidden="true">⚽</div>
          </div>

          <div className="team-block team-block--zaf">
            <div className="team-flag" aria-hidden="true">🇿🇦</div>
            <div className="team-name-kr">남아공</div>
            <div className="team-name-en">S.AFRICA</div>
          </div>
        </div>
      </section>

      <main className="main-content">
        <section className="predict-section" aria-label="스코어 예측 입력">
          <h2 className="section-title">스코어 예측</h2>

          <form onSubmit={handleSubmit} className="predict-form" noValidate>
            <input
              type="text"
              className="name-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="닉네임을 입력하세요"
              maxLength={20}
              required
              autoComplete="off"
              aria-label="닉네임"
            />

            <div className="score-row" aria-label="예측 스코어">
              <div className="score-side">
                <span className="score-team-label">🇰🇷 한국</span>
                <FlipDial
                  value={korScore}
                  onChange={setKorScore}
                  accentColor="#CE1126"
                />
              </div>

              <div className="score-colon" aria-hidden="true">:</div>

              <div className="score-side">
                <span className="score-team-label">🇿🇦 남아공</span>
                <FlipDial
                  value={zafScore}
                  onChange={setZafScore}
                  accentColor="#FFB81C"
                />
              </div>
            </div>

            <button
              type="submit"
              className={`submit-btn${submitted ? " submit-btn--success" : ""}`}
            >
              {submitted ? "✓ 예측 등록 완료!" : "예측 등록하기"}
            </button>
          </form>
        </section>

        {total > 0 && (
          <section className="stats-section" aria-label="예측 통계">
            <h2 className="section-title">모두의 예측 ({total}명)</h2>

            <div className="stats-bar" role="img" aria-label={`한국 승 ${korWins}명, 무승부 ${draws}명, 남아공 승 ${zafWins}명`}>
              <div className="stats-segment stats-segment--kor"  style={{ width: `${korW}%` }}>
                <span>한국 승 {korWins}</span>
              </div>
              <div className="stats-segment stats-segment--draw" style={{ width: `${drawW}%` }}>
                <span>무 {draws}</span>
              </div>
              <div className="stats-segment stats-segment--zaf"  style={{ width: `${zafW}%` }}>
                <span>남아공 승 {zafWins}</span>
              </div>
            </div>

            <div className="avg-scores">
              <div className="avg-block">
                <span className="avg-flag" aria-hidden="true">🇰🇷</span>
                <span className="avg-number" style={{ color: "#CE1126" }}>{avgKor}</span>
                <span className="avg-label">평균 예측 득점</span>
              </div>
              <div className="avg-divider" aria-hidden="true" />
              <div className="avg-block">
                <span className="avg-flag" aria-hidden="true">🇿🇦</span>
                <span className="avg-number" style={{ color: "#FFB81C" }}>{avgZaf}</span>
                <span className="avg-label">평균 예측 득점</span>
              </div>
            </div>

            <div className="predictions-grid">
              {predictions.map((p) => (
                <PredictionCard key={p.id} p={p} onLike={handleLike} />
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="site-footer">
        <p>2026 FIFA WORLD CUP™ · 대한민국 화이팅! 🇰🇷</p>
      </footer>
    </div>
  );
}
