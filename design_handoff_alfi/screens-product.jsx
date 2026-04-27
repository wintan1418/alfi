/* global React, Icon, Platform */
const { useState } = React;

const ProductDetail = ({ product, onBack }) => {
  const { ANGLES, TONES } = window.ALFI_DATA;
  const [selected, setSelected] = useState({ tg: 'witty', pin: 'practical', x: 'practical', tt: 'practical', ig: 'practical' });
  const [active, setActive] = useState('tg');
  const [editing, setEditing] = useState(null);

  const platforms = [
    { id: 'tg', name: 'Telegram', icon: 'tg', status: 'live' },
    { id: 'pin', name: 'Pinterest', icon: 'pinterest', status: 'live' },
    { id: 'x', name: 'X / Twitter', icon: 'twitter', status: 'live' },
    { id: 'tt', name: 'TikTok', icon: 'tiktok', status: 'assist' },
    { id: 'ig', name: 'Instagram', icon: 'instagram', status: 'paused' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 300px', height: '100%', overflow: 'hidden' }}>
      {/* LEFT — product info */}
      <div style={{ borderRight: '1px solid var(--line)', overflowY: 'auto', padding: 24, background: 'var(--bg-2)' }}>
        <button onClick={onBack} className="btn ghost sm" style={{ marginBottom: 16, padding: '4px 8px' }}>
          <Icon name="chev" size={11} style={{ transform: 'rotate(180deg)' }}/> Products
        </button>

        <div className="ph-img" style={{ width: '100%', aspectRatio: '1', borderRadius: 10, marginBottom: 14 }}>product photo</div>

        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{product.id} · imported {product.discovered}</div>
        <h2 className="serif" style={{ fontSize: 24, margin: '0 0 4px', lineHeight: 1.15, fontStyle: 'normal' }}>{product.title}</h2>
        <div className="row" style={{ gap: 8, marginBottom: 18, fontSize: 13 }}>
          <span className="mono" style={{ color: 'var(--ink)' }}>{product.price}</span>
          <span className="muted">·</span>
          <span className="mono" style={{ color: 'var(--pos)' }}>{product.margin} margin</span>
        </div>

        <div className="col" style={{ gap: 10, marginBottom: 20 }}>
          <Stat label="Score" value={<><span style={{ color: product.score >= 85 ? 'var(--pos)' : 'var(--accent)' }}>{product.score}</span> <span className="muted">/ 100</span></>}/>
          <Stat label="Total clicks" value={product.clicks.toLocaleString()}/>
          <Stat label="Earned" value={<span style={{ color: 'var(--pos)' }}>${product.earnings.toFixed(2)}</span>}/>
          <Stat label="Live posts" value={product.posts}/>
          <Stat label="Angles generated" value={product.angles}/>
        </div>

        <div className="card" style={{ background: 'var(--surface)', borderRadius: 8, padding: 12, marginBottom: 12 }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Affiliate link</div>
          <div className="mono" style={{ fontSize: 11, color: 'var(--ink-2)', wordBreak: 'break-all', marginBottom: 8 }}>
            alfi.co/<span style={{ color: 'var(--accent-fg)', background: 'var(--accent-bg)', padding: '0 3px', borderRadius: 3 }}>p2841</span>
          </div>
          <div className="row" style={{ gap: 4 }}>
            <button className="btn sm ghost" style={{ padding: '2px 6px' }}><Icon name="link" size={10}/> Copy</button>
            <button className="btn sm ghost" style={{ padding: '2px 6px' }}><Icon name="eye" size={10}/> Preview</button>
          </div>
        </div>

        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Source</div>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', wordBreak: 'break-all' }}>
          temu.com/...mp;goods_id=601099···<a style={{ color: 'var(--info)' }}>open ↗</a>
        </div>

        {product.note && (
          <div style={{ marginTop: 18, padding: 10, background: 'var(--accent-bg)', borderRadius: 6, fontSize: 12, color: 'var(--accent-fg)', fontStyle: 'italic' }}>
            <Icon name="bolt" size={11} stroke={2.2} style={{ marginRight: 4, verticalAlign: '-2px' }}/>
            {product.note}
          </div>
        )}
      </div>

      {/* CENTER — angle picker */}
      <div style={{ overflowY: 'auto', padding: '20px 32px 60px' }}>
        <div className="spread" style={{ marginBottom: 4 }}>
          <div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Step 2 / 3 — Curate angles</div>
            <h2 className="serif" style={{ fontSize: 28, margin: 0, fontStyle: 'normal' }}>Pick the winning angle <em>per platform.</em></h2>
          </div>
          <button className="btn sm ghost"><Icon name="refresh" size={11}/> Regenerate all</button>
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 22 }}>
          AI generated 3 tones × 5 platforms = <span className="mono">15 angles</span>. Click a card to set it as the winner. Click again to edit inline.
        </div>

        {/* Platform tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', marginBottom: 22, gap: 0 }}>
          {platforms.map(p => (
            <button key={p.id} onClick={() => setActive(p.id)}
              style={{
                padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                borderBottom: active === p.id ? '2px solid var(--ink)' : '2px solid transparent',
                color: active === p.id ? 'var(--ink)' : 'var(--ink-3)',
                fontSize: 13, fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: -1,
              }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: `var(--${p.id})` }}/>
              {p.name}
              {selected[p.id] && <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase' }}>· {selected[p.id]}</span>}
              {p.status === 'assist' && <span className="tag" style={{ fontSize: 9, padding: '0 4px' }}>Assist</span>}
              {p.status === 'paused' && <span className="tag warn" style={{ fontSize: 9, padding: '0 4px' }}>Paused</span>}
            </button>
          ))}
        </div>

        {/* 3 tone previews for the active platform */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 18 }}>
          {TONES.map(tone => (
            <AngleCard
              key={tone.id}
              platform={active}
              tone={tone}
              data={(ANGLES[active] && ANGLES[active][tone.id]) || { copy: '[Generated copy]', cta: '', hashtags: '' }}
              isWinner={selected[active] === tone.id}
              onSelect={() => setSelected({ ...selected, [active]: tone.id })}
              onEdit={() => setEditing({ platform: active, tone: tone.id })}
            />
          ))}
        </div>

        {/* Cross-platform overview */}
        <div style={{ marginTop: 32 }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Across all platforms</div>
          <div className="card" style={{ padding: 0 }}>
            <table className="tbl">
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Practical</th>
                  <th>Premium</th>
                  <th>Witty</th>
                  <th style={{ width: 80 }}>Schedule</th>
                </tr>
              </thead>
              <tbody>
                {platforms.map(p => (
                  <tr key={p.id}>
                    <td><Platform name={p.id}/></td>
                    {TONES.map(t => (
                      <td key={t.id}>
                        <button onClick={() => { setActive(p.id); setSelected({ ...selected, [p.id]: t.id }); }}
                          style={{
                            border: selected[p.id] === t.id ? '1px solid var(--accent)' : '1px solid var(--line)',
                            background: selected[p.id] === t.id ? 'var(--accent-bg)' : 'var(--surface)',
                            color: selected[p.id] === t.id ? 'var(--accent-fg)' : 'var(--ink-2)',
                            padding: '3px 8px', borderRadius: 4, fontSize: 11, fontFamily: 'var(--font-mono)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                          }}>
                          {selected[p.id] === t.id && <Icon name="check" size={10} stroke={2.5}/>}
                          {t.label}
                        </button>
                      </td>
                    ))}
                    <td>
                      <button className="btn sm ghost" style={{ padding: '2px 6px' }}>
                        <Icon name="clock" size={10}/> Time
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* RIGHT — schedule & ship */}
      <div style={{ borderLeft: '1px solid var(--line)', overflowY: 'auto', padding: 22, background: 'var(--bg-2)' }}>
        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Step 3 / 3</div>
        <h3 className="serif" style={{ fontSize: 22, margin: '0 0 14px', fontStyle: 'normal' }}>Ship.</h3>

        <div className="col" style={{ gap: 14 }}>
          <div className="card" style={{ background: 'var(--surface)', padding: 0 }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--line)' }}>
              <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Selected angles</div>
            </div>
            {Object.entries(selected).map(([plat, tone]) => (
              <div key={plat} className="row" style={{ padding: '8px 12px', borderBottom: '1px solid var(--line)', gap: 8 }}>
                <Platform name={plat}/>
                <span className="mono" style={{ fontSize: 11, color: 'var(--ink-2)', marginLeft: 'auto' }}>{tone}</span>
                <Icon name="check" size={11} style={{ color: 'var(--pos)' }} stroke={2.5}/>
              </div>
            ))}
          </div>

          <div className="card" style={{ background: 'var(--surface)', padding: 12 }}>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Schedule</div>
            <div className="col" style={{ gap: 6 }}>
              <ScheduleOption icon="bolt" label="Ship now" desc="All 5 platforms · simultaneous"/>
              <ScheduleOption icon="clock" label="Stagger across day" desc="Optimal times per platform" active/>
              <ScheduleOption icon="calendar" label="Custom schedule" desc="Pick time + day for each"/>
            </div>
          </div>

          <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, padding: 12 }}>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Tracking</div>
            <div style={{ fontSize: 12, color: 'var(--ink-2)', lineHeight: 1.55 }}>
              Each post gets a unique short link:<br/>
              <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>alfi.co/p2841-{'{plat}'}-{'{tone}'}</span>
            </div>
          </div>

          <button className="btn accent" style={{ justifyContent: 'center', padding: '10px', fontSize: 14, fontWeight: 600 }}>
            <Icon name="send" size={13} stroke={2}/>
            Ship 5 posts
          </button>
          <button className="btn ghost" style={{ justifyContent: 'center' }}>Save as draft</button>
        </div>
      </div>
    </div>
  );
};

const Stat = ({ label, value }) => (
  <div className="spread" style={{ fontSize: 12 }}>
    <span className="mono" style={{ color: 'var(--ink-3)', textTransform: 'uppercase', fontSize: 10, letterSpacing: '0.06em' }}>{label}</span>
    <span style={{ color: 'var(--ink)', fontWeight: 500 }}>{value}</span>
  </div>
);

const ScheduleOption = ({ icon, label, desc, active }) => (
  <button style={{
    display: 'flex', gap: 10, padding: 8, border: active ? '1px solid var(--accent)' : '1px solid var(--line)',
    background: active ? 'var(--accent-bg)' : 'transparent',
    borderRadius: 6, alignItems: 'flex-start', textAlign: 'left', cursor: 'pointer',
  }}>
    <Icon name={icon} size={13} style={{ marginTop: 2, color: active ? 'var(--accent-fg)' : 'var(--ink-3)' }}/>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: active ? 'var(--accent-fg)' : 'var(--ink)' }}>{label}</div>
      <div style={{ fontSize: 11, color: active ? 'var(--accent-fg)' : 'var(--ink-3)', opacity: active ? 0.8 : 1 }}>{desc}</div>
    </div>
    {active && <Icon name="check" size={12} style={{ color: 'var(--accent-fg)' }} stroke={2.5}/>}
  </button>
);

