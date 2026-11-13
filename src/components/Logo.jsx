import { C } from '../constants/colours';
const f = "'Manrope',system-ui";
export const CoachIcon = ({ size=48 }) => (
  <div style={{ width:size, height:size, background:C.bg, borderRadius:size*0.22, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden', flexShrink:0 }}>
    <img src="/brand/coach-icon.png" alt="COACH" style={{ width:size*0.72, height:size*0.72, objectFit:'contain' }} />
  </div>
);
export const LogoText = ({ large=false }) => {
  const h = large ? 52 : 30;
  return (
    <div style={{ display:'flex', alignItems:'flex-end' }}>
      <img src="/brand/coach-icon.png" alt="C" style={{ height:h, width:'auto', objectFit:'contain', display:'block' }} />
      <span style={{ fontFamily:f, fontSize:large?'44px':'26px', fontWeight:'800', color:C.dark, letterSpacing:'-0.01em', lineHeight:1, marginLeft:large?'-2px':'-1px', paddingBottom:large?'2px':'1px' }}>OACH</span>
    </div>
  );
};
export const LogoHero = () => (
  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'12px' }}>
    <LogoText large />
    <p style={{ color:C.light, fontSize:'11px', letterSpacing:'0.18em', textTransform:'uppercase', margin:0, fontWeight:'500', fontFamily:f }}>Train smart. Go further.</p>
  </div>
);
