import { C } from '../../constants/colours';
import { GL, BackBtn, Avatar } from '../../components/UI';
const f = "'Manrope',system-ui";
const MEDALS=['🥇','🥈','🥉'];
export const ChallengeDetailScreen = ({ selectedChallenge, challengeLeaderboard, onBack }) => {
  const ch = selectedChallenge;
  const daysLeft = ch?.ends_at ? Math.max(0,Math.ceil((new Date(ch.ends_at)-new Date())/86400000)) : null;
  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:f, overflowY:'auto', paddingBottom:'80px' }}>
      <div style={{ maxWidth:'420px', margin:'0 auto', padding:'20px 20px 0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px', paddingTop:'20px', marginBottom:'20px' }}><BackBtn onClick={onBack} /><h2 style={{ color:C.dark, fontSize:'18px', fontWeight:'800', margin:0, flex:1, fontFamily:f }}>{ch?.title}</h2></div>
        {ch?.slogan && <p style={{ color:C.mid, fontSize:'14px', margin:'0 0 16px', lineHeight:1.5, fontFamily:f }}>{ch.slogan}</p>}
        <div style={{ display:'flex', gap:'10px', marginBottom:'16px' }}>
          <div style={{ flex:1, background:C.card, border:`1px solid ${C.border}`, borderRadius:'12px', padding:'12px', textAlign:'center' }}><p style={{ color:C.dark, fontSize:'18px', fontWeight:'900', margin:'0 0 2px', fontFamily:f }}>{ch?.target_value}{ch?.challenge_type==='distance'?'km':' sessions'}</p><p style={{ color:C.mid, fontSize:'11px', margin:0, fontFamily:f }}>Target</p></div>
          {daysLeft!==null && <div style={{ flex:1, background:C.card, border:`1px solid ${C.border}`, borderRadius:'12px', padding:'12px', textAlign:'center' }}><p style={{ color:daysLeft<=2?C.red:C.green, fontSize:'18px', fontWeight:'900', margin:'0 0 2px', fontFamily:f }}>{daysLeft}</p><p style={{ color:C.mid, fontSize:'11px', margin:0, fontFamily:f }}>Days left</p></div>}
        </div>
        <div style={{ marginTop:'8px', display:'flex', flexDirection:'column', gap:'10px' }}>{challengeLeaderboard.map((row,i)=>(<div key={i} style={{ background:i<3?C.greenLight:C.card, border:`1px solid ${i<3?C.greenBorder:C.border}`, borderRadius:'14px', padding:'14px 16px', display:'flex', alignItems:'center', gap:'12px' }}><span style={{ fontSize:i<3?'22px':'14px', width:'28px', textAlign:'center', fontFamily:f }}>{i<3?MEDALS[i]:i+1}</span><Avatar username={row.username} /><p style={{ color:C.dark, fontSize:'14px', fontWeight:'700', margin:0, flex:1, fontFamily:f }}>{row.username}</p><p style={{ color:i===0?C.green:C.dark, fontSize:'16px', fontWeight:'900', margin:0, fontFamily:f }}>{row.value}{ch?.challenge_type==='distance'?'km':''}</p></div>))}</div>
      </div>
    </div>
  );
};
