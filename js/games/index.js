// Registry: each game is its own lazy chunk, so only the next game is ever downloaded.
export const REGISTRY = [
  { id: 'hop',     load: () => import('./hop.js') },      // side-scroll runner (lightest)
  { id: 'dodge',   load: () => import('./dodge.js') },    // top-down survival
  { id: 'flap',    load: () => import('./flap.js') },     // side-scroll flyer
  { id: 'blaster', load: () => import('./blaster.js') },  // top-down shooter
  { id: 'catch',   load: () => import('./catch.js') },    // side-view catcher
  { id: 'orbs',    load: () => import('./orbs.js') },     // top-down collect & chase
  { id: 'stack',   load: () => import('./stack.js') },    // side-view tower stacker (tap timing)
  { id: 'lane',    load: () => import('./lane.js') },     // top-down road crossing
  { id: 'pop',     load: () => import('./pop.js') },      // tap-to-pop balloons
  { id: 'flip',    load: () => import('./flip.js') },     // side-scroll gravity flipper
  { id: 'bounce',  load: () => import('./bounce.js') },   // top-down brick bouncer
  { id: 'slice',   load: () => import('./slice.js') },    // swipe to slice fruit
  { id: 'jet',     load: () => import('./jet.js') },      // hold-to-fly jetpack
  { id: 'snake',   load: () => import('./snake.js') },    // top-down snake
  { id: 'climb',   load: () => import('./climb.js') },    // vertical bouncer
  { id: 'mole',    load: () => import('./mole.js') },     // whack-a-mole
  { id: 'simon',   load: () => import('./simon.js') },    // memory pattern
  { id: 'orbit',   load: () => import('./orbit.js') },    // reverse-direction orbiter
  { id: 'archery', load: () => import('./archery.js') },  // timing archery
  { id: 'bridge',  load: () => import('./bridge.js') },   // stick bridge
  { id: 'rhythm',  load: () => import('./rhythm.js') },   // lane rhythm
  { id: 'cannon',  load: () => import('./cannon.js') },   // aim and pop balloons
  { id: 'fish',    load: () => import('./fish.js') },     // dive and catch fish
];
