/* global React, Icon, KPI, Sparkline, Platform */

const Dashboard = ({ onProduct, onNav }) => {
  const { KPIS, POSTS, FEED, PRODUCTS } = window.ALFI_DATA;
  const top = [...PRODUCTS].sort((a,b) => b.earnings - a.earnings).slice(0, 5);

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 1320, margin: '0 auto' }}>
      {/* Header */}
      <div className="spread" style={{ marginBottom: 22 }}>
        <div>
          <h1 className="section-h">Good morning, Pastro.</h1>
          <div className="section-sub">
            <span className="mono">12 product cards</span> waiting for review · last sync <span className="mono">2 min ago</span>
          </div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn">
            <Icon name="refresh" size={13} /> Sync Temu
          </button>
          <button className="btn accent" onClick={() => onNav?.('add')}>
            <Icon name="plus" size={13} stroke={2.2}/> Add product
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="kpi-row" style={{ marginBottom: 24 }}>
        <KPI label="Earnings · MTD" unit="$" value={KPIS.earningsMtd.toFixed(2)} delta={KPIS.earningsDelta} deltaDir="up" spark={KPIS.earningsSpark} sparkColor="var(--pos)"/>
        <KPI label="Clicks · Today" value={KPIS.clicksToday.toLocaleString()} delta={KPIS.clicksDelta} deltaDir="up" spark={KPIS.clicksSpark} sparkColor="var(--accent)"/>
        <KPI label="CTR · 7-day" value={KPIS.ctr.toFixed(2)} unit="%" delta={KPIS.ctrDelta} deltaDir="up" spark={KPIS.ctrSpark}/>
        <KPI label="Posts · This week" value={KPIS.posted} delta={KPIS.postedDelta} deltaDir="up" spark={KPIS.postedSpark}/>
      </div>

      {/* Two-column grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 20 }}>
        {/* LEFT — review queue */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Review queue</div>
              <div className="card-sub" style={{ marginTop: 2 }}>12 products · 156 angles waiting</div>
            </div>
            <div className="row" style={{ marginLeft: 'auto', gap: 6 }}>
              <button className="btn sm ghost"><Icon name="filter" size={11}/> Filter</button>
              <button className="btn sm" onClick={() => onNav?.('products')}>View all <Icon name="arrowRight" size={11}/></button>
            </div>
          </div>
          <div>
            {PRODUCTS.slice(0, 6).map((p, i) => (
              <ProductRow key={p.id} p={p} onClick={() => onProduct?.(p)} first={i === 0}/>
            ))}
          </div>
        </div>

        {/* RIGHT — live feed */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title">Live click feed</div>
              <div className="card-sub" style={{ marginTop: 2 }}>
                <span style={{ color: 'var(--pos)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <span className="dot-pulse" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--pos)', display: 'inline-block' }}/>
                  Streaming
                </span>
              </div>
            </div>
          </div>
          <div style={{ padding: '4px 0', maxHeight: 380, overflowY: 'auto' }}>
            {FEED.map((f, i) => (
              <div key={i} style={{ padding: '9px 16px', borderBottom: i < FEED.length-1 ? '1px solid var(--line)' : 'none' }}>
                <div className="spread">
                  <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{f.t}</div>
                  <div className="mono" style={{ fontSize: 11, color: 'var(--pos)', fontWeight: 600 }}>+${f.earned.toFixed(2)}</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink)', margin: '3px 0', fontWeight: 500 }}>{f.product}</div>
                <div className="row" style={{ gap: 8, fontSize: 11 }}>
                  <Platform name={f.platform}/>
                  <span className="mono" style={{ color: 'var(--ink-3)' }}>{f.tone}</span>
                  <span className="mono" style={{ color: 'var(--ink-3)', marginLeft: 'auto' }}>{f.country}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
        {/* Top performers */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Top performers · MTD</div>
            <div className="row" style={{ marginLeft: 'auto', gap: 6 }}>
              <button className="btn sm ghost" onClick={() => onNav?.('analytics')}>Open analytics <Icon name="arrowRight" size={11}/></button>
            </div>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: 28 }}>#</th>
                <th>Product</th>
                <th style={{ textAlign: 'right' }}>Clicks</th>
                <th style={{ textAlign: 'right' }}>Earned</th>
                <th style={{ width: 80 }}>Best ch.</th>
              </tr>
            </thead>
            <tbody>
              {top.map((p, i) => (
                <tr key={p.id} onClick={() => onProduct?.(p)} style={{ cursor: 'pointer' }}>
                  <td className="mono" style={{ color: 'var(--ink-3)', fontSize: 11 }}>{String(i+1).padStart(2,'0')}</td>
                  <td>
                    <div style={{ color: 'var(--ink)', fontWeight: 500, fontSize: 12 }}>{p.title}</div>
                    <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)' }}>{p.id}</div>
                  </td>
                  <td className="mono" style={{ textAlign: 'right', color: 'var(--ink)' }}>{p.clicks.toLocaleString()}</td>
                  <td className="mono" style={{ textAlign: 'right', color: 'var(--pos)', fontWeight: 600 }}>${p.earnings.toFixed(2)}</td>
                  <td><Platform name={i % 3 === 0 ? 'pin' : i % 3 === 1 ? 'tg' : 'x'}/></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Today's queue */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">Today's schedule</div>
            <div className="card-sub" style={{ marginLeft: 'auto' }}>
              <span style={{ color: 'var(--pos)' }}>3 live</span> · <span style={{ color: 'var(--info)' }}>4 queued</span>
            </div>
          </div>
          <div style={{ padding: '4px 0' }}>
            {POSTS.slice(0, 7).map((post, i) => (
              <div key={post.id} style={{ padding: '10px 16px', borderBottom: i < 6 ? '1px solid var(--line)' : 'none' }} className="row">
                <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)', width: 56 }}>
                  {post.when.split(', ')[1]}
                </div>
                <Platform name={post.platform}/>
                <div style={{ flex: 1, fontSize: 12, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {post.product}
                  <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 6 }}>· {post.tone}</span>
                </div>
                {post.status === 'live' ? (
                  <span className="tag live"><span className="dot"/>Live</span>
                ) : (
                  <span className="tag scheduled">{post.status}</span>
                )}
                {post.hot && <span className="tag flagged"><Icon name="bolt" size={9} stroke={2.2}/>Hot</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductRow = ({ p, onClick, first }) => {
  const statusTag = {
    live: <span className="tag live"><span className="dot"/>Live</span>,
    queued: <span className="tag draft">Queued</span>,
    scheduled: <span className="tag scheduled">Scheduled</span>,
    paused: <span className="tag warn">Paused</span>,
  }[p.status];
  return (
    <div onClick={onClick} style={{ display: 'grid', gridTemplateColumns: '52px 1fr auto auto auto auto', gap: 14, padding: '12px 16px', borderTop: first ? 'none' : '1px solid var(--line)', alignItems: 'center', cursor: 'pointer' }}
      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-2)'}
      onMouseLeave={e => e.currentTarget.style.background = ''}
    >
      <div className="ph-img" style={{ width: 52, height: 52, borderRadius: 6 }}>img</div>
      <div style={{ minWidth: 0 }}>
        <div className="row" style={{ gap: 6, marginBottom: 3 }}>
          <span style={{ color: 'var(--ink)', fontSize: 13, fontWeight: 500 }}>{p.title}</span>
          {p.flagged && <Icon name="bolt" size={11} style={{ color: 'var(--accent)' }} stroke={2.2}/>}
        </div>
        <div className="row" style={{ gap: 8, fontSize: 11 }}>
          <span className="mono" style={{ color: 'var(--ink-3)' }}>{p.id}</span>
          <span className="muted">·</span>
          <span className="mono" style={{ color: 'var(--ink-3)' }}>{p.price}</span>
          <span className="muted">·</span>
          <span className="mono" style={{ color: 'var(--ink-3)' }}>{p.angles} angles</span>
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>SCORE</div>
        <ScoreBar score={p.score}/>
      </div>
      <div style={{ textAlign: 'right', minWidth: 60 }}>
        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Clicks</div>
        <div className="mono" style={{ color: 'var(--ink)', fontSize: 13 }}>{p.clicks.toLocaleString()}</div>
      </div>
      <div style={{ textAlign: 'right', minWidth: 70 }}>
        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Earned</div>
        <div className="mono" style={{ color: p.earnings > 0 ? 'var(--pos)' : 'var(--ink-3)', fontSize: 13, fontWeight: 600 }}>${p.earnings.toFixed(2)}</div>
      </div>
      <div>{statusTag}</div>
    </div>
  );
};

const ScoreBar = ({ score }) => {
  const color = score >= 85 ? 'var(--pos)' : score >= 70 ? 'var(--accent)' : 'var(--ink-3)';
  return (
    <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
      <div style={{ width: 60, height: 4, background: 'var(--bg-3)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', background: color }}/>
      </div>
      <span className="mono" style={{ fontSize: 11, color: 'var(--ink)', minWidth: 22, textAlign: 'right' }}>{score}</span>
    </div>
  );
};

Object.assign(window, { Dashboard, ProductRow, ScoreBar });
