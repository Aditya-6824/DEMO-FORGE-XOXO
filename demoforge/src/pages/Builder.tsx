import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { supabase } from '../lib/supabase'
import { IPhoneFrame } from '../components/devices/IPhoneFrame'
import { MacBookFrame } from '../components/devices/MacBookFrame'
import { BrowserFrame } from '../components/devices/BrowserFrame'
import { ApiPanel } from '../components/devices/ApiPanel'
import { GripVertical, Plus, ChevronLeft, Eye, Trash2, Import, Zap, Code } from 'lucide-react'
import { parseCurl } from '../lib/curlParser'

// Types
interface Step {
  id: string
  demo_id: string
  step_order: number
  title: string
  subtitle: string
  device_type: 'iphone' | 'macbook' | 'browser' | 'api'
  screen_content: string
  screen_bg: string
  status_bar_text: string
  browser_url: string
  tab_title: string
  api_method: string
  api_endpoint: string
  api_request: string
  api_response: string // For mock response
  api_status_code: number
  api_response_ms: number
  api_mode: 'mock' | 'live'
  api_headers: string
  chain_path: string
}

interface Demo {
  id: string
  title: string
  company_name: string
  company_logo: string | null
  status: 'draft' | 'live'
  theme_color?: string
  api_mode?: 'mock' | 'live'
}

