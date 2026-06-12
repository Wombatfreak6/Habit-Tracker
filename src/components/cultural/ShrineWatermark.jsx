// ─────────────────────────────────────────────────────────────────────
//  ShrineWatermark — Detailed Sukuna-inspired torii in sakura pink tones
//  position: fixed, zIndex: 0, pointerEvents: none
// ─────────────────────────────────────────────────────────────────────

export default function ShrineWatermark() {
  // Skull helper positions
  const skulls = [
    // left pillar base
    { cx: 108, cy: 258 },
    { cx: 119, cy: 262 },
    // right pillar base
    { cx: 281, cy: 258 },
    { cx: 292, cy: 262 },
  ]

  return (
    <div
      style={{
        position:       'fixed',
        top:            '50%',
        left:           '50%',
        transform:      'translate(-50%, -48%)',
        zIndex:         0,
        pointerEvents:  'none',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
      }}
      aria-hidden
    >
      {/* Radial glow behind gate */}
      <div
        style={{
          position:     'absolute',
          width:        '380px',
          height:       '380px',
          borderRadius: '50%',
          background:   'radial-gradient(circle, rgba(255,183,213,0.055) 0%, rgba(255,183,213,0.02) 40%, transparent 70%)',
          top:          '50%',
          left:         '50%',
          transform:    'translate(-50%, -40%)',
          zIndex:       -1,
        }}
      />

      <svg
        width="560"
        height="480"
        viewBox="0 0 400 340"
        overflow="visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* ── FULL MOON behind everything ── */}
        <defs>
          <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(248,247,242,0.07)" />
            <stop offset="100%" stopColor="rgba(248,247,242,0)" />
          </radialGradient>
        </defs>
        <circle cx="200" cy="110" r="70" fill="url(#moonGlow)" />

        {/* ── TOP FINIAL ── */}
        <line x1="200" y1="15" x2="200" y2="50"
          stroke="rgba(255,183,213,0.2)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="200" cy="12" r="5"
          stroke="rgba(255,183,213,0.2)" strokeWidth="1.5" fill="rgba(255,183,213,0.06)" />
        {/* Flanges */}
        <path d="M193 30 Q200 26 207 30"
          stroke="rgba(255,183,213,0.18)" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M195 34 Q200 30 205 34"
          stroke="rgba(255,183,213,0.14)" strokeWidth="1" strokeLinecap="round" fill="none" />

        {/* ── SECOND ROOF TIER (smaller, above) ── */}
        <polygon
          points="90,50 310,50 330,80 70,80"
          fill="rgba(255,183,213,0.04)"
          stroke="rgba(255,183,213,0.13)"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        {/* Second tier ridge */}
        <line x1="90" y1="50" x2="310" y2="50"
          stroke="rgba(255,183,213,0.18)" strokeWidth="2" strokeLinecap="round" />
        {/* Second tier tiles — 12 tiles */}
        {Array.from({ length: 12 }, (_, i) => {
          const x = 70 + i * (260 / 12)
          return (
            <path
              key={`t2-${i}`}
              d={`M${x},80 Q${x + 10.8},75 ${x + 21.7},80`}
              stroke="rgba(255,183,213,0.16)"
              strokeWidth="0.8"
              strokeLinecap="round"
              fill="none"
            />
          )
        })}
        {/* Second tier upswept corners */}
        <path d="M90,50 Q78,46 80,38" stroke="rgba(255,183,213,0.14)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M310,50 Q322,46 320,38" stroke="rgba(255,183,213,0.14)" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* ── MAIN ROOF (lowest tier) ── */}
        <polygon
          points="40,80 360,80 380,110 20,110"
          fill="rgba(255,183,213,0.05)"
          stroke="rgba(255,183,213,0.15)"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        {/* Main roof ridge */}
        <line x1="40" y1="80" x2="360" y2="80"
          stroke="rgba(255,183,213,0.2)" strokeWidth="3" strokeLinecap="round" />
        {/* Eave tiles — 18 tiles */}
        {Array.from({ length: 18 }, (_, i) => {
          const x = 20 + i * (360 / 18)
          return (
            <path
              key={`t1-${i}`}
              d={`M${x},110 Q${x + 10},103 ${x + 20},110`}
              stroke="rgba(255,183,213,0.18)"
              strokeWidth="0.8"
              strokeLinecap="round"
              fill="none"
            />
          )
        })}
        {/* Upswept corners */}
        <path d="M40,80 Q18,76 15,120" stroke="rgba(255,183,213,0.18)" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M360,80 Q382,76 385,120" stroke="rgba(255,183,213,0.18)" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* ── ONI CREST (center of main roof ridge) ── */}
        <circle cx="200" cy="78" r="6"
          stroke="rgba(255,183,213,0.25)" strokeWidth="1.2" fill="rgba(255,183,213,0.05)" />
        {/* Horns */}
        <path d="M194,74 Q188,66 182,58"
          stroke="rgba(255,183,213,0.22)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M206,74 Q212,66 218,58"
          stroke="rgba(255,183,213,0.22)" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        {/* Eyes */}
        <circle cx="196" cy="77" r="1.5" fill="rgba(255,183,213,0.3)" />
        <circle cx="204" cy="77" r="1.5" fill="rgba(255,183,213,0.3)" />
        {/* Fangs */}
        <polygon points="196,84 194,88 198,88" fill="rgba(255,183,213,0.18)" />
        <polygon points="204,84 202,88 206,88" fill="rgba(255,183,213,0.18)" />

        {/* ── GAKUZUKA (vertical connector, nuki to roof) ── */}
        <rect x="196" y="110" width="8" height="60"
          fill="rgba(255,183,213,0.06)"
          stroke="rgba(255,183,213,0.14)"
          strokeWidth="0.8"
        />

        {/* ── LEFT PILLAR ── */}
        <polygon
          points="104,270 122,270 122,108 104,108"
          fill="rgba(255,183,213,0.06)"
          stroke="rgba(255,183,213,0.16)"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* Grain lines */}
        <line x1="108" y1="112" x2="108" y2="268" stroke="rgba(255,183,213,0.05)" strokeWidth="0.5" />
        <line x1="113" y1="112" x2="113" y2="268" stroke="rgba(255,183,213,0.05)" strokeWidth="0.5" />
        <line x1="118" y1="112" x2="118" y2="268" stroke="rgba(255,183,213,0.05)" strokeWidth="0.5" />
        {/* Shimaki ring */}
        <rect x="104" y="230" width="18" height="6"
          fill="rgba(255,183,213,0.1)"
          stroke="rgba(255,183,213,0.2)"
          strokeWidth="0.8"
        />

        {/* ── RIGHT PILLAR ── */}
        <polygon
          points="278,270 296,270 296,108 278,108"
          fill="rgba(255,183,213,0.06)"
          stroke="rgba(255,183,213,0.16)"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* Grain lines */}
        <line x1="282" y1="112" x2="282" y2="268" stroke="rgba(255,183,213,0.05)" strokeWidth="0.5" />
        <line x1="287" y1="112" x2="287" y2="268" stroke="rgba(255,183,213,0.05)" strokeWidth="0.5" />
        <line x1="292" y1="112" x2="292" y2="268" stroke="rgba(255,183,213,0.05)" strokeWidth="0.5" />
        {/* Shimaki ring */}
        <rect x="278" y="230" width="18" height="6"
          fill="rgba(255,183,213,0.1)"
          stroke="rgba(255,183,213,0.2)"
          strokeWidth="0.8"
        />

        {/* ── NUKI CROSSBEAM ── */}
        <rect x="108" y="170" width="184" height="10"
          fill="rgba(255,183,213,0.07)"
          stroke="rgba(255,183,213,0.16)"
          strokeWidth="0.8"
        />
        {/* Underside shadow */}
        <line x1="108" y1="180" x2="292" y2="180"
          stroke="rgba(255,183,213,0.06)" strokeWidth="2" />

        {/* ── MOUTH — Sukuna signature element ── */}
        {/* Dark throat behind teeth */}
        <ellipse cx="200" cy="215" rx="55" ry="14"
          fill="rgba(0,0,0,0.3)" />

        {/* Outer mouth oval */}
        <ellipse cx="200" cy="215" rx="68" ry="30"
          stroke="rgba(255,183,213,0.18)"
          strokeWidth="1.2"
          fill="rgba(255,183,213,0.03)"
        />

        {/* Upper lip arc */}
        <path d="M132,215 Q166,192 200,195 Q234,192 268,215"
          stroke="rgba(255,183,213,0.2)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Lower lip arc */}
        <path d="M132,215 Q166,232 200,232 Q234,232 268,215"
          stroke="rgba(255,183,213,0.2)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Upper teeth (7) */}
        {Array.from({ length: 7 }, (_, i) => {
          const x = 148 + i * (104 / 6) - 4
          return (
            <rect
              key={`ut-${i}`}
              x={x} y={199}
              width="8" height="10"
              rx="2"
              fill="rgba(255,183,213,0.12)"
              stroke="rgba(255,183,213,0.2)"
              strokeWidth="0.5"
            />
          )
        })}

        {/* Lower teeth (7) */}
        {Array.from({ length: 7 }, (_, i) => {
          const x = 148 + i * (104 / 6) - 4
          return (
            <rect
              key={`lt-${i}`}
              x={x} y={221}
              width="8" height="8"
              rx="2"
              fill="rgba(255,183,213,0.10)"
              stroke="rgba(255,183,213,0.18)"
              strokeWidth="0.5"
            />
          )
        })}

        {/* ── SKULL ELEMENTS at pillar bases ── */}
        {skulls.map((sk, i) => (
          <g key={`sk-${i}`}>
            {/* Cranium */}
            <circle cx={sk.cx} cy={sk.cy} r="7"
              fill="rgba(255,183,213,0.08)"
              stroke="rgba(255,183,213,0.18)"
              strokeWidth="0.8"
            />
            {/* Jaw */}
            <polygon
              points={`${sk.cx - 5},${sk.cy + 6} ${sk.cx + 5},${sk.cy + 6} ${sk.cx + 4},${sk.cy + 11} ${sk.cx - 4},${sk.cy + 11}`}
              fill="rgba(255,183,213,0.07)"
              stroke="rgba(255,183,213,0.16)"
              strokeWidth="0.7"
            />
            {/* Eyes */}
            <circle cx={sk.cx - 2.5} cy={sk.cy - 1} r="1.8" fill="rgba(255,183,213,0.2)" />
            <circle cx={sk.cx + 2.5} cy={sk.cy - 1} r="1.8" fill="rgba(255,183,213,0.2)" />
            {/* Nose — two dots */}
            <circle cx={sk.cx - 1} cy={sk.cy + 3} r="0.9" fill="rgba(255,183,213,0.15)" />
            <circle cx={sk.cx + 1} cy={sk.cy + 3} r="0.9" fill="rgba(255,183,213,0.15)" />
          </g>
        ))}

        {/* ── STONE STEPS ── */}
        <rect x="88"  y="270" width="224" height="6"
          fill="rgba(255,183,213,0.04)" stroke="rgba(255,183,213,0.12)" strokeWidth="0.8" />
        <rect x="96"  y="276" width="208" height="5"
          fill="rgba(255,183,213,0.04)" stroke="rgba(255,183,213,0.10)" strokeWidth="0.8" />
        <rect x="104" y="281" width="192" height="4"
          fill="rgba(255,183,213,0.04)" stroke="rgba(255,183,213,0.08)" strokeWidth="0.8" />

        {/* ── LEFT STONE LANTERN ── */}
        {/* Cap */}
        <polygon points="63,230 88,230 91,238 60,238"
          fill="rgba(255,183,213,0.05)" stroke="rgba(255,183,213,0.12)" strokeWidth="0.8" />
        {/* Body */}
        <rect x="66" y="238" width="20" height="18"
          fill="rgba(255,183,213,0.04)" stroke="rgba(255,183,213,0.12)" strokeWidth="0.7" />
        {/* Light chamber with glow */}
        <rect x="69" y="241" width="14" height="12" rx="1"
          fill="rgba(255,183,213,0.08)" stroke="rgba(255,183,213,0.15)" strokeWidth="0.6" />
        {/* Base */}
        <polygon points="62,256 90,256 87,262 65,262"
          fill="rgba(255,183,213,0.04)" stroke="rgba(255,183,213,0.10)" strokeWidth="0.7" />

        {/* ── RIGHT STONE LANTERN ── */}
        {/* Cap */}
        <polygon points="309,230 337,230 342,238 312,238"
          fill="rgba(255,183,213,0.05)" stroke="rgba(255,183,213,0.12)" strokeWidth="0.8" />
        {/* Body */}
        <rect x="314" y="238" width="20" height="18"
          fill="rgba(255,183,213,0.04)" stroke="rgba(255,183,213,0.12)" strokeWidth="0.7" />
        {/* Light chamber */}
        <rect x="317" y="241" width="14" height="12" rx="1"
          fill="rgba(255,183,213,0.08)" stroke="rgba(255,183,213,0.15)" strokeWidth="0.6" />
        {/* Base */}
        <polygon points="310,256 340,256 343,262 313,262"
          fill="rgba(255,183,213,0.04)" stroke="rgba(255,183,213,0.10)" strokeWidth="0.7" />
      </svg>
    </div>
  )
}
