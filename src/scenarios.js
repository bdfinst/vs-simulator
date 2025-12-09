// Workflow Scenarios Configuration
// Each scenario defines a complete workflow with different stages and characteristics

export const SCENARIOS = {
  standard: {
    id: 'standard',
    name: 'Standard Agile Flow',
    description: 'Typical agile workflow with continuous deployment',
    stages: [
      { id: 'backlog', label: 'Backlog', type: 'queue', processTime: { min: 0, max: 0 }, waitTime: { min: 0, max: 0 } },
      { id: 'analysis', label: 'Refining Work', type: 'process', stepType: 'manual', processTime: { min: 2, max: 4 }, waitTime: { min: 8, max: 8 }, actors: 2, percentComplete: 95 },
      { id: 'dev', label: 'Development', type: 'process', stepType: 'manual', processTime: { min: 1, max: 8 }, waitTime: { min: 8, max: 8 }, actors: 5, percentComplete: 95 },
      { id: 'review', label: 'Code Review', type: 'process', stepType: 'manual', processTime: { min: 0.5, max: 2 }, waitTime: { min: 4, max: 8 }, actors: 2, percentComplete: 95 },
      { id: 'test', label: 'Testing', type: 'process', stepType: 'automated', processTime: { min: 0.5, max: 1 }, waitTime: { min: 0, max: 0 }, actors: Infinity, percentComplete: 95 },
      { id: 'deploy', label: 'Deployment', type: 'process', stepType: 'automated', processTime: { min: 0.8, max: 1.2 }, waitTime: { min: 0, max: 0 }, actors: Infinity, percentComplete: 95 },
      { id: 'done', label: 'Production', type: 'sink', processTime: { min: 0, max: 0 }, waitTime: { min: 0, max: 0 } },
    ],
    deploymentSchedule: 24, // hours
  },

  cabApproval: {
    id: 'cabApproval',
    name: 'CAB Approval Flow',
    description: 'Traditional workflow with Change Advisory Board approval every 2 days',
    stages: [
      { id: 'backlog', label: 'Backlog', type: 'queue', processTime: { min: 0, max: 0 }, waitTime: { min: 0, max: 0 } },
      { id: 'analysis', label: 'Refining Work', type: 'process', stepType: 'manual', processTime: { min: 2, max: 4 }, waitTime: { min: 8, max: 8 }, actors: 2, percentComplete: 95 },
      { id: 'dev', label: 'Development', type: 'process', stepType: 'manual', processTime: { min: 1, max: 8 }, waitTime: { min: 8, max: 8 }, actors: 5, percentComplete: 95 },
      { id: 'review', label: 'Code Review', type: 'process', stepType: 'manual', processTime: { min: 0.5, max: 2 }, waitTime: { min: 4, max: 8 }, actors: 2, percentComplete: 95 },
      { id: 'test', label: 'Testing', type: 'process', stepType: 'automated', processTime: { min: 0.5, max: 1 }, waitTime: { min: 0, max: 0 }, actors: Infinity, percentComplete: 95 },
      { id: 'cab', label: 'CAB Approval', type: 'process', stepType: 'batch', processTime: { min: 0.5, max: 1 }, waitTime: { min: 0, max: 0 }, actors: 1, percentComplete: 95, cadence: 48 }, // CAB meets every 48 hours (2 days)
      { id: 'deploy', label: 'Deployment', type: 'process', stepType: 'automated', processTime: { min: 0.8, max: 1.2 }, waitTime: { min: 0, max: 0 }, actors: Infinity, percentComplete: 95 },
      { id: 'done', label: 'Production', type: 'sink', processTime: { min: 0, max: 0 }, waitTime: { min: 0, max: 0 } },
    ],
    deploymentSchedule: 24, // hours (regular deployment, but CAB is the bottleneck)
  },

  waterfall: {
    id: 'waterfall',
    name: 'Waterfall Model',
    description: 'Traditional waterfall with long phases and quarterly releases',
    stages: [
      { id: 'backlog', label: 'Backlog', type: 'queue', processTime: { min: 0, max: 0 }, waitTime: { min: 0, max: 0 } },
      { id: 'requirements', label: 'Requirements', type: 'process', stepType: 'manual', processTime: { min: 80, max: 160 }, waitTime: { min: 40, max: 80 }, actors: 2, percentComplete: 95 },
      { id: 'design', label: 'Design', type: 'process', stepType: 'manual', processTime: { min: 80, max: 160 }, waitTime: { min: 40, max: 80 }, actors: 3, percentComplete: 95 },
      { id: 'dev', label: 'Development', type: 'process', stepType: 'manual', processTime: { min: 160, max: 320 }, waitTime: { min: 80, max: 160 }, actors: 8, percentComplete: 95 },
      { id: 'test', label: 'QA Testing', type: 'process', stepType: 'manual', processTime: { min: 80, max: 160 }, waitTime: { min: 40, max: 80 }, actors: 4, percentComplete: 95 },
      { id: 'uat', label: 'UAT', type: 'process', stepType: 'manual', processTime: { min: 40, max: 80 }, waitTime: { min: 80, max: 160 }, actors: 2, percentComplete: 95 },
      { id: 'deploy', label: 'Release', type: 'process', stepType: 'batch', processTime: { min: 4, max: 8 }, waitTime: { min: 0, max: 0 }, actors: 2, percentComplete: 95, cadence: 2160 }, // Quarterly releases (90 days * 24 hours)
      { id: 'done', label: 'Production', type: 'sink', processTime: { min: 0, max: 0 }, waitTime: { min: 0, max: 0 } },
    ],
    deploymentSchedule: 2160, // 90 days (quarterly)
  },

  dualReview: {
    id: 'dualReview',
    name: 'Dual Code Review',
    description: 'Workflow with both peer review and mandatory tech lead review',
    stages: [
      { id: 'backlog', label: 'Backlog', type: 'queue', processTime: { min: 0, max: 0 }, waitTime: { min: 0, max: 0 } },
      { id: 'analysis', label: 'Refining Work', type: 'process', stepType: 'manual', processTime: { min: 2, max: 4 }, waitTime: { min: 8, max: 8 }, actors: 2, percentComplete: 95 },
      { id: 'dev', label: 'Development', type: 'process', stepType: 'manual', processTime: { min: 1, max: 8 }, waitTime: { min: 8, max: 8 }, actors: 5, percentComplete: 95 },
      { id: 'peerReview', label: 'Peer Review', type: 'process', stepType: 'manual', processTime: { min: 0.5, max: 2 }, waitTime: { min: 4, max: 8 }, actors: 3, percentComplete: 95 },
      { id: 'techLeadReview', label: 'Tech Lead Review', type: 'process', stepType: 'manual', processTime: { min: 1, max: 3 }, waitTime: { min: 8, max: 16 }, actors: 1, percentComplete: 95 },
      { id: 'test', label: 'Testing', type: 'process', stepType: 'automated', processTime: { min: 0.5, max: 1 }, waitTime: { min: 0, max: 0 }, actors: Infinity, percentComplete: 95 },
      { id: 'deploy', label: 'Deployment', type: 'process', stepType: 'automated', processTime: { min: 0.8, max: 1.2 }, waitTime: { min: 0, max: 0 }, actors: Infinity, percentComplete: 95 },
      { id: 'done', label: 'Production', type: 'sink', processTime: { min: 0, max: 0 }, waitTime: { min: 0, max: 0 } },
    ],
    deploymentSchedule: 24, // hours
  },

  externalQA: {
    id: 'externalQA',
    name: 'External QA Team',
    description: 'Separate QA team with scheduled triage meetings - 20% of defects require test fixes',
    stages: [
      { id: 'backlog', label: 'Backlog', type: 'queue', processTime: { min: 0, max: 0 }, waitTime: { min: 0, max: 0 } },
      { id: 'analysis', label: 'Requirements', type: 'process', stepType: 'manual', processTime: { min: 2, max: 4 }, waitTime: { min: 8, max: 16 }, actors: 2, percentComplete: 95 },
      { id: 'dev', label: 'Development', type: 'process', stepType: 'manual', processTime: { min: 2, max: 10 }, waitTime: { min: 8, max: 16 }, actors: 5, percentComplete: 95 },
      { id: 'handoff', label: 'QA Handoff', type: 'process', stepType: 'manual', processTime: { min: 0.5, max: 1 }, waitTime: { min: 16, max: 24 }, actors: 1, percentComplete: 95 },
      { id: 'externalTest', label: 'External QA', type: 'process', stepType: 'manual', processTime: { min: 4, max: 8 }, waitTime: { min: 16, max: 32 }, actors: 3, percentComplete: 70 }, // 30% defect rate
      { id: 'triage', label: 'Triage Meeting', type: 'process', stepType: 'batch', processTime: { min: 0.5, max: 1 }, waitTime: { min: 0, max: 0 }, actors: 2, percentComplete: 80, cadence: 48, isExceptionFlow: true }, // Scheduled meeting every 48h, 20% need test fixes
      { id: 'testFix', label: 'Test Fix', type: 'process', stepType: 'manual', processTime: { min: 2, max: 4 }, waitTime: { min: 8, max: 16 }, actors: 2, percentComplete: 95, isExceptionFlow: true }, // Fix incorrect tests
      { id: 'deploy', label: 'Deployment', type: 'process', stepType: 'manual', processTime: { min: 1, max: 2 }, waitTime: { min: 4, max: 8 }, actors: 2, percentComplete: 95 },
      { id: 'done', label: 'Production', type: 'sink', processTime: { min: 0, max: 0 }, waitTime: { min: 0, max: 0 } },
    ],
    deploymentSchedule: 24, // hours
  },

  devops: {
    id: 'devops',
    name: 'Elite DevOps',
    description: 'High-performing team with automated pipeline and multiple deployments per day',
    stages: [
      { id: 'backlog', label: 'Backlog', type: 'queue', processTime: { min: 0, max: 0 }, waitTime: { min: 0, max: 0 } },
      { id: 'dev', label: 'Development', type: 'process', stepType: 'manual', processTime: { min: 0.5, max: 2 }, waitTime: { min: 0.5, max: 2 }, actors: 5, percentComplete: 95 },
      { id: 'review', label: 'Code Review', type: 'process', stepType: 'automated', processTime: { min: 0.1, max: 0.3 }, waitTime: { min: 0.5, max: 1 }, actors: Infinity, percentComplete: 95 },
      { id: 'test', label: 'Testing', type: 'process', stepType: 'automated', processTime: { min: 0.1, max: 0.2 }, waitTime: { min: 0, max: 0 }, actors: Infinity, percentComplete: 95 },
      { id: 'deploy', label: 'Deployment', type: 'process', stepType: 'automated', processTime: { min: 0.05, max: 0.1 }, waitTime: { min: 0, max: 0 }, actors: Infinity, percentComplete: 95 },
      { id: 'done', label: 'Production', type: 'sink', processTime: { min: 0, max: 0 }, waitTime: { min: 0, max: 0 } },
    ],
    deploymentSchedule: 0.25, // Deploy every 15 minutes (0.25 hours)
  },
}

// Helper to get scenario by ID
export const getScenario = (scenarioId) => {
  return SCENARIOS[scenarioId] || SCENARIOS.standard
}

// Get list of all scenarios for UI
export const getScenarioList = () => {
  return Object.values(SCENARIOS).map(s => ({
    id: s.id,
    name: s.name,
    description: s.description,
  }))
}
