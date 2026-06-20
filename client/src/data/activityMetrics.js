export const activityMetrics = {
  'Cricket': {
    types: [
      { id: 'batting', label: 'Batting', metric: 'runs' },
      { id: 'bowling', label: 'Bowling', metric: 'wickets' },
      { id: 'fielding', label: 'Fielding', metric: 'catches' }
    ]
  },
  'Football': {
    types: [
      { id: 'goals', label: 'Scoring', metric: 'goals' },
      { id: 'assists', label: 'Playmaking', metric: 'assists' },
      { id: 'minutes', label: 'Playing Time', metric: 'minutes' }
    ]
  },
  'Basketball': {
    types: [
      { id: 'points', label: 'Scoring', metric: 'points' },
      { id: 'rebounds', label: 'Rebounding', metric: 'rebounds' },
      { id: 'assists', label: 'Assists', metric: 'assists' }
    ]
  },
  'Weight Training': {
    types: [
      { id: 'bench_press', label: 'Bench Press', metric: 'kg' },
      { id: 'squat', label: 'Squat', metric: 'kg' },
      { id: 'deadlift', label: 'Deadlift', metric: 'kg' },
      { id: 'overhead_press', label: 'Overhead Press', metric: 'kg' }
    ]
  },
  'Cardio': {
    types: [
      { id: 'running', label: 'Running', metric: 'km' },
      { id: 'cycling', label: 'Cycling', metric: 'km' },
      { id: 'swimming', label: 'Swimming', metric: 'laps' }
    ]
  },
  'Reading': {
    types: [
      { id: 'pages', label: 'Pages Read', metric: 'pages' },
      { id: 'chapters', label: 'Chapters Read', metric: 'chapters' },
      { id: 'books', label: 'Books Finished', metric: 'books' }
    ]
  },
  'Programming': {
    types: [
      { id: 'commits', label: 'Commits', metric: 'commits' },
      { id: 'pr', label: 'Pull Requests', metric: 'PRs' },
      { id: 'hours', label: 'Hours Coded', metric: 'hours' }
    ]
  }
};
