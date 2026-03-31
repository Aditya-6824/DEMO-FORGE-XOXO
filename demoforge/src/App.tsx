import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'
import { Landing }   from './pages/Landing'
import { Login }     from './pages/Login'
import { Signup }    from './pages/Signup'
import { Dashboard } from './pages/Dashboard'
import { Builder }   from './pages/Builder'
import { Viewer }    from './pages/Viewer'
import { DemoAnalytics } from './pages/DemoAnalytics'
import { Templates } from './pages/Templates'
import PolycabDemo from './pages/PolycabDemo'

// Protects routes that require login
function PrivateRoute({ element }: { element: React.ReactElement }) {
  const [checked, setChecked] = useState(false)
  const [authed,  setAuthed]  = useState(false)
  
  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    supabase.auth.getSession().then(({ data }: any) => {
      setAuthed(!!data.session)
      setChecked(true)
    })
  }, [])

  if (!checked) return (
    <div style={{ height:'100vh', background:'var(--bg-base)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ width:32, height:32, borderRadius:'50%', border:'3px solid rgba(255,255,255,0.1)', borderTop:'3px solid var(--accent)', animation:'spin 0.8s linear infinite' }} />
    </div>
  )
  return authed ? element : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background:'#0F1629', color:'#F0F4FF', border:'1px solid #1F2B4A', borderRadius:10, fontSize:14 },
          success: { iconTheme: { primary:'#10B981', secondary:'#0F1629' } },
        }}
      />
      <Routes>
        <Route path="/"            element={<Landing />} />
        <Route path="/login"       element={<Login />} />
        <Route path="/signup"      element={<Signup />} />
        <Route path="/dashboard"   element={<PrivateRoute element={<Dashboard />} />} />
        <Route path="/analytics"   element={<PrivateRoute element={<DemoAnalytics />} />} />
        <Route path="/templates"   element={<PrivateRoute element={<Templates />} />} />
        <Route path="/builder/:id" element={<PrivateRoute element={<Builder />} />} />
        <Route path="/demo/:id"    element={<Viewer />} />
        <Route path="/polycab-demo" element={<PolycabDemo />} />
        <Route path="*"            element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
