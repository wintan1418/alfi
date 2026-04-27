/* global React, Icon, Platform, Sparkline, ProductRow, ScoreBar */
const { useState: useS } = React;

// ============ PRODUCTS LIST ============
const ProductsList = ({ onProduct, onNav }) => {
  const { PRODUCTS } = window.ALFI_DATA;
  const [filter, setFilter] = useS('all');
  const filtered = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.status === filter);
  const counts = {
    all: PRODUCTS.length,
    live: PRODUCTS.filter(p => p.status === 'live').length,
    queued: PRODUCTS.filter(p => p.status === 'queued').length,
    scheduled: PRODUCTS.filter(p => p.status === 'scheduled').length,
    paused: PRODUCTS.filter(p => p.status === 'paused').length,
  };
  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 1320, margin: '0 auto' }}>
      <div className="spread" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="section-h">Products</h1>
          <div className="section-sub"><span className="mono">{PRODUCTS.length} total</span> · sorted by recently updated</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn"><Icon name="upload" size={13}/> Import CSV</button>
          <button className="btn accent" onClick={() => onNav?.('add')}>
            <Icon name="plus" size={13} stroke={2.2}/> Add product
          </button>
        </div>
      </div>
      <div className="row" style={{ gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All' },
          { id: 'live', label: 'Live' },
          { id: 'queued', label: 'Review queue' },
          { id: 'scheduled', label: 'Scheduled' },
          { id: 'paused', label: 'Paused' },
        ].map(t => (
          <button key={t.id} onClick={() => setFilter(t.id)}
            className="btn sm"
            style={{
              borderColor: filter === t.id ? 'var(--ink)' : 'var(--line)',
              background: filter === t.id ? 'var(--ink)' : 'var(--surface)',
              color: filter === t.id ? 'var(--bg)' : 'var(--ink-2)',
            }}>
            {t.label} <span className="mono" style={{ fontSize: 10, opacity: 0.7, marginLeft: 4 }}>{counts[t.id]}</span>
          </button>
        ))}
        <div style={{ flex: 1 }}/>
        <button className="btn sm ghost"><Icon name="filter" size={11}/> Filters</button>
        <button className="btn sm ghost"><Icon name="grid" size={11}/> Grid</button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {filtered.map((p, i) => <ProductRow key={p.id} p={p} onClick={() => onProduct?.(p)} first={i === 0}/>)}
      </div>
    </div>
  );
};

// ============ ADD PRODUCT ============
const AddProduct = ({ onBack, onProduct }) => {
  const [step, setStep] = useS(1);
  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 880, margin: '0 auto' }}>
      <button onClick={onBack} className="btn ghost sm" style={{ marginBottom: 16 }}>
        <Icon name="chev" size={11} style={{ transform: 'rotate(180deg)' }}/> Back
      </button>
      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Step 1 / 3 — Find product</div>
      <h1 className="section-h" style={{ marginBottom: 6 }}>Paste a Temu product URL.</h1>
      <div className="section-sub" style={{ marginBottom: 24 }}>The system fetches title, photos, price, and generates 15 angles in ~12 seconds.</div>

      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Icon name="link" size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-3)' }}/>
            <input type="text" defaultValue="https://www.temu.com/magnetic-cable-organizer-6-pack-silicone-g-601099421828.html"
              style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid var(--line)', borderRadius: 6, fontSize: 13, fontFamily: 'var(--font-mono)', background: 'var(--bg)', color: 'var(--ink)' }}/>
          </div>
          <button className="btn primary"><Icon name="sparkle" size={13}/> Generate</button>
        </div>
        <div className="row" style={{ marginTop: 10, gap: 16, fontSize: 11, color: 'var(--ink-3)' }}>
          <span>or</span>
          <button className="btn sm ghost"><Icon name="upload" size={11}/> Bulk paste (one per line)</button>
          <button className="btn sm ghost"><Icon name="bolt" size={11}/> Pull Hot Items list</button>
        </div>
      </div>

      {/* Pipeline */}
      <div className="card" style={{ padding: 18 }}>
        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Pipeline</div>
        <div className="col" style={{ gap: 10 }}>
          <PipeStep done label="Apify scraper · fetched product data" detail="Title, images, price, variants — 0.31s"/>
          <PipeStep done label="Affiliate deeplink generated" detail="alfi.co/p2841 → tracked Temu URL"/>
          <PipeStep done label="GPT-4o · Practical tone × 5 platforms" detail="prompt v3.2 · 1284 tokens"/>
          <PipeStep done label="GPT-4o · Premium tone × 5 platforms" detail="prompt v3.2 · 1391 tokens"/>
          <PipeStep done label="GPT-4o · Witty tone × 5 platforms" detail="prompt v3.2 · 1052 tokens"/>
          <PipeStep done label="Pinterest pin variants rendered" detail="3 image cards generated"/>
          <PipeStep current label="Score & quality check" detail="evaluating angle uniqueness…"/>
        </div>
        <div className="row" style={{ marginTop: 18, gap: 8 }}>
          <button className="btn ghost" style={{ flex: 1, justifyContent: 'center' }}>Save & add another</button>
          <button className="btn accent" style={{ flex: 1, justifyContent: 'center', fontWeight: 600 }}
            onClick={() => onProduct?.(window.ALFI_DATA.PRODUCTS[0])}>
            Continue to angles <Icon name="arrowRight" size={13}/>
          </button>
        </div>
      </div>
    </div>
  );
};

