// ─────────────────────────────────────────────────────────────────────────────
// COACH — App Constants
// Events, Hyrox stations, exercises by location, week type
// ─────────────────────────────────────────────────────────────────────────────

export const EVENTS = [
  { id:'hyrox',         name:'Hyrox',             emoji:'🏋️', distances:['Hyrox Individual','Hyrox Doubles','Hyrox Relay'] },
  { id:'marathon',      name:'Marathon',           emoji:'🏃', distances:['Full Marathon (42.2km)'] },
  { id:'half_marathon', name:'Half Marathon',      emoji:'🏃', distances:['Half Marathon (21.1km)'] },
  { id:'10k',           name:'10k',                emoji:'🏃', distances:['10k'] },
  { id:'5k',            name:'5k',                 emoji:'🏃', distances:['5k'] },
  { id:'ironman',       name:'Ironman',             emoji:'🏊', distances:['Full Ironman','70.3 Half Ironman'] },
  { id:'triathlon',     name:'Triathlon',           emoji:'🏊', distances:['Sprint','Olympic','Half','Full'] },
  { id:'obstacle',      name:'Obstacle Course Race',emoji:'💪', distances:['Tough Mudder','Spartan Sprint','Spartan Beast','OCR'] },
  { id:'cycling',       name:'Cycling Event',       emoji:'🚴', distances:['Sportive','Gran Fondo','Criterium'] },
];

export const HYROX_STATIONS = [
  { id:'skierg',    name:'SkiErg',           unit:'1km',    tip:'Maintain consistent rhythm. Do not sprint the first 200m.' },
  { id:'sled_push', name:'Sled Push',        unit:'50m',    tip:'Stay low and drive with your legs. Short powerful steps.' },
  { id:'sled_pull', name:'Sled Pull',        unit:'50m',    tip:'Stay upright and walk backwards with control.' },
  { id:'burpees',   name:'Burpee Broad Jumps',unit:'80 reps',tip:'Find a rhythm early. Break into sets of 10-15.' },
  { id:'rowing',    name:'Rowing',           unit:'1km',    tip:'Start at a controlled pace. Legs drive first, not arms.' },
  { id:'farmers',   name:'Farmers Carry',    unit:'200m',   tip:'Keep shoulders back and walk tall.' },
  { id:'lunges',    name:'Sandbag Lunges',   unit:'100m',   tip:'Keep the sandbag on one shoulder. Step long and controlled.' },
  { id:'wallballs', name:'Wall Balls',       unit:'100 reps',tip:'Aim for the same spot every rep. Break early into sets.' },
];

// Week type cycles through A/B/C for variation
export const getWeekType = () => {
  const weekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
  return ['A','B','C'][weekNumber % 3];
};

const GYM_UPPER = {
  A: [
    { name:'Bench Press',             sets:'4×8',  rest:'90s', tip:'Grip just outside shoulder width. Control the descent.' },
    { name:'Bent Over Row',           sets:'4×10', rest:'90s', tip:'Hinge at hips, keep back flat. Row to lower chest.' },
    { name:'Dumbbell Shoulder Press', sets:'3×12', rest:'60s', tip:'Press straight up, do not arch your lower back.' },
    { name:'Lat Pulldown',            sets:'3×12', rest:'60s', tip:'Pull to upper chest. Think elbows to pockets.' },
    { name:'Bicep Curl',              sets:'3×12', rest:'60s', tip:'Controlled on the way down. No swinging.' },
    { name:'Tricep Pushdown',         sets:'3×15', rest:'60s', tip:'Keep elbows at your sides throughout.' },
  ],
  B: [
    { name:'Incline Dumbbell Press',  sets:'4×10', rest:'90s', tip:'30-45 degree incline targets upper chest.' },
    { name:'Cable Row',               sets:'4×12', rest:'90s', tip:'Squeeze shoulder blades together at the end of each rep.' },
    { name:'Lateral Raises',          sets:'4×15', rest:'60s', tip:'Slight bend in elbows. Lead with elbows not hands.' },
    { name:'Chest Supported Row',     sets:'3×12', rest:'60s', tip:'No momentum — isolate the pulling muscles.' },
    { name:'Hammer Curl',             sets:'3×12', rest:'60s', tip:'Neutral grip builds both bicep and brachialis.' },
    { name:'Overhead Extension',      sets:'3×12', rest:'60s', tip:'Keep upper arms close to ears throughout.' },
  ],
  C: [
    { name:'Push Press',              sets:'4×6',  rest:'90s', tip:'Slight dip and drive. Power through the shoulders.' },
    { name:'Weighted Pull Ups',       sets:'4×6',  rest:'90s', tip:'Full extension at the bottom. Chin over bar at top.' },
    { name:'Arnold Press',            sets:'3×12', rest:'60s', tip:'Rotate as you press — hits all three deltoid heads.' },
    { name:'Seal Row',                sets:'3×10', rest:'60s', tip:'Chest on bench eliminates cheating. Pure lat work.' },
    { name:'Zottman Curl',            sets:'3×12', rest:'60s', tip:'Curl up with supinated grip, lower with pronated.' },
    { name:'Close Grip Bench',        sets:'3×10', rest:'60s', tip:'Elbows track inward. Tricep-dominant press.' },
  ],
};

