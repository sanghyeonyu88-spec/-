"use client";

import { useState, useEffect, useRef } from "react";

// ── Types ────────────────────────────────────────────────────────
interface Player {
  id: string;
  name: string;
  nameEn: string;
  pos: "GK" | "DF" | "MF" | "FW";
  club: string;
  no: number;
  captain?: boolean;
}

interface Prediction {
  id: string;
  nickname: string;
  korScore: number;
  zafScore: number;
  korScorers: string[];
  zafScorers: string[];
  timestamp: number;
  likes: number;
}

type Tab = "predict" | "info" | "squad";

// ── Squad data ───────────────────────────────────────────────────
const KOR_SQUAD: Player[] = [
  { id: "ksgu",   name: "김승규",  nameEn: "Kim Seung-gyu",  pos: "GK", club: "Al Shabab",       no: 1  },
  { id: "johw",   name: "조현우",  nameEn: "Jo Hyeon-woo",   pos: "GK", club: "울산 HD",          no: 21 },
  { id: "sobk",   name: "송범근",  nameEn: "Song Bum-keun",  pos: "GK", club: "전북현대",         no: 26 },
  { id: "leegj",  name: "이기제",  nameEn: "Lee Gi-je",      pos: "DF", club: "전북현대",         no: 2  },
  { id: "seolyw", name: "설영우",  nameEn: "Seol Young-woo", pos: "DF", club: "울산 HD",          no: 3  },
  { id: "kimmj",  name: "김민재",  nameEn: "Kim Min-jae",    pos: "DF", club: "Bayern München",   no: 4  },
  { id: "kwonkw", name: "권경원",  nameEn: "Kwon Kyung-won", pos: "DF", club: "울산 HD",          no: 5  },
  { id: "kimjs",  name: "김진수",  nameEn: "Kim Jin-su",     pos: "DF", club: "전북현대",         no: 14 },
  { id: "kimth",  name: "김태환",  nameEn: "Kim Tae-hwan",   pos: "DF", club: "전북현대",         no: 13 },
  { id: "hongch", name: "홍철",    nameEn: "Hong Chul",      pos: "DF", club: "울산 HD",          no: 15 },
  { id: "jungwy", name: "정우영",  nameEn: "Jung Woo-young", pos: "MF", club: "Al-Sadd",          no: 6  },
  { id: "hwangib",name: "황인범",  nameEn: "Hwang In-beom",  pos: "MF", club: "Vancouver WC",     no: 16 },
  { id: "eomws",  name: "엄원상",  nameEn: "Eom Won-sang",   pos: "MF", club: "RB Leipzig",       no: 8  },
  { id: "leeki",  name: "이강인",  nameEn: "Lee Kang-in",    pos: "MF", club: "PSG",              no: 10 },
  { id: "leejs",  name: "이재성",  nameEn: "Lee Jae-sung",   pos: "MF", club: "Mainz 05",         no: 17 },
  { id: "baeksh", name: "백승호",  nameEn: "Baek Seung-ho",  pos: "MF", club: "Al-Fayha",         no: 18 },
  { id: "parkyw", name: "박용우",  nameEn: "Park Yong-woo",  pos: "MF", club: "Al-Qadsiah",       no: 20 },
  { id: "leesm",  name: "이순민",  nameEn: "Lee Sun-min",    pos: "MF", club: "울산 HD",          no: 24 },
  { id: "sonhm",  name: "손흥민",  nameEn: "Son Heung-min",  pos: "FW", club: "Tottenham",        no: 7,  captain: true },
  { id: "hwanghc",name: "황희찬",  nameEn: "Hwang Hee-chan", pos: "FW", club: "Wolves",           no: 11 },
  { id: "choggs", name: "조규성",  nameEn: "Cho Gue-sung",   pos: "FW", club: "Midtjylland",      no: 9  },
  { id: "ohhg",   name: "오현규",  nameEn: "Oh Hyeon-gyu",   pos: "FW", club: "Celtic",           no: 12 },
  { id: "honghs", name: "홍현석",  nameEn: "Hong Hyun-seok", pos: "FW", club: "KAA Gent",         no: 19 },
  { id: "ohsh",   name: "오세훈",  nameEn: "Oh Se-hun",      pos: "FW", club: "수원FC",           no: 22 },
  { id: "jumr",   name: "주민규",  nameEn: "Joo Min-kyu",    pos: "FW", club: "전북현대",         no: 23 },
  { id: "gomj",   name: "고민준",  nameEn: "Ko Min-jun",     pos: "FW", club: "알힐랄",           no: 25 },
];

