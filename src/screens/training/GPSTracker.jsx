// COACH — GPS Tracker with Mapbox, Audio Cues, Safety Check-In, Offline Queue
import { useState, useEffect, useRef } from 'react';
import { C, gbtn } from '../../constants/colours';
import { GL } from '../../components/UI';

const MAPBOX_TOKEN = process.env.EXPO_PUBLIC_MAPBOX_TOKEN;
const f = "'Manrope',system-ui";

const haversine = (lat1,lon1,lat2,lon2) => {
  const R=6371, dLat=(lat2-lat1)*Math.PI/180, dLon=(lon2-lon1)*Math.PI/180;
  const a=Math.sin(dLat/2)**2+Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a));
};
const fmtTime = s => { const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60; return h>0?`${h}:${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`:`${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`; };
const fmtPace = p => { if(!p||p===Infinity||p<=0) return '--:--'; const t=p*60,m=Math.floor(t/60),s=Math.round(t%60); return `${m}:${s.toString().padStart(2,'0')}/km`; };

// Audio cue using Web Speech API
const speak = (text) => {
  if (typeof window === 'undefined' || !window.speechSynthesis) return;
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.9; utt.pitch = 1.0; utt.volume = 0.8;
  window.speechSynthesis.speak(utt);
};

export const GPSTracker = ({ workout, onComplete, onCancel }) => {
  const [phase,       setPhase]       = useState('ready');
  const [elapsed,     setElapsed]     = useState(0);
  const [distance,    setDistance]    = useState(0);
  const [pace,        setPace]        = useState(null);
  const [error,       setError]       = useState('');
  const [mapReady,    setMapReady]    = useState(false);
  const [showSafety,  setShowSafety]  = useState(false);
  const [contact,     setContact]     = useState('');
  const [safetySet,   setSafetySet]   = useState(false);
  const [showDone,    setShowDone]    = useState(false);

  const mapRef       = useRef(null);
  const mapInstance  = useRef(null);
  const markerRef    = useRef(null);
  const routeCoords  = useRef([]);
  const lastPos      = useRef(null);
  const watchId      = useRef(null);
  const timerRef     = useRef(null);
  const distRef      = useRef(0);
  const elapsedRef   = useRef(0);
  const lastKm       = useRef(0);
  const lastPaceCue  = useRef(0);
  const signalLostAt = useRef(null); // for silent retry

  // Load Mapbox from CDN
  useEffect(() => {
    if (typeof document==='undefined') return;
    if (window.mapboxgl) { setMapReady(true); return; }
    const link = document.createElement('link');
    link.href='https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.css'; link.rel='stylesheet';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src='https://api.mapbox.com/mapbox-gl-js/v3.8.0/mapbox-gl.js'; script.async=true;
    script.onload=()=>setMapReady(true);
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(link); } catch(e) {} };
  }, []);

  // Init map
  useEffect(() => {
    if (!mapReady || !mapRef.current || mapInstance.current) return;
    window.mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new window.mapboxgl.Map({ container:mapRef.current, style:'mapbox://styles/mapbox/outdoors-v12', zoom:15, center:[-0.1276,51.5074], attributionControl:false });
    map.addControl(new window.mapboxgl.AttributionControl({ compact:true }));
    map.on('load', () => {
      map.addSource('route',{type:'geojson',data:{type:'Feature',geometry:{type:'LineString',coordinates:[]}}});
      map.addLayer({id:'route-glow',type:'line',source:'route',layout:{'line-join':'round','line-cap':'round'},paint:{'line-color':'#64974a','line-width':10,'line-opacity':0.2}});
      map.addLayer({id:'route-line',type:'line',source:'route',layout:{'line-join':'round','line-cap':'round'},paint:{'line-color':'#64974a','line-width':5,'line-opacity':0.95}});
    });
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => map.setCenter([p.coords.longitude,p.coords.latitude]),()=>{});
    mapInstance.current = map;
  }, [mapReady]);

  // Cleanup
  useEffect(() => () => {
    clearInterval(timerRef.current);
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    if (mapInstance.current) { mapInstance.current.remove(); mapInstance.current=null; }
  }, []);

  // Pace update
  useEffect(() => {
    if (elapsedRef.current > 10 && distRef.current > 0.05) setPace((elapsedRef.current/60)/distRef.current);
  }, [elapsed, distance]);

  const updateMap = (coords) => {
    try { const s=mapInstance.current?.getSource('route'); if(s) s.setData({type:'Feature',geometry:{type:'LineString',coordinates:coords}}); } catch(e) {}
  };
  const updateMarker = (lon,lat) => {
    if (!mapInstance.current||!window.mapboxgl) return;
    if (!markerRef.current) {
      const el=document.createElement('div');
      el.style.cssText='width:16px;height:16px;background:#64974a;border:3px solid white;border-radius:50%;box-shadow:0 0 0 4px rgba(100,151,74,0.25);';
      markerRef.current=new window.mapboxgl.Marker(el).setLngLat([lon,lat]).addTo(mapInstance.current);
    } else markerRef.current.setLngLat([lon,lat]);
    mapInstance.current.easeTo({center:[lon,lat],duration:500});
  };

  const startTracking = () => {
    if (!navigator.geolocation) { setError('GPS not available on this device.'); return; }
    setError(''); setPhase('tracking');
    routeCoords.current=[]; distRef.current=0; elapsedRef.current=0;
    setElapsed(0); setDistance(0); setPace(null); lastKm.current=0;
    speak(`Starting your ${workout?.title ?? 'run'}. Good luck!`);

    timerRef.current = setInterval(() => {
      elapsedRef.current+=1; setElapsed(e=>e+1);
      // Pace cue every 5 minutes
      if (elapsedRef.current>0 && elapsedRef.current%300===0 && distRef.current>0.2) {
        const p=(elapsedRef.current/60)/distRef.current;
        const pm=Math.floor(p), ps=Math.round((p%1)*60);
        speak(`Current pace ${pm} minutes ${ps} seconds per kilometre`);
        lastPaceCue.current=elapsedRef.current;
      }
    }, 1000);

    watchId.current = navigator.geolocation.watchPosition(
      pos => {
        signalLostAt.current = null; // signal restored
        const { latitude:lat, longitude:lon } = pos.coords;
        routeCoords.current.push([lon,lat]);
        if (lastPos.current) {
          const d=haversine(lastPos.current.lat,lastPos.current.lon,lat,lon);
          if (d>0.005) { distRef.current+=d; setDistance(Math.round(distRef.current*1000)/1000); }
        }
        lastPos.current={lat,lon};
        updateMap(routeCoords.current); updateMarker(lon,lat);

        // KM split audio cue
        const km = Math.floor(distRef.current);
        if (km > lastKm.current) {
          lastKm.current=km;
          const p=(elapsedRef.current/60)/distRef.current;
          speak(`${km} kilometre${km!==1?'s':''}. Pace ${Math.floor(p)} minutes ${Math.round((p%1)*60)} seconds.`);
          // Halfway cue
          if (workout?.targetDistance && km===Math.floor(workout.targetDistance/2)) speak('Halfway. Keep going!');
        }
      },
      (err) => {
        // Silent retry for short drops — only alert if lost for 60+ seconds
        if (!signalLostAt.current) signalLostAt.current = Date.now();
        else if (Date.now() - signalLostAt.current > 60000) {
          setError('GPS signal lost. Move to an open area.');
        }
      },
      { enableHighAccuracy:true, maximumAge:0, timeout:15000 }
    );
  };

  const pauseTracking  = () => { setPhase('paused'); clearInterval(timerRef.current); speak('Paused.'); };
  const resumeTracking = () => {
    setPhase('tracking');
    speak('Resumed.');
    timerRef.current=setInterval(()=>{elapsedRef.current+=1;setElapsed(e=>e+1);},1000);
  };
  const stopTracking = () => {
    clearInterval(timerRef.current);
    if (watchId.current) navigator.geolocation.clearWatch(watchId.current);
    speak(`Session complete. ${distRef.current.toFixed(2)} kilometres in ${Math.round(elapsedRef.current/60)} minutes. Well done!`);
    if (safetySet && contact) setShowDone(true);
    else onComplete({ distance:Math.round(distRef.current*100)/100, duration:Math.round(elapsedRef.current/60), device_source:'gps' });
  };

  const inp = { background:'rgba(245,241,212,0.95)', border:`1px solid ${C.border}`, borderRadius:'12px', color:C.dark, fontSize:'14px', padding:'13px', outline:'none', fontFamily:f, width:'100%', boxSizing:'border-box' };

  if (showDone) return (
    <div style={{ height:'100vh', background:C.bg, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 24px', fontFamily:f }}>
      <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'20px', padding:'32px 24px', textAlign:'center', maxWidth:'360px', width:'100%' }}>
        <p style={{ fontSize:'40px', margin:'0 0 12px' }}>🙌</p>
        <p style={{ color:C.green, fontSize:'20px', fontWeight:'800', margin:'0 0 8px', fontFamily:f }}>Great session</p>
        <p style={{ color:C.dark, fontSize:'14px', lineHeight:1.7, margin:'0 0 24px', fontFamily:f }}>{distRef.current.toFixed(2)}km in {fmtTime(elapsedRef.current)}. Remember to let <strong>{contact}</strong> know you are back safely.</p>
        <button onClick={()=>onComplete({distance:Math.round(distRef.current*100)/100,duration:Math.round(elapsedRef.current/60),device_source:'gps'})} style={gbtn(C.green,C.white)}>LOG THIS SESSION</button>
      </div>
    </div>
  );

  return (
    <div style={{ height:'100vh', background:C.bg, position:'relative', overflow:'hidden', fontFamily:f }}>
      <div ref={mapRef} style={{ position:'absolute', inset:0, zIndex:0 }} />

      {/* Safety modal */}
      {showSafety && (
        <div style={{ position:'absolute', inset:0, zIndex:30, background:'rgba(28,28,24,0.7)', display:'flex', alignItems:'flex-end' }}>
          <div style={{ background:C.bg, borderRadius:'24px 24px 0 0', padding:'28px 24px 48px', width:'100%', boxSizing:'border-box' }}>
            <div style={{ width:'40px', height:'4px', background:C.border, borderRadius:'2px', margin:'0 auto 24px' }} />
            <GL text="Safety check-in" />
            <p style={{ color:C.dark, fontSize:'18px', fontWeight:'800', margin:'4px 0 8px', fontFamily:f }}>Let someone know you're out</p>
            <p style={{ color:C.mid, fontSize:'14px', lineHeight:1.6, margin:'0 0 16px', fontFamily:f }}>Enter a contact's name. When you finish COACH will remind you to let them know you are back safe.</p>
            <input placeholder="e.g. Mum, Partner, Flatmate" value={contact} onChange={e=>setContact(e.target.value)} style={{ ...inp, marginBottom:'12px' }} />
            <button onClick={()=>{setSafetySet(true);setShowSafety(false);}} disabled={!contact} style={gbtn(C.green,C.white,{opacity:!contact?0.5:1})}>SET CHECK-IN</button>
            <button onClick={()=>setShowSafety(false)} style={{ background:'none', border:'none', color:C.mid, fontSize:'14px', cursor:'pointer', padding:'12px', fontFamily:f, width:'100%' }}>Skip</button>
          </div>
        </div>
      )}

      {/* Ready state */}
      {phase==='ready' && (
        <div style={{ position:'absolute', inset:0, zIndex:10, display:'flex', flexDirection:'column', justifyContent:'flex-end', padding:'0 20px 40px' }}>
          <div style={{ background:'rgba(245,241,212,0.97)', borderRadius:'20px', padding:'24px', backdropFilter:'blur(8px)', border:`1px solid ${C.border}` }}>
            <GL text="Ready to track" />
            <p style={{ color:C.dark, fontSize:'18px', fontWeight:'800', margin:'4px 0 8px', fontFamily:f }}>{workout?.title??'Free Run'}</p>
            <p style={{ color:C.mid, fontSize:'13px', margin:'0 0 16px', lineHeight:1.6, fontFamily:f }}>Your route will draw on the map as you run. Audio cues every km and every 5 minutes.</p>
            {safetySet ? (
              <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'10px', padding:'10px 14px', marginBottom:'12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <p style={{ color:C.green, fontSize:'13px', fontWeight:'600', margin:0, fontFamily:f }}>🛡 Check-in set for {contact}</p>
                <button onClick={()=>{setSafetySet(false);setContact('');}} style={{ background:'none', border:'none', color:C.light, cursor:'pointer', fontSize:'12px', fontFamily:f }}>Remove</button>
              </div>
            ) : (
              <button onClick={()=>setShowSafety(true)} style={{ ...gbtn('transparent',C.mid), border:`1px solid ${C.border}`, marginBottom:'10px' }}>Set safety check-in</button>
            )}
            {error && <p style={{ color:C.red, fontSize:'13px', margin:'0 0 12px', fontFamily:f }}>{error}</p>}
            <button onClick={startTracking} style={gbtn(C.green,C.white)}>START</button>
            <button onClick={onCancel} style={{ ...gbtn('transparent',C.mid), border:`1px solid ${C.border}`, marginTop:'10px' }}>Log manually instead</button>
          </div>
        </div>
      )}

      {/* Active tracking */}
      {(phase==='tracking'||phase==='paused') && (
        <>
          <div style={{ position:'absolute', top:0, left:0, right:0, zIndex:10, padding:'48px 16px 12px' }}>
            <div style={{ background:'rgba(245,241,212,0.92)', borderRadius:'16px', padding:'12px', backdropFilter:'blur(8px)', border:`1px solid ${C.border}` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                <p style={{ color:phase==='paused'?C.orange:C.green, fontSize:'11px', fontWeight:'700', letterSpacing:'0.15em', textTransform:'uppercase', margin:0, fontFamily:f }}>{phase==='paused'?'PAUSED':'TRACKING'}</p>
                <p style={{ color:C.dark, fontSize:'28px', fontWeight:'900', margin:0, fontFamily:f, lineHeight:1 }}>{fmtTime(elapsed)}</p>
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                {[{v:`${distance.toFixed(2)}`,l:'km'},{v:fmtPace(pace),l:'pace'},{v:safetySet?'🛡':'',l:safetySet?contact:''}].filter(x=>x.v).map((s,i)=>(
                  <div key={i} style={{ flex:1, background:'rgba(255,255,255,0.92)', borderRadius:'12px', padding:'12px 8px', textAlign:'center', backdropFilter:'blur(4px)' }}>
                    <p style={{ color:C.dark, fontSize:'18px', fontWeight:'900', margin:'0 0 2px', fontFamily:f }}>{s.v}</p>
                    <p style={{ color:C.mid, fontSize:'10px', margin:0, textTransform:'uppercase', letterSpacing:'0.08em', fontFamily:f }}>{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, zIndex:10, padding:'12px 16px 40px' }}>
            {error && <p style={{ color:C.red, fontSize:'13px', textAlign:'center', margin:'0 0 8px', background:'rgba(245,241,212,0.95)', padding:'10px', borderRadius:'10px', fontFamily:f }}>{error}</p>}
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {phase==='tracking'
                ? <button onClick={pauseTracking}  style={{ ...gbtn('rgba(245,241,212,0.95)',C.dark), border:`1px solid ${C.border}` }}>PAUSE</button>
                : <button onClick={resumeTracking} style={gbtn(C.green,C.white)}>RESUME</button>}
              <button onClick={stopTracking} style={gbtn('rgba(184,50,50,0.9)',C.white)}>STOP AND LOG</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