const GYM_LOWER = {
  A: [
    { name:'Back Squat',              sets:'4×8',  rest:'120s', tip:'Depth to parallel minimum. Knees track over toes.' },
    { name:'Romanian Deadlift',       sets:'4×10', rest:'90s',  tip:'Hinge, do not squat. Feel the hamstring stretch.' },
    { name:'Leg Press',               sets:'3×12', rest:'90s',  tip:'Feet shoulder width, high on the platform for glutes.' },
    { name:'Leg Curl',                sets:'3×15', rest:'60s',  tip:'Slow on the way down. Do not let hips rise.' },
    { name:'Calf Raises',             sets:'4×20', rest:'45s',  tip:'Full range. Pause at the bottom of each rep.' },
    { name:'Glute Bridge',            sets:'3×15', rest:'60s',  tip:'Drive through heels. Squeeze glutes at top.' },
  ],
  B: [
    { name:'Front Squat',             sets:'4×8',  rest:'120s', tip:'Keep torso upright. Elbows high.' },
    { name:'Nordic Curl',             sets:'3×6',  rest:'120s', tip:'One of the best hamstring injury prevention exercises.' },
    { name:'Bulgarian Split Squat',   sets:'3×10', rest:'90s',  tip:'Front foot further forward than you think.' },
    { name:'Leg Extension',           sets:'3×15', rest:'60s',  tip:'Squeeze at the top. Do not slam down.' },
    { name:'Seated Calf Raise',       sets:'4×20', rest:'45s',  tip:'Targets soleus. Essential for runners.' },
    { name:'Hip Thrust',              sets:'3×12', rest:'60s',  tip:'Weight across hips. Drive through heels.' },
  ],
  C: [
    { name:'Deadlift',                sets:'4×5',  rest:'180s', tip:'Hip-width stance. Bar over mid-foot. Proud chest.' },
    { name:'Hack Squat',              sets:'4×10', rest:'90s',  tip:'Quad-dominant. Feet low on the platform.' },
    { name:'Walking Lunge',           sets:'3×20', rest:'90s',  tip:'Long stride for glutes. Short for quads.' },
    { name:'Hamstring Curl',          sets:'3×12', rest:'60s',  tip:'Slow eccentric builds more strength.' },
    { name:'Standing Calf Raise',     sets:'4×15', rest:'45s',  tip:'Single leg variation increases difficulty.' },
    { name:'Cable Kickback',          sets:'3×15', rest:'60s',  tip:'Isolates glute max. Keep core tight.' },
  ],
};