const PipeStep = ({ done, current, label, detail }) => (
  <div className="row" style={{ gap: 10 }}>
    <div style={{
      width: 18, height: 18, borderRadius: '50%',
      border: done || current ? 'none' : '1px dashed var(--line-2)',
      background: done ? 'var(--pos)' : current ? 'var(--accent)' : 'transparent',
      color: 'white',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      position: 'relative',
    }}>
      {done && <Icon name="check" size={11} stroke={3}/>}
      {current && <span className="dot-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }}/>}
    </div>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, color: done ? 'var(--ink-2)' : 'var(--ink)', fontWeight: 500 }}>{label}</div>
      <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{detail}</div>
    </div>
    {done && <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>0.{Math.floor(Math.random() * 9 + 1)}s</span>}
  </div>
);

// ============ CALENDAR ============
const Calendar = () => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = ['08', '10', '12', '14', '16', '18', '20'];
  const events = [
    { d: 0, h: 1, plat: 'pin', tone: 'practical', title: 'Cable organizer', live: true },
    { d: 0, h: 2, plat: 'tg', tone: 'witty', title: 'Cable organizer', live: true, hot: true },
    { d: 0, h: 3, plat: 'pin', tone: 'premium', title: 'Laptop stand', live: true },
    { d: 0, h: 4, plat: 'x', tone: 'witty', title: 'Hairdryer' },
    { d: 0, h: 5, plat: 'pin', tone: 'practical', title: 'LED strip' },
    { d: 1, h: 0, plat: 'tg', tone: 'witty', title: 'Speaker' },
    { d: 1, h: 2, plat: 'pin', tone: 'practical', title: 'Self-stir mug' },
    { d: 1, h: 3, plat: 'x', tone: 'practical', title: 'Garlic press' },
    { d: 1, h: 5, plat: 'tg', tone: 'witty', title: 'Earbuds' },
    { d: 2, h: 1, plat: 'pin', tone: 'witty', title: 'Cable organizer' },
    { d: 2, h: 4, plat: 'tg', tone: 'practical', title: 'Pet roller' },
    { d: 3, h: 0, plat: 'x', tone: 'witty', title: 'Phone holder' },
    { d: 3, h: 2, plat: 'pin', tone: 'premium', title: 'Stretch lids' },
    { d: 3, h: 3, plat: 'tg', tone: 'practical', title: 'Cotton rounds' },
    { d: 4, h: 1, plat: 'pin', tone: 'practical', title: 'Mug' },
    { d: 4, h: 2, plat: 'tg', tone: 'witty', title: 'Earbuds' },
    { d: 4, h: 4, plat: 'x', tone: 'practical', title: 'Speaker' },
    { d: 5, h: 0, plat: 'pin', tone: 'witty', title: 'Cable organizer', recurring: true },
    { d: 5, h: 3, plat: 'tg', tone: 'witty', title: 'Laptop stand' },
    { d: 6, h: 2, plat: 'pin', tone: 'premium', title: 'Hairdryer' },
  ];
  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 1320, margin: '0 auto' }}>
      <div className="spread" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="section-h">Calendar</h1>
          <div className="section-sub">Week of Apr 27 — May 3 · <span className="mono">23 posts scheduled</span></div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn sm ghost"><Icon name="chev" size={11} style={{ transform: 'rotate(180deg)' }}/></button>
          <button className="btn sm">Today</button>
          <button className="btn sm ghost"><Icon name="chev" size={11}/></button>
          <div style={{ width: 1, height: 18, background: 'var(--line)', margin: '0 4px' }}/>
          <button className="btn sm">Week</button>
          <button className="btn sm ghost">Month</button>
          <button className="btn accent" style={{ marginLeft: 8 }}><Icon name="plus" size={11} stroke={2.2}/> Schedule</button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', borderBottom: '1px solid var(--line)' }}>
          <div style={{ padding: 10, background: 'var(--bg-2)' }}/>
          {days.map((d, i) => (
            <div key={d} style={{ padding: '10px 12px', borderLeft: '1px solid var(--line)', background: i === 0 ? 'var(--bg-3)' : 'var(--bg-2)' }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{d}</div>
              <div className="serif" style={{ fontSize: 22, color: 'var(--ink)', fontStyle: 'normal' }}>{27 + i > 30 ? 27 + i - 30 : 27 + i}</div>
            </div>
          ))}
        </div>
        {hours.map((h, hIdx) => (
          <div key={h} style={{ display: 'grid', gridTemplateColumns: '60px repeat(7, 1fr)', borderBottom: hIdx < hours.length - 1 ? '1px solid var(--line)' : 'none', minHeight: 70 }}>
            <div style={{ padding: 8, background: 'var(--bg-2)' }} className="mono">
              <span style={{ fontSize: 11, color: 'var(--ink-3)' }}>{h}:00</span>
            </div>
            {days.map((_, dIdx) => (
              <div key={dIdx} style={{ borderLeft: '1px solid var(--line)', padding: 4, position: 'relative', minHeight: 70, background: dIdx === 0 ? 'var(--accent-bg)' : undefined }}>
                {events.filter(e => e.d === dIdx && e.h === hIdx).map((e, i) => (
                  <CalEvent key={i} event={e}/>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const CalEvent = ({ event }) => (
  <div style={{
    background: event.live ? 'var(--accent-bg)' : 'var(--bg-2)',
    border: `1px solid var(--${event.plat})`,
    borderLeftWidth: 3,
    borderRadius: 4, padding: '4px 6px', marginBottom: 3,
    fontSize: 11,
  }}>
    <div className="row" style={{ gap: 4, marginBottom: 1 }}>
      <span style={{ width: 6, height: 6, borderRadius: 1, background: `var(--${event.plat})` }}/>
      <span style={{ flex: 1, color: 'var(--ink)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{event.title}</span>
      {event.hot && <Icon name="bolt" size={9} style={{ color: 'var(--accent)' }} stroke={2.2}/>}
    </div>
    <div className="mono" style={{ fontSize: 9, color: 'var(--ink-3)' }}>{event.tone}{event.live && ' · live'}{event.recurring && ' · recurring'}</div>
  </div>
);

// ============ ANALYTICS ============
const Analytics = () => {
  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 1320, margin: '0 auto' }}>
      <div className="spread" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="section-h">Analytics</h1>
          <div className="section-sub">Attribution from <em className="serif">angle</em> → <em className="serif">click</em> → <em className="serif">earning</em>. April 1 — Apr 27.</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn sm">Last 30 days <Icon name="chevDown" size={11}/></button>
          <button className="btn sm ghost"><Icon name="upload" size={11}/> Export</button>
        </div>
      </div>

      {/* Attribution chart placeholder */}
      <div className="card" style={{ padding: 20, marginBottom: 20 }}>
        <div className="card-title" style={{ marginBottom: 4 }}>Earnings · daily</div>
        <div className="card-sub" style={{ marginBottom: 16 }}>$1,284.42 · +18.4% vs prior period</div>
        <BigChart/>
      </div>

      {/* Tone vs platform matrix */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card" style={{ padding: 0 }}>
          <div className="card-head"><div className="card-title">Tone × Platform — earnings heatmap</div></div>
          <div style={{ padding: 18 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '90px repeat(3, 1fr)', gap: 6 }}>
              <div/>
              {['Practical', 'Premium', 'Witty'].map(t => <div key={t} className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', textAlign: 'center', letterSpacing: '0.06em' }}>{t}</div>)}
              {[
                ['Telegram', 'tg', [142, 89, 312]],
                ['Pinterest', 'pin', [486, 240, 204]],
                ['X / Twitter', 'x', [88, 64, 158]],
                ['TikTok', 'tt', [22, 18, 42]],
                ['Instagram', 'ig', [12, 14, 8]],
              ].map(([name, key, vals]) => (
                <React.Fragment key={key}>
                  <div className="row" style={{ gap: 6 }}><Platform name={key}/></div>
                  {vals.map((v, i) => {
                    const max = 486;
                    const intensity = v / max;
                    return (
                      <div key={i} style={{
                        background: `color-mix(in oklch, var(--accent) ${Math.round((0.08 + intensity * 0.8) * 100)}%, transparent)`,
                        padding: '10px 6px', borderRadius: 4, textAlign: 'center',
                      }}>
                        <div className="mono" style={{ fontSize: 13, color: intensity > 0.4 ? 'oklch(0.2 0.05 60)' : 'var(--ink)', fontWeight: 600 }}>${v}</div>
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </div>
            <div className="row" style={{ marginTop: 14, gap: 12, fontSize: 11, color: 'var(--ink-3)' }}>
              <span className="mono">Lower</span>
              <div style={{ flex: 1, height: 6, background: 'linear-gradient(to right, color-mix(in oklch, var(--accent) 8%, transparent), var(--accent))', borderRadius: 3 }}/>
              <span className="mono">Higher</span>
            </div>
            <div style={{ marginTop: 16, padding: 12, background: 'var(--accent-bg)', borderRadius: 6, fontSize: 12, color: 'var(--accent-fg)' }}>
              <strong style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', fontSize: 14 }}>Insight:</strong> Practical-tone Pinterest pins drive 38% of total earnings. Witty Telegram is the runner-up.
            </div>
          </div>
        </div>

        {/* Best time to post */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-head"><div className="card-title">Best time to post</div></div>
          <div style={{ padding: 18 }}>
            <BestTimeChart/>
          </div>
        </div>
      </div>

      {/* Top angles table */}
      <div className="card" style={{ padding: 0 }}>
        <div className="card-head"><div className="card-title">Top angles · MTD</div></div>
        <table className="tbl">
          <thead>
            <tr>
              <th>#</th>
              <th>Product</th>
              <th>Platform</th>
              <th>Tone</th>
              <th style={{ textAlign: 'right' }}>Impressions</th>
              <th style={{ textAlign: 'right' }}>Clicks</th>
              <th style={{ textAlign: 'right' }}>CTR</th>
              <th style={{ textAlign: 'right' }}>EPC</th>
              <th style={{ textAlign: 'right' }}>Earned</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Magnetic Cable Organizer', 'pin', 'practical', '12,840', 612, '4.77%', '$0.79', 486.20],
              ['Magnetic Cable Organizer', 'tg', 'witty', '8,210', 312, '3.80%', '$0.92', 287.04],
              ['Adjustable Laptop Stand', 'pin', 'premium', '9,420', 240, '2.55%', '$0.88', 211.20],
              ['Self-Stirring Mug', 'tg', 'witty', '5,180', 198, '3.82%', '$0.71', 140.58],
              ['Foldable Hairdryer', 'x', 'witty', '14,200', 158, '1.11%', '$0.62', 97.96],
            ].map((r, i) => (
              <tr key={i}>
                <td className="mono" style={{ color: 'var(--ink-3)', fontSize: 11 }}>{String(i+1).padStart(2,'0')}</td>
                <td style={{ color: 'var(--ink)', fontWeight: 500, fontSize: 12 }}>{r[0]}</td>
                <td><Platform name={r[1]}/></td>
                <td className="mono" style={{ fontSize: 11 }}>{r[2]}</td>
                <td className="mono" style={{ textAlign: 'right' }}>{r[3]}</td>
                <td className="mono" style={{ textAlign: 'right', color: 'var(--ink)' }}>{r[4]}</td>
                <td className="mono" style={{ textAlign: 'right' }}>{r[5]}</td>
                <td className="mono" style={{ textAlign: 'right' }}>{r[6]}</td>
                <td className="mono" style={{ textAlign: 'right', color: 'var(--pos)', fontWeight: 600 }}>${r[7].toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BigChart = () => {
  const days = 27;
  const data = Array.from({ length: days }, (_, i) => 30 + Math.sin(i * 0.4) * 18 + Math.random() * 22 + i * 0.6);
  const max = Math.max(...data);
  const w = 1100, h = 200;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h+30}`} style={{ display: 'block' }}>
      {[0, 0.25, 0.5, 0.75, 1].map(p => (
        <line key={p} x1="0" x2={w} y1={h * p} y2={h * p} stroke="var(--line)" strokeDasharray="2 4"/>
      ))}
      <path d={`M0,${h} ${data.map((v, i) => `L${(i / (days-1)) * w},${h - (v / max) * h * 0.85}`).join(' ')} L${w},${h} Z`}
        fill="var(--accent-bg)"/>
      <path d={`M0,${h - (data[0] / max) * h * 0.85} ${data.map((v, i) => `L${(i / (days-1)) * w},${h - (v / max) * h * 0.85}`).join(' ')}`}
        stroke="var(--accent)" strokeWidth="2" fill="none"/>
      {data.map((v, i) => (
        <circle key={i} cx={(i / (days-1)) * w} cy={h - (v / max) * h * 0.85} r="2" fill="var(--accent)"/>
      ))}
      {[1, 7, 14, 21, 27].map(d => (
        <text key={d} x={((d-1) / (days-1)) * w} y={h + 20} fill="var(--ink-3)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="middle">Apr {d}</text>
      ))}
    </svg>
  );
};

const BestTimeChart = () => {
  const hours = ['6am', '9am', '12pm', '3pm', '6pm', '9pm'];
  const vals = [12, 38, 64, 52, 88, 71];
  const max = Math.max(...vals);
  return (
    <div className="col" style={{ gap: 8 }}>
      {hours.map((h, i) => (
        <div key={h} className="row" style={{ gap: 10 }}>
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', width: 40 }}>{h}</span>
          <div style={{ flex: 1, height: 18, background: 'var(--bg-3)', borderRadius: 3, overflow: 'hidden' }}>
            <div style={{
              width: `${(vals[i] / max) * 100}%`, height: '100%',
              background: i === 4 ? 'var(--accent)' : 'var(--ink-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 6px',
              color: i === 4 ? 'oklch(0.2 0.05 60)' : 'var(--bg)',
              fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600,
            }}>${vals[i]}</div>
          </div>
        </div>
      ))}
      <div style={{ marginTop: 6, padding: 10, background: 'var(--accent-bg)', borderRadius: 6, fontSize: 12, color: 'var(--accent-fg)' }}>
        <strong>6pm window</strong> averages 33% higher EPC. Schedule recommendations bias toward this slot.
      </div>
    </div>
  );
};

// ============ EARNINGS / RECONCILE ============
const Earnings = () => {
  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 1320, margin: '0 auto' }}>
      <div className="spread" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="section-h">Earnings & reconciliation</h1>
          <div className="section-sub">Match Temu's monthly CSV against your tracked clicks. Catch the orphans.</div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn"><Icon name="upload" size={13}/> Upload CSV</button>
          <button className="btn primary"><Icon name="bolt" size={13}/> Auto-match</button>
        </div>
      </div>

      <div className="kpi-row" style={{ marginBottom: 20 }}>
        <div className="kpi"><div className="kpi-label">Reported · April</div><div className="kpi-value"><span className="unit">$</span>1,284.42</div><div className="kpi-delta up">CSV uploaded Apr 27</div></div>
        <div className="kpi"><div className="kpi-label">Auto-matched</div><div className="kpi-value">94.2%</div><div className="kpi-delta up">242 of 257 rows</div></div>
        <div className="kpi"><div className="kpi-label">Needs review</div><div className="kpi-value" style={{ color: 'var(--accent-fg)' }}>15</div><div className="kpi-delta" style={{ color: 'var(--accent-fg)' }}>orphan rows</div></div>
        <div className="kpi"><div className="kpi-label">Variance</div><div className="kpi-value"><span className="unit">$</span>2.40</div><div className="kpi-delta" style={{ color: 'var(--ink-3)' }}>vs. tracker</div></div>
      </div>

      <div className="card" style={{ padding: 0, marginBottom: 20 }}>
        <div className="card-head">
          <div className="card-title">Reconciliation queue</div>
          <span className="card-sub" style={{ marginLeft: 8 }}>15 unmatched rows · earliest Apr 03</span>
          <div style={{ flex: 1 }}/>
          <button className="btn sm ghost"><Icon name="filter" size={11}/> Filter</button>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Date</th>
              <th>Order ID (Temu)</th>
              <th>Product (CSV)</th>
              <th style={{ textAlign: 'right' }}>Commission</th>
              <th>Suggested match</th>
              <th style={{ width: 160 }}/>
            </tr>
          </thead>
          <tbody>
            {[
              ['Apr 03 14:22', 'TMU-A8201', 'Magnetic Cable Holder 6pk silicone', 0.31, 'Magnetic Cable Organizer · pin · practical', 96],
              ['Apr 09 09:10', 'TMU-A8419', 'Cable Mgmt Clips set of six', 0.28, 'Magnetic Cable Organizer · tg · witty', 88],
              ['Apr 12 18:45', 'TMU-A8702', 'Foldable Hair Dryer Travel 1200W', 0.42, 'Foldable Travel Hairdryer · pin · premium', 91],
              ['Apr 15 11:02', 'TMU-A8841', 'LED Light Strip RGB 32', 0.18, 'LED Strip Lights · ?', 64],
              ['Apr 18 22:30', 'TMU-A9012', 'unknown sku 2841299', 0.22, '— no confident match', 0],
            ].map((r, i) => (
              <tr key={i}>
                <td className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{r[0]}</td>
                <td className="mono" style={{ fontSize: 11, color: 'var(--ink-2)' }}>{r[1]}</td>
                <td style={{ color: 'var(--ink)', fontSize: 12 }}>{r[2]}</td>
                <td className="mono" style={{ textAlign: 'right', color: 'var(--pos)', fontWeight: 600 }}>${r[3].toFixed(2)}</td>
                <td>
                  <div style={{ fontSize: 12, color: r[5] ? 'var(--ink)' : 'var(--ink-3)' }}>{r[4]}</div>
                  {r[5] > 0 && (
                    <div className="row" style={{ gap: 4, marginTop: 3 }}>
                      <div style={{ width: 50, height: 3, background: 'var(--bg-3)', borderRadius: 2 }}>
                        <div style={{ width: `${r[5]}%`, height: '100%', background: r[5] >= 80 ? 'var(--pos)' : 'var(--accent)', borderRadius: 2 }}/>
                      </div>
                      <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{r[5]}% match</span>
                    </div>
                  )}
                </td>
                <td>
                  <div className="row" style={{ gap: 4, justifyContent: 'flex-end' }}>
                    {r[5] >= 80 ? (
                      <button className="btn sm primary" style={{ padding: '3px 8px' }}><Icon name="check" size={10} stroke={2.5}/> Confirm</button>
                    ) : (
                      <button className="btn sm" style={{ padding: '3px 8px' }}>Manual link</button>
                    )}
                    <button className="btn sm ghost" style={{ padding: '3px 6px' }}><Icon name="x" size={11}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="card-head"><div className="card-title">Monthly statements</div></div>
        <table className="tbl">
          <thead><tr><th>Month</th><th>CSV uploaded</th><th>Rows</th><th style={{ textAlign: 'right' }}>Reported</th><th style={{ textAlign: 'right' }}>Tracker</th><th style={{ textAlign: 'right' }}>Variance</th><th>Status</th></tr></thead>
          <tbody>
            {[
              ['April 2026', 'Apr 27', 257, 1284.42, 1281.97, 2.45, 'In progress'],
              ['March 2026', 'Apr 02', 312, 1481.10, 1481.10, 0.00, 'Reconciled'],
              ['February 2026', 'Mar 03', 198, 824.60, 824.60, 0.00, 'Reconciled'],
              ['January 2026', 'Feb 02', 96, 380.20, 380.20, 0.00, 'Reconciled'],
            ].map((r, i) => (
              <tr key={i}>
                <td className="serif" style={{ fontStyle: 'normal', fontSize: 16, color: 'var(--ink)' }}>{r[0]}</td>
                <td className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{r[1]}</td>
                <td className="mono">{r[2]}</td>
                <td className="mono" style={{ textAlign: 'right', color: 'var(--ink)' }}>${r[3].toFixed(2)}</td>
                <td className="mono" style={{ textAlign: 'right', color: 'var(--ink-2)' }}>${r[4].toFixed(2)}</td>
                <td className="mono" style={{ textAlign: 'right', color: r[5] === 0 ? 'var(--ink-3)' : 'var(--accent-fg)' }}>{r[5] === 0 ? '—' : `+$${r[5].toFixed(2)}`}</td>
                <td><span className={`tag ${i === 0 ? 'scheduled' : 'live'}`}>{r[6]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ============ SETTINGS ============
const Settings = () => {
  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 1100, margin: '0 auto' }}>
      <h1 className="section-h" style={{ marginBottom: 6 }}>Settings</h1>
      <div className="section-sub" style={{ marginBottom: 28 }}>Operator-level. Workspace-wide. No multi-tenant.</div>

      <SettingSection title="Channels" desc="Connected publishing destinations">
        {[
          { name: 'Telegram', key: 'tg', status: 'Live', detail: '@alfifinds · 14.2k subs · webhook OK', meta: 'Connected Mar 14' },
          { name: 'Pinterest', key: 'pin', status: 'Live', detail: 'alfi.co domain verified · 5 boards', meta: 'Connected Mar 18' },
          { name: 'X / Twitter', key: 'x', status: 'Live', detail: 'API tier: Basic · $200/mo · 47/100 posts this month', meta: 'Connected Mar 22' },
          { name: 'TikTok', key: 'tt', status: 'Assist', detail: 'No publishing API — script & asset generation only', meta: '—' },
          { name: 'Instagram', key: 'ig', status: 'Paused', detail: 'Graph API connected · no link in caption (limitation)', meta: 'Paused Apr 12' },
        ].map(c => (
          <div key={c.key} className="row" style={{ padding: '14px 0', gap: 14, borderBottom: '1px solid var(--line)' }}>
            <div style={{ width: 32, height: 32, borderRadius: 6, background: `var(--${c.key})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-mono)' }}>
              {c.name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div className="row" style={{ gap: 8 }}>
                <span style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 600 }}>{c.name}</span>
                <span className={`tag ${c.status === 'Live' ? 'live' : c.status === 'Assist' ? 'flagged' : 'warn'}`}>
                  {c.status === 'Live' && <span className="dot"/>}
                  {c.status}
                </span>
              </div>
              <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 3 }}>{c.detail}</div>
            </div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{c.meta}</div>
            <button className="btn sm ghost">Configure</button>
          </div>
        ))}
      </SettingSection>

      <SettingSection title="Domain & short links" desc="alfi.co — used for tracked redirects">
        <div className="card" style={{ padding: 16, background: 'var(--bg-2)' }}>
          <div className="spread" style={{ marginBottom: 8 }}>
            <span className="mono" style={{ fontSize: 14, color: 'var(--ink)', fontWeight: 600 }}>alfi.co</span>
            <span className="tag live"><span className="dot"/>Verified</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.6 }}>
            Pinterest verification: <span className="mono" style={{ color: 'var(--pos)' }}>✓ verified Mar 18</span><br/>
            DNS records: <span className="mono">TXT, MX, A — all valid</span><br/>
            SSL: <span className="mono" style={{ color: 'var(--pos)' }}>active until Aug 14, 2026</span>
          </div>
        </div>
      </SettingSection>

      <SettingSection title="AI prompts" desc="Versioned. Every angle records the prompt that wrote it.">
        {[
          { v: 'v3.2', label: 'Practical · platform-aware', when: 'Apr 14', active: true, perf: 'EPC: $0.79' },
          { v: 'v3.2', label: 'Premium · platform-aware', when: 'Apr 14', active: true, perf: 'EPC: $0.71' },
          { v: 'v3.2', label: 'Witty · platform-aware', when: 'Apr 14', active: true, perf: 'EPC: $0.92' },
          { v: 'v2.0', label: 'Practical (legacy)', when: 'Mar 02', active: false, perf: 'EPC: $0.61' },
        ].map((p, i) => (
          <div key={i} className="row" style={{ padding: '10px 0', gap: 12, borderBottom: '1px solid var(--line)' }}>
            <span className="mono" style={{ fontSize: 11, padding: '2px 6px', background: p.active ? 'var(--accent-bg)' : 'var(--bg-3)', color: p.active ? 'var(--accent-fg)' : 'var(--ink-3)', borderRadius: 4, minWidth: 36, textAlign: 'center' }}>{p.v}</span>
            <span style={{ flex: 1, color: 'var(--ink)', fontSize: 13 }}>{p.label}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{p.perf}</span>
            <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{p.when}</span>
            {p.active ? <span className="tag live"><span className="dot"/>Active</span> : <button className="btn sm ghost">Diff</button>}
          </div>
        ))}
        <button className="btn sm" style={{ marginTop: 12 }}><Icon name="plus" size={11}/> New prompt version</button>
      </SettingSection>

      <SettingSection title="Discovery" desc="Auto-pull from Temu Hot Items">
        <div className="row" style={{ padding: '12px 0', gap: 14 }}>
          <ToggleRow label="Daily Hot Items sync" sub="Runs at 06:00 · 12 products / day · via Apify" on/>
        </div>
        <div className="row" style={{ padding: '12px 0', gap: 14 }}>
          <ToggleRow label="Auto-generate angles on import" sub="Skips manual queue · only if score ≥ 75" on/>
        </div>
        <div className="row" style={{ padding: '12px 0', gap: 14 }}>
          <ToggleRow label="Auto-schedule top-scoring products" sub="Posts to all live channels at optimal times"/>
        </div>
      </SettingSection>
    </div>
  );
};

const SettingSection = ({ title, desc, children }) => (
  <div style={{ marginBottom: 36, display: 'grid', gridTemplateColumns: '240px 1fr', gap: 32 }}>
    <div>
      <h3 className="serif" style={{ fontSize: 22, fontStyle: 'normal', margin: 0, marginBottom: 4 }}>{title}</h3>
      <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{desc}</div>
    </div>
    <div>{children}</div>
  </div>
);

const ToggleRow = ({ label, sub, on }) => (
  <div style={{ flex: 1 }} className="row">
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{label}</div>
      <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{sub}</div>
    </div>
    <div style={{
      width: 32, height: 18, borderRadius: 10,
      background: on ? 'var(--accent)' : 'var(--bg-3)',
      border: '1px solid var(--line)',
      position: 'relative', transition: 'all 0.15s', cursor: 'pointer',
    }}>
      <div style={{
        width: 14, height: 14, borderRadius: '50%', background: 'white',
        position: 'absolute', top: 1, left: on ? 16 : 1,
        transition: 'all 0.15s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
      }}/>
    </div>
  </div>
);

Object.assign(window, { ProductsList, AddProduct, Calendar, Analytics, Earnings, Settings });
