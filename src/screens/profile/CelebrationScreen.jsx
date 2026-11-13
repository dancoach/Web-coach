import { C, gbtn } from '../../constants/colours';
const f = "'Manrope',system-ui";

export const CelebrationScreen = ({ celebrationData, celebrationStats, onShare, onNextEvent, onDashboard }) => (
  <div style={{ minHeight:'100vh', background:C.bg, fontFamily:f, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 28px' }}>
    <div style={{ maxWidth:'360px', width:'100%', textAlign:'center' }}>
      <p style={{ fontSize:'64px', margin:'0 0 16px' }}>🏅</p>
      <h1 style={{ color:C.green, fontSize:'28px', fontWeight:'900', margin:'0 0 8px', fontFamily:f, lineHeight:1.2 }}>You did it!</h1>
      <p style={{ color:C.dark, fontSize:'18px', fontWeight:'700', margin:'0 0 24px', fontFamily:f }}>{celebrationStats?.eventName}</p>
      {celebrationData?.response && (
        <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderLeft:`3px solid ${C.green}`, borderRadius:'14px', padding:'16px', marginBottom:'24px', textAlign:'left' }}>
          <p style={{ color:C.mid, fontSize:'11px', letterSpacing:'0.1em', textTransform:'uppercase', margin:'0 0 6px', fontFamily:f }}>Your words</p>
          <p style={{ color:C.dark, fontSize:'14px', lineHeight:1.7, margin:0, fontFamily:f }}>{celebrationData.response}</p>
        </div>
      )}
      {celebrationStats && (
        <div style={{ display:'flex', gap:'10px', marginBottom:'24px' }}>
          {[
            { v:celebrationStats.sessions, l:'Sessions' },
            { v:`${celebrationStats.distance}km`, l:'Covered' },
            { v:`${celebrationStats.streak}d`, l:'Best streak' },
          ].map((s,i)=>(
            <div key={i} style={{ flex:1, background:C.card, border:`1px solid ${C.border}`, borderRadius:'14px', padding:'12px' }}>
              <p style={{ color:C.green, fontSize:'20px', fontWeight:'900', margin:'0 0 2px', fontFamily:f, lineHeight:1 }}>{s.v}</p>
              <p style={{ color:C.mid, fontSize:'11px', margin:0, textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:f }}>{s.l}</p>
            </div>
          ))}
        </div>
      )}
      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
        <button onClick={onShare}     style={gbtn(C.green,C.white)}>SHARE MY ACHIEVEMENT</button>
        <button onClick={onNextEvent} style={{ ...gbtn('transparent',C.green), border:`1px solid ${C.green}` }}>ADD NEXT EVENT</button>
        <button onClick={onDashboard} style={{ ...gbtn('transparent',C.mid), border:`1px solid ${C.border}` }}>GO TO DASHBOARD</button>
      </div>
    </div>
  </div>
);