// ============ ANGLE CARDS — native-looking platform previews ============

const AngleCard = ({ platform, tone, data, isWinner, onSelect, onEdit }) => {
  return (
    <div style={{
      borderRadius: 10,
      border: isWinner ? '1.5px solid var(--accent)' : '1px solid var(--line)',
      background: 'var(--surface)',
      overflow: 'hidden',
      position: 'relative',
      boxShadow: isWinner ? '0 0 0 4px var(--accent-bg)' : 'none',
      transition: 'all 0.15s',
    }}>
      {/* Tone label */}
      <div className="spread" style={{ padding: '10px 12px', borderBottom: '1px solid var(--line)', background: isWinner ? 'var(--accent-bg)' : 'var(--bg-2)' }}>
        <div className="row" style={{ gap: 8 }}>
          <div style={{
            width: 18, height: 18, borderRadius: 4,
            background: isWinner ? 'var(--accent)' : 'var(--ink)',
            color: isWinner ? 'oklch(0.2 0.05 60)' : 'var(--bg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 700,
          }}>{tone.char}</div>
          <span style={{ fontSize: 13, fontWeight: 600, color: isWinner ? 'var(--accent-fg)' : 'var(--ink)' }}>{tone.label}</span>
          {isWinner && <span className="tag" style={{ background: 'var(--accent)', color: 'oklch(0.2 0.05 60)', borderColor: 'transparent' }}>Winner</span>}
        </div>
        <div className="row" style={{ gap: 4 }}>
          <button className="icon-btn" style={{ width: 22, height: 22, border: 'none' }} onClick={onEdit}>
            <Icon name="edit" size={11}/>
          </button>
          <button className="icon-btn" style={{ width: 22, height: 22, border: 'none' }}>
            <Icon name="refresh" size={11}/>
          </button>
        </div>
      </div>

      {/* Tone description */}
      <div style={{ padding: '8px 12px', fontSize: 11, color: 'var(--ink-3)', background: 'var(--bg-2)', fontStyle: 'italic' }}>
        {tone.desc}
      </div>

      {/* Native preview */}
      <div style={{ padding: 12 }}>
        {platform === 'tg' && <TelegramPreview data={data}/>}
        {platform === 'pin' && <PinterestPreview data={data} tone={tone.id}/>}
        {platform === 'x' && <XPreview data={data}/>}
        {platform === 'tt' && <TikTokPreview data={data}/>}
        {platform === 'ig' && <InstagramPreview data={data}/>}
      </div>

      {/* Stats / select */}
      <div style={{ borderTop: '1px solid var(--line)', padding: '8px 12px', background: 'var(--bg-2)' }} className="spread">
        <div className="row" style={{ gap: 12, fontSize: 10 }}>
          <span className="mono" style={{ color: 'var(--ink-3)' }}>v3</span>
          <span className="mono" style={{ color: 'var(--ink-3)' }}>{(data.copy || '').length} chars</span>
        </div>
        <button onClick={onSelect} className="btn sm" style={{
          background: isWinner ? 'var(--accent)' : 'var(--surface)',
          color: isWinner ? 'oklch(0.2 0.05 60)' : 'var(--ink)',
          borderColor: isWinner ? 'var(--accent)' : 'var(--line)',
          fontWeight: 600,
        }}>
          {isWinner ? <><Icon name="check" size={11} stroke={2.5}/> Selected</> : 'Pick this'}
        </button>
      </div>
    </div>
  );
};

