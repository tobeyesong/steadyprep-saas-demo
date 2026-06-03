export type TrainingMethod =
  | "Straight Sets"
  | "Descending Load Sets"
  | "Ascending Ramp Sets"
  | "Cluster Rest Sets"
  | "Superset"
  | "Timed Hold";

export type SessionStatus = "planned" | "completed" | "missed" | "moved";

export type ExercisePrescription = {
  id: string;
  name: string;
  sets: number;
  reps: string;
  rest: string;
  method: TrainingMethod;
  optional: boolean;
  notes: string;
};

export type WorkoutTemplate = {
  id: string;
  name: string;
  scheduledDay: string;
  focus: string;
  exercises: ExercisePrescription[];
};

export type Phase = {
  id: string;
  name: string;
  weeks: string;
  lengthWeeks: number;
  goal: string;
  status: "active" | "next" | "later";
  reviewPrompt: string;
  workouts: WorkoutTemplate[];
};

export type Program = {
  id: string;
  name: string;
  revision: string;
  updatedAt: string;
  phases: Phase[];
};

export type RoleplayDifficulty = "Foundation" | "Retention" | "Performance";

export type RoleplayScenario = {
  id: string;
  title: string;
  difficulty: RoleplayDifficulty;
  audience: string;
  linkedWorkoutId: string;
  situation: string;
  openingLine: string;
  coachObjective: string;
  memberSignals: string[];
  successCriteria: string[];
  coachCues: string[];
  rescueLine: string;
};

export const trainingMethods: TrainingMethod[] = [
  "Straight Sets",
  "Descending Load Sets",
  "Ascending Ramp Sets",
  "Cluster Rest Sets",
  "Superset",
  "Timed Hold",
];

