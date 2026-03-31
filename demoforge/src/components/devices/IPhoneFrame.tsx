import { IPhoneMockup } from 'react-device-mockup'

interface Props {
  content: string       // HTML string to render inside screen
  bgColor?: string
}

export function IPhoneFrame({ content, bgColor = '#fff' }: Props) {
  return (
    <div style={{ filter: 'drop-shadow(0 40px 80px rgba(0,0,0,0.8))' }}>
      <IPhoneMockup
        screenType="island"
        screenWidth={260}
        frameColor="#1C1C1E"
        statusbarColor={bgColor}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            background: bgColor,
            overflow: 'hidden',
            position: 'relative',
          }}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </IPhoneMockup>
    </div>
  )
}