const TelegramPreview = ({ data }) => (
  <div style={{ background: 'oklch(0.97 0.01 235)', borderRadius: 8, padding: 10, fontFamily: '-apple-system, system-ui, sans-serif' }}>
    <div className="row" style={{ gap: 8, marginBottom: 8 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'oklch(0.62 0.13 235)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600 }}>α</div>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#000' }}>Alfi Finds</div>
        <div style={{ fontSize: 10, color: '#666' }}>14.2k subscribers</div>
      </div>
    </div>
    <div style={{ background: 'white', padding: 8, borderRadius: 6, marginBottom: 6, height: 70 }} className="ph-img">photo</div>
    <div style={{ fontSize: 11.5, color: '#000', whiteSpace: 'pre-wrap', lineHeight: 1.45, maxHeight: 120, overflow: 'hidden' }}>{data.copy}</div>
    {data.cta && (
      <div style={{ marginTop: 8, padding: '6px 10px', background: 'oklch(0.62 0.13 235)', color: 'white', borderRadius: 4, fontSize: 11, textAlign: 'center', fontWeight: 500 }}>
        🔗 {data.cta}
      </div>
    )}
  </div>
);

const PinterestPreview = ({ data, tone }) => (
  <div style={{ background: 'white', borderRadius: 12, overflow: 'hidden', border: '1px solid #eee' }}>
    <div style={{
      height: 180,
      background: tone === 'practical' ? 'oklch(0.92 0.05 60)' : tone === 'premium' ? 'oklch(0.18 0.02 80)' : 'oklch(0.85 0.12 25)',
      color: tone === 'premium' ? 'oklch(0.92 0.05 60)' : 'oklch(0.2 0.02 80)',
      padding: 16, display: 'flex', alignItems: 'flex-end',
      fontFamily: tone === 'premium' ? 'Georgia, serif' : '-apple-system',
      fontSize: tone === 'witty' ? 22 : 18,
      fontWeight: 700,
      lineHeight: 1.15,
    }}>
      {data.title}
    </div>
    <div style={{ padding: 10, fontFamily: '-apple-system, system-ui' }}>
      <div style={{ fontSize: 11, color: '#000', marginBottom: 6, lineHeight: 1.4 }}>{data.copy}</div>
      <div style={{ fontSize: 10, color: 'oklch(0.6 0.19 25)', marginBottom: 6 }}>{data.hashtags}</div>
      <div className="row" style={{ gap: 8 }}>
        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'oklch(0.6 0.19 25)' }}/>
        <span style={{ fontSize: 10, color: '#000', flex: 1 }}>alfi · @alfifinds</span>
        <span style={{ background: 'oklch(0.6 0.19 25)', color: 'white', padding: '4px 10px', borderRadius: 16, fontSize: 10, fontWeight: 600 }}>Save</span>
      </div>
    </div>
  </div>
);