export const seedProgram: Program = {
  id: "program-web-mvp",
  name: "12 Week Protocol Block",
  revision: "web-r001",
  updatedAt: "2026-05-13T09:00:00.000Z",
  phases: [
    {
      id: "phase-1",
      name: "Phase 1",
      weeks: "Weeks 1-3",
      lengthWeeks: 3,
      goal: "Build repeatable technique, establish baselines, and keep recovery clean.",
      status: "active",
      reviewPrompt:
        "At the end of week 3, review adherence, top sets, and whether load jumps are still clean.",
      workouts: [
        {
          id: "workout-a",
          name: "Workout A",
          scheduledDay: "Monday",
          focus: "Upper push + hinge",
          exercises: [
            {
              id: "ex-incline-db-press",
              name: "Incline DB Press",
              sets: 2,
              reps: "6-8, 8-10",
              rest: "3 min",
              method: "Descending Load Sets",
              optional: false,
              notes: "Heaviest clean set first, then reduce load and chase the upper rep target.",
            },
            {
              id: "ex-flat-db-press",
              name: "Flat DB Press",
              sets: 2,
              reps: "6-8, 8-10",
              rest: "3 min",
              method: "Descending Load Sets",
              optional: false,
              notes: "Keep shoulder blades pinned; stop the set before form degrades.",
            },
            {
              id: "ex-rdl",
              name: "Romanian Deadlift",
              sets: 4,
              reps: "10-12",
              rest: "2-3 min",
              method: "Ascending Ramp Sets",
              optional: false,
              notes: "Increase load across sets and make the final set challenging.",
            },
            {
              id: "ex-rear-delt-fly",
              name: "Bent-Over Rear Delt Fly",
              sets: 1,
              reps: "12-15 + mini sets",
              rest: "15 sec",
              method: "Cluster Rest Sets",
              optional: false,
              notes: "Activation set, then short-rest mini sets with the same load.",
            },
            {
              id: "ex-knee-raises",
              name: "Hanging Knee Raises",
              sets: 4,
              reps: "10-12",
              rest: "90 sec",
              method: "Straight Sets",
              optional: true,
              notes: "Bonus slot. Add load when every set is crisp.",
            },
          ],
        },
        {
          id: "workout-b",
          name: "Workout B",
          scheduledDay: "Thursday",
          focus: "Shoulders + pull + unilateral legs",
          exercises: [
            {
              id: "ex-shoulder-press",
              name: "Seated DB Shoulder Press",
              sets: 2,
              reps: "6-8, 8-10",
              rest: "3 min",
              method: "Descending Load Sets",
              optional: false,
              notes: "Start heavy while fresh; keep the second set clean.",
            },
            {
              id: "ex-lat-pulldown",
              name: "Lat Pulldown",
              sets: 2,
              reps: "6-8, 8-10",
              rest: "3 min",
              method: "Descending Load Sets",
              optional: false,
              notes: "Pause briefly at the bottom and keep torso position consistent.",
            },
            {
              id: "ex-bulgarian-split-squat",
              name: "Bulgarian Split Squat",
              sets: 4,
              reps: "10-12 / side",
              rest: "2-3 min",
              method: "Ascending Ramp Sets",
              optional: false,
              notes: "Build up by set; the last set should be the only hard grind.",
            },
            {
              id: "ex-lateral-raise",
              name: "Lateral Raise",
              sets: 1,
              reps: "12-15 + mini sets",
              rest: "15 sec",
              method: "Cluster Rest Sets",
              optional: false,
              notes: "Same load for the cluster; chase clean partial-free reps.",
            },
            {
              id: "ex-calf-raise",
              name: "Machine Calf Raise",
              sets: 4,
              reps: "10-12",
              rest: "90 sec",
              method: "Ascending Ramp Sets",
              optional: true,
              notes: "Bonus slot. Full stretch, hard top contraction.",
            },
          ],
        },
      ],
    },
    {
      id: "phase-2",
      name: "Phase 2",
      weeks: "Weeks 4-6",
      lengthWeeks: 3,
      goal: "Increase volume and add method variation only where it supports progression.",
      status: "next",
      reviewPrompt:
        "Review whether higher volume improved output or started to bury recovery.",
      workouts: [
        {
          id: "workout-a-p2",
          name: "Workout A",
          scheduledDay: "Monday",
          focus: "Pressing volume + hamstrings",
          exercises: [
            {
              id: "ex-hammer-incline",
              name: "Hammer Incline Press",
              sets: 3,
              reps: "6-10",
              rest: "3 min",
              method: "Descending Load Sets",
              optional: false,
              notes: "Use this as the primary press slot for the phase.",
            },
            {
              id: "ex-leg-curl",
              name: "Seated Leg Curl",
              sets: 3,
              reps: "8-12",
              rest: "2 min",
              method: "Ascending Ramp Sets",
              optional: false,
              notes: "Increase only if all sets hit the top range.",
            },
          ],
        },
        {
          id: "workout-b-p2",
          name: "Workout B",
          scheduledDay: "Thursday",
          focus: "Rows + reverse lunges",
          exercises: [
            {
              id: "ex-cable-row",
              name: "Machine or Cable Row",
              sets: 3,
              reps: "6-10",
              rest: "3 min",
              method: "Descending Load Sets",
              optional: false,
              notes: "Keep the movement pattern consistent for clean PR tracking.",
            },
            {
              id: "ex-reverse-lunge",
              name: "Reverse Lunge",
              sets: 4,
              reps: "10-12 / side",
              rest: "2-3 min",
              method: "Ascending Ramp Sets",
              optional: false,
              notes: "Log each side as one set target for the MVP.",
            },
          ],
        },
      ],
    },
    {
      id: "phase-3",
      name: "Phase 3",
      weeks: "Weeks 7-9",
      lengthWeeks: 3,
      goal: "Convert progress into denser sessions while protecting joints and adherence.",
      status: "later",
      reviewPrompt:
        "Decide whether to advance, repeat the block, or deload based on completion and PR trend.",
      workouts: [
        {
          id: "workout-density",
          name: "Workout A",
          scheduledDay: "Monday",
          focus: "Density review session",
          exercises: [
            {
              id: "ex-density-press",
              name: "Machine Chest Press",
              sets: 3,
              reps: "10-15",
              rest: "60-90 sec",
              method: "Straight Sets",
              optional: false,
              notes: "Use shorter rest without turning the session into conditioning.",
            },
            {
              id: "ex-density-row",
              name: "Chest-Supported Row",
              sets: 3,
              reps: "10-15",
              rest: "60-90 sec",
              method: "Straight Sets",
              optional: false,
              notes: "Pair with pressing volume for phase comparison.",
            },
          ],
        },
      ],
    },
  ],
};

