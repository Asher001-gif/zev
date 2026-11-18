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
