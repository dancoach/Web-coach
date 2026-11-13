import { C, gbtn } from '../../constants/colours';
import { GL, Card, Tag, BackBtn, ExerciseCard } from '../../components/UI';
import { getExercises, getWeekType } from '../../constants/data';

const f = "'Manrope',system-ui";

export const WorkoutScreen = ({ selectedWorkout, userProfile, sessionLocation, setSessionLocation, workoutLogged, onLogActivity, onGPS, onHyrox, onBack }) => {
  const weekType = getWeekType();
  const isUpper  = selectedWorkout?.day === 'Tuesday';
  const exercises = selectedWorkout?.exercises ?? (selectedWorkout?.type==='strength' ? getExercises(sessionLocation, isUpper, weekType) : []);
  const isGym    = sessionLocation === 'gym';
  const isRun    = selectedWorkout?.type === 'run';
  const isHyrox  = selectedWorkout?.type === 'hyrox';

  const runTips = {
    'Easy Run':  {what:'A slow comfortable effort where you could hold a full conversation. Should feel almost embarrassingly slow.', tip:'Most runners go too fast on easy days. Slower than you think is correct.'},
    'Tempo Run': {what:'A comfortably hard effort around 7/10. You can say a few words but not a full conversation.', tip:'Do not start too fast. Ease into the first km then settle into rhythm.'},
    'Long Run':  {what:'Same easy conversational pace as easy runs — duration is the goal not speed.', tip:'Run the first half feeling like you are going too easy. Your second half will thank you.'},
  };
  const runExp = runTips[selectedWorkout?.title] ?? runTips['Easy Run'];

  if (isHyrox) return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:f, overflowY:'auto' }}>
      <div style={{ maxWidth:'420px', margin:'0 auto', padding:'20px 20px 40px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px', paddingTop:'20px', marginBottom:'20px' }}><BackBtn onClick={onBack} /><h2 style={{ color:C.dark, fontSize:'20px', fontWeight:'800', margin:0, fontFamily:f }}>Hyrox Session</h2></div>
        <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'14px', padding:'20px', textAlign:'center', marginBottom:'20px' }}>
          <p style={{ fontSize:'40px', margin:'0 0 12px' }}>🏅</p>
          <p style={{ color:C.dark, fontSize:'18px', fontWeight:'800', margin:'0 0 8px', fontFamily:f }}>Ready for your Hyrox session?</p>
          <p style={{ color:C.mid, fontSize:'14px', lineHeight:1.6, margin:0, fontFamily:f }}>Log times and performance for each of the 8 stations. Every session builds your race day profile.</p>
        </div>
        <button onClick={onHyrox} style={gbtn(C.green,C.white)}>LOG STATION PERFORMANCE</button>
        <button onClick={onBack} style={{ ...gbtn('transparent',C.mid), border:`1px solid ${C.border}`, marginTop:'10px' }}>Back to week</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:f, overflowY:'auto' }}>
      <div style={{ maxWidth:'420px', margin:'0 auto', padding:'20px 20px 40px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px', paddingTop:'20px', marginBottom:'20px' }}>
          <BackBtn onClick={onBack} />
          <h2 style={{ color:C.dark, fontSize:'20px', fontWeight:'800', margin:0, fontFamily:f }}>{selectedWorkout?.day}</h2>
          {selectedWorkout?.aiPowered && <Tag label="AI" />}
        </div>

        {userProfile?.training_location==='both' && selectedWorkout?.type==='strength' && (
          <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:'12px', padding:'12px 16px', marginBottom:'16px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <p style={{ color:C.mid, fontSize:'13px', margin:0, fontFamily:f }}>Today:</p>
            <div style={{ display:'flex', background:C.raised, borderRadius:'8px', padding:'3px', border:`1px solid ${C.border}` }}>
              {['gym','home'].map(loc=><button key={loc} onClick={()=>setSessionLocation(loc)} style={{ padding:'7px 12px', background:sessionLocation===loc?C.green:'transparent', border:'none', borderRadius:'5px', color:sessionLocation===loc?C.white:C.mid, fontSize:'12px', fontWeight:'700', cursor:'pointer', textTransform:'uppercase', fontFamily:f }}>{loc}</button>)}
            </div>
          </div>
        )}

        <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'14px', padding:'16px', marginBottom:'16px' }}>
          <GL text={`${selectedWorkout?.day} · ${selectedWorkout?.aiPowered?'AI Personalised':'Week 1'}`} />
          <p style={{ color:C.dark, fontSize:'22px', fontWeight:'800', margin:'4px 0 8px', fontFamily:f }}>{selectedWorkout?.title}</p>
          <p style={{ color:C.mid, fontSize:'14px', margin:'0 0 12px', lineHeight:1.6, fontFamily:f }}>{selectedWorkout?.detail}</p>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {selectedWorkout?.duration && selectedWorkout.duration!=='0 min' && <Tag label={selectedWorkout.duration} />}
            {selectedWorkout?.rpe && <Tag label={`RPE ${selectedWorkout.rpe}`} />}
            <Tag label={isGym?'Gym':'Home'} />
          </div>
        </div>

        {isRun && (
          <>
            <Card style={{ marginBottom:'16px' }}><GL text={`What is a ${selectedWorkout?.title?.toLowerCase()??'run'}?`} /><p style={{ color:C.dark, fontSize:'14px', lineHeight:1.7, margin:'4px 0 0', fontFamily:f }}>{runExp.what}</p></Card>
            <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderLeft:`3px solid ${C.green}`, borderRadius:'14px', padding:'16px', marginBottom:'20px' }}><GL text="Coach tip" /><p style={{ color:C.dark, fontSize:'13px', lineHeight:1.7, margin:'4px 0 0', fontFamily:f }}>{runExp.tip}</p></div>
            <button onClick={onGPS} style={{ ...gbtn('transparent',C.green), border:`1px solid ${C.green}`, marginBottom:'10px' }}>TRACK THIS RUN WITH GPS</button>
          </>
        )}

        {selectedWorkout?.type==='strength' && (
          <>
            <Card style={{ marginBottom:'16px' }}>
              <GL text="Before you start" />
              <p style={{ color:C.dark, fontSize:'14px', lineHeight:1.7, margin:'4px 0 10px', fontFamily:f }}>Warm up for 5 minutes before touching any weight. Arm circles, leg swings and bodyweight squats prepare your joints.</p>
              <div style={{ background:C.raised, borderRadius:'10px', padding:'12px' }}>
                <p style={{ color:C.green, fontSize:'13px', fontWeight:'700', margin:'0 0 4px', fontFamily:f }}>Form first, always</p>
                <p style={{ color:C.mid, fontSize:'13px', lineHeight:1.6, margin:0, fontFamily:f }}>{isGym?'Perfect form with lighter weight builds more strength than sloppy reps heavy.':'Adjust band tension so the last 2-3 reps challenge you but stay clean.'}</p>
              </div>
            </Card>
            <Card style={{ marginBottom:'16px' }}><GL text="Today's exercises" /><p style={{ color:C.mid, fontSize:'12px', margin:'4px 0 16px', fontFamily:f }}>{isGym?'Rest 60-90 seconds between sets.':'Use a heavier band or slower reps to increase difficulty.'}</p>{exercises.map((ex,i)=><ExerciseCard key={i} ex={ex} />)}</Card>
            <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderLeft:`3px solid ${C.green}`, borderRadius:'14px', padding:'16px', marginBottom:'20px' }}><GL text="Coach tip" /><p style={{ color:C.dark, fontSize:'13px', lineHeight:1.7, margin:'4px 0 0', fontFamily:f }}>Every strength session makes you a more powerful and injury-resistant athlete. This work directly improves your event performance.</p></div>
          </>
        )}

        <button onClick={onLogActivity} disabled={workoutLogged} style={{ ...gbtn(workoutLogged?C.raised:C.green, workoutLogged?C.mid:C.white), cursor:workoutLogged?'default':'pointer', marginBottom:'10px' }}>{workoutLogged?'ACTIVITY ALREADY LOGGED':'LOG THIS WORKOUT'}</button>
        <button onClick={onBack} style={{ ...gbtn('transparent',C.mid), border:`1px solid ${C.border}` }}>Back to week</button>
      </div>
    </div>
  );
};
