/* global React */
// Icon set — minimal stroke icons used throughout Alfi
const Icon = ({ name, size = 14, stroke = 1.5, ...props }) => {
  const s = { width: size, height: size, fill: 'none', stroke: 'currentColor', strokeWidth: stroke, strokeLinecap: 'round', strokeLinejoin: 'round', ...(props.style || {}) };
  const paths = {
    home: <><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-7h-6v7H4a1 1 0 0 1-1-1z"/></>,
    box: <><path d="M3 7l9-4 9 4v10l-9 4-9-4z"/><path d="M3 7l9 4 9-4M12 11v10"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></>,
    chart: <><path d="M3 21V8M9 21V3M15 21v-9M21 21v-5"/></>,
    dollar: <><path d="M12 3v18M17 7H9.5a2.5 2.5 0 0 0 0 5H14a2.5 2.5 0 0 1 0 5H6"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>,
    filter: <><path d="M3 4h18l-7 9v6l-4 2v-8z"/></>,
    arrowUp: <><path d="M12 19V5M5 12l7-7 7 7"/></>,
    arrowDown: <><path d="M12 5v14M19 12l-7 7-7-7"/></>,
    arrowRight: <><path d="M5 12h14M13 5l7 7-7 7"/></>,
    chev: <><path d="m9 18 6-6-6-6"/></>,
    chevDown: <><path d="m6 9 6 6 6-6"/></>,
    check: <><path d="M5 12l5 5L20 7"/></>,
    x: <><path d="M18 6 6 18M6 6l12 12"/></>,
    edit: <><path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></>,
    refresh: <><path d="M3 12a9 9 0 0 1 15.5-6.3L21 8M21 3v5h-5M21 12a9 9 0 0 1-15.5 6.3L3 16M3 21v-5h5"/></>,
    sparkle: <><path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/></>,
    bolt: <><path d="M13 2 3 14h7v8l10-12h-7z"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></>,
    moon: <><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></>,
    link: <><path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 1 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 1 0 7 7l1-1"/></>,
    upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></>,
    inbox: <><path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></>,
    eye: <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    bell: <><path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></>,
    play: <><path d="M6 4l14 8-14 8z"/></>,
    pause: <><path d="M6 4h4v16H6zM14 4h4v16h-4z"/></>,
    flag: <><path d="M4 22V4l8 2 8-2v12l-8 2-8-2"/></>,
    pin: <><path d="M12 2v7M9 9h6l-1 6h-4zM12 15v7"/></>,
    send: <><path d="M22 2 11 13M22 2l-7 20-4-9-9-4z"/></>,
    image: <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></>,
    layers: <><path d="m12 2 10 6-10 6L2 8z"/><path d="m2 17 10 6 10-6M2 12l10 6 10-6"/></>,
    grid: <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
    list: <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></>,
    tg: <><path d="M22 3 2 11l7 3 3 7 4-6 6 5z"/></>,
    pinterest: <><circle cx="12" cy="12" r="9"/><path d="M11 8c-2 0-4 1.5-4 4 0 2 1 3 2 3M12 8c2.5 0 4 2 4 4s-1 4-3 4c-2.5 0-2-3-2-3M11 11l-2 9"/></>,
    twitter: <><path d="M4 4l16 16M20 4 4 20"/></>,
    tiktok: <><path d="M9 12a4 4 0 1 0 4 4V4c0 4 3 6 6 6"/></>,
    instagram: <><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor"/></>,
  };
  return <svg viewBox="0 0 24 24" style={s}>{paths[name] || null}</svg>;
};

