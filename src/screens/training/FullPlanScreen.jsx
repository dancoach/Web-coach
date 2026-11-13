import { useState, useEffect } from 'react';
import { C } from '../../constants/colours';
import { GL, Card, BackBtn, Tag } from '../../components/UI';
import { supabase } from '../../services/supabase';
import { EVENTS } from '../../constants/data';

const f = "'Manrope',system-ui";

export const FullPlanScreen = ({ userId, onBack }) => {
  const [plan, setPlan] = useState(null);
  useEffect(() => {
    supabase.from('training_plans').select('plan_data').eq('user_id',userId).maybeSingle().then(({data})=>{ if(data?.plan_data) setPlan(data.plan_data); });
  }, [userId]);

  const phases = plan?.phaseTimeline ?? plan?.phases ?? [
    {weekRange:'1-4', name:'Base Building', focus:'Building aerobic base and training consistency'},
    {weekRange:'5-8', name:'Development', focus:'Increasing volume and introducing event-specific work'},
    {weekRange:'9-12', name:'Peak Training', focus:'Maximum training load — where real fitness is forged'},
    {weekRange:'13-16', name:'Taper and Race', focus:'Reducing volume, sharpening fitness, trusting the training'},
  ];

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:f, overflowY:'auto', paddingBottom:'80px' }}>
      <div style={{ maxWidth:'420px', margin:'0 auto', padding:'20px 20px 0' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px', paddingTop:'20px', marginBottom:'24px' }}>
          <BackBtn onClick={onBack} />
          <h2 style={{ color:C.dark, fontSize:'20px', fontWeight:'800', margin:0, fontFamily:f }}>Your Plan</h2>
        </div>
        {plan && (
          <>
            <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'14px', padding:'16px', marginBottom:'16px' }}>
              <GL text="Plan Summary" />
              <p style={{ color:C.dark, fontSize:'14px', lineHeight:1.7, margin:'4px 0 8px', fontFamily:f }}>{plan.planSummary}</p>
              {plan.currentPhase && <><GL text="Current Phase" /><p style={{ color:C.dark, fontSize:'13px', lineHeight:1.6, margin:'4px 0 0', fontFamily:f }}>{plan.currentPhase}</p></>}
            </div>
            {plan.eventPlans?.length > 0 && (
              <div style={{ marginBottom:'16px' }}>
                <GL text="Your Events" />
                <div style={{ marginTop:'8px', display:'flex', flexDirection:'column', gap:'10px' }}>
                  {plan.eventPlans.map((ep,i) => {
                    const info = EVENTS.find(e=>e.id===ep.eventType);
                    return <div key={i} style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'14px', padding:'16px' }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px' }}>
                        <p style={{ color:C.dark, fontSize:'15px', fontWeight:'700', margin:0, fontFamily:f }}>{info?.name??ep.eventType}</p>
                        <div style={{ textAlign:'right', flexShrink:0, marginLeft:'12px' }}>
                          <p style={{ color:C.green, fontSize:'20px', fontWeight:'900', margin:0, fontFamily:f }}>{ep.weeksAway}</p>
                          <p style={{ color:C.light, fontSize:'10px', margin:0, fontFamily:f }}>weeks</p>
                        </div>
                      </div>
                      {ep.racePrediction && <p style={{ color:C.green, fontSize:'13px', fontWeight:'600', margin:'0 0 4px', fontFamily:f }}>{ep.racePrediction}</p>}
                      {ep.raceProfile    && <p style={{ color:C.mid, fontSize:'13px', lineHeight:1.5, margin:'0 0 4px', fontFamily:f }}>{ep.raceProfile}</p>}
                      {ep.taperStartWeek && <p style={{ color:C.light, fontSize:'12px', margin:0, fontFamily:f }}>Taper: {ep.taperStartWeek}</p>}
                    </div>;
                  })}
                </div>
              </div>
            )}
            {!plan.eventPlans?.length && plan.racePrediction && <Card style={{ marginBottom:'16px' }}><GL text="Predicted Performance" /><p style={{ color:C.dark, fontSize:'15px', fontWeight:'700', margin:'4px 0 0', fontFamily:f }}>{plan.racePrediction}</p></Card>}
            {plan.transitionNotes && <div style={{ background:C.raised, border:`1px solid ${C.border}`, borderRadius:'14px', padding:'16px', marginBottom:'16px' }}><GL text="Transitions between events" /><p style={{ color:C.dark, fontSize:'13px', lineHeight:1.6, margin:'4px 0 0', fontFamily:f }}>{plan.transitionNotes}</p></div>}
            {plan.keyWorkouts?.length > 0 && <Card style={{ marginBottom:'16px' }}><GL text="Key Sessions" /><div style={{ marginTop:'10px', display:'flex', flexDirection:'column', gap:'10px' }}>{plan.keyWorkouts.map((kw,i)=><div key={i} style={{ background:C.raised, borderRadius:'10px', padding:'12px' }}><p style={{ color:C.dark, fontSize:'14px', fontWeight:'700', margin:'0 0 4px', fontFamily:f }}>{kw.name}</p><p style={{ color:C.mid, fontSize:'12px', margin:'0 0 4px', lineHeight:1.5, fontFamily:f }}>{kw.why}</p><p style={{ color:C.green, fontSize:'11px', fontWeight:'600', margin:0, fontFamily:f }}>{kw.howOften}</p></div>)}</div></Card>}
            {plan.weeklyTips?.length > 0 && <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderLeft:`3px solid ${C.green}`, borderRadius:'14px', padding:'16px', marginBottom:'16px' }}><GL text="Your Coach Says" /><div style={{ marginTop:'8px', display:'flex', flexDirection:'column', gap:'8px' }}>{plan.weeklyTips.map((tip,i)=><p key={i} style={{ color:C.dark, fontSize:'13px', lineHeight:1.6, margin:0, fontFamily:f }}>• {tip}</p>)}</div></div>}
          </>
        )}
        <GL text="Training Phases" />
        <div style={{ marginTop:'8px', display:'flex', flexDirection:'column', gap:'10px', marginBottom:'20px' }}>
          {phases.map((ph,i)=>(
            <div key={i} style={{ background:i===0?C.greenLight:C.card, border:`1px solid ${i===0?C.green:C.border}`, borderRadius:'14px', padding:'16px' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'4px' }}>
                <p style={{ color:i===0?C.green:C.dark, fontSize:'15px', fontWeight:'700', margin:0, fontFamily:f }}>{ph.name}</p>
                <span style={{ background:i===0?C.green:C.raised, color:i===0?C.white:C.light, fontSize:'11px', fontWeight:'700', padding:'3px 10px', borderRadius:'20px', fontFamily:f, flexShrink:0, marginLeft:'8px' }}>{i===0?'Current':`Wk ${ph.weeks??ph.weekRange}`}</span>
              </div>
              <p style={{ color:C.mid, fontSize:'13px', margin:0, lineHeight:1.5, fontFamily:f }}>{ph.focus}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const RestDayScreen = ({ selectedWorkout, onBack }) => {
  const stretches = [
    {name:'Hip Flexor Stretch',       time:'30s each side', how:'Kneel on one knee, push hips forward. Essential for runners.'},
    {name:'Hamstring Stretch',         time:'30s each leg',  how:'Sit with one leg straight, reach toward foot with flat back.'},
    {name:'Quad Stretch',              time:'30s each leg',  how:'Stand on one leg, pull other foot toward glutes.'},
    {name:'Calf and Achilles',         time:'30s each leg',  how:'Step back and press heel into floor. Straight leg = calf, bent = Achilles.'},
    {name:'Glute and Hip Stretch',     time:'30s each side', how:'Lie on back, cross ankle over opposite knee, pull toward chest.'},
    {name:'Chest and Shoulder Opener', time:'30 seconds',    how:'Clasp hands behind back, lift gently while opening chest.'},
  ];
  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:f, overflowY:'auto' }}>
      <div style={{ maxWidth:'420px', margin:'0 auto', padding:'20px 20px 40px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px', paddingTop:'20px', marginBottom:'24px' }}>
          <BackBtn onClick={onBack} />
          <h2 style={{ color:C.dark, fontSize:'20px', fontWeight:'800', margin:0, fontFamily:f }}>{selectedWorkout?.day} — Rest</h2>
        </div>
        <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderLeft:`3px solid ${C.green}`, borderRadius:'14px', padding:'16px', marginBottom:'16px' }}>
          <GL text="Why rest matters as much as training" />
          <p style={{ color:C.dark, fontSize:'14px', lineHeight:1.7, margin:'4px 0 0', fontFamily:f }}>Your muscles get stronger during recovery, not during training. Skipping rest days slows progress and raises injury risk.</p>
        </div>
        <Card style={{ marginBottom:'16px' }}>
          <GL text="Stretching routine" />
          {stretches.map((s,i)=><div key={i} style={{ background:C.raised, borderRadius:'12px', padding:'14px', marginBottom:'10px' }}><div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'6px' }}><p style={{ color:C.dark, fontSize:'14px', fontWeight:'700', margin:0, fontFamily:f }}>{s.name}</p><Tag label={s.time} /></div><p style={{ color:C.mid, fontSize:'12px', lineHeight:1.6, margin:0, fontFamily:f }}>{s.how}</p></div>)}
        </Card>
      </div>
    </div>
  );
};