export const roleplayScenarios: RoleplayScenario[] = [
  {
    id: "scenario-new-member",
    title: "First session nerves",
    difficulty: "Foundation",
    audience: "New member, 2 weeks into training",
    linkedWorkoutId: "workout-a",
    situation:
      "The member keeps apologizing before every set and says the free weight area feels intimidating.",
    openingLine:
      "I do not want to hold anyone up. Maybe I should just stay on machines today.",
    coachObjective:
      "Lower anxiety, protect technique, and give the member one repeatable win before the session ends.",
    memberSignals: [
      "Keeps looking around the room before picking up dumbbells.",
      "Underrates effort even when reps are clean.",
      "Responds well to clear next steps, not hype.",
    ],
    successCriteria: [
      "Names the emotion without making it weird.",
      "Offers a smaller first set instead of abandoning the exercise.",
      "Defines exactly what a good rep looks like.",
      "Ends with a next-set commitment the member can repeat.",
    ],
    coachCues: [
      "Start: 'Totally normal. We can make the first set boring on purpose.'",
      "Redirect attention to setup, tempo, and one visible marker.",
      "Use the planned incline press as the confidence anchor.",
    ],
    rescueLine:
      "If they still resist, swap to machine press for today and schedule dumbbells first next session.",
  },
  {
    id: "scenario-plateau",
    title: "Plateau frustration",
    difficulty: "Performance",
    audience: "Intermediate lifter chasing PRs",
    linkedWorkoutId: "workout-b",
    situation:
      "The member missed the top rep target twice and wants to add more exercises because the plan feels too simple.",
    openingLine:
      "This is not working. I should be doing way more volume if I want my numbers to move.",
    coachObjective:
      "Keep trust in the block, find the real constraint, and make the next progression rule specific.",
    memberSignals: [
      "Confuses more work with better stimulus.",
      "Has slept under 6 hours twice this week.",
      "Will accept data if it connects to the next workout.",
    ],
    successCriteria: [
      "Acknowledges the frustration before defending the plan.",
      "Checks sleep, soreness, and last-session load before changing volume.",
      "Keeps one primary lift stable for comparison.",
      "Sets a clear rule for repeating, adding load, or deloading.",
    ],
    coachCues: [
      "Ask for last two sessions before prescribing anything.",
      "Use 'same exercise, cleaner signal' as the frame.",
      "Tie the answer back to the phase review prompt.",
    ],
    rescueLine:
      "If they demand novelty, add one accessory finisher without touching the primary progression slots.",
  },
  {
    id: "scenario-adherence",
    title: "Skipped week reset",
    difficulty: "Retention",
    audience: "Busy member after a missed week",
    linkedWorkoutId: "workout-a-p2",
    situation:
      "The member missed three sessions, feels behind, and is considering restarting the whole program.",
    openingLine:
      "I messed the plan up. Should we just start over from week one?",
    coachObjective:
      "Remove shame, preserve momentum, and choose the smallest restart that keeps the program honest.",
    memberSignals: [
      "Uses all-or-nothing language.",
      "Needs permission to do a smaller version today.",
      "Will disappear if the reset feels punitive.",
    ],
    successCriteria: [
      "Separates missed sessions from identity.",
      "Chooses repeat, resume, or deload with a reason.",
      "Cuts today to the minimum useful session when needed.",
      "Books the next session before ending the conversation.",
    ],
    coachCues: [
      "Say what stays true: one missed week does not erase baseline work.",
      "Pick two must-do exercises and one optional slot.",
      "Use the calendar to make the next commitment visible.",
    ],
    rescueLine:
      "If they are overloaded, run a 25-minute version today and repeat the phase week once.",
  },
];

export const roleplayRubric = [
  {
    label: "Safety",
    target: "Screens pain, fatigue, and exercise risk before pushing load.",
  },
  {
    label: "Clarity",
    target: "Gives one specific next action instead of a motivational speech.",
  },
  {
    label: "Trust",
    target: "Reflects the member's concern before correcting the plan.",
  },
  {
    label: "Progression",
    target: "Connects the answer to the programmed phase and next session.",
  },
];

export const prTrend = [
  { label: "Jan", incline: 62.3, squat: null, deadlift: 55.5 },
  { label: "Feb", incline: 64.2, squat: null, deadlift: null },
  { label: "Mar", incline: 68.0, squat: 93.3, deadlift: 81.7 },
  { label: "Apr", incline: 66.0, squat: 123.3, deadlift: 102.0 },
  { label: "May", incline: 66.0, squat: 128.3, deadlift: 55.5 },
];

export const scheduledSessions = [
  { date: "2026-05-01", name: "Jump C + Trigger I", status: "completed" as SessionStatus },
  { date: "2026-05-04", name: "Jump A", status: "completed" as SessionStatus },
  { date: "2026-05-07", name: "Trigger I", status: "completed" as SessionStatus },
  { date: "2026-05-09", name: "Foundational Workout I", status: "completed" as SessionStatus },
  { date: "2026-05-12", name: "Mobility", status: "completed" as SessionStatus },
  { date: "2026-05-14", name: "Workout B", status: "planned" as SessionStatus },
  { date: "2026-05-18", name: "Workout A", status: "planned" as SessionStatus },
  { date: "2026-05-21", name: "Workout B", status: "planned" as SessionStatus },
  { date: "2026-05-25", name: "Phase review", status: "planned" as SessionStatus },
];

export const strongReferenceSummary = {
  filename: "strong_workouts.csv",
  importedAt: "2026-05-12 reference scan",
  rows: 9517,
  sessions: 540,
  exercises: 327,
  workoutNames: 47,
  dateRange: "2023-06-12 to 2026-05-12",
  columns: [
    "Date",
    "Workout Name",
    "Duration",
    "Exercise Name",
    "Set Order",
    "Weight",
    "Reps",
    "Distance",
    "Seconds",
    "RPE",
  ],
  topExerciseRows: [
    { name: "Deadlift (Barbell)", rows: 225 },
    { name: "Hanging Leg Raise", rows: 217 },
    { name: "Squat (Barbell)", rows: 205 },
    { name: "Incline Bench Press (Barbell)", rows: 190 },
    { name: "Bicep Curl (Machine)", rows: 178 },
    { name: "Bulgarian Split Squat", rows: 109 },
  ],
  importRequirements: [
    "Group rows by Date + Workout Name to reconstruct sessions.",
    "Map Strong exercise names onto canonical exercise records before PR calculations.",
    "Preserve timed, distance, weighted, and RPE fields even when most lifting rows only use weight and reps.",
    "Keep imported history immutable so template edits do not rewrite old workouts.",
  ],
};
