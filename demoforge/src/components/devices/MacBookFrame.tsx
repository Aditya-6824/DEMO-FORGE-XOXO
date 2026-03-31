interface Props { content: string; bgColor?: string; url?: string }

export function MacBookFrame({ content, bgColor = '#fff', url = 'app.example.com' }: Props) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', filter:'drop-shadow(0 32px 64px rgba(0,0,0,0.75))' }}>
      {/* LID */}
      <div style={{
        width: 560, background:'linear-gradient(160deg,#DCDCDC,#C0C0C0)',
        borderRadius:'12px 12px 0 0', border:'2px solid #AEAEAE',
        padding: 8, position:'relative',
      }}>
        {/* Notch */}
        <div style={{
          position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
          width:170, height:18, background:'linear-gradient(160deg,#DCDCDC,#C8C8C8)',
          borderRadius:'0 0 10px 10px', zIndex:10,
        }}/>
        {/* Camera */}
        <div style={{
          position:'absolute', top:5, left:'50%', transform:'translateX(-50%)',
          width:6, height:6, background:'#2A2A2A', borderRadius:'50%', zIndex:11,
        }}/>
        {/* Bezel */}
        <div style={{ background:'#0A0A0A', borderRadius:5, overflow:'hidden', height:326 }}>
          {/* URL bar */}
          <div style={{
            background:'#1E2430', padding:'8px 12px', display:'flex',
            alignItems:'center', gap:8, borderBottom:'1px solid #2A3448',
          }}>
            {['#FF5F57','#FFBD2E','#28C840'].map(c=>(
              <div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c }}/>
            ))}
            <div style={{
              flex:1, background:'#0F1629', borderRadius:5,
              padding:'3px 10px', display:'flex', alignItems:'center', gap:5,
            }}>
              <span style={{ color:'#28C840', fontSize:10 }}>🔒</span>
              <span style={{ color:'#8B95B5', fontSize:11, fontFamily:'monospace' }}>{url}</span>
            </div>
          </div>
          {/* Page */}
          <div style={{ background:bgColor, height:'calc(100% - 37px)', overflow:'hidden' }}
            dangerouslySetInnerHTML={{ __html: content }}/>
        </div>
      </div>
      {/* BASE */}
      <div style={{
        width:578, height:22,
        background:'linear-gradient(180deg,#D2D2D2,#BDBDBD)',
        borderRadius:'0 0 12px 12px', border:'2px solid #AEAEAE', borderTop:'none',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        <div style={{ width:110, height:12, background:'linear-gradient(180deg,#C4C4C4,#ADADAD)', borderRadius:3, border:'1px solid #9E9E9E' }}/>
      </div>
      {/* Shadow on desk */}
      <div style={{ width:620, height:8, background:'radial-gradient(ellipse,rgba(0,0,0,0.35) 0%,transparent 70%)', marginTop:2 }}/>
    </div>
  )
}