const ZAF_SQUAD: Player[] = [
  { id: "zwill",  name: "론웬 윌리엄스",   nameEn: "Ronwen Williams",   pos: "GK", club: "슈퍼스포트 Utd", no: 1  },
  { id: "zmoth",  name: "벨리 모트화",     nameEn: "Veli Mothwa",       pos: "GK", club: "AmaZulu FC",     no: 16 },
  { id: "zfros",  name: "리브 프로슬러",   nameEn: "Reeve Frosler",     pos: "DF", club: "Kasımpaşa",      no: 2  },
  { id: "zhlant", name: "시피소 흘란티",   nameEn: "Sifiso Hlanti",     pos: "DF", club: "울루 유나이티드", no: 3  },
  { id: "zderee", name: "루신 드리크",     nameEn: "Rushine De Reuck",  pos: "DF", club: "셀터 비야레알",  no: 5  },
  { id: "zmvala", name: "모토비 음발라",   nameEn: "Mothobi Mvala",     pos: "DF", club: "슈퍼스포트 Utd", no: 4  },
  { id: "zmokon", name: "테보호 모코에나", nameEn: "Teboho Mokoena",    pos: "MF", club: "슈퍼스포트 Utd", no: 10 },
  { id: "zzungu", name: "봉가니 준구",     nameEn: "Bongani Zungu",     pos: "MF", club: "Racing Club",    no: 8  },
  { id: "zmbule", name: "시포 므블레",     nameEn: "Sipho Mbule",       pos: "MF", club: "슈퍼스포트 Utd", no: 6  },
  { id: "zmaart", name: "유수프 마르트",   nameEn: "Yusuf Maart",       pos: "MF", club: "Kaizer Chiefs",  no: 7  },
  { id: "ztau",   name: "퍼시 타우",       nameEn: "Percy Tau",         pos: "FW", club: "Al Ahly",        no: 11, captain: true },
  { id: "zfost",  name: "라일 포스터",     nameEn: "Lyle Foster",       pos: "FW", club: "Burnley",        no: 9  },
  { id: "zmakgo", name: "에비던스 마크고파",nameEn: "Evidence Makgopa",  pos: "FW", club: "Al-Qadsiah",     no: 19 },
  { id: "zmudau", name: "쿨리소 무다우",   nameEn: "Khuliso Mudau",     pos: "FW", club: "슈퍼스포트 Utd", no: 14 },
];

const POS_LABEL: Record<string, string> = { GK: "골키퍼", DF: "수비수", MF: "미드필더", FW: "공격수" };
const POS_ORDER = ["GK", "DF", "MF", "FW"];

// ── Match info data ──────────────────────────────────────────────
const MATCH_DATE = new Date("2026-06-26T09:00:00.000Z"); // 18:00 KST

