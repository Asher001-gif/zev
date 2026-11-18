// Registry: each game is its own lazy chunk, so only the next game is ever downloaded.
export const REGISTRY = [
  { id: 'hop',     load: () => import('./hop.js') },      // side-scroll runner (lightest)
  { id: 'dodge',   load: () => import('./dodge.js') },    // top-down survival
  { id: 'flap',    load: () => import('./flap.js') },     // side-scroll flyer
  { id: 'blaster', load: () => import('./blaster.js') },  // top-down shooter
  { id: 'catch',   load: () => import('./catch.js') },    // side-view catcher
  { id: 'orbs',    load: () => import('./orbs.js') },     // top-down collect & chase
];
