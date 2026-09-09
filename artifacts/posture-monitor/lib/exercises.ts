export type SpineType =
  | 'kyphosis'
  | 'lordosis'
  | 'text_neck'
  | 'scoliosis'
  | 'flat_back'
  | 'normal';

export type SpineOption = {
  id: SpineType;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
};

export const SPINE_TYPES: SpineOption[] = [
  {
    id: 'kyphosis',
    title: 'Round Back (Kyphosis)',
    subtitle: 'Hunchback or excessive upper back curvature',
    description: 'Shoulders rounded forward, upper back curved out. Common from prolonged desk work.',
    badge: 'Upper Back',
  },
  {
    id: 'lordosis',
    title: 'Swayback (Hyperlordosis)',
    subtitle: 'Excessive inward curve of lower back',
    description: 'Lower back curves excessively inward, tilting the pelvis forward.',
    badge: 'Lower Back',
  },
  {
    id: 'text_neck',
    title: 'Forward Head (Text Neck)',
    subtitle: 'Head slumping forward past shoulders',
    description: 'Head jutting forward from looking down at phones, laptops, or monitors.',
    badge: 'Neck & Shoulders',
  },
  {
    id: 'scoliosis',
    title: 'Asymmetric Curve (Scoliosis)',
    subtitle: 'Side-to-side spinal curvature (S or C shape)',
    description: 'Spine curves laterally to the left or right, causing uneven shoulder/hip height.',
    badge: 'Lateral Curve',
  },
  {
    id: 'flat_back',
    title: 'Flat Back Syndrome',
    subtitle: 'Loss of natural spinal curves',
    description: 'Spine loses normal natural curves, causing stooped posture and muscle fatigue.',
    badge: 'Spine Stiffness',
  },
  {
    id: 'normal',
    title: 'General Maintenance',
    subtitle: 'Preventative posture care & alignment',
    description: 'Overall daily mobility and core stabilization to maintain healthy posture.',
    badge: 'Prevention',
  },
];

export type Exercise = {
  id: string;
  title: string;
  duration: string;
  reps: string;
  category: string;
  targetArea: string;
  instructions: string[];
  benefit: string;
  spineTypes: SpineType[];
};

export const EXERCISES_DATABASE: Exercise[] = [
  {
    id: 'ex-1',
    title: 'Doorway Chest Stretch',
    duration: '60 secs',
    reps: '3 sets of 20s hold',
    category: 'Chest Opening',
    targetArea: 'Pectorals & Front Shoulders',
    instructions: [
      'Stand in a open doorway and place elbows at 90 degrees against the frame.',
      'Gently step forward with one foot until you feel a comfortable stretch in your chest.',
      'Keep your head tall and shoulders down. Hold for 20 seconds.',
    ],
    benefit: 'Opens tight chest muscles caused by rounded shoulders and kyphosis.',
    spineTypes: ['kyphosis', 'text_neck', 'normal'],
  },
  {
    id: 'ex-2',
    title: 'Wall Angels',
    duration: '2 mins',
    reps: '2 sets of 10 reps',
    category: 'Scapular Activation',
    targetArea: 'Upper Trapezius & Rhomboids',
    instructions: [
      'Stand with your back flat against a wall, feet 6 inches away.',
      'Press your head, upper back, and tailbone against the wall.',
      'Raise arms into a "W" shape with elbows against wall, then slowly slide arms up into a "Y".',
    ],
    benefit: 'Strengthens weak upper back muscles that hold shoulders erect.',
    spineTypes: ['kyphosis', 'text_neck', 'flat_back'],
  },
  {
    id: 'ex-3',
    title: 'Chin Tucks',
    duration: '90 secs',
    reps: '3 sets of 10 reps',
    category: 'Neck Alignment',
    targetArea: 'Deep Cervical Flexors',
    instructions: [
      'Sit tall looking straight ahead.',
      'Gently glide your head straight back, making a slight double chin without tilting head down.',
      'Hold for 3 seconds, then relax back to neutral position.',
    ],
    benefit: 'Corrects forward head position ("Text Neck") and reduces neck strain.',
    spineTypes: ['text_neck', 'kyphosis', 'normal'],
  },
  {
    id: 'ex-4',
    title: 'Cat-Cow Stretch',
    duration: '2 mins',
    reps: '10 slow cycles',
    category: 'Spinal Mobility',
    targetArea: 'Entire Spine & Core',
    instructions: [
      'Start on hands and knees with wrists under shoulders and knees under hips.',
      'Inhale: arch your back downward and lift your head and tailbone up (Cow).',
      'Exhale: round your spine upward towards the ceiling, tucking your chin (Cat).',
    ],
    benefit: 'Restores fluid mobility throughout the spinal column and eases tension.',
    spineTypes: ['kyphosis', 'lordosis', 'flat_back', 'scoliosis', 'normal'],
  },
  {
    id: 'ex-5',
    title: 'Pelvic Tilts',
    duration: '90 secs',
    reps: '2 sets of 12 reps',
    category: 'Lower Back & Pelvic Reset',
    targetArea: 'Lower Abdominals & Glutes',
    instructions: [
      'Lie on your back with knees bent and feet flat on the floor.',
      'Flatten your lower back against the floor by tightening your abdominal muscles.',
      'Hold for 5 seconds, then relax to neutral arch.',
    ],
    benefit: 'Corrects swayback (hyperlordosis) by tilting pelvis back into alignment.',
    spineTypes: ['lordosis', 'flat_back'],
  },
  {
    id: 'ex-6',
    title: 'Bird-Dog Hold',
    duration: '2 mins',
    reps: '2 sets of 8 per side',
    category: 'Core Stability',
    targetArea: 'Erector Spinae & Deep Core',
    instructions: [
      'Begin on hands and knees in neutral spine posture.',
      'Extend right arm forward and left leg backward until parallel to floor.',
      'Hold for 3 seconds without letting hips tilt or arching back. Switch sides.',
    ],
    benefit: 'Stabilizes spine alignment and builds balanced core strength.',
    spineTypes: ['lordosis', 'scoliosis', 'flat_back', 'normal'],
  },
  {
    id: 'ex-7',
    title: 'Side Plank Reach',
    duration: '90 secs',
    reps: '30s hold per side',
    category: 'Asymmetric Balance',
    targetArea: 'Obliques & Lateral Stabilizers',
    instructions: [
      'Lie on your side, propped on forearm with elbow under shoulder.',
      'Lift hips off floor creating a straight line from head to ankles.',
      'Keep core engaged and maintain neutral spine alignment.',
    ],
    benefit: 'Strengthens lateral core muscles to support asymmetric spinal curves.',
    spineTypes: ['scoliosis', 'lordosis'],
  },
  {
    id: 'ex-8',
    title: 'Thoracic Foam Extension',
    duration: '2 mins',
    reps: '3 sets of 45s hold',
    category: 'Mid-Back Extension',
    targetArea: 'Thoracic Spine',
    instructions: [
      'Lie back over a foam roller or rolled towel placed horizontally under mid-back.',
      'Support your head with hands, keep knees bent and hips grounded.',
      'Gently arch mid-back back over the roller without straining lower back.',
    ],
    benefit: 'Reverses hunchback and stiff flat back by extending mid-spine.',
    spineTypes: ['kyphosis', 'flat_back', 'text_neck'],
  },
];

export function getExercisesForSpineType(spineType: SpineType): Exercise[] {
  return EXERCISES_DATABASE.filter((ex) => ex.spineTypes.includes(spineType));
}