const MATCH = {
  venue: "소파이 스타디움",
  venueEn: "SoFi Stadium",
  city: "로스앤젤레스, 미국",
  capacity: "70,240석",
  group: "G조 2라운드",
  korRank: 22,
  zafRank: 65,
  h2h: { played: 5, korW: 3, draw: 1, zafW: 1, last: "2023 친선 1-0 한국 승" },
  korForm: ["W", "W", "D", "W", "W"] as const,
  zafForm: ["W", "L", "D", "W", "L"] as const,
  groupStandings: [
    { flag: "🇺🇸", team: "미국",     mp: 1, w: 1, d: 0, l: 0, gf: 3, ga: 0, pts: 3 },
    { flag: "🇰🇷", team: "대한민국", mp: 1, w: 1, d: 0, l: 0, gf: 1, ga: 0, pts: 3 },
    { flag: "🇿🇦", team: "남아공",   mp: 1, w: 0, d: 0, l: 1, gf: 0, ga: 1, pts: 0 },
    { flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", team: "스코틀랜드",mp: 1, w: 0, d: 0, l: 1, gf: 0, ga: 3, pts: 0 },
  ],
  keyFacts: [
    "한국, FIFA 랭킹 22위로 남아공(65위)보다 43계단 우위",
    "손흥민, 2022 카타르 월드컵에서 3골 기록한 주포",
    "남아공, 2010 자국 개최 월드컵 이후 16년 만에 본선 재진출",
    "퍼시 타우, 이집트 리그 알아흘리 소속 '바파나 바파나' 에이스",
    "양 팀 모두 2라운드 진출을 위해 반드시 이겨야 하는 경기",
    "이강인(PSG), 이번 대회 전 공격 포인트 12개로 최전성기",
  ],
};

// ── Utils ────────────────────────────────────────────────────────
const MATCH_DATE_STAMP = MATCH_DATE.getTime();

function useCountdown(target: number) {
  const [state, setState] = useState({ d: 0, h: 0, m: 0, s: 0, past: false });
  useEffect(() => {
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setState({ d: 0, h: 0, m: 0, s: 0, past: true }); return; }
      setState({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
        past: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);
  return state;
}

function timeAgo(ts: number) {
  const d = Date.now() - ts;
  const m = Math.floor(d / 60000);
  if (m < 1) return "방금 전";
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}시간 전`;
  return `${Math.floor(h / 24)}일 전`;
}

function playerName(id: string): string {
  return (
    KOR_SQUAD.find(p => p.id === id)?.name ??
    ZAF_SQUAD.find(p => p.id === id)?.name ??
    id
  );
}

// ── FlipDial ─────────────────────────────────────────────────────
function FlipDial({ value, onChange, color }: { value: number; onChange: (v: number) => void; color: string }) {
  const [key, setKey] = useState(0);
  const prev = useRef(value);
  useEffect(() => {
    if (value !== prev.current) { setKey(k => k + 1); prev.current = value; }
  }, [value]);
  return (
    <div className="flip-dial">
      <button type="button" className="flip-dial__btn" onClick={() => onChange(Math.min(20, value + 1))} aria-label="올리기">▲</button>
      <div className="flip-dial__track" style={{ borderColor: color, boxShadow: `0 0 28px ${color}1e`, color }}>
        <span key={key} className="flip-dial__number" style={{ color }}>{value}</span>
      </div>
      <button type="button" className="flip-dial__btn" onClick={() => onChange(Math.max(0, value - 1))} aria-label="내리기">▼</button>
    </div>
  );
}

// ── ScorerPicker ─────────────────────────────────────────────────
function ScorerPicker({
  squad, selected, onChange, accentColor, label,
}: {
  squad: Player[];
  selected: string[];
  onChange: (ids: string[]) => void;
  accentColor: string;
  label: string;
}) {
  const toggle = (id: string) =>
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);

  return (
    <div className="scorer-picker">
      <div className="scorer-picker__label">{label}</div>
      {POS_ORDER.map(pos => {
        const players = squad.filter(p => p.pos === pos);
        if (!players.length) return null;
        return (
          <div key={pos} className="pos-group">
            <span className={`pos-badge pos-badge--${pos.toLowerCase()}`}>{POS_LABEL[pos]}</span>
            <div className="player-chips">
              {players.map(p => {
                const active = selected.includes(p.id);
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`player-chip${active ? " player-chip--on" : ""}`}
                    style={active ? { borderColor: accentColor, background: `${accentColor}22`, color: accentColor } : undefined}
                    onClick={() => toggle(p.id)}
                    title={p.nameEn}
                    aria-pressed={active}
                  >
                    <span className="chip-no">{p.no}</span>
                    <span className="chip-name">{p.name}{p.captain ? " ©" : ""}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── MatchInfoTab ──────────────────────────────────────────────────
function MatchInfoTab() {
  const formColor = (r: string) =>
    r === "W" ? "#22c55e" : r === "D" ? "#a3a3a3" : "#ef4444";
  const formLabel = (r: string) =>
    r === "W" ? "승" : r === "D" ? "무" : "패";

  return (
    <div className="info-tab">
      {/* Venue */}
      <div className="info-card">
        <div className="info-card__title">경기 개요</div>
        <div className="meta-grid">
          <div className="meta-item"><span className="meta-key">경기장</span><span className="meta-val">{MATCH.venue} ({MATCH.venueEn})</span></div>
          <div className="meta-item"><span className="meta-key">도시</span><span className="meta-val">{MATCH.city}</span></div>
          <div className="meta-item"><span className="meta-key">수용</span><span className="meta-val">{MATCH.capacity}</span></div>
          <div className="meta-item"><span className="meta-key">라운드</span><span className="meta-val">{MATCH.group}</span></div>
          <div className="meta-item"><span className="meta-key">일시</span><span className="meta-val">2026년 6월 26일 18:00 KST</span></div>
        </div>
      </div>

      {/* FIFA Ranking */}
      <div className="info-card">
        <div className="info-card__title">FIFA 랭킹</div>
        <div className="ranking-row">
          <div className="ranking-side ranking-side--kor">
            <span className="rank-flag">🇰🇷</span>
            <span className="rank-num" style={{ color: "#CE1126" }}>{MATCH.korRank}위</span>
            <span className="rank-team">대한민국</span>
          </div>
          <div className="rank-vs">VS</div>
          <div className="ranking-side ranking-side--zaf">
            <span className="rank-flag">🇿🇦</span>
            <span className="rank-num" style={{ color: "#FFB81C" }}>{MATCH.zafRank}위</span>
            <span className="rank-team">남아공</span>
          </div>
        </div>
        <div className="rank-gap">한국 {MATCH.zafRank - MATCH.korRank}계단 우위</div>
      </div>

      {/* H2H */}
      <div className="info-card">
        <div className="info-card__title">역대 상대 전적</div>
        <div className="h2h-row">
          <div className="h2h-block" style={{ color: "#CE1126" }}>
            <span className="h2h-num">{MATCH.h2h.korW}</span>
            <span className="h2h-lbl">한국 승</span>
          </div>
          <div className="h2h-block" style={{ color: "var(--text-muted)" }}>
            <span className="h2h-num">{MATCH.h2h.draw}</span>
            <span className="h2h-lbl">무승부</span>
          </div>
          <div className="h2h-block" style={{ color: "#FFB81C" }}>
            <span className="h2h-num">{MATCH.h2h.zafW}</span>
            <span className="h2h-lbl">남아공 승</span>
          </div>
        </div>
        <div className="h2h-last">최근: {MATCH.h2h.last}</div>
      </div>

      {/* Recent Form */}
      <div className="info-card">
        <div className="info-card__title">최근 5경기 폼</div>
        <div className="form-section">
          <div className="form-row">
            <span className="form-team">🇰🇷 한국</span>
            <div className="form-dots">
              {MATCH.korForm.map((r, i) => (
                <span key={i} className="form-dot" style={{ background: formColor(r) }} title={formLabel(r)}>{formLabel(r)}</span>
              ))}
            </div>
          </div>
          <div className="form-row">
            <span className="form-team">🇿🇦 남아공</span>
            <div className="form-dots">
              {MATCH.zafForm.map((r, i) => (
                <span key={i} className="form-dot" style={{ background: formColor(r) }} title={formLabel(r)}>{formLabel(r)}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Group Standings */}
      <div className="info-card">
        <div className="info-card__title">G조 순위 (1라운드 후)</div>
        <div className="standings-wrap">
          <table className="standings-table">
            <thead>
              <tr>
                <th>팀</th>
                <th>경기</th><th>승</th><th>무</th><th>패</th>
                <th>득</th><th>실</th><th>승점</th>
              </tr>
            </thead>
            <tbody>
              {MATCH.groupStandings.map((s, i) => (
                <tr key={i} className={s.team === "대한민국" || s.team === "남아공" ? "standings-row--hl" : ""}>
                  <td className="standings-team"><span>{s.flag}</span> {s.team}</td>
                  <td>{s.mp}</td><td>{s.w}</td><td>{s.d}</td><td>{s.l}</td>
                  <td>{s.gf}</td><td>{s.ga}</td>
                  <td className="standings-pts">{s.pts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Facts */}
      <div className="info-card">
        <div className="info-card__title">경기 관전 포인트</div>
        <ul className="key-facts">
          {MATCH.keyFacts.map((f, i) => (
            <li key={i} className="key-fact">{f}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ── SquadTab ─────────────────────────────────────────────────────
function SquadTab() {
  return (
    <div className="squad-tab">
      <SquadList squad={KOR_SQUAD} flag="🇰🇷" teamName="대한민국" accentColor="#CE1126" />
      <SquadList squad={ZAF_SQUAD} flag="🇿🇦" teamName="남아공 (바파나 바파나)" accentColor="#FFB81C" />
    </div>
  );
}

function SquadList({ squad, flag, teamName, accentColor }: { squad: Player[]; flag: string; teamName: string; accentColor: string }) {
  return (
    <div className="squad-block">
      <div className="squad-block__header" style={{ borderColor: accentColor }}>
        <span className="squad-flag">{flag}</span>
        <span className="squad-teamname">{teamName}</span>
        <span className="squad-count">{squad.length}명</span>
      </div>
      {POS_ORDER.map(pos => {
        const players = squad.filter(p => p.pos === pos);
        if (!players.length) return null;
        return (
          <div key={pos} className="squad-pos-section">
            <div className={`squad-pos-header pos-badge pos-badge--${pos.toLowerCase()}`}>{POS_LABEL[pos]}</div>
            <div className="squad-grid">
              {players.map(p => (
                <div key={p.id} className="squad-card">
                  <span className="squad-no" style={{ color: accentColor }}>{p.no}</span>
                  <div className="squad-info">
                    <div className="squad-name">{p.name}{p.captain ? <span className="captain-badge"> C</span> : ""}</div>
                    <div className="squad-name-en">{p.nameEn}</div>
                    <div className="squad-club">{p.club}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── PredictionCard ───────────────────────────────────────────────
function PredictionCard({ p, onLike }: { p: Prediction; onLike: (id: string) => void }) {
  const diff = p.korScore - p.zafScore;
  const result = diff > 0 ? "한국 승" : diff < 0 ? "남아공 승" : "무승부";
  const resultColor = diff > 0 ? "#CE1126" : diff < 0 ? "#FFB81C" : "#5A6070";
  return (
    <div className="prediction-card">
      <div className="card-header">
        <span className="card-name">{p.nickname}</span>
        <span className="card-time">{timeAgo(p.timestamp)}</span>
      </div>
      <div className="card-score">
        <span className="card-score-number" style={{ color: "#CE1126" }}>{p.korScore}</span>
        <span className="card-score-sep">:</span>
        <span className="card-score-number" style={{ color: "#FFB81C" }}>{p.zafScore}</span>
      </div>
      {(p.korScorers.length > 0 || p.zafScorers.length > 0) && (
        <div className="card-scorers">
          {p.korScorers.map(id => (
            <span key={id} className="scorer-tag scorer-tag--kor">⚽ {playerName(id)}</span>
          ))}
          {p.zafScorers.map(id => (
            <span key={id} className="scorer-tag scorer-tag--zaf">⚽ {playerName(id)}</span>
          ))}
        </div>
      )}
      <div className="card-footer">
        <span className="card-result" style={{ color: resultColor }}>{result}</span>
        <button className="card-like" onClick={() => onLike(p.id)} aria-label={`좋아요 ${p.likes}개`}>♥ {p.likes}</button>
      </div>
    </div>
  );
}

// ── Main component ───────────────────────────────────────────────
export default function WorldCupPredictor() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [nickname, setNickname] = useState("");
  const [korScore, setKorScore] = useState(2);
  const [zafScore, setZafScore] = useState(0);
  const [korScorers, setKorScorers] = useState<string[]>([]);
  const [zafScorers, setZafScorers] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [tab, setTab] = useState<Tab>("predict");
  const countdown = useCountdown(MATCH_DATE_STAMP);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wc2026-predictions-v2");
      if (raw) setPredictions(JSON.parse(raw));
    } catch {}
  }, []);

  function save(list: Prediction[]) {
    setPredictions(list);
    try { localStorage.setItem("wc2026-predictions-v2", JSON.stringify(list)); } catch {}
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!nickname.trim()) return;
    save([{
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      nickname: nickname.trim(),
      korScore, zafScore, korScorers, zafScorers,
      timestamp: Date.now(), likes: 0,
    }, ...predictions]);
    setNickname(""); setKorScorers([]); setZafScorers([]);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  }

  const total   = predictions.length;
  const korWins = predictions.filter(p => p.korScore > p.zafScore).length;
  const draws   = predictions.filter(p => p.korScore === p.zafScore).length;
  const zafWins = predictions.filter(p => p.korScore < p.zafScore).length;
  const avgKor  = total > 0 ? (predictions.reduce((s, p) => s + p.korScore, 0) / total).toFixed(1) : "–";
  const avgZaf  = total > 0 ? (predictions.reduce((s, p) => s + p.zafScore, 0) / total).toFixed(1) : "–";

  // Top predicted scorers
  const korScorerCount: Record<string, number> = {};
  const zafScorerCount: Record<string, number> = {};
  predictions.forEach(p => {
    p.korScorers.forEach(id => { korScorerCount[id] = (korScorerCount[id] || 0) + 1; });
    p.zafScorers.forEach(id => { zafScorerCount[id] = (zafScorerCount[id] || 0) + 1; });
  });
  const topKor = Object.entries(korScorerCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topZaf = Object.entries(zafScorerCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxKor = topKor[0]?.[1] || 1;
  const maxZaf = topZaf[0]?.[1] || 1;

  return (
    <div className="app">
      <div className="stadium-lights" aria-hidden="true" />

      {/* Header */}
      <header className="site-header">
        <div className="header-inner">
          <span className="tournament-badge">2026 FIFA WORLD CUP™</span>
          <div className="countdown-bar">
            {countdown.past ? <span className="kickoff-live">경기 진행중 ⚽</span> : (
              <>
                <span className="countdown-label">킥오프까지</span>
                {([[ countdown.d,"일"],[countdown.h,"시간"],[countdown.m,"분"],[countdown.s,"초"]] as [number,string][]).map(([v,u]) => (
                  <div key={u} className="countdown-unit">
                    <span className="countdown-number">{String(v).padStart(2,"0")}</span>
                    <span className="countdown-unit-label">{u}</span>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="match-hero">
        <div className="match-hero-inner">
          <div className="team-block team-block--kor">
            <div className="team-flag">🇰🇷</div>
            <div className="team-name-kr">대한민국</div>
            <div className="team-name-en">KOREA</div>
          </div>
          <div className="vs-block">
            <div className="vs-text">VS</div>
            <div className="match-info">
              <div className="match-date">2026년 6월 26일</div>
              <div className="match-venue">G조 2라운드</div>
            </div>
            <div className="pitch-icon" aria-hidden="true">⚽</div>
          </div>
          <div className="team-block team-block--zaf">
            <div className="team-flag">🇿🇦</div>
            <div className="team-name-kr">남아공</div>
            <div className="team-name-en">S.AFRICA</div>
          </div>
        </div>
      </section>

      {/* Tab nav */}
      <div className="tabs-bar">
        <div className="tabs-inner">
          {([["predict","스코어 예측"],["info","경기 정보"],["squad","선수단"]] as [Tab,string][]).map(([t,label]) => (
            <button key={t} className={`tab-btn${tab===t?" tab-btn--active":""}`} onClick={() => setTab(t)}>{label}</button>
          ))}
        </div>
      </div>

      <main className="main-content">

        {/* ── Tab: 스코어 예측 ── */}
        {tab === "predict" && (
          <>
            <section>
              <h2 className="section-title">스코어 예측</h2>
              <form onSubmit={handleSubmit} className="predict-form" noValidate>
                <input
                  className="name-input" type="text" value={nickname}
                  onChange={e => setNickname(e.target.value)}
                  placeholder="닉네임을 입력하세요" maxLength={20} required autoComplete="off"
                />
                <div className="score-row">
                  <div className="score-side">
                    <span className="score-team-label">🇰🇷 한국</span>
                    <FlipDial value={korScore} onChange={setKorScore} color="#CE1126" />
                  </div>
                  <div className="score-colon">:</div>
                  <div className="score-side">
                    <span className="score-team-label">🇿🇦 남아공</span>
                    <FlipDial value={zafScore} onChange={setZafScore} color="#FFB81C" />
                  </div>
                </div>

                {/* Scorer pickers */}
                <div className="scorers-block">
                  <ScorerPicker squad={KOR_SQUAD} selected={korScorers} onChange={setKorScorers} accentColor="#CE1126" label="🇰🇷 한국 득점자 예측 (복수 선택 가능)" />
                  <ScorerPicker squad={ZAF_SQUAD} selected={zafScorers} onChange={setZafScorers} accentColor="#FFB81C" label="🇿🇦 남아공 득점자 예측 (선택)" />
                </div>

                <button type="submit" className={`submit-btn${submitted?" submit-btn--success":""}`}>
                  {submitted ? "✓ 예측 등록 완료!" : "예측 등록하기"}
                </button>
              </form>
            </section>

            {total > 0 && (
              <section>
                <h2 className="section-title">모두의 예측 ({total}명)</h2>

                <div className="stats-bar">
                  <div className="stats-segment stats-segment--kor"  style={{ width: `${(korWins/total)*100}%` }}><span>한국 승 {korWins}</span></div>
                  <div className="stats-segment stats-segment--draw" style={{ width: `${(draws/total)*100}%` }}><span>무 {draws}</span></div>
                  <div className="stats-segment stats-segment--zaf"  style={{ width: `${(zafWins/total)*100}%` }}><span>남아공 승 {zafWins}</span></div>
                </div>

                <div className="avg-scores">
                  <div className="avg-block">
                    <span className="avg-flag">🇰🇷</span>
                    <span className="avg-number" style={{ color:"#CE1126" }}>{avgKor}</span>
                    <span className="avg-label">평균 득점</span>
                  </div>
                  <div className="avg-divider" />
                  <div className="avg-block">
                    <span className="avg-flag">🇿🇦</span>
                    <span className="avg-number" style={{ color:"#FFB81C" }}>{avgZaf}</span>
                    <span className="avg-label">평균 득점</span>
                  </div>
                </div>

                {(topKor.length > 0 || topZaf.length > 0) && (
                  <div className="top-scorers-wrap">
                    {topKor.length > 0 && (
                      <div className="top-scorers-block">
                        <div className="top-scorers-title">🇰🇷 예측 득점자 TOP</div>
                        {topKor.map(([id, cnt]) => (
                          <div key={id} className="scorer-row">
                            <span className="scorer-row__name">{playerName(id)}</span>
                            <div className="scorer-row__bar-wrap">
                              <div className="scorer-row__bar" style={{ width:`${(cnt/maxKor)*100}%`, background:"#CE1126" }} />
                            </div>
                            <span className="scorer-row__cnt">{cnt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {topZaf.length > 0 && (
                      <div className="top-scorers-block">
                        <div className="top-scorers-title">🇿🇦 예측 득점자 TOP</div>
                        {topZaf.map(([id, cnt]) => (
                          <div key={id} className="scorer-row">
                            <span className="scorer-row__name">{playerName(id)}</span>
                            <div className="scorer-row__bar-wrap">
                              <div className="scorer-row__bar" style={{ width:`${(cnt/maxZaf)*100}%`, background:"#FFB81C" }} />
                            </div>
                            <span className="scorer-row__cnt">{cnt}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="predictions-grid">
                  {predictions.map(p => <PredictionCard key={p.id} p={p} onLike={id => save(predictions.map(x => x.id===id?{...x,likes:x.likes+1}:x))} />)}
                </div>
              </section>
            )}
          </>
        )}

        {/* ── Tab: 경기 정보 ── */}
        {tab === "info" && <MatchInfoTab />}

        {/* ── Tab: 선수단 ── */}
        {tab === "squad" && <SquadTab />}
      </main>

      <footer className="site-footer">
        <p>2026 FIFA WORLD CUP™ · 대한민국 화이팅! 🇰🇷</p>
      </footer>
    </div>
  );
}
