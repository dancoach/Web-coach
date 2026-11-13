import { C } from '../../constants/colours';
import { GL, BackBtn, Avatar } from '../../components/UI';
const f = "'Manrope',system-ui";
const MEDALS = ['🥇','🥈','🥉'];
export const LeaderboardScreen = ({ leaderboard, onBack }) => (
  <div style={{ minHeight:'100vh', background:C.bg, fontFamily:f, overflowY:'auto', paddingBottom:'80px' }}>
    <div style={{ maxWidth:'420px', margin:'0 auto', padding:'20px 20px 0' }}>
      <div style={{ display:'flex', alignItems:'center', gap:'16px', paddingTop:'20px', marginBottom:'24px' }}>
        <BackBtn onClick={onBack} />
        <h2 style={{ color:C.dark, fontSize:'20px', fontWeight:'800', margin:0, fontFamily:f }}>Leaderboard</h2>
      </div>
      <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'14px', padding:'12px 16px', marginBottom:'16px' }}>
        <GL text="Ranked by current streak" />
        <p style={{ color:C.mid, fontSize:'13px', margin:'4px 0 0', fontFamily:f }}>Consistency wins. The athletes here show up every day.</p>
      </div>
      {leaderboard.map((row,i) => (
        <div key={i} style={{ background:i<3?C.greenLight:C.card, border:`1px solid ${i<3?C.greenBorder:C.border}`, borderRadius:'14px', padding:'14px 16px', marginBottom:'10px', display:'flex', alignItems:'center', gap:'14px' }}>
          <span style={{ fontSize:i<3?'24px':'16px', fontWeight:'700', color:C.mid, width:'32px', textAlign:'center', fontFamily:f }}>{i<3?MEDALS[i]:i+1}</span>
          <Avatar username={row.profiles?.username} />
          <div style={{ flex:1 }}>
            <p style={{ color:C.dark, fontSize:'14px', fontWeight:'700', margin:'0 0 2px', fontFamily:f }}>{row.profiles?.username??'Athlete'}</p>
            <p style={{ color:C.mid, fontSize:'12px', margin:0, fontFamily:f }}>Best streak: {row.longest_streak??0} days</p>
          </div>
          <div style={{ textAlign:'right' }}>
            <p style={{ color:i<3?C.green:C.dark, fontSize:'20px', fontWeight:'900', margin:'0 0 2px', fontFamily:f, lineHeight:1 }}>{row.current_streak??0}</p>
            <p style={{ color:C.light, fontSize:'10px', margin:0, textTransform:'uppercase', letterSpacing:'0.06em', fontFamily:f }}>days</p>
          </div>
        </div>
      ))}
      {leaderboard.length === 0 && (
        <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'16px', padding:'40px 24px', textAlign:'center' }}>
          <p style={{ color:C.dark, fontSize:'16px', fontWeight:'700', margin:'0 0 8px', fontFamily:f }}>No data yet</p>
          <p style={{ color:C.mid, fontSize:'13px', margin:0, fontFamily:f }}>Start logging sessions to appear on the leaderboard.</p>
        </div>
      )}
    </div>
  </div>
);
