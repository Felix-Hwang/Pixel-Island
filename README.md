![social-preview](./icons/social-preview.png)
# Pixel Island

Play: https://felix-hwang.github.io/Pixel-Island/

## Overview

Pixel Island is a single-player browser game. You start as a level 1 creature, eat creatures of a lower level, and evolve until you reach level 10. There are 100 species, ten per level, and five maps.

The game has no build step and no dependencies. Its own software renderer draws every creature and map, and a script in `tools/audio` synthesizes the music and the sound effects. The interface comes in Korean, English, Chinese and Malay, and the game runs on phones and desktops.

License: [MIT](LICENSE). Made by [Felix](https://github.com/Felix-Hwang).

## Rules

- Touch a creature of a lower level to eat it. A full food gauge turns you into a random species of the next level. A level needs its number plus 2 in food.
- Touch a creature of a higher level and the round is over. Creatures of your own level only push you.
- At levels 1 and 2 you can also eat the berries on the ground.
- Thirty seconds after you reach level 10, the round ends in a win.
- The three stars above a creature show its level. They are green for levels 1 to 3, blue for 4 to 6, yellow for 7 to 9 and red for 10.
- Around you, half of the creatures can be eaten and up to 36% are hunters.
- Hunters leave you alone for the first 6 seconds of a round. After that a hunter chases for 10 seconds, then rests for 3.
- Hunters run a little slower than you, but some lunge at close range. Once a chase has lasted 2 seconds you speed up little by little, until you match the top speed of your fastest chaser or run 15% faster than usual. The extra speed fades when the chase ends.
- You cannot be hurt for a moment after you evolve.
- Food from terrain, such as food stalls and clams, fills at most half of a gauge.
- Species of one level differ in grade (S, A, B, C or D), detection range and temperament. The field guide in the main menu lists them.

The Enemy pursuit setting has three choices, and On is the default. Off stops hunters from coming after you, but touching one still ends the round. In Peaceful a touch only pushes you, so you cannot lose.

## Controls

- Keyboard: the arrow keys or WASD. Hold two keys to move diagonally.
- Touch or mouse: press anywhere and drag. The point you press becomes the centre of the stick.
- Esc, or the exit sign at the top right, leaves a round.

The settings change the camera view, the enemy pursuit, the music and the sound effects.

## Maps

Each round is played on one of five maps, picked at random. The map guide in the main menu explains the terrain effects.

| Map | Id | Terrain effects |
| --- | --- | --- |
| Wave Beach | `beach` | waves, falling coconuts, parasols, drink stands, tide pools |
| Market Street | `market` | food stalls, handcarts, a narrow alley, awnings, hawkers |
| Current Isles | `islands` | a current, a tide, pearl clams, jellyfish, a ferry |
| Firefly Swamp | `swamp` | fireflies, mud pits, rotten bridges, root shelters, slippery mud |
| Cloud Mountain | `mountain` | clouds to ride, rock walls, fog, high ground, a summit flag |

## Running

Serve the folder with any static file server and open it in a browser.

```bash
python -m http.server 5310
```

Then open http://localhost:5310/.

Four parameters in the page address set up a test. A parameter with no value picks at random.

| Parameter | Value | Example |
| --- | --- | --- |
| `map` | a map id | `?map=swamp` |
| `lv` | a starting level, 1 to 10 | `?lv=7` |
| `species` | a species id from `data/species` | `?species=otter` |
| `color` | red, orange, yellow, green, blue, indigo or violet | `?color=blue` |

To change a sound, edit `tools/audio/sfx.js` or `tools/audio/bgm.js` and run `node tools/audio/build.js`. The build needs Node.js and ffmpeg.

`.github/workflows/pages.yml` deploys every push to `main` once the Pages source of the repository is set to "GitHub Actions".

## Structure

Every file is a plain script that adds to one global object, `PI`. `index.html` loads the engine and the species. Maps, languages and sounds load when the game needs them.

```
index.html       load order and page shell
src/core/        constants, state, rules, population, movement, frame loop, sound
src/gfx/         the renderer
src/creatures/   body templates, animation, senses
src/behaviors/   8 movement patterns, one per file
src/world/       map baking, 5 maps, 25 terrain effects
src/ui/          screens, notices, status card
src/i18n/        language and string lookup
data/            species, speeds, grades, detection ranges, temperaments, text in four languages
tools/           two data check pages and the audio build
assets/audio/    9 music tracks and 48 sound effects, as MP3
```

Balance numbers such as creature size, population, the share of hunters and chase speeds are in `src/core/config.js`. A new map or terrain effect also has to be listed in `src/world/manifest.js`.
