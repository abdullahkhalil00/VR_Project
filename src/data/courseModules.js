/** Tab labels aligned with Batch 01–04 */
export const batchTabs = [
  { id: '1', label: 'Batch 01' },
  { id: '2', label: 'Batch 02' },
  { id: '3', label: 'Batch 03' },
  { id: '4', label: 'Batch 04' },
]

/** Course cards shown in the grid above the module table — unique sets per batch */
export const coursesByBatch = {
  '1': [
    { name: 'Diploma in Physics', code: 'OXF/ENG/01' },
    { name: 'Diploma in IT', code: 'OXF/DIT/01' },
    { name: 'HND in Computing', code: 'OXF/HND/01' },
  ],
  '2': [
    { name: 'Certificate in Data Science', code: 'OXF/DS/02' },
    { name: 'Web Development Fundamentals', code: 'OXF/WEB/02' },
    { name: 'Cloud & DevOps Intro', code: 'OXF/CLO/02' },
  ],
  '3': [
    { name: 'Business Analytics', code: 'OXF/BAN/03' },
    { name: 'Digital Marketing Essentials', code: 'OXF/DMK/03' },
    { name: 'Project Management Basics', code: 'OXF/PME/03' },
  ],
  '4': [
    { name: 'Advanced Software Engineering', code: 'OXF/ASE/04' },
    { name: 'Cybersecurity Foundations', code: 'OXF/CYB/04' },
    { name: 'UX Design Studio', code: 'OXF/UXD/04' },
  ],
}

/** Module rows per batch (same structure; topics/status vary) */
export const modulesByBatch = {
  '1': [
    { id: '1', label: 'Module 01', topic: 'Programming', unit: 'Unit 01', status: 'Completed' },
    { id: '2', label: 'Module 02', topic: 'Networking', unit: 'Unit 01', status: 'Ongoing' },
    { id: '3', label: 'Module 03', topic: 'Database', unit: 'Unit 01', status: 'Pending' },
    { id: '4', label: 'Module 04', topic: 'Professional Practice', unit: 'Unit 01', status: 'Pending' },
  ],
  '2': [
    { id: '1', label: 'Module 01', topic: 'Python & Tools', unit: 'Unit 01', status: 'Ongoing' },
    { id: '2', label: 'Module 02', topic: 'Statistics for DS', unit: 'Unit 02', status: 'Pending' },
    { id: '3', label: 'Module 03', topic: 'Machine Learning Intro', unit: 'Unit 02', status: 'Pending' },
    { id: '4', label: 'Module 04', topic: 'Capstone Prep', unit: 'Unit 03', status: 'Pending' },
  ],
  '3': [
    { id: '1', label: 'Module 01', topic: 'Market Research', unit: 'Unit 01', status: 'Completed' },
    { id: '2', label: 'Module 02', topic: 'Metrics & KPIs', unit: 'Unit 01', status: 'Ongoing' },
    { id: '3', label: 'Module 03', topic: 'Campaign Planning', unit: 'Unit 02', status: 'Pending' },
    { id: '4', label: 'Module 04', topic: 'Portfolio Review', unit: 'Unit 02', status: 'Pending' },
  ],
  '4': [
    { id: '1', label: 'Module 01', topic: 'System Design', unit: 'Unit 01', status: 'Ongoing' },
    { id: '2', label: 'Module 02', topic: 'Secure Coding', unit: 'Unit 01', status: 'Pending' },
    { id: '3', label: 'Module 03', topic: 'Threat Modeling', unit: 'Unit 02', status: 'Pending' },
    { id: '4', label: 'Module 04', topic: 'Industry Project', unit: 'Unit 03', status: 'Pending' },
  ],
}

/** @deprecated use modulesByBatch['1'] */
export const modulesList = modulesByBatch['1']

const LONG_DESC =
  `This session frames the roadmap for success in your field — from foundational principles to actionable goals. We'll align expectations, highlight key milestones, and show how lessons connect to assessments.

Key areas:
• Establishing measurable outcomes for the semester
• How video lessons and quizzes reinforce each topic
• Where to find help and extra reading materials

You'll leave with clarity on pacing, prerequisites, and how to get the most from each lecture.`

function thumbSeed(id) {
  return `https://picsum.photos/seed/${encodeURIComponent(id)}/320/180`
}

