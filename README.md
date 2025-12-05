# Value Stream Simulator

An interactive web-based simulator that visualizes software delivery workflows, queues, bottlenecks, and rework loops in real-time. Built with React and Vite, this tool helps teams understand how various system constraints impact flow efficiency, cycle time, and throughput.

## Overview

The Value Stream Simulator models a typical software delivery pipeline with stages from Backlog to Production. Watch work items flow through the system, and activate different constraints to see their real-time impact on key metrics like Work In Progress (WIP), throughput, and cycle time.

## Features

- **Real-time Visualization**: Animated flow of work items through stages (Backlog → Change Definition → Development → Testing → Deployment → Production)
- **Interactive Constraints**: Toggle common system problems to see their immediate impact:
  - Siloed Teams
  - Large Batch Sizes
  - Unclear Requirements
  - Quality Issues (Rework)
  - Manual Testing
  - Manual Deploy Gates
  - Infrequent Deploys
  - Too Many Features
  - Unstable Production
- **Configurable Settings**: Adjust process times, wait times, and deployment schedules
- **Live Metrics**: Track WIP, throughput, cycle time, and per-stage performance
- **Visual Indicators**: Color-coded work items (features, defects, unclear requirements, blocked items)

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Running the Application

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Running Tests

```bash
# Run tests
npm test

# Run tests with UI
npm test:ui

# Generate coverage report
npm test:coverage
```

## How It Works

### Stages

The simulator models six stages in a value stream:

1. **Backlog**: Entry point for new work
2. **Change Definition**: Requirements analysis and planning
3. **Development**: Implementation of features
4. **Testing**: Quality assurance and validation
5. **Deployment**: Release to production
6. **Production**: Completed work

Each stage has three zones:
- **Queue**: Work waiting to start
- **Wait**: Work delayed due to system constraints
- **Work**: Active processing

### Work Item Types

- **Features** (blue): Normal work items flowing through the system
- **Defects** (red): Bugs that may be rejected back to development
- **Unclear Requirements** (orange): Items with ambiguous specifications
- **Waiting/Blocked** (amber): Items held up by constraints

### System Constraints

Activate constraints to simulate real-world problems:

- **Siloed Teams**: Increases handoff delays between stages
- **Large Batch Sizes**: Forces items to wait for peers (batch of 5)
- **Unclear Requirements**: Sends work back from Development to Analysis
- **Quality Issues**: Defects discovered in Testing return to Development
- **Manual Testing**: Reduces parallelism and increases process time
- **Manual Deploy Gate**: Simulates change review board delays
- **Infrequent Deploys**: Schedules releases on fixed intervals (configurable)
- **Too Many Features**: Doubles feature generation rate
- **Unstable Production**: Doubles defect generation rate

### Metrics

- **Work In Progress (WIP)**: Number of active items in the system
- **Total Throughput**: Cumulative items delivered to production
- **Estimated Cycle Time**: Average time to complete an item
- **Per-Stage Metrics**: Process time and wait time for each stage

## Configuration

Use the Settings menu to customize:

- Process time ranges (min/max hours) for each stage
- Wait time ranges for each stage
- Number of actors (parallelism) per stage
- Deployment schedule frequency (for Infrequent Deploys constraint)

## Technology Stack

- **React** 18.3.1 - UI framework
- **Vite** 7.2.6 - Build tool and dev server
- **Tailwind CSS** 4.1.17 - Styling
- **Lucide React** - Icons
- **Vitest** - Testing framework
- **Testing Library** - Component testing

## Project Structure

```
vs-simulator/
├── src/
│   ├── App.jsx              # Main simulator component
│   ├── components/          # Reusable components
│   │   └── SettingsMenu.jsx # Configuration interface
│   ├── test/                # Test files
│   └── main.jsx             # Application entry point
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
└── README.md                # This file
```

## Use Cases

- **Learning Tool**: Understand the impact of system constraints on flow
- **Training**: Teach DevOps, Lean, and Agile principles
- **Experimentation**: Test hypotheses about process improvements
- **Visualization**: Demonstrate bottleneck effects to stakeholders
- **Planning**: Model changes before implementing them

## Contributing

Contributions are welcome! This simulator is designed to help teams visualize and understand their value streams.

## License

This project is open source and available under the MIT License.

## Acknowledgments

Built to demonstrate principles from:
- Theory of Constraints
- Lean Software Development
- DevOps Research and Assessment (DORA)
- Value Stream Mapping
