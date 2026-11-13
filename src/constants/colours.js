export const C = {
  bg:'#f5f1d4', card:'#e8e3cf', raised:'#ddd8c4', border:'#cdc8b4',
  green:'#64974a', greenLight:'rgba(100,151,74,0.12)', greenBorder:'rgba(100,151,74,0.32)',
  dark:'#1c1c18', mid:'#5a5750', light:'#9c9c8d',
  red:'#b83232', orange:'#b7770d', blue:'#2563a8',
  premium:'#9b7fd4', premiumLight:'rgba(155,127,212,0.12)',
  pro:'#d4843f', proLight:'rgba(212,132,63,0.12)',
  white:'#ffffff',
};
export const gbtn = (bg, color, extra={}) => ({
  width:'100%', padding:'17px', borderRadius:'12px', fontSize:'14px',
  fontWeight:'700', letterSpacing:'0.08em', textTransform:'uppercase',
  cursor:'pointer', border:'none', background:bg, color,
  fontFamily:"'Manrope',system-ui", ...extra,
});
export const S = {
  inp:{ width:'100%', boxSizing:'border-box', background:'#e8e3cf', border:'1px solid #cdc8b4', borderRadius:'12px', color:'#1c1c18', fontSize:'15px', padding:'16px', outline:'none', fontFamily:"'Manrope',system-ui" },
  wrap:{ minHeight:'100vh', background:'#f5f1d4', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', fontFamily:"'Manrope',system-ui", padding:'40px 28px', boxSizing:'border-box' },
  col:{ display:'flex', flexDirection:'column', width:'100%', maxWidth:'360px', gap:'14px' },
};
