/* global React, Icon, Platform */
const Links = () => {
  const links = [
    { slug: 'p2841-pin-pra', target: 'Cable Organizer · Pinterest · Practical', clicks: 612, earned: 486.20, ctr: '4.77%', live: true, hot: true },
    { slug: 'p2841-tg-wit', target: 'Cable Organizer · Telegram · Witty', clicks: 312, earned: 287.04, ctr: '3.80%', live: true, hot: true },
    { slug: 'p2835-pin-prm', target: 'Laptop Stand · Pinterest · Premium', clicks: 240, earned: 211.20, ctr: '2.55%', live: true },
    { slug: 'p2837-tg-wit', target: 'Self-Stir Mug · Telegram · Witty', clicks: 198, earned: 140.58, ctr: '3.82%', live: true },
    { slug: 'p2840-x-wit', target: 'Hairdryer · X · Witty', clicks: 158, earned: 97.96, ctr: '1.11%', live: true },
    { slug: 'p2836-pin-pra', target: 'Speaker · Pinterest · Practical', clicks: 142, earned: 88.40, ctr: '2.10%', live: true },
    { slug: 'p2833-tg-pra', target: 'Stretch Lids · Telegram · Practical', clicks: 96, earned: 52.80, ctr: '1.92%', live: true },
    { slug: 'p2834-pin-pra', target: 'Pet Roller · Pinterest · Practical', clicks: 42, earned: 14.20, ctr: '0.81%', live: false },
  ];

  return (
    <div style={{ padding: '24px 28px 60px', maxWidth: 1320, margin: '0 auto' }}>
      <div className="spread" style={{ marginBottom: 20 }}>
        <div>
          <h1 className="section-h">Short links</h1>
          <div className="section-sub">Every (product × angle × channel) gets its own tracked URL · domain <span className="mono">alfi.co</span></div>
        </div>
        <div className="row" style={{ gap: 8 }}>
          <button className="btn"><Icon name="upload" size={13}/> Export</button>
          <button className="btn accent"><Icon name="plus" size={13} stroke={2.2}/> New link</button>
        </div>
      </div>

      <div className="kpi-row" style={{ marginBottom: 20 }}>
        <div className="kpi"><div className="kpi-label">Active links</div><div className="kpi-value">187</div><div className="kpi-delta up">+24 this week</div></div>
        <div className="kpi"><div className="kpi-label">Clicks · 30d</div><div className="kpi-value">12,840</div><div className="kpi-delta up">+18.4%</div></div>
        <div className="kpi"><div className="kpi-label">Top EPC</div><div className="kpi-value"><span className="unit">$</span>0.92</div><div className="kpi-delta">witty · TG</div></div>
        <div className="kpi"><div className="kpi-label">Bot traffic blocked</div><div className="kpi-value">312</div><div className="kpi-delta">2.4% of total</div></div>
      </div>

      <div className="card" style={{ padding: 0 }}>
        <div className="card-head">
          <div className="card-title">All tracked links</div>
          <span className="card-sub" style={{ marginLeft: 8 }}>sorted by earnings · MTD</span>
          <div style={{ flex: 1 }}/>
          <button className="btn sm ghost"><Icon name="filter" size={11}/> Platform</button>
          <button className="btn sm ghost"><Icon name="filter" size={11}/> Tone</button>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Slug</th>
              <th>Target</th>
              <th style={{ textAlign: 'right' }}>Clicks</th>
              <th style={{ textAlign: 'right' }}>CTR</th>
              <th style={{ textAlign: 'right' }}>Earned</th>
              <th>Status</th>
              <th style={{ width: 100 }}/>
            </tr>
          </thead>
          <tbody>
            {links.map(l => (
              <tr key={l.slug}>
                <td>
                  <div className="row" style={{ gap: 6 }}>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>alfi.co/</span>
                    <span className="mono" style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 600, background: 'var(--accent-bg)', color: 'var(--accent-fg)', padding: '1px 5px', borderRadius: 3 }}>{l.slug}</span>
                    {l.hot && <Icon name="bolt" size={10} stroke={2.2} style={{ color: 'var(--accent)' }}/>}
                  </div>
                </td>
                <td style={{ fontSize: 12, color: 'var(--ink-2)' }}>{l.target}</td>
                <td className="mono" style={{ textAlign: 'right', color: 'var(--ink)' }}>{l.clicks.toLocaleString()}</td>
                <td className="mono" style={{ textAlign: 'right', color: 'var(--ink-2)' }}>{l.ctr}</td>
                <td className="mono" style={{ textAlign: 'right', color: 'var(--pos)', fontWeight: 600 }}>${l.earned.toFixed(2)}</td>
                <td>{l.live ? <span className="tag live"><span className="dot"/>Live</span> : <span className="tag warn">Paused</span>}</td>
                <td>
                  <div className="row" style={{ gap: 4, justifyContent: 'flex-end' }}>
                    <button className="btn sm ghost" style={{ padding: '3px 6px' }}><Icon name="link" size={11}/></button>
                    <button className="btn sm ghost" style={{ padding: '3px 6px' }}><Icon name="chart" size={11}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

window.Links = Links;
