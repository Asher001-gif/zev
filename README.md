# zev
A scroll game. 
Name and pitch: a vertical feed of 3D low-poly mini games. Each game is 30-60 seconds, one per screen, and plays instantly in Chrome. Swipe up and the next game is already there.

Final rules

Area	Decision
Format	9:16 frame, one game per screen
Games	6 at launch, same low-poly art style, same controls
Order	Shuffled, with no repeats in a session
Replay	None. Play once, then move on
Score / streak	None across games. Each game stands alone
Feedback	Like and dislike appear only when the game is paused, won, or lost
Name	Shown only in the small description caption
Navigation	Swipe up on touch, arrow key on desktop
Input	Feed locked while playing, unlocked at pause or end
Loading	Always one game ahead. Loading screen only if the next game isn’t ready

How shuffle works

At the start of a visit, shuffle the 6 games into a random order.
Play through that order with no game appearing twice.
Save which game came last (in the browser), so the next visit never starts with the same game the player just finished.
After the 6th game, show an end screen: “You’ve played everything. New games coming soon.” Offer a way to be told when new games arrive.

Because there’s no replay and no repeat, the end screen is a real finish line. It also shows you how many players make it through all 6, which is a useful signal.

Always one ahead, in short: while game N is being played, game N+1 downloads and prepares. When the player swipes, it opens instantly. If it isn’t ready, show a short loading screen in the same art style. When a game ends, release its memory completely.

What to build first

The feed shell: frame, swipe and arrow navigation, lock and unlock.
The game contract: a standard way for every game to start, end, pause, report its result, and clean up.
Shuffle with no repeats, plus preloading of the next game.
Game 1, built to be the lightest and fastest to load.
Like and dislike logging, saved on the device at first.
Games 2 to 6, using the same shared base.

## Endless loop

The end screen (with the Follow on itch.io button) is scrollable. Swipe up / press ↓ on it and a fresh shuffle starts, never opening with the game just played.

## Status (2026-11-18)

Decision: the first games are **2D** with different perspectives (side-scroll, top-down), same flat low-poly look. 3D can come later.

Built so far: feed shell (9:16 frame, swipe up / arrow key, lock while playing), game contract (`js/core.js` `makeGame`: start, pause, resume, win/lose, destroy), shuffle with no repeat and last-game memory, preload one ahead, like/dislike logging in `localStorage` (`zev.votes`), end screen with a Follow-on-itch.io button, and 11 games (6 original + 5 added 2026-11-18):

| id | view | goal |
|---|---|---|
| hop | side-scroll | jump spikes 30s |
| dodge | top-down | avoid shards 30s |
| flap | side-scroll | fly through gaps 30s |
| blaster | top-down | survive 35s, 3 lives |
| catch | side view | 15 gems in 40s, dodge bombs |
| orbs | top-down | 12 orbs in 35s, don't get caught |
| stack | side view | tap to drop sliding blocks, stack 12 in 40s |
| lane | top-down | cross the road 3 times in 40s, 3 lives |
| pop | tap target | pop 15 balloons in 30s, max 3 escape |
| flip | side-scroll | tap flips gravity, dodge spikes 30s |
| bounce | top-down | keep the ball alive 30s (or clear bricks) |
| slice | tap/drag | slice 15 fruits in 35s, bombs cost a life |
| jet | side-scroll | hold to fly, collect 10 coins in 35s, dodge zappers |
| snake | top-down | eat 12 apples in 40s, don't hit walls or yourself |
| climb | side view | bounce up platforms to 300m in 40s |
| mole | tap target | whack 15 moles in 35s, bombs cost a life |
| simon | tap target | repeat the tile pattern, 5 rounds in 50s |
| orbit | ring | tap to reverse, grab 10 stars, dodge blocks |
| archery | side view | time 6 shots, score 40+ |
| bridge | side view | hold to grow stick, cross 6 gaps in 45s |
| rhythm | 3 lanes | tap gems on the line, hit 20 in 40s |
| cannon | side view | drag to aim, pop 5 balloons with 6 shots |
| fish | side view | hold to dive, catch 8 fish, dodge jellyfish |

Controls everywhere: tap/Space = action, drag or WASD/arrows = move.

## Run locally

ES modules need a server: `python3 -m http.server 8000`, then open http://localhost:8000 (best in Chrome, or devtools mobile view).

## Adding a game

Create `js/games/<id>.js` with `export default makeGame({ id, name, caption, duration, init, update, draw })` and add one line to `js/games/index.js`.

## UI (2026-11-18)

Short-video style: game name + short description bottom-left (always visible); right rail with 👍 / 👎 (only when paused or ended) and **?** (always; opens how-to-play and pauses). New players get a one-time fade-to-black tutorial pointing at the buttons (`zev.tutorial` in localStorage). Reviews are stored per game on the device in `zev.reviews` as like / neutral / dislike counts (moving on without voting = neutral) for picking games later.