export function Builder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [demo, setDemo] = useState<Demo | null>(null)
  const [steps, setSteps] = useState<Step[]>([])
  const [activeStep, setActiveStep] = useState<Step | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle'|'saving'|'saved'>('idle')
  const [showImportModal, setShowImportModal] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [liveResponse, setLiveResponse] = useState<string | null>(null)
  const [curlCmd, setCurlCmd] = useState<string | null>(null)
  const [showCurlModal, setShowCurlModal] = useState(false)
  const [tempCurl, setTempCurl] = useState('')

  // Load demo + steps
  useEffect(() => {
    if (!id) return
    Promise.all([
      supabase.from('demos').select('*').eq('id', id).single(),
      supabase.from('demo_steps').select('*').eq('demo_id', id).order('step_order'),
    ]).then(([demoRes, stepsRes]) => {
      if (demoRes.data) setDemo(demoRes.data)
      if (stepsRes.data && stepsRes.data.length > 0) {
        setSteps(stepsRes.data)
        setActiveStep(stepsRes.data[0])
      }
    })
  }, [id])

  // Auto-save with debounce
  const save = useCallback(async (stepToSave: Step) => {
    setSaveStatus('saving')
    const { error } = await supabase.from('demo_steps').upsert(stepToSave)
    if (!error) {
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }
  }, [])

  useEffect(() => {
    if (!activeStep) return
    const t = setTimeout(() => save(activeStep), 1500)
    return () => clearTimeout(t)
  }, [activeStep, save])

  const updateStep = (changes: Partial<Step>) => {
    if (!activeStep) return
    const updated = { ...activeStep, ...changes }
    setActiveStep(updated)
    setSteps(prev => prev.map(s => s.id === updated.id ? updated : s))
  }

  const addStep = async (overrides?: Partial<Step>) => {
    if (!id) return
    const newStep: Omit<Step, 'id'> = {
      demo_id: id,
      step_order: steps.length,
      title: `Step ${steps.length + 1}`,
      subtitle: '',
      device_type: 'api',
      screen_content: '<div style="padding:24px;font-family:system-ui"><h2 style="color:#111">New step</h2></div>',
      screen_bg: '#FFFFFF',
      status_bar_text: '9:41',
      browser_url: 'https://app.example.com',
      tab_title: 'App',
      api_method: 'POST',
      api_endpoint: '/api/v1/example',
      api_request: '{\n  "key": "value"\n}',
      api_response: '{\n  "status": "success"\n}',
      api_status_code: 200,
      api_response_ms: 124,
      api_mode: 'mock',
      api_headers: '{"Content-Type":"application/json"}',
      chain_path: '',
      ...overrides
    }
    const { data } = await supabase.from('demo_steps').insert(newStep).select().single()
    if (data) {
      setSteps(prev => [...prev, data])
      setActiveStep(data)
    }
  }

  const deleteStep = async (stepId: string) => {
    await supabase.from('demo_steps').delete().eq('id', stepId)
    const remaining = steps.filter(s => s.id !== stepId)
    setSteps(remaining)
    setActiveStep(remaining[0] || null)
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onDragEnd = async (result: any) => {
    if (!result.destination) return
    const reordered = Array.from(steps)
    const [removed] = reordered.splice(result.source.index, 1)
    reordered.splice(result.destination.index, 0, removed)
    const withOrder = reordered.map((s, i) => ({ ...s, step_order: i }))
    setSteps(withOrder)
    if (withOrder.find(s => s.id === activeStep?.id)) {
      setActiveStep(withOrder.find(s => s.id === activeStep?.id) || null)
    }
    await supabase.from('demo_steps').upsert(withOrder.map(s => ({ id:s.id, step_order:s.step_order })))
  }

  const handleImport = async () => {
    if (!importUrl) return
    setImporting(true)
    try {
      const res = await fetch('http://localhost:3001/api/ai/analyze-spec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specUrl: importUrl })
      })
      const data = await res.json()
      if (data.endpoints && data.endpoints.length > 0) {
        for (const ep of data.endpoints) {
          await addStep({
            title: ep.summary || ep.path,
            api_method: ep.method.toUpperCase(),
            api_endpoint: ep.path,
            api_request: JSON.stringify(ep.requestBodyExample || {}, null, 2),
            api_response: JSON.stringify(ep.responseExample || {}, null, 2),
            device_type: 'api'
          })
        }
      }
      setShowImportModal(false)
    } catch(e) {
      console.error(e)
    } finally {
      setImporting(false)
    }
  }

  const handleCurlImport = () => {
    const parsed = parseCurl(tempCurl)
    if (!parsed.url) {
      alert('Invalid cURL: No URL found')
      return
    }
    updateStep({
      api_method: parsed.method,
      api_endpoint: parsed.url,
      api_headers: JSON.stringify(parsed.headers, null, 2),
      api_request: parsed.body || '{}',
    })
    setShowCurlModal(false)
    setTempCurl('')
  }

  const runTest = async () => {
    if (!activeStep) return
    if (activeStep.api_mode === 'mock') {
      alert('Mock mode response preview triggered.')
      return
    }
    try {
      const headers = JSON.parse(activeStep.api_headers || '{}')
      const res = await fetch('http://localhost:3001/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: activeStep.api_endpoint,
          method: activeStep.api_method,
          headers,
          body: activeStep.api_request
        })
      })
      const data = await res.json()
      setLiveResponse(typeof data.data === 'object' ? JSON.stringify(data.data, null, 2) : String(data.data))
      setCurlCmd(data.curlCommand)
    } catch(e) {
      console.error(e)
    }
  }

  const renderDevice = (step: Step) => {
    switch (step.device_type) {
      case 'iphone':
        return <IPhoneFrame content={step.screen_content} bgColor={step.screen_bg} />
      case 'macbook':
        return <MacBookFrame content={step.screen_content} bgColor={step.screen_bg} url={step.browser_url} />
      case 'browser':
        return <BrowserFrame content={step.screen_content} bgColor={step.screen_bg} url={step.browser_url} tabTitle={step.tab_title} />
      case 'api':
        return <ApiPanel method={step.api_method} endpoint={step.api_endpoint} requestBody={step.api_request} responseBody={activeStep?.api_mode === 'live' && liveResponse ? liveResponse : step.api_response} statusCode={step.api_status_code} responseMs={step.api_response_ms} />
    }
  }

  if (!demo) return <div style={{ color:'#F0F4FF', padding:40 }}>Loading...</div>

  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100vh', background:'var(--bg-base)' }}>
      {/* TOP BAR */}
      <div style={{
        height:56, background:'var(--bg-surface)', borderBottom:'1px solid var(--bg-border)',
        display:'flex', alignItems:'center', padding:'0 16px', gap:16, flexShrink:0,
      }}>
        <button onClick={() => navigate('/dashboard')} style={{
          background:'transparent', border:'none', color:'var(--text-secondary)', cursor:'pointer',
          display:'flex', alignItems:'center', gap:6, fontSize:14,
        }}>
          <ChevronLeft size={16} /> Dashboard
        </button>
        <div style={{ width:1, height:24, background:'var(--bg-border)' }} />
        <input
          value={demo.title}
          onChange={e => setDemo({...demo, title: e.target.value})}
          onBlur={() => supabase.from('demos').update({ title:demo.title }).eq('id', demo.id)}
          style={{
            background:'transparent', border:'none', color:'var(--text-primary)',
            fontSize:15, fontWeight:600, outline:'none', fontFamily:'inherit',
          }}
        />
        <div style={{ marginLeft:'auto', display:'flex', alignItems:'center', gap:10 }}>
          <button onClick={() => setShowImportModal(true)} style={ghostBtnStyle}>
            <Import size={14} /> Import OpenAPI
          </button>
          
          <span style={{
            fontSize:12, color: saveStatus === 'saved' ? 'var(--success)' : 'var(--text-muted)',
            transition:'color 0.3s',
          }}>
            {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? '✓ Saved' : ''}
          </span>
          <select
            value={demo.status}
            onChange={e => {
              const status = e.target.value as 'draft' | 'live'
              setDemo({ ...demo, status })
              supabase.from('demos').update({ status }).eq('id', demo.id)
            }}
            style={selectStyle}
          >
            <option value="draft">Draft</option>
            <option value="live">Live</option>
          </select>
          <button
            onClick={() => window.open(`/demo/${id}`, '_blank')}
            style={actionBtnStyle}
          >
            <Eye size={14} /> Preview
          </button>
        </div>
      </div>

      {/* 3-COLUMN MAIN */}
      <div style={{ display:'flex', flex:1, overflow:'hidden' }}>

        {/* LEFT: Step list */}
        <div style={{
          width:260, background:'var(--bg-surface)', borderRight:'1px solid var(--bg-border)',
          display:'flex', flexDirection:'column', overflow:'hidden',
        }}>
          <div style={{
            padding:'14px 16px', borderBottom:'1px solid var(--bg-border)',
            display:'flex', alignItems:'center', justifyContent:'space-between',
          }}>
            <span style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)' }}>STEPS</span>
            <button onClick={() => addStep()} style={{
              background:'var(--accent)', border:'none', color:'white', width:28, height:28,
              borderRadius:6, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
            }}>
              <Plus size={14} />
            </button>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="steps">
              {provided => (
                <div {...provided.droppableProps} ref={provided.innerRef} style={{ flex:1, overflow:'auto', padding:8 }}>
                  {steps.map((step, index) => (
                    <Draggable key={step.id} draggableId={step.id} index={index}>
                      {(prov, snapshot) => (
                        <div
                          ref={prov.innerRef}
                          {...prov.draggableProps}
                          onClick={() => setActiveStep(step)}
                          style={{
                            ...prov.draggableProps.style,
                            background: activeStep?.id === step.id ? 'var(--bg-elevated)' : snapshot.isDragging ? 'var(--bg-border)' : 'transparent',
                            borderLeft: activeStep?.id === step.id ? '3px solid var(--accent)' : '3px solid transparent',
                            borderRadius:8, padding:'10px 10px 10px 12px',
                            marginBottom:4, cursor:'pointer',
                            display:'flex', alignItems:'center', gap:8,
                            boxShadow: activeStep?.id === step.id ? '0 0 0 1px var(--accent-subtle)' : 'none',
                          }}
                        >
                          <div {...prov.dragHandleProps} style={{ color:'var(--text-muted)', cursor:'grab', flexShrink:0 }}>
                            <GripVertical size={14} />
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:13, fontWeight:500, color:'var(--text-primary)', overflow:'hidden', ...textEllipsis }}>
                              {step.title}
                            </div>
                            <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:2 }}>
                              {step.device_type} · {activeStep?.api_mode === 'live' ? '⚡Live' : ''}
                            </div>
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); deleteStep(step.id) }}
                            style={{ background:'transparent', border:'none', color:'var(--text-muted)', cursor:'pointer', padding:2 }}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>

        {/* CENTER: Preview */}
        <div style={{
          flex:1, background:'var(--bg-base)',
          display:'flex', alignItems:'center', justifyContent:'center',
          overflow:'auto', padding:40, position: 'relative'
        }}>
          {activeStep ? renderDevice(activeStep) : (
            <div style={{ color:'var(--text-muted)', textAlign:'center' }}>
              <div style={{ fontSize:48, marginBottom:16 }}>⚡</div>
              <div>Select a step to preview</div>
            </div>
          )}
        </div>

        {/* RIGHT: Config */}
        <div style={{
          width:360, background:'var(--bg-surface)', borderLeft:'1px solid var(--bg-border)',
          overflow:'auto', padding:20, display:'flex', flexDirection:'column', gap:20
        }}>
          {activeStep ? (
            <>
              {/* TOP TOGGLE */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', letterSpacing:'0.05em' }}>STEP CONFIG</div>
                <button 
                  onClick={() => setShowCurlModal(true)}
                  style={{ ...ghostBtnStyle, height:28, padding:'0 10px', fontSize:11, background: 'rgba(0, 202, 255, 0.1)', color: '#00CAFF', borderColor: 'rgba(0, 202, 255, 0.2)' }}
                >
                  <Code size={12} /> Import cURL
                </button>
                <div style={{ display:'flex', background:'var(--bg-base)', borderRadius:8, border:'1px solid var(--bg-border)', overflow:'hidden' }}>
                  <button 
                    onClick={() => updateStep({ api_mode: 'mock' })}
                    style={{ background: activeStep.api_mode === 'mock' ? 'var(--bg-elevated)' : 'transparent', color: activeStep.api_mode === 'mock' ? 'var(--text-primary)' : 'var(--text-muted)', padding:'4px 12px', border:'none', cursor:'pointer', fontSize:12, fontWeight:600 }}
                  >Mock</button>
                  <button 
                    onClick={() => updateStep({ api_mode: 'live' })}
                    style={{ background: activeStep.api_mode === 'live' ? 'var(--bg-elevated)' : 'transparent', color: activeStep.api_mode === 'live' ? 'var(--accent)' : 'var(--text-muted)', padding:'4px 12px', border:'none', cursor:'pointer', fontSize:12, fontWeight:600 }}
                  >Live!</button>
                </div>
              </div>

              <Field label="Step title">
                <Input value={activeStep.title} onChange={v => updateStep({ title:v })} />
              </Field>

              <Field label="Device display">
                <select
                  value={activeStep.device_type}
                  onChange={e => updateStep({ device_type: e.target.value as Step['device_type'] })}
                  style={selectStyle}
                >
                  <option value="api">⚡ API Panel</option>
                  <option value="iphone">📱 iPhone 15 Pro</option>
                  <option value="macbook">💻 MacBook Pro</option>
                  <option value="browser">🌐 Browser</option>
                </select>
              </Field>

              {/* API SPECIFIC FIELDS */}
              <div style={{ borderTop:'1px solid var(--bg-border)', paddingTop:16, display:'flex', flexDirection:'column', gap:16 }}>
                <div style={{ display:'flex', gap:8 }}>
                  <div style={{ width:100 }}>
                    <Field label="Method">
                      <select value={activeStep.api_method} onChange={e => updateStep({ api_method: e.target.value })} style={selectStyle}>
                        {['GET','POST','PUT','DELETE','PATCH'].map(m => <option key={m}>{m}</option>)}
                      </select>
                    </Field>
                  </div>
                  <div style={{ flex:1 }}>
                    <Field label="API URL / Endpoint">
                      <Input value={activeStep.api_endpoint} onChange={v => updateStep({ api_endpoint: v })} placeholder="https://api.example.com/v1/..." />
                    </Field>
                  </div>
                </div>

                <Field label="Headers (JSON)">
                  <textarea value={activeStep.api_headers || '{}'} onChange={e => updateStep({ api_headers: e.target.value })} rows={3} style={textareaStyle} />
                </Field>

                <Field label="Request Body (JSON)">
                  <textarea value={activeStep.api_request || '{}'} onChange={e => updateStep({ api_request: e.target.value })} rows={4} style={textareaStyle} />
                </Field>

                {activeStep.api_mode === 'mock' && (
                  <Field label="Mock Response Body (JSON)">
                    <textarea value={activeStep.api_response || '{}'} onChange={e => updateStep({ api_response: e.target.value })} rows={5} style={textareaStyle} />
                  </Field>
                )}

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
                  <div style={{ display:'flex', gap:12 }}>
                    <div style={{ width: 80 }}>
                      <Field label="Status code">
                        <Input value={String(activeStep.api_status_code)} onChange={v => updateStep({ api_status_code: parseInt(v)||200 })} />
                      </Field>
                    </div>
                  </div>
                  <button onClick={runTest} style={actionBtnStyle}>
                    <Zap size={14}/> Run Test
                  </button>
                </div>
                
                {activeStep.api_mode === 'live' && curlCmd && (
                  <div style={{ marginTop: 8 }}>
                    <Field label="Equivalent cURL">
                      <pre style={{ background:'var(--bg-base)', padding:8, borderRadius:6, fontSize:11, overflowX:'auto', color:'var(--text-muted)' }}>
                        {curlCmd}
                      </pre>
                    </Field>
                  </div>
                )}
              </div>

              {/* CHAINING SECTION */}
              <div style={{ borderTop:'1px solid var(--bg-border)', paddingTop:16 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'var(--text-secondary)', marginBottom:12 }}>WORKFLOW CHAINING</div>
                <Field label="Chain from previous step (JSONPath)">
                  <Input value={activeStep.chain_path || ''} onChange={v => updateStep({ chain_path: v })} placeholder="e.g. $.data.id" />
                </Field>
                <div style={{ fontSize:11, color:'var(--text-muted)', marginTop:6 }}>
                  Extracts value from previous API response and injects it into this step.
                </div>
              </div>
            </>
          ) : (
            <div style={{ color:'var(--text-muted)', textAlign:'center', paddingTop:40 }}>Add a step to start</div>
          )}
        </div>
      </div>

      {showImportModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:999, display:'flex', alignItems:'center', justifyItems:'center', justifyContent:'center' }}>
          <div style={{ background:'var(--bg-surface)', padding:32, borderRadius:16, width:400, border:'1px solid var(--bg-border)' }}>
            <h3 style={{ fontSize:20, fontWeight:700, marginBottom:16 }}>Import OpenAPI Spec</h3>
            <Input value={importUrl} onChange={setImportUrl} placeholder="https://api.example.com/openapi.json" />
            <div style={{ display:'flex', gap:12, marginTop:24 }}>
              <button disabled={importing} onClick={handleImport} style={{ flex:1, height:40, background:'var(--accent)', color:'white', border:'none', borderRadius:8, cursor:'pointer' }}>
                {importing ? 'Analyzing...' : 'Analyze with AI'}
              </button>
              <button disabled={importing} onClick={() => setShowImportModal(false)} style={{ flex:1, height:40, background:'transparent', color:'var(--text-primary)', border:'1px solid var(--bg-border)', borderRadius:8, cursor:'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCurlModal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.8)', zIndex:999, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'var(--bg-surface)', padding:32, borderRadius:16, width:500, border:'1px solid var(--bg-border)' }}>
            <h3 style={{ fontSize:20, fontWeight:700, marginBottom:16 }}>Import from cURL</h3>
            <p style={{ color:'var(--text-secondary)', fontSize:13, marginBottom:16 }}>Paste a production cURL command to sync headers and auth instantly.</p>
            <textarea 
              value={tempCurl} 
              onChange={e => setTempCurl(e.target.value)} 
              rows={10} 
              placeholder="curl --request POST --url https://api..." 
              style={{ ...textareaStyle, marginBottom: 20, height: 200 }}
            />
            <div style={{ display:'flex', gap:12 }}>
              <button onClick={handleCurlImport} style={{ flex:1, height:40, background:'var(--accent)', color:'white', border:'none', borderRadius:8, cursor:'pointer', fontWeight:600 }}>
                Import Command
              </button>
              <button onClick={() => setShowCurlModal(false)} style={{ flex:1, height:40, background:'transparent', color:'var(--text-primary)', border:'1px solid var(--bg-border)', borderRadius:8, cursor:'pointer' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Reusable styled components
const inputStyle: React.CSSProperties = {
  width:'100%', background:'var(--bg-base)', border:'1px solid var(--bg-border)',
  color:'var(--text-primary)', padding:'8px 12px', borderRadius:8, fontSize:13,
  fontFamily:'inherit', outline:'none', boxSizing:'border-box',
}
const selectStyle: React.CSSProperties = { ...inputStyle, cursor:'pointer', height:35 }
const textareaStyle: React.CSSProperties = { ...inputStyle, fontFamily:'var(--app-font-mono)', fontSize:12, resize:'vertical' }

const actionBtnStyle: React.CSSProperties = {
  background:'var(--accent)', border:'none', color:'white',
  padding:'0 16px', height: 35, borderRadius:8, fontSize:13, cursor:'pointer',
  display:'flex', alignItems:'center', gap:6, fontFamily:'inherit', fontWeight:600
}

const ghostBtnStyle: React.CSSProperties = {
  background:'transparent', border:'1px solid var(--bg-border)', color:'var(--text-secondary)',
  padding:'0 16px', height: 35, borderRadius:8, fontSize:13, cursor:'pointer',
  display:'flex', alignItems:'center', gap:6, fontFamily:'inherit', fontWeight:600
}

const textEllipsis = { textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }

function Input({ value, onChange, placeholder, onBlur }: { value:string; onChange:(v:string)=>void; placeholder?:string; onBlur?:()=>void }) {
  return <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} onBlur={onBlur} style={inputStyle} />
}

function Field({ label, children }: { label:string; children:React.ReactNode }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
      <label style={{ fontSize:12, color:'var(--text-secondary)', fontWeight:500 }}>{label}</label>
      {children}
    </div>
  )
}