// ============ APP SHELL ============
const Sidebar = ({ active, onNav, counts = {} }) => {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: 'home' },
    { id: 'products', label: 'Products', icon: 'box', count: counts.products },
    { id: 'calendar', label: 'Calendar', icon: 'calendar', count: counts.calendar },
    { id: 'analytics', label: 'Analytics', icon: 'chart' },
    { id: 'earnings', label: 'Earnings', icon: 'dollar' },
  ];
  const tools = [
    { id: 'inbox', label: 'Reconcile', icon: 'inbox', count: counts.inbox },
    { id: 'links', label: 'Short links', icon: 'link' },
    { id: 'prompts', label: 'Prompt library', icon: 'sparkle' },
  ];
  return (
    <aside className="sidebar">
      <div className="sb-brand">
        <div className="sb-brand-mark">α</div>
        alfi
      </div>
      {items.map(it => (
        <button key={it.id} className={`sb-item ${active === it.id ? 'active' : ''}`} onClick={() => onNav?.(it.id)}>
          <Icon name={it.icon} size={14} />
          {it.label}
          {it.count != null && <span className="sb-count mono">{it.count}</span>}
        </button>
      ))}
      <div className="sb-section-label">Workshop</div>
      {tools.map(it => (
        <button key={it.id} className={`sb-item ${active === it.id ? 'active' : ''}`} onClick={() => onNav?.(it.id)}>
          <Icon name={it.icon} size={14} />
          {it.label}
          {it.count != null && <span className="sb-count mono">{it.count}</span>}
        </button>
      ))}
      <div className="sb-section-label">Channels</div>
      <ChannelStatus name="Telegram" key1="tg" status="live" />
      <ChannelStatus name="Pinterest" key1="pin" status="live" />
      <ChannelStatus name="X / Twitter" key1="x" status="live" />
      <ChannelStatus name="TikTok" key1="tt" status="assist" />
      <ChannelStatus name="Instagram" key1="ig" status="paused" />

      <div className="sb-footer">
        <div className="sb-avatar">PA</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, color: 'var(--ink)', fontWeight: 500 }}>Pastro Alfred</div>
          <div className="mono" style={{ fontSize: 10 }}>operator</div>
        </div>
        <button className="icon-btn" onClick={() => onNav?.('settings')} title="Settings">
          <Icon name="settings" size={13} />
        </button>
      </div>
    </aside>
  );
};

const ChannelStatus = ({ name, key1, status }) => {
  const colors = { live: 'var(--pos)', assist: 'var(--accent)', paused: 'var(--ink-4)' };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px', fontSize: 12, color: 'var(--ink-3)' }}>
      <span className={`platform-dot`} style={{ width: 6, height: 6, borderRadius: 2, background: `var(--${key1})` }} />
      <span style={{ flex: 1, color: 'var(--ink-2)' }}>{name}</span>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: colors[status] }} />
    </div>
  );
};

const TopBar = ({ crumbs = [], children, theme, onTheme }) => (
  <div className="topbar">
    <div className="topbar-crumbs">
      {crumbs.map((c, i) => (
        <React.Fragment key={i}>
          {i > 0 && <span className="sep">/</span>}
          <span style={{ color: i === crumbs.length - 1 ? 'var(--ink)' : undefined }}>{c}</span>
        </React.Fragment>
      ))}
    </div>
    <div className="topbar-right">
      {children}
      <div className="row" style={{ gap: 6, padding: '0 8px', borderLeft: '1px solid var(--line)', height: 24, marginLeft: 6 }}>
        <Icon name="search" size={13} style={{ color: 'var(--ink-3)' }}/>
        <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>Search</span>
        <span className="kbd">⌘K</span>
      </div>
      <button className="icon-btn" onClick={onTheme} title="Toggle theme">
        <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={14} />
      </button>
    </div>
  </div>
);

// Sparkline component
const Sparkline = ({ data, color = 'var(--ink-3)', width = 80, height = 24 }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * height;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const KPI = ({ label, value, unit, delta, deltaDir = 'up', spark, sparkColor }) => (
  <div className="kpi">
    <div className="kpi-label">{label}</div>
    <div className="kpi-value">
      {unit && <span className="unit">{unit}</span>}{value}
    </div>
    {delta && (
      <div className={`kpi-delta ${deltaDir}`}>
        <Icon name={deltaDir === 'up' ? 'arrowUp' : 'arrowDown'} size={11} stroke={2}/>
        {delta}
      </div>
    )}
    {spark && (
      <div className="kpi-spark">
        <Sparkline data={spark} color={sparkColor || (deltaDir === 'up' ? 'var(--pos)' : 'var(--neg)')} width={140} height={36}/>
      </div>
    )}
  </div>
);

// Platform tag
const Platform = ({ name }) => {
  const map = { tg: 'Telegram', pin: 'Pinterest', x: 'X', tt: 'TikTok', ig: 'Instagram' };
  return (
    <span className={`platform ${name}`}>
      <span className="platform-dot"/>
      {map[name]}
    </span>
  );
};

Object.assign(window, { Icon, Sidebar, TopBar, Sparkline, KPI, Platform, ChannelStatus });