const HOME_UPPER = {
  A: [
    { name:'Push Up',                 sets:'4×20',  rest:'60s', tip:'Hands shoulder width. Lower chest to floor.' },
    { name:'Wide Row (band)',          sets:'4×15',  rest:'60s', tip:'Anchor band low. Pull elbows wide like a face pull.' },
    { name:'Pike Press',              sets:'3×12',  rest:'60s', tip:'Hips high. Lowers through a larger shoulder range.' },
    { name:'Doorframe Row',           sets:'3×15',  rest:'60s', tip:'Lean back, pull chest to hands. Tuck elbows.' },
    { name:'Tricep Dip (chairs)',      sets:'3×15',  rest:'60s', tip:'Keep hips close to the edge. Elbows behind you.' },
    { name:'Curl (band)',             sets:'3×15',  rest:'60s', tip:'Stand on band. Supinate at the top of each rep.' },
  ],
  B: [
    { name:'Decline Push Up',         sets:'4×15',  rest:'60s', tip:'Feet elevated targets upper chest and shoulders.' },
    { name:'Inverted Row (table)',     sets:'4×12',  rest:'60s', tip:'Body rigid. Pull chest to table edge.' },
    { name:'Handstand Hold (wall)',    sets:'3×30s', rest:'60s', tip:'Hands shoulder width. Press actively into floor.' },
    { name:'Superman',                sets:'3×15',  rest:'45s', tip:'Lift arms and legs simultaneously. Squeeze glutes.' },
    { name:'Diamond Push Up',         sets:'3×12',  rest:'60s', tip:'Hands close together. Tricep-heavy variation.' },
    { name:'Face Pull (band)',        sets:'3×20',  rest:'45s', tip:'Pull to nose level. External rotate at end of rep.' },
  ],
  C: [
    { name:'Archer Push Up',          sets:'3×10',  rest:'60s', tip:'One arm extends as you press. Builds unilateral strength.' },
    { name:'Towel Row',               sets:'4×15',  rest:'60s', tip:'Loop towel around a door handle. Full range of motion.' },
    { name:'Pike Push Up',            sets:'3×15',  rest:'60s', tip:'Progress toward handstand push up.' },
    { name:'Band Pull Apart',         sets:'3×20',  rest:'45s', tip:'Rear deltoid and rotator cuff health essential for runners.' },
    { name:'Close Push Up',           sets:'3×15',  rest:'60s', tip:'Elbows scrape ribs. Tricep dominant.' },
    { name:'Band Bicep Curl',         sets:'3×20',  rest:'45s', tip:'Stand on band. Slow eccentric for more stimulus.' },
  ],
};

const HOME_LOWER = {
  A: [
    { name:'Bodyweight Squat',        sets:'4×25',  rest:'60s', tip:'Push knees out. Weight in heels.' },
    { name:'Single Leg RDL',          sets:'3×12',  rest:'60s', tip:'Hinge from hip. Feel the hamstring stretch.' },
    { name:'Reverse Lunge',           sets:'3×15',  rest:'60s', tip:'Keep front shin vertical. Drop back knee to floor.' },
    { name:'Glute Bridge',            sets:'4×20',  rest:'45s', tip:'Drive heels into floor. Squeeze glutes at top.' },
    { name:'Calf Raise (single leg)', sets:'4×20',  rest:'45s', tip:'Full range. Use wall for balance only.' },
    { name:'Side-Lying Clam',         sets:'3×20',  rest:'45s', tip:'Hip abductor isolation. Essential for knee health.' },
  ],
  B: [
    { name:'Jump Squat',              sets:'4×15',  rest:'60s', tip:'Land softly. Absorb through hips and knees.' },
    { name:'Nordic Curl (sofa)',       sets:'3×5',   rest:'120s', tip:'Arguably the best hamstring exercise available.' },
    { name:'Split Squat',             sets:'3×15',  rest:'60s', tip:'Stationary lunge. More stability work than walking.' },
    { name:'Donkey Kick',             sets:'3×20',  rest:'45s', tip:'Glute max isolation. Square hips throughout.' },
    { name:'Banded Walk',             sets:'3×20',  rest:'45s', tip:'Loop band above knees. Keep tension as you walk.' },
    { name:'Box Step Up',             sets:'3×15',  rest:'60s', tip:'Drive through front heel entirely.' },
  ],
  C: [
    { name:'Pistol Squat (assisted)', sets:'4×8',   rest:'90s', tip:'Hold TRX or doorframe for balance as needed.' },
    { name:'Romanian Deadlift (bag)', sets:'4×12',  rest:'90s', tip:'Fill a backpack for added resistance.' },
    { name:'Walking Lunge',           sets:'3×20',  rest:'60s', tip:'Long stride for glutes. Short for quads.' },
    { name:'Hip Thrust',              sets:'3×20',  rest:'60s', tip:'Upper back on sofa. Drive hips to ceiling.' },
    { name:'Squat Hold',              sets:'3×45s', rest:'60s', tip:'At parallel. Wall sit variation also fine.' },
    { name:'High Knee Sprint (spot)', sets:'4×30s', rest:'60s', tip:'Drive knees above hip height. Arms drive.' },
  ],
};

export const getExercises = (location, isUpper, weekType) => {
  const isGym = location === 'gym';
  if (isUpper) return isGym ? (GYM_UPPER[weekType] ?? GYM_UPPER.A) : (HOME_UPPER[weekType] ?? HOME_UPPER.A);
  return isGym ? (GYM_LOWER[weekType] ?? GYM_LOWER.A) : (HOME_LOWER[weekType] ?? HOME_LOWER.A);
};
