interface Props { content: string; bgColor?: string; url?: string; tabTitle?: string }

export function BrowserFrame({ content, bgColor = '#fff', url = 'app.example.com', tabTitle = 'App' }: Props) {
  return (
    <div style={{
      width:620, background:'#1E2430', borderRadius:12,
      border:'1px solid #2A3448', overflow:'hidden',
      boxShadow:'0 32px 64px rgba(0,0,0,0.7)',
    }}>
      {/* Chrome top */}
      <div style={{ background:'#252E42', padding:'10px 14px 0' }}>
        <div style={{ display:'flex', gap:6, marginBottom:8 }}>
          {['#FF5F57','#FFBD2E','#28C840'].map(c=>(
            <div key={c} style={{ width:12, height:12, borderRadius:'50%', background:c }}/>
          ))}
        </div>
        {/* Tab */}
        <div style={{ display:'flex', gap:2 }}>
          <div style={{
            background:'#1A2235', color:'#F0F4FF', padding:'6px 18px',
            borderRadius:'8px 8px 0 0', fontSize:12,
            border:'1px solid #2A3448', borderBottom:'none',
          }}>{tabTitle}</div>
          <div style={{ color:'#4A5578', padding:'6px 10px', fontSize:12 }}>+</div>
        </div>
      </div>
      {/* URL bar */}
      <div style={{
        background:'#1A2235', padding:'8px 14px',
        display:'flex', alignItems:'center', gap:8, borderBottom:'1px solid #2A3448',
      }}>
        <span style={{ color:'#28C840', fontSize:12 }}>🔒</span>
        <div style={{ flex:1, background:'#0F1629', borderRadius:6, padding:'4px 12px', border:'1px solid #2A3448' }}>
          <span style={{ color:'#8B95B5', fontSize:12, fontFamily:'monospace' }}>{url}</span>
        </div>
      </div>
      {/* Page */}
      <div style={{ background:bgColor, minHeight:380, overflow:'hidden' }}
        dangerouslySetInnerHTML={{ __html: content }}/>
    </div>
  )
}
