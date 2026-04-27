/* global React, Icon */
const { useState: useS2 } = React;

const Prompts = () => {
  const [active, setActive] = useS2('prac-pin');

  const prompts = [
    { id: 'prac-tg', tone: 'Practical', plat: 'Telegram', v: 'v3.2', updated: 'Apr 14', epc: 0.81, runs: 142, status: 'active' },
    { id: 'prac-pin', tone: 'Practical', plat: 'Pinterest', v: 'v3.2', updated: 'Apr 14', epc: 0.79, runs: 168, status: 'active', hot: true },
    { id: 'prac-x', tone: 'Practical', plat: 'X', v: 'v3.2', updated: 'Apr 14', epc: 0.62, runs: 88, status: 'active' },
    { id: 'prac-tt', tone: 'Practical', plat: 'TikTok', v: 'v2.8', updated: 'Mar 30', epc: 0.41, runs: 42, status: 'active' },
    { id: 'prac-ig', tone: 'Practical', plat: 'Instagram', v: 'v2.8', updated: 'Mar 30', epc: 0.31, runs: 18, status: 'active' },
    { id: 'prem-tg', tone: 'Premium', plat: 'Telegram', v: 'v3.2', updated: 'Apr 14', epc: 0.68, runs: 96, status: 'active' },
    { id: 'prem-pin', tone: 'Premium', plat: 'Pinterest', v: 'v3.2', updated: 'Apr 14', epc: 0.71, runs: 142, status: 'active' },
    { id: 'prem-x', tone: 'Premium', plat: 'X', v: 'v3.2', updated: 'Apr 14', epc: 0.54, runs: 64, status: 'active' },
    { id: 'wit-tg', tone: 'Witty', plat: 'Telegram', v: 'v3.2', updated: 'Apr 14', epc: 0.92, runs: 120, status: 'active', hot: true },
    { id: 'wit-pin', tone: 'Witty', plat: 'Pinterest', v: 'v3.2', updated: 'Apr 14', epc: 0.66, runs: 88, status: 'active' },
    { id: 'wit-x', tone: 'Witty', plat: 'X', v: 'v3.2', updated: 'Apr 14', epc: 0.78, runs: 158, status: 'active' },
    { id: 'prac-pin-old', tone: 'Practical', plat: 'Pinterest', v: 'v2.0', updated: 'Mar 02', epc: 0.61, runs: 412, status: 'archived' },
    { id: 'prac-pin-old2', tone: 'Practical', plat: 'Pinterest', v: 'v1.0', updated: 'Feb 14', epc: 0.42, runs: 218, status: 'archived' },
  ];

  const sel = prompts.find(p => p.id === active) || prompts[0];

  const promptText = `You are writing a {{platform}} post for an affiliate product on Temu.

TONE: {{tone}}
- Practical: plainspoken, use-case first, "this just works" energy
- Premium: aspirational, lifestyle, "you deserve it"
- Witty: punchy, conversational, "stop scrolling"

PRODUCT
- Title: {{product.title}}
- Price: {{product.price}}
- Photos: {{product.image_urls}}
- Top features: {{product.features | join: ", "}}

PLATFORM RULES
{% if platform == "pinterest" %}
- Lead with a 4-8 word visual hook (this becomes pin overlay)
- Body: 2-3 sentences max, must feel like organic save-worthy content
- 4-6 hashtags, lowercase, no spam tokens
- Never expose the raw temu URL — use {{tracked_link}}
{% elsif platform == "telegram" %}
- 80-180 words, line breaks for scannability
- One emoji max, only if it adds info (→ ↓ 🔗)
- End with $price + tracked link
{% elsif platform == "x" %}
- 220 chars max, 1-3 short lines, no hashtags
- Personality > information; the link does the rest
{% endif %}

OUTPUT JSON
{ "copy": "...", "title": "...", "cta": "...", "hashtags": "..." }

CONSTRAINTS
- Never invent specs not in product data
- Never use "game-changer", "must-have", "level up", "unleash"
- Never end with a question unless witty tone`;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', height: '100%', overflow: 'hidden' }}>
      {/* Left — list */}
      <div style={{ borderRight: '1px solid var(--line)', overflowY: 'auto', background: 'var(--bg-2)' }}>
        <div style={{ padding: '20px 20px 12px' }}>
          <h1 className="section-h" style={{ fontSize: 26 }}>Prompt library</h1>
          <div className="section-sub" style={{ fontSize: 12, marginTop: 4 }}>
            <span className="mono">11 active</span> · <span className="mono">2 archived</span> · versioned
          </div>
        </div>

        <div style={{ padding: '0 12px 12px' }} className="row">
          <button className="btn sm" style={{ flex: 1, justifyContent: 'center' }}><Icon name="plus" size={11} stroke={2.2}/> New prompt</button>
          <button className="btn sm ghost" style={{ flex: 1, justifyContent: 'center' }}><Icon name="bolt" size={11}/> A/B test</button>
        </div>

        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '8px 20px 6px' }}>Active · v3.2 series</div>
        {prompts.filter(p => p.status === 'active').map(p => (
          <PromptRow key={p.id} p={p} active={active === p.id} onClick={() => setActive(p.id)}/>
        ))}

        <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '14px 20px 6px' }}>Archived</div>
        {prompts.filter(p => p.status === 'archived').map(p => (
          <PromptRow key={p.id} p={p} active={active === p.id} onClick={() => setActive(p.id)}/>
        ))}
      </div>

      {/* Right — editor */}
      <div style={{ overflowY: 'auto', padding: '24px 32px 60px' }}>
        <div className="spread" style={{ marginBottom: 18 }}>
          <div>
            <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
              {sel.tone} · {sel.plat} · {sel.v}
            </div>
            <h2 className="serif" style={{ fontSize: 26, margin: 0, fontStyle: 'normal' }}>
              {sel.tone.toLowerCase()} <em>on</em> {sel.plat.toLowerCase()}
            </h2>
            <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
              Updated {sel.updated} · {sel.runs} runs · drives <span className="mono" style={{ color: 'var(--pos)' }}>${sel.epc.toFixed(2)} EPC</span>
            </div>
          </div>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn sm ghost"><Icon name="refresh" size={11}/> Revert</button>
            <button className="btn sm ghost"><Icon name="layers" size={11}/> Diff vs v2.0</button>
            <button className="btn sm primary">Save as v3.3</button>
          </div>
        </div>

        {/* Performance bar */}
        <div className="card" style={{ padding: 14, marginBottom: 18 }}>
          <div className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Version performance — EPC</div>
          <div className="col" style={{ gap: 8 }}>
            {[
              { v: 'v3.2', val: sel.epc, runs: sel.runs, current: true },
              { v: 'v2.0', val: 0.61, runs: 412 },
              { v: 'v1.0', val: 0.42, runs: 218 },
            ].map(r => (
              <div key={r.v} className="row" style={{ gap: 10 }}>
                <span className="mono" style={{ fontSize: 11, color: r.current ? 'var(--accent-fg)' : 'var(--ink-3)', width: 40, fontWeight: r.current ? 600 : 400 }}>{r.v}</span>
                <div style={{ flex: 1, height: 16, background: 'var(--bg-3)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${(r.val / 1.0) * 100}%`, height: '100%', background: r.current ? 'var(--accent)' : 'var(--ink-3)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 6px', color: r.current ? 'oklch(0.2 0.05 60)' : 'var(--bg)', fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600 }}>${r.val.toFixed(2)}</div>
                </div>
                <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', width: 60, textAlign: 'right' }}>{r.runs} runs</span>
              </div>
            ))}
          </div>
        </div>

        {/* Editor */}
        <div className="card" style={{ padding: 0 }}>
          <div className="card-head">
            <div className="card-title">Prompt source</div>
            <span className="card-sub" style={{ marginLeft: 8 }}>Liquid templating · GPT-4o · max 1500 tokens</span>
            <div style={{ flex: 1 }}/>
            <button className="btn sm ghost"><Icon name="eye" size={11}/> Test run</button>
          </div>
          <pre style={{
            margin: 0, padding: 18,
            fontFamily: 'var(--font-mono)', fontSize: 12, lineHeight: 1.65,
            color: 'var(--ink-2)', background: 'var(--bg-2)',
            whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            borderRadius: 0,
          }}>{promptText.split('\n').map((line, i) => {
            // simple syntax color
            const isComment = line.trim().startsWith('-');
            const isLiquid = line.includes('{%') || line.includes('{{');
            const isHeading = /^[A-Z ]+$/.test(line.trim()) && line.trim().length > 2;
            return (
              <div key={i} style={{
                color: isHeading ? 'var(--ink)' :
                       isLiquid ? 'var(--accent-fg)' :
                       isComment ? 'var(--ink-3)' : 'var(--ink-2)',
                fontWeight: isHeading ? 600 : 400,
              }}>{line || '\u00A0'}</div>
            );
          })}</pre>
        </div>

        {/* Variables */}
        <div className="card" style={{ marginTop: 16, padding: 0 }}>
          <div className="card-head"><div className="card-title">Variables in scope</div></div>
          <table className="tbl">
            <tbody>
              {[
                ['{{ product.title }}', 'string', 'Scraped from Temu via Apify'],
                ['{{ product.price }}', 'string', 'Display price (e.g. "$4.97")'],
                ['{{ product.image_urls }}', 'array', 'CDN URLs, up to 6 photos'],
                ['{{ product.features }}', 'array', 'Bullet points from product description'],
                ['{{ tracked_link }}', 'string', 'Generated alfi.co/p2841-{plat}-{tone} short link'],
                ['{{ platform }}', 'enum', 'telegram | pinterest | x | tiktok | instagram'],
                ['{{ tone }}', 'enum', 'practical | premium | witty'],
              ].map(r => (
                <tr key={r[0]}>
                  <td className="mono" style={{ color: 'var(--accent-fg)', fontSize: 11 }}>{r[0]}</td>
                  <td className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>{r[1]}</td>
                  <td style={{ fontSize: 12, color: 'var(--ink-2)' }}>{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PromptRow = ({ p, active, onClick }) => (
  <button onClick={onClick} style={{
    width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
    background: active ? 'var(--surface)' : 'transparent',
    borderLeft: active ? '2px solid var(--accent)' : '2px solid transparent',
    padding: '10px 18px', display: 'block',
  }}>
    <div className="row" style={{ gap: 6, marginBottom: 3 }}>
      <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: active ? 600 : 500 }}>{p.tone}</span>
      <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>· {p.plat}</span>
      {p.hot && <Icon name="bolt" size={10} stroke={2.2} style={{ color: 'var(--accent)' }}/>}
      <span className="mono" style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 'auto' }}>{p.v}</span>
    </div>
    <div className="row" style={{ gap: 8, fontSize: 11 }}>
      <span className="mono" style={{ color: 'var(--ink-3)' }}>{p.runs} runs</span>
      <span className="mono" style={{ color: 'var(--ink-3)' }}>·</span>
      <span className="mono" style={{ color: 'var(--pos)' }}>${p.epc.toFixed(2)} EPC</span>
    </div>
  </button>
);

window.Prompts = Prompts;
