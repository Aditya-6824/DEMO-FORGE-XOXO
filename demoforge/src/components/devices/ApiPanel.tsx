import { useState, useEffect } from 'react'

interface Props {
  method: string
  endpoint: string
  requestBody: string
  responseBody: string
  statusCode: number
  responseMs: number
  stepKey?: string
}

type AnimState = 'idle' | 'sending' | 'receiving' | 'done'

function highlightJSON(json: string): string {
  if (!json) return ''
  try {
    // If it's already an object, just stringify it
    let obj = json
    if (typeof json === 'string') {
      try { obj = JSON.parse(json) } catch { return json }
    }
    const formatted = JSON.stringify(obj, null, 2)
    return formatted
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"([^"]+)"(\s*:)/g, '<span style="color:#79B8FF">"$1"</span>$2')
      .replace(/:\s*"([^"]+)"/g, ': <span style="color:#9ECE6A">"$1"</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span style="color:#E8A272">$1</span>')
      .replace(/:\s*(true|false|null)/g, ': <span style="color:#BB9AF7">$1</span>')
  } catch {
    return String(json)
  }
}

function addLineNumbers(html: string): string {
  const lines = html.split('\n')
  return lines.map((line, i) =>
    `<div style="display:flex;min-height:22px"><span style="color:#3A4568;width:36px;text-align:right;padding-right:12px;user-select:none;flex-shrink:0">${i + 1}</span><span style="flex:1">${line || ' '}</span></div>`
  ).join('')
}

const methodColors: Record<string, { bg: string; text: string; border: string }> = {
  GET:    { bg: '#1A3A2A', text: '#3FB950', border: '#238636' },
  POST:   { bg: '#1A2A3A', text: '#58A6FF', border: '#1F6FEB' },
  PUT:    { bg: '#2A2A1A', text: '#E3B341', border: '#9E6A03' },
  DELETE: { bg: '#3A1A1A', text: '#F85149', border: '#DA3633' },
  PATCH:  { bg: '#2A1A3A', text: '#BC8CFF', border: '#8957E5' },
}

export function ApiPanel({ method, endpoint, requestBody, responseBody, statusCode, responseMs, stepKey }: Props) {
  const [anim, setAnim] = useState<AnimState>('idle')
  const [tab, setTab] = useState<'request' | 'response'>('response')
  const [progressWidth, setProgressWidth] = useState(0)

  useEffect(() => {
    setTimeout(() => {
      setAnim('sending')
      setProgressWidth(0)
    }, 0)
    const p1 = setTimeout(() => setProgressWidth(40), 50)
    const t1 = setTimeout(() => { setAnim('receiving'); setProgressWidth(75) }, 500)
    const t2 = setTimeout(() => { setAnim('done'); setProgressWidth(100) }, 1100)
    const t3 = setTimeout(() => setProgressWidth(0), 1400)
    return () => { clearTimeout(p1); clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [endpoint, requestBody, stepKey])

  const mc = methodColors[method] || methodColors.POST
  const isSuccess = statusCode >= 200 && statusCode < 300

  const tabs: Array<{ key: 'request' | 'response'; label: string }> = [
    { key: 'request', label: 'Request' },
    { key: 'response', label: 'Response' },
  ]

  return (
    <div style={{
      background: '#0D1117', borderRadius: 12,
      border: '1px solid #21262D', overflow: 'hidden',
      fontFamily: '"Fira Code", monospace',
      boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
    }}>
      {/* Progress bar */}
      <div style={{
        height: 2, background: '#21262D', overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${progressWidth}%`,
          background: anim === 'done'
            ? (isSuccess ? '#3FB950' : '#F85149')
            : 'linear-gradient(90deg, #4461F2, #6C8BFF)',
          transition: 'width 0.4s cubic-bezier(0.16,1,0.3,1), background 0.3s ease',
        }} />
      </div>

      {/* Header */}
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid #21262D',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{
            fontSize: 10, fontWeight: 800, padding: '3px 7px', borderRadius: 4,
            background: mc.bg, color: mc.text, border: `1px solid ${mc.border}`,
            letterSpacing: '0.5px', flexShrink: 0,
          }}>{method}</span>
          <span style={{
            color: '#8B95B5', fontSize: 12, overflow: 'hidden',
            textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{endpoint}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {anim !== 'done' ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 7, height: 7, borderRadius: '50%',
                background: anim === 'sending' ? '#E3B341' : '#3FB950',
                animation: 'pulse 0.8s infinite',
              }} />
              <span style={{
                color: anim === 'sending' ? '#E3B341' : '#3FB950',
                fontSize: 11, fontWeight: 600,
              }}>
                {anim === 'sending' ? 'Sending...' : 'Receiving...'}
              </span>
            </div>
          ) : (
            <>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
                background: isSuccess ? '#1A3A2A' : '#3A1A1A',
                color: isSuccess ? '#3FB950' : '#F85149',
              }}>{statusCode}</span>
              <span style={{ color: '#4A5578', fontSize: 11 }}>{responseMs}ms</span>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', borderBottom: '1px solid #21262D',
        background: 'rgba(13,17,23,0.5)',
      }}>
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '9px 16px', fontSize: 12, cursor: 'pointer',
              background: 'transparent', border: 'none', outline: 'none',
              color: tab === t.key ? '#F0F4FF' : '#4A5578',
              borderBottom: tab === t.key ? '2px solid #4461F2' : '2px solid transparent',
              fontFamily: 'inherit', fontWeight: tab === t.key ? 600 : 400,
              transition: 'all 0.15s ease',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Body with line numbers */}
      <div style={{
        maxHeight: 300, overflow: 'auto', padding: '12px 0',
        opacity: anim === 'done' ? 1 : 0.25,
        transform: anim === 'done' ? 'translateY(0)' : 'translateY(4px)',
        transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)',
      }}>
        <div
          style={{ margin: 0, fontSize: 12, lineHeight: '22px', color: '#8B95B5' }}
          dangerouslySetInnerHTML={{
            __html: addLineNumbers(
              highlightJSON(tab === 'request' ? requestBody : responseBody)
            )
          }}
        />
      </div>

      {/* Status bar */}
      {anim === 'done' && (
        <div style={{
          padding: '7px 16px', borderTop: '1px solid #21262D',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'rgba(13,17,23,0.5)',
        }}>
          <span style={{ color: '#3FB950', fontSize: 11, display: 'flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3FB950', display: 'inline-block' }} />
            Connected
          </span>
          <span style={{ color: '#3A4568', fontSize: 11 }}>
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  )
}
