import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export function Signup() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate = useNavigate()

  const submit = async () => {
    setError(''); setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    navigate('/dashboard')
  }

  return (
    <div style={{
      minHeight:'100vh', background:'#080C18',
      display:'flex', alignItems:'center', justifyContent:'center', padding:20,
    }}>
      <div style={{
        width:'100%', maxWidth:400,
        background:'#0F1629', border:'1px solid #1F2B4A',
        borderRadius:20, padding:36,
      }}>
        {/* Logo mark */}
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{
            display:'inline-flex', width:48, height:48, borderRadius:14,
            background:'#4461F2', alignItems:'center', justifyContent:'center',
            fontSize:22, fontWeight:700, color:'white', marginBottom:12,
          }}>D</div>
          <h1 style={{ fontSize:22, fontWeight:600, color:'#F0F4FF', margin:0 }}>Create your account</h1>
          <p style={{ fontSize:14, color:'#4A5578', margin:'6px 0 0' }}>Free forever. Unlimited demos.</p>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={labelStyle}>Email</label>
            <input
              type="email" value={email} onChange={e=>setEmail(e.target.value)}
              placeholder="you@company.com"
              onKeyDown={e => e.key === 'Enter' && submit()}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <input
              type="password" value={password} onChange={e=>setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && submit()}
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, padding:'10px 14px', fontSize:13, color:'#EF4444' }}>
              {error}
            </div>
          )}

          <button onClick={submit} disabled={loading} style={{
            background:'#4461F2', border:'none', color:'white',
            padding:'12px', borderRadius:10, fontSize:15, fontWeight:500,
            cursor: loading ? 'not-allowed' : 'pointer', fontFamily:'inherit',
            opacity: loading ? 0.7 : 1, marginTop:4,
            boxShadow:'0 4px 14px rgba(68,97,242,0.35)',
          }}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p style={{ textAlign:'center', fontSize:13, color:'#4A5578', margin:0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'#4461F2', textDecoration:'none', fontWeight:500 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display:'block', fontSize:12, fontWeight:500,
  color:'#8B95B5', marginBottom:6,
}
const inputStyle: React.CSSProperties = {
  width:'100%', background:'#080C18', border:'1px solid #1F2B4A',
  color:'#F0F4FF', padding:'10px 14px', borderRadius:10,
  fontSize:14, fontFamily:'inherit', outline:'none', boxSizing:'border-box',
  transition:'border-color 0.15s',
}