const XPreview = ({ data }) => (
  <div style={{ background: 'white', padding: 12, borderRadius: 8, border: '1px solid #eee', fontFamily: '-apple-system, system-ui' }}>
    <div className="row" style={{ gap: 10, marginBottom: 8 }}>
      <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#000', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>α</div>
      <div style={{ flex: 1 }}>
        <div className="row" style={{ gap: 4 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#000' }}>alfi finds</span>
          <span style={{ fontSize: 11, color: '#71767b' }}>@alfifinds · 1m</span>
        </div>
      </div>
    </div>
    <div style={{ fontSize: 12, color: '#000', whiteSpace: 'pre-wrap', lineHeight: 1.4, marginBottom: 8 }}>{data.copy}</div>
    <div style={{ background: '#f7f9f9', padding: 8, borderRadius: 8, height: 60, marginBottom: 8 }} className="ph-img">photo</div>
    <div className="row" style={{ gap: 16, color: '#71767b', fontSize: 10 }}>
      <span>💬 14</span><span>🔁 28</span><span>♡ 192</span><span>📊 4.2k</span>
    </div>
  </div>
);

const TikTokPreview = ({ data }) => (
  <div style={{ background: '#000', borderRadius: 8, padding: 12, color: 'white', fontFamily: '-apple-system' }}>
    <div className="row" style={{ gap: 6, marginBottom: 8 }}>
      <span style={{ fontSize: 9, fontFamily: 'var(--font-mono)', color: 'oklch(0.55 0.16 340)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Assist mode</span>
      <span style={{ fontSize: 9, color: '#888' }}>· script + asset pack</span>
    </div>
    <div style={{ fontSize: 11, whiteSpace: 'pre-wrap', lineHeight: 1.45, fontFamily: 'var(--font-mono)' }}>{data.copy}</div>
    <div style={{ marginTop: 10, fontSize: 9, color: '#888', borderTop: '1px solid #222', paddingTop: 8, fontFamily: 'var(--font-mono)' }}>3 assets ready · 0:20 runtime</div>
  </div>
);

const InstagramPreview = ({ data }) => (
  <div style={{ background: 'white', borderRadius: 8, border: '1px solid #eee', fontFamily: '-apple-system' }}>
    <div className="row" style={{ padding: 8, gap: 8, borderBottom: '1px solid #eee' }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'linear-gradient(45deg, oklch(0.6 0.18 350), oklch(0.7 0.16 60))' }}/>
      <span style={{ fontSize: 11, fontWeight: 600 }}>alfifinds</span>
    </div>
    <div className="ph-img" style={{ height: 130 }}>square photo</div>
    <div style={{ padding: 10 }}>
      <div className="row" style={{ gap: 12, fontSize: 14, marginBottom: 6 }}>♡ 💬 ➤</div>
      <div style={{ fontSize: 11, color: '#000', lineHeight: 1.4 }}>
        <strong>alfifinds</strong> {data.copy}
      </div>
      <div style={{ fontSize: 10, color: '#999', marginTop: 4 }}>{data.hashtags}</div>
    </div>
  </div>
);

Object.assign(window, { ProductDetail, AngleCard });