function lectureSequence(moduleNum, prefix, subtitles, batchId = '1') {
  return subtitles.map((sub, i) => {
    const n = i + 1
    const hasVideo = moduleNum !== 4 || i < 2
    const lecId = `b${batchId}-m${moduleNum}-l${n}`
    return {
      id: lecId,
      number: n,
      title: `Lecture ${String(n).padStart(2, '0')}: ${prefix} — ${sub}`,
      helpingContent: 0,
      videos: hasVideo ? 1 : 0,
      assignments: moduleNum === 2 && n === 1 ? 1 : 0,
      openQuiz: 0,
      description: `${sub}: core ideas, demos where applicable, and links to supplementary PDFs inside Attachments.`,
      attachments: hasVideo
        ? [
            {
              id: `vx-b${batchId}-${moduleNum}-${n}`,
              kind: 'video',
              title: `${sub} (recorded session)`,
              thumb: thumbSeed(`${lecId}-v`),
            },
          ]
        : [],
      assignmentItems:
        moduleNum === 2 && n === 1
          ? [{ id: `a-b${batchId}-m${moduleNum}`, title: 'Practice worksheet', due: 'May 25, 2026' }]
          : [],
      quizItems: [],
    }
  })
}

/** Rich lecture content for Batch 01 only (original mock) */
const batch1ModuleLectures = {
  '1': [
    {
      id: 'm1-l1',
      number: 1,
      title: 'Lecture 01: The Top 100 | The Grand Vision & Foundations',
      helpingContent: 0,
      videos: 2,
      assignments: 1,
      openQuiz: 1,
      description: LONG_DESC,
      attachments: [
        {
          id: 'v1',
          kind: 'video',
          title: 'Introduction — course structure and grading',
          thumb: thumbSeed('m1-l1-v1'),
        },
        {
          id: 'v2',
          kind: 'video',
          title: 'Workshop review Q&A',
          thumb: thumbSeed('m1-l1-v2'),
        },
      ],
      assignmentItems: [{ id: 'a1', title: 'Reflection: your learning goals', due: 'May 18, 2026' }],
      quizItems: [{ id: 'q1', title: 'Open Quiz — Module 01 basics', questionCount: 10 }],
    },
    {
      id: 'm1-l2',
      number: 2,
      title: 'Lecture 02: Choosing Your Niche & Earning Strategy',
      helpingContent: 0,
      videos: 1,
      assignments: 0,
      openQuiz: 0,
      description:
        'A condensed walkthrough of prioritization, timelines, and how to pair theory with exercises from the LMS.',
      attachments: [
        {
          id: 'v3',
          kind: 'video',
          title: 'Strategy session recording',
          thumb: thumbSeed('m1-l2-v1'),
        },
      ],
      assignmentItems: [],
      quizItems: [],
    },
  ],
  '2': lectureSequence(2, 'Networking Essentials', ['Topologies & models', 'Practical cabling & VLAN intro', 'Troubleshooting basics'], '1'),
  '3': lectureSequence(3, 'Database Design', ['Entities & relationships', 'SQL foundations', 'Normalization practice'], '1'),
  '4': lectureSequence(4, 'Professional Practice', ['Ethics overview', 'Team communication', 'Portfolio tips'], '1'),
}

function defaultLecturesForModule(batchId, moduleId, topic) {
  const n = Number(moduleId) || 1
  const subs = ['Core concepts', 'Lab & practice', 'Review & next steps']
  return lectureSequence(n, topic, subs, batchId)
}

/**
 * @param {string} moduleId
 * @param {string} [batchId='1']
 */
export function getModuleCourseContent(moduleId, batchId = '1') {
  const bid = batchTabs.some((t) => t.id === batchId) ? batchId : '1'
  const modules = modulesByBatch[bid]
  const metaRaw = modules?.find((m) => m.id === moduleId)
  if (!metaRaw) return null

  const meta = { ...metaRaw, batchId: bid }

  let lectures =
    bid === '1' ? batch1ModuleLectures[moduleId] : undefined

  if (!lectures) {
    lectures = defaultLecturesForModule(bid, moduleId, meta.topic)
  }

  const summary = lectures.reduce(
    (acc, l) => ({
      lectures: acc.lectures + 1,
      videos: acc.videos + (l.videos || 0),
      helpingContent: acc.helpingContent + (l.helpingContent || 0),
      assignments: acc.assignments + (l.assignments || 0),
      openQuiz: acc.openQuiz + (l.openQuiz || 0),
    }),
    { lectures: 0, videos: 0, helpingContent: 0, assignments: 0, openQuiz: 0 },
  )
  return { meta, lectures, summary }
}

export function getCoursesForBatch(batchId = '1') {
  const bid = batchTabs.some((t) => t.id === batchId) ? batchId : '1'
  return coursesByBatch[bid] ?? coursesByBatch['1']
}

export function getModulesForBatch(batchId = '1') {
  const bid = batchTabs.some((t) => t.id === batchId) ? batchId : '1'
  return modulesByBatch[bid] ?? modulesByBatch['1']
}
