import { C, gbtn } from '../../constants/colours';
import { GL, Card, Tag, BackBtn } from '../../components/UI';

const f = "'Manrope',system-ui";

const ACTIVE_IDEAS = [
  { name:'Easy walk',        detail:'15-20 minutes at a pace where breathing stays relaxed.' },
  { name:'Mobility',         detail:'Hips, ankles and upper back. Slow, controlled movements, no forcing.' },
  { name:'Light stretching', detail:'Hold each stretch for 30 seconds. It should ease, not hurt.' },
];

const FULL_REST_IDEAS = [
  { name:'Sleep',     detail:'Aim for a full night. Most of your adaptation happens while you sleep.' },
  { name:'Fuel',      detail:'Eat normally and include protein with each meal to support repair.' },
  { name:'Hydration', detail:'Keep drinking through the day, especially after a hard session.' },
];

export const RestDayScreen = ({ selectedWorkout, onBack }) => {
  const duration = selectedWorkout?.duration;
  const hasTime  = duration && duration !== '0 min';
  const detail   = selectedWorkout?.detail ?? '';
  const isActive = hasTime || /active|walk|stretch|mobility/i.test(detail);
  const ideas    = isActive ? ACTIVE_IDEAS : FULL_REST_IDEAS;

  return (
    <div style={{ minHeight:'100vh', background:C.bg, fontFamily:f, overflowY:'auto' }}>
      <div style={{ maxWidth:'420px', margin:'0 auto', padding:'20px 20px 40px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'16px', paddingTop:'20px', marginBottom:'20px' }}>
          <BackBtn onClick={onBack} />
          <h2 style={{ color:C.dark, fontSize:'20px', fontWeight:'800', margin:0, fontFamily:f }}>{selectedWorkout?.day ?? 'Rest Day'}</h2>
          {selectedWorkout?.aiPowered && <Tag label="AI" />}
        </div>

        <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderRadius:'14px', padding:'16px', marginBottom:'16px' }}>
          <GL text={isActive ? 'Active recovery' : 'Full rest'} />
          <p style={{ color:C.dark, fontSize:'22px', fontWeight:'800', margin:'4px 0 8px', fontFamily:f }}>{selectedWorkout?.title ?? 'Rest Day'}</p>
          {detail && <p style={{ color:C.mid, fontSize:'14px', margin:'0 0 12px', lineHeight:1.6, fontFamily:f }}>{detail}</p>}
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {hasTime && <Tag label={duration} />}
            {selectedWorkout?.rpe && <Tag label={`RPE ${selectedWorkout.rpe}`} />}
          </div>
        </div>

        <Card style={{ marginBottom:'16px' }}>
          <GL text="Why rest days matter" />
          <p style={{ color:C.dark, fontSize:'14px', lineHeight:1.7, margin:'4px 0 0', fontFamily:f }}>Training creates the stimulus. Rest is when your body rebuilds and gets fitter. Skipping recovery raises injury risk and makes your next hard session worse.</p>
        </Card>

        <Card style={{ marginBottom:'16px' }}>
          <GL text={isActive ? 'Ideas for today' : 'Focus for today'} />
          <div style={{ marginTop:'12px' }}>
            {ideas.map((item, i) => (
              <div key={i} style={{ background:C.raised, borderRadius:'12px', padding:'14px 16px', marginBottom:i < ideas.length - 1 ? '10px' : 0 }}>
                <p style={{ color:C.dark, fontSize:'15px', fontWeight:'700', margin:'0 0 4px', fontFamily:f }}>{item.name}</p>
                <p style={{ color:C.mid, fontSize:'13px', lineHeight:1.6, margin:0, fontFamily:f }}>{item.detail}</p>
              </div>
            ))}
          </div>
        </Card>

        <div style={{ background:C.greenLight, border:`1px solid ${C.greenBorder}`, borderLeft:`3px solid ${C.green}`, borderRadius:'14px', padding:'16px', marginBottom:'20px' }}>
          <GL text="Coach tip" />
          <p style={{ color:C.dark, fontSize:'13px', lineHeight:1.7, margin:'4px 0 0', fontFamily:f }}>{isActive ? 'Keep it easy. If you finish feeling more tired than when you started, you went too hard.' : 'Feeling restless on a rest day is normal. Trust the plan and arrive fresh tomorrow.'}</p>
        </div>

        <button onClick={onBack} style={{ ...gbtn('transparent',C.mid), border:`1px solid ${C.border}` }}>Back to week</button>
      </div>
    </div>
  );
};
