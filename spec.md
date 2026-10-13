# CHRONO SHIFT — Game Development Specification



**Tagline:** Bend Time. Defy Fate.  

**Genre:** Sci-fi 2D/2.5D side-scrolling action runner / precision platformer  

**Target:** Browser-playable desktop game, with responsive layout and optional touch controls  

**Team:** PixelForge  

**Primary stack:** Phaser 3, JavaScript ES modules, Vite  



This is the authoritative implementation specification for AI-assisted development. Save it as `SPEC.md` in the project root. Read it before changing code, implement one phase at a time, and verify each phase before proceeding.



---



## 0. Instructions for the AI Developer



Treat this document as a requirements contract, not loose inspiration.



1. Read this entire file, the project README, and `PRD.md` if present before coding. Preserve compatible requirements. If requirements genuinely conflict, explain the conflict instead of silently discarding either.

2. Work **one phase at a time**. Complete only the phase requested by the user. Then report what changed, files touched, commands run, tests actually performed, known issues, and the exact next phase.

3. Inspect the existing project, package scripts, scenes, assets, and current changes before editing. Do not replace working code with a fresh scaffold unless the project is irreparably broken and the user approves.

4. Preserve working features. Avoid broad rewrites. Make small, coherent changes.

5. Functional first, polished second—but polish is mandatory. Build a playable, complete loop before expensive decoration, then refine visuals, motion, audio, responsiveness, and game feel.

6. No fake functionality. Every visible button, menu option, ability, collectible, checkpoint, pause control, settings control, and end-state action must work. Mark anything not implemented as incomplete.

7. Do not leave placeholder screens, TODOs, empty click handlers, fake progress bars, nonfunctional settings, or buttons that only show alerts in the final implementation.

8. Use original or permitted assets. Do not copy proprietary art, logos, UI, sound, or level layouts from other games. Record external assets and licenses in `ASSET_CREDITS.md`.

9. Follow event rules on AI assistance and disclose AI tools, libraries, assets, and sources as required. Do not claim organizer approval unless confirmed.

10. Test honestly. Never claim a build or test succeeded unless it was actually run and the result observed.

11. Keep dependencies minimal. Prefer Phaser 3 + JavaScript + Vite. No backend or database is required.

12. If external art/audio is unavailable, create an attractive original vector/canvas fallback so the game remains playable offline.

13. Avoid unbounded scope. No multiplayer, accounts, cloud saves, procedural world generation, or true 3D unless explicitly requested.

14. Before editing, state the phase and a short plan. After editing, provide a completion report and the next action.



---



## 1. Game Vision



### 1.1 Logline

In 2189, an experiment in Aethelon City's Chrono Core fractures time. As pilot Kael Veyron, the player must traverse a collapsing temporal facility, manipulate time and motion, and stabilize the core before the final countdown reaches zero.



### 1.2 Player promise

The player should feel fast, capable, and clever: reading geometric hazards, choosing precise movement, freezing threats at the right moment, and using a vector dash to cross danger. The game should be understandable within seconds and rewarding to master.



### 1.3 Core pillars

- **Readable high-speed action:** hazards are visible, telegraphed, and fair.

- **Time manipulation with trade-offs:** freeze and dash are powerful but energy-limited.

- **Mathematics is gameplay:** vectors, angles, trajectories, rotations, timing, geometry, and collision rules materially affect play.

- **Cinematic sci-fi presentation:** layered environments, controlled glow, temporal distortion, strong effects, and clear UI.

- **Complete experience:** menu → briefing/tutorial → gameplay → checkpoint/sections → final reactor → victory or game over → replay.

- **Competition reliability:** quick startup, stable frame rate, deterministic behavior, understandable controls, clear credits, and a presentation-ready ending.



---



## 2. Scope and Priorities



### P0 — Required

- Working project that installs, runs locally, and produces a production build.

- Main menu, briefing/how-to-play, gameplay HUD, pause/settings, victory and game-over screens.

- Playable character with run, jump, slide, collision, damage and recovery.

- Chrono Freeze and Chrono Dash with energy costs, availability rules, visual feedback, and clear explanations.

- At least one rotating geometric hazard, one moving projectile, and one moving or collapsing platform.

- One compact, completable level with four themed sections.

- Collectibles, score, health, countdown/timer, at least one checkpoint, restart flow.

- A final Chrono Core encounter and clear win/loss endings.

- Original/permitted visual and audio assets with credits.

- Keyboard controls and responsive UI; optional touch controls only after desktop controls work.

- Documentation and honest test/build instructions.



### P1 — High-value polish

- Parallax background layers and atmospheric particles.

- Dash trails, freeze pulse, impact flashes, landing dust, collectible effects, reactor effects.

- Smooth camera tracking, restrained screen shake, short hit-stop only where appropriate.

- Original sound effects and music with volume controls.

- Clear ability feedback, accessible contrast and readable typography.

- Performance checks on an ordinary integrated-graphics laptop.



### P2 — Optional stretch goals

- Touch controls, if they do not threaten core completion.

- Extra enemy/drone pattern, optional challenge route, best score saved locally.

- Additional animation details and accessibility toggles such as reduced screen shake/flashing.



Do not begin P2 until all P0 requirements work and P1 polish is underway.



---



## 3. Target Platform and Technical Constraints



- **Engine:** Phaser 3.

- **Language:** JavaScript ES modules. Use TypeScript only if the existing project already uses it and converting is safer than rewriting.

- **Build tool:** Vite.

- **Target:** Current desktop browsers (Chrome, Edge, Firefox) at common laptop resolutions.

- **Primary input:** Keyboard.

- **Rendering:** 2D gameplay with layered parallax and visual depth; do not implement a true 3D game.

- **Backend:** None required.

- **Persistence:** Optional local best score/settings only; core gameplay must not depend on network access.

- **Performance target:** Aim for stable 60 FPS on an ordinary integrated-graphics laptop. Avoid unnecessary post-processing, huge textures, excessive particles, and per-frame object creation.

- **Responsive behavior:** Keep gameplay readable at 1280×720 and smaller laptop windows. Scale game area and UI without clipping essential controls or HUD.

- **Dependencies:** Minimal. Explain every added dependency.

- **Asset loading:** Include local fallbacks for missing optional assets and handle load errors gracefully.



### 3.1 Recommended project layout

Adapt to the existing repository rather than forcing this exact tree:



```text

pixelforge-respawn/

├── index.html

├── package.json

├── vite.config.js

├── README.md

├── PRD.md

├── SPEC.md

├── ASSET_CREDITS.md

├── public/assets/

│   ├── images/

│   ├── audio/

│   └── fonts/

└── src/

    ├── main.js

    ├── config/gameConfig.js

    ├── scenes/

    │   ├── BootScene.js

    │   ├── PreloadScene.js

    │   ├── MenuScene.js

    │   ├── BriefingScene.js

    │   ├── GameScene.js

    │   ├── UIScene.js

    │   ├── PauseScene.js

    │   ├── VictoryScene.js

    │   └── GameOverScene.js

    ├── entities/

    │   ├── Player.js

    │   ├── hazards/

    │   └── collectibles/

    ├── systems/

    │   ├── ChronoSystem.js

    │   ├── HazardSystem.js

    │   ├── LevelSystem.js

    │   ├── ScoreSystem.js

    │   ├── AudioSystem.js

    │   └── InputSystem.js

    ├── ui/

    ├── effects/

    └── utils/

```



This tree is guidance, not a reason to refactor a healthy project. Keep modules focused and avoid one enormous scene file.



---



## 4. Narrative and World



- **Year:** 2189.

- **Location:** Aethelon City, a futuristic city powered by a Chrono Core.

- **Incident:** A core experiment fractures time, causing unstable physics, frozen projectiles, rotating geometry, and collapsing architecture.

- **Player:** Kael Veyron, a pilot equipped with a Chrono Gauntlet.

- **Mission:** Cross the temporal facility and stabilize the Chrono Core before the Zero Second countdown ends.

- **Tone:** Urgent, mysterious, high-tech, energetic. Story delivery should be brief and never obstruct gameplay for long.



Use short, polished briefing text. Do not add lengthy dialogue scenes or complex lore systems.



---



## 5. Core Gameplay Loop



1. Start from the menu and receive a concise control briefing.

2. Move through the level, avoid hazards, collect Chrono Cells, and build score.

3. Use ordinary movement and geometry-aware timing to cross obstacles.

4. Spend energy to freeze eligible hazards or perform a directional Chrono Dash.

5. Reach checkpoints that preserve progress within the current run and provide a clear recovery point.

6. Progress through four sections with escalating challenge.

7. Reach the Chrono Core encounter and perform the final stabilization sequence.

8. See a clear victory or game-over screen with score, time, and restart/menu options.



Gameplay must be possible without reading a long manual. Teach controls with contextual prompts at safe moments.



---



## 6. Player Controller



### 6.1 Required actions

- Run/move horizontally.

- Jump with gravity and a clear jump arc.

- Slide under suitable overhead hazards.

- Take damage with feedback and a brief invulnerability window to prevent repeated instant damage.

- Use Chrono Freeze.

- Use Chrono Dash.

- Die/game over, respawn at checkpoint where appropriate, or finish the level.



### 6.2 Controller feel

- Movement must feel responsive; avoid noticeable input lag.

- Use consistent physics and collision dimensions.

- Prevent repeated jumping in mid-air unless an explicit mechanic is designed and documented.

- Slide has a clear start/end and a smaller collision profile, then safely restores the standing collider.

- The player must not get trapped inside geometry after dash, freeze, slide, checkpoint respawn, or scene transition.

- Camera follows smoothly while keeping enough space ahead to read hazards.

- Animation communicates run, jump, slide, dash, damage and death. If sprite sheets are unavailable, use original procedural/vector animation rather than static rectangles.



### 6.3 Keyboard mapping

- `A` / `Arrow Left`: move left where the level allows it.

- `D` / `Arrow Right`: move right / accelerate forward according to the chosen side-scrolling model.

- `Space` / `Arrow Up`: jump.

- `S` / `Arrow Down`: slide.

- `Q`: Chrono Freeze.

- `E` / `Shift`: Chrono Dash.

- `Escape`: pause/resume.

- `Enter`: confirm menu choice.

- `R`: restart only when appropriate; never unexpectedly restart active play without clear confirmation or documented behavior.



Prevent simultaneous key events from triggering duplicate ability activations. Support keyboard focus and prevent browser scrolling when gameplay keys are active.



---



## 7. Chrono Abilities



All values below are initial tuning targets. Centralize them in configuration and playtest them; do not scatter magic numbers across modules.



### 7.1 Chrono Freeze

- Default energy cost: **35 / 100**.

- Default duration: **2.0 seconds**.

- Freeze eligible hazards and projectiles, rotating barriers, and moving/collapsing platforms where safe and coherent.

- Player movement/input, UI, and mission countdown continue normally.

- Freeze must not freeze the entire game clock, UI, countdown, or player controller.

- Show frozen objects with cyan/blue temporal rim, suspended particles and a restrained distortion/pulse, plus a clear end-of-freeze cue.

- Prevent activation when energy is insufficient or the ability is already active, unless refresh is deliberately supported.

- Show an activation/rejection cue; do not rely on text alone.



### 7.2 Chrono Dash

- Default energy cost: **25 / 100**.

- Target duration: **0.25–0.40 seconds**.

- Dash direction comes from a normalized vector derived from player input/facing direction, with a documented fallback if no direction is pressed.

- Dash crosses suitable gaps or evades hazards but cannot permanently bypass level boundaries or final objectives.

- Define collision/invulnerability rules: document exactly which hazards dash avoids and which barriers still block it.

- Feedback: bright temporal trail, short afterimages, directional burst, subtle camera impulse, and cooldown/energy response.

- End dash cleanly, restore normal movement/collision and prevent clipping through walls or landing inside hazards.



### 7.3 Energy rules

- Maximum: **100**.

- Freeze and dash costs are configurable.

- Chrono Cells recharge energy by a configurable amount; initial target **20**.

- Energy cannot exceed 100 or fall below 0.

- HUD clearly shows current energy and ability availability.

- Avoid soft-locks: provide enough energy or an alternate route wherever an ability is required.



---



## 8. Mathematical Mechanics — Core Event Requirement



Mathematics must materially change gameplay, not merely appear in decorative UI. Explain the mathematical rule in documentation and demonstrate it in the level.



### 8.1 Vectors

- Dash direction is computed from a normalized direction vector.

- Projectile movement uses velocity components; projectile angle determines its path.

- At least one encounter requires choosing when or where to move based on projectile trajectory.



### 8.2 Angles and rotations

- Include at least one rotating geometric hazard (e.g. triangular blade, rotating square, or polygonal barrier).

- Rotation must affect actual collision geometry or a clearly defined collision approximation; visual rotation alone is insufficient.

- Collision approximation must be fair and consistent with the visible object.



### 8.3 Geometry and collision

- Platforms, gaps, overhead barriers and hazard hitboxes use predictable shapes/sizes.

- Collision boxes broadly match visible hazards; avoid invisible damage zones.

- Telegraph dangerous motion with color, movement, sound or a short warning.

- Keep collision behavior consistent during freeze and dash.



### 8.4 Timing and trajectories

- At least one projectile uses a predictable trajectory with a visible tell.

- At least one collapsing/moving platform requires timing.

- The player learns patterns through observation rather than random unavoidable hits.

- Difficulty rises gradually; avoid unavoidable hazards immediately after a checkpoint.



### 8.5 Testability

Create test cases or a development-only debug mode to verify:

- dash direction and normalized speed;

- freeze affects only eligible objects;

- projectile direction/velocity;

- rotating hazard collision alignment;

- platform stop/collapse behavior;

- energy costs and recharge;

- collision while dashing and after freeze ends.



A debug overlay may show velocity vectors, hitboxes, angles and state names. Disable it in the final presentation build unless deliberately exposed as a documented option.



---



## 9. Level Design and Progression



Build **one compact, polished, completable level** divided into four sections. Target a 3–6 minute first successful run; this is a target, not a hard restriction.



### Section 1 — Awakening

- Establish movement, jump and slide in a safe space.

- Teach the Chrono Gauntlet and energy collection.

- Introduce one simple hazard with generous reaction time.

- Show contextual control hints that disappear after the player learns them or after a short period.



### Section 2 — Broken Timeline

- Introduce rotating geometric hazards and a moving projectile.

- Teach Chrono Freeze as a tactical choice.

- Add a moving/collapsing platform and a checkpoint.

- Increase complexity without combining too many new rules at once.



### Section 3 — Zero Zone

- Use tighter timing, alternating hazard types, and more demanding jump/slide/dash combinations.

- Include visible telegraphs and recovery space.

- Use visual distortion to communicate temporal instability without obscuring hazards or UI.



### Section 4 — Chrono Core

- Shift to a visually distinct reactor chamber.

- Present a short final encounter with rotating defenses, a predictable projectile pattern, and a stabilization objective.

- Require movement and at least one chrono ability; avoid pixel-perfect timing.

- Clearly signal the final action and transition into victory or failure.



### Level fairness

- Place collectibles intentionally to teach risk/reward and ability usage.

- Ensure no required jump exceeds tested reach.

- Every death must be attributable to a visible hazard or clearly explained mechanic.

- Checkpoints reduce repetition without removing challenge.

- Avoid endless generation or randomized placement that undermines a reliable demo.



---



## 10. Hazards, Collectibles, and Scoring



### 10.1 Required hazards

- Ground barrier requiring jump or dash.

- Overhead barrier requiring slide or another clearly taught solution.

- Rotating geometric blade/barrier with actual collision.

- Moving projectile with visible trajectory.

- Moving or collapsing platform.

- Temporal distortion zone that changes a clear gameplay parameter or communicates a specific danger.



Optional after P0: drone/second projectile pattern, small alternate route or bonus challenge.



Each hazard must have:

- Clear visual identity and collision shape.

- Predictable state machine (e.g. idle → telegraph → active → recovery).

- Documented freeze behavior.

- Fair damage/avoidance rules.

- Cleanup when no longer needed to prevent memory growth.



### 10.2 Collectibles

- Chrono Cells recharge energy.

- Score pickups increase score.

- Pickup collection has visible feedback and optional audio.

- Pickups cannot be collected repeatedly due to collision bugs.

- Use a small, readable number of collectible types; avoid clutter.



### 10.3 Scoring

- Award points for distance/progression, pickups, section completion and successful completion.

- Penalize damage only if the penalty is clearly shown and consistent.

- Avoid exploits from respawn, repeated pickups or farming.

- Results screen shows final score, elapsed/remaining time, sections completed, collectibles gathered, and optionally best score.

- If best score persists, use local browser storage and handle unavailable storage gracefully.



---



## 11. Health, Damage, Checkpoints, and Failure



- Use a clear health system with readable HUD indicators.

- Damage feedback communicates the cause; add a short invulnerability window after a hit.

- Use controlled screen shake and a flash, with options to reduce or disable intense effects where feasible.

- A checkpoint saves the current section/spawn location and the state required for safe respawn.

- Respawn restores a safe position and consistent movement/ability states; it must not duplicate collectibles or enable score exploits.

- If the mission countdown reaches zero, enter game over unless the final objective has already completed.

- If health reaches zero, enter game over or checkpoint recovery according to the chosen rule; document it.

- Game-over UI offers Retry/Restart and Main Menu.

- Victory UI offers Play Again and Main Menu.



---



## 12. Countdown and Final Objective



- Display a clearly labeled mission countdown, such as **ZERO SECOND**.

- Countdown continues during Chrono Freeze; pause is the only intentional way to stop it.

- When paused, freeze gameplay simulation and countdown together.

- The final reactor encounter ends in a real state transition, not a static victory banner over active hazards.

- Stabilization has clear prerequisites, progress feedback, completion feedback and failure handling.

- Playtest level length and timer together so a competent first-time player has a fair chance. Tune the countdown based on measured run times.



---



## 13. Visual Direction and Art Style



### 13.1 Overall art direction

Aim for premium, modern, cinematic sci-fi while preserving clarity and performance:

- Deep navy/near-black environments with layered silhouettes.

- Cyan/electric blue for Chrono energy and friendly/interactive systems.

- Violet/magenta for temporal anomalies.

- Orange/amber/red for hazards and urgent warnings.

- White/cool-gray typography with strong contrast.

- Geometric architecture, holographic panels, luminous rails, reactor rings, animated skyline, subtle scanlines and controlled atmospheric particles.

- Distinct foreground, gameplay plane, midground and distant background to create depth in a 2D/2.5D presentation.

- Use original design language. Broad genre inspiration is acceptable; copying another game's specific UI/art is not.



### 13.2 UI design

- Main menu feels like a finished game title screen, not a generic starter template.

- Clear hierarchy: title, tagline, primary Play action, secondary How to Play/Settings/Credits.

- Consistent spacing, typography, color, focus/hover/pressed states and icon style.

- HUD remains legible over bright effects and busy backgrounds.

- Keep essential information inside safe margins at smaller resolutions.

- Use clean panels and purposeful animation rather than excessive neon borders everywhere.

- Provide clear states for button hover/focus/disabled, ability ready, ability active, low energy, damage, checkpoint and objective completion.

- Settings controls change actual settings.

- Menus support mouse and keyboard navigation.



### 13.3 Required screen flows

1. Boot/loading screen with clear status or short original animation.

2. Main menu.

3. How to Play / mission briefing.

4. Gameplay HUD.

5. Pause overlay.

6. Settings with functional master/music/SFX volume if audio exists, plus reduced screen shake/flashing options where feasible.

7. Credits including team and third-party asset attributions.

8. Victory screen.

9. Game-over screen.

10. Results summary/replay flow.



### 13.4 Motion and transitions

- Use short, purposeful transitions between screens.

- Use camera easing and subtle parallax to add depth.

- UI animations must not delay gameplay.

- Respect reduced-motion settings where feasible.

- Avoid intense flashing or rapid strobing. Effects must not hide hazards, damage cues or controls.



---



## 14. VFX and Game Feel



VFX are a major polish target, but must not come before core mechanics work.



### 14.1 Required effects

- **Chrono Freeze:** expanding pulse/ring, controlled time-distortion ripple, frozen-object tint/rim, suspended particles, clear end cue.

- **Chrono Dash:** directional energy burst, short trail, restrained afterimages, exit/landing cue.

- **Jump/landing:** small dust/energy puff, brief landing squash or subtle camera response.

- **Slide:** low-profile trail/sparks when appropriate.

- **Damage:** brief player flash, impact burst and controlled shake; never obscure the hazard.

- **Collectible:** pickup flash, particles and HUD energy/score response.

- **Checkpoint:** beacon activation, short ring/pulse, checkpoint indicator.

- **Rotating hazard:** motion trail or edge highlight, clear telegraph before dangerous phases.

- **Projectile:** readable trail and impact burst.

- **Collapsing platform:** warning glow/cracks, shake or particles, then fall/break.

- **Reactor finale:** layered rings, energy arcs, pulsing core, escalating but readable effects, final stabilization burst.

- **Victory/game over:** short closing animation that does not trap the player in a long wait.



### 14.2 VFX implementation rules

- Prefer pooled/reused particles or capped emitters; avoid allocating hundreds of objects every frame.

- Avoid expensive full-screen shaders unless proven performant on integrated graphics.

- Use additive blending/glow sparingly; preserve silhouette/contrast.

- Screen shake is small, short and configurable.

- Effects are time-based, not frame-count based.

- Clean up completed tweens, timers, particles and temporary objects.

- Effects have a fallback or degrade gracefully if a texture/effect is missing.

- Prefer coherent effects tied to gameplay events over constant random particles everywhere.



---



## 15. Audio



- Include short, original or properly licensed sounds for jump, slide, dash, freeze start/end, pickup, damage, checkpoint, reactor interaction, victory and game over.

- Optional ambient/music layer supports tension without masking gameplay cues.

- Provide working master, music and SFX volume controls when audio is included.

- Respect browser autoplay rules: initialize/resume audio only after user interaction.

- Missing audio must not prevent game startup.

- Document audio sources and licenses in `ASSET_CREDITS.md`.



---



## 16. HUD and User Feedback



HUD should include, where applicable:

- Health.

- Chrono energy.

- Freeze/dash availability or cooldown state.

- Mission countdown.

- Score.

- Current section/objective.

- Contextual control hints that can be dismissed or disappear after use.

- Checkpoint feedback.

- Boss/final objective progress during the reactor encounter.



Rules:

- Do not clutter the screen with every metric at once.

- Use icons plus labels where icons alone are ambiguous.

- Show a clear cue when an ability cannot activate and why (insufficient energy, active cooldown or invalid state).

- Avoid text spam; use a compact notification queue.

- Keep UI readable over all backgrounds.

- Update UI from authoritative game state, not independent counters that drift out of sync.



---



## 17. Architecture and State Management



- Keep player, hazards, abilities, level progression, score, audio, UI and scene transitions modular.

- Use a single authoritative source of truth for health, energy, score, timer, checkpoints, collectibles and game state.

- Avoid circular dependencies between scenes and systems.

- Define explicit states for player and hazards instead of many conflicting booleans.

- Separate world simulation from HUD rendering.

- Use Phaser time/tween systems or a consistent delta-time approach; avoid inconsistent timers that break on pause.

- Pause all relevant gameplay timers, tweens and physics consistently.

- Chrono Freeze selectively suspends eligible entities while global progression continues.

- Clean up event listeners and input handlers when scenes stop/restart.

- Prevent duplicate event listeners and physics bodies after retry.

- Keep tunable values in a central configuration file: player speed, jump strength, gravity, slide duration, health, damage, invulnerability duration, freeze cost/duration, dash cost/speed/duration, recharge values, hazard speeds/rotations, projectile patterns, countdown, score rewards and checkpoint behavior.

- Use meaningful names and brief comments for non-obvious math/collision logic.



---



## 18. Required Development Phases



Complete phases sequentially. Do not skip ahead without user approval. At the end of each phase, run available checks and report results honestly.



### Phase 1 — Project Foundation

- Inspect repository and read `SPEC.md`/`PRD.md`.

- Confirm Node/npm and package scripts.

- Create/stabilize Phaser 3 + Vite project.

- Establish game configuration, canvas sizing, scaling, boot/preload flow and a minimal test scene.

- Ensure `npm run dev` works and production build command is documented.

- Do not build elaborate UI or full gameplay yet.



**Exit criteria:** Project starts without console errors, canvas scales correctly, production build succeeds.



### Phase 2 — Visual Identity and Menus

- Implement original main menu, How to Play, Settings and Credits.

- Create background layers, subtle parallax and polished typography/panels.

- All buttons work with mouse and keyboard.

- Settings modify actual runtime values and persist locally if implemented.



**Exit criteria:** Menu flows are functional, responsive and cohesive; no controls are decorative-only.



### Phase 3 — Player Controller

- Implement player physics, running, jumping, sliding, damage/death state, camera follow and collision.

- Create a simple test corridor with safe spacing.

- Add original procedural animations if art assets are not ready.



**Exit criteria:** Movement is consistent, collisions fair, retry/scene restart does not duplicate bodies or inputs.



### Phase 4 — Chrono Abilities

- Implement selective Chrono Freeze and vector Chrono Dash.

- Add energy costs/recharge, availability rules and VFX.

- Verify countdown continues during freeze but pauses with the game.

- Prevent dash clipping and invalid repeated activations.



**Exit criteria:** Both abilities materially change gameplay, costs are correct, feedback is clear, edge cases tested.



### Phase 5 — Mathematical Hazards

- Implement rotating geometric hazard, trajectory-based projectile, moving/collapsing platform and temporal distortion mechanic.

- Add readable telegraphs and collision behavior.

- Test vector, angle, collision, freeze and dash interactions.



**Exit criteria:** Required mathematical mechanics affect gameplay and behave predictably.



### Phase 6 — Level and Progression

- Build four sections with escalating complexity, collectibles, checkpoints, section indicators and recovery paths.

- Test reachability and avoid unavoidable hazards.

- Add transitions between sections.



**Exit criteria:** One complete finite level is playable from start to finish.



### Phase 7 — HUD and Game States

- Implement health, energy, score, timer, abilities, objective, pause, game over, victory, results and replay.

- Make HUD reflect authoritative game state.

- Ensure pause/resume and restart are reliable.



**Exit criteria:** All states and transitions work; player can complete/retry without refreshing browser.



### Phase 8 — VFX and Animation Polish

- Add required effects from Section 14.

- Improve player animation, environment motion, camera easing and impact feedback.

- Profile particle/tween counts and reduce effects if performance degrades.



**Exit criteria:** Effects communicate game events, remain readable and perform acceptably on integrated graphics.



### Phase 9 — Audio, Controls and Responsiveness

- Add original/permitted audio, working volume controls and optional touch controls.

- Check common laptop resolutions and browser sizes.

- Add reduced-motion options where feasible.



**Exit criteria:** Keyboard gameplay/UI are reliable, audio never blocks startup, layouts do not clip.



### Phase 10 — Chrono Core Finale

- Build distinct final chamber and stabilization objective.

- Include rotating defense, predictable projectile pattern and at least one required ability interaction.

- Implement victory/failure closure.



**Exit criteria:** Final encounter is winnable, understandable and transitions to results correctly.



### Phase 11 — Quality Assurance and Optimization

- Run lint/type checks if configured, tests if present, `npm run build`, and manual gameplay checks.

- Test abilities, collisions, timer, pause, checkpoint, collectibles, restart, win/loss.

- Test missing optional audio/assets and smaller viewport behavior.

- Fix errors before adding features.



**Exit criteria:** No known critical blockers; production build passes; remaining issues documented.



### Phase 12 — Competition Delivery

- Complete README and `ASSET_CREDITS.md`.

- Provide controls, objective, run/build commands, architecture overview, known limitations and test checklist.

- Prepare concise game description, demo path and pitch notes.

- Do not fabricate screenshots, recordings, test results or claims.

- Preserve the original project and submission-ready build.



**Exit criteria:** Another team member can run the game using README and demonstrate a complete run.



---



## 19. Quality Assurance Checklist



Mark an item `[x]` only after verifying it.



### Project

- [ ] Dependencies install from documented commands.

- [ ] Development server starts.

- [ ] Production build succeeds.

- [ ] No fatal console/runtime errors during a full run.

- [ ] Game loads without network APIs or required external services.



### Controls and player

- [ ] Keyboard input works and browser does not scroll during gameplay.

- [ ] Jump requires valid grounded state.

- [ ] Slide starts/ends and collider restores safely.

- [ ] Damage feedback and invulnerability work.

- [ ] Player cannot get stuck in walls/platforms.

- [ ] Camera never loses player or hides next required hazard.



### Abilities

- [ ] Freeze affects only eligible hazards.

- [ ] Countdown continues during freeze.

- [ ] Pause stops countdown and world simulation.

- [ ] Dash uses normalized vector and documented fallback.

- [ ] Energy costs/recharges are exact and capped.

- [ ] Ability VFX do not obscure gameplay.

- [ ] No soft-lock when energy is low.



### Hazards and mathematics

- [ ] Rotating hazard hitbox matches visible geometry sufficiently.

- [ ] Projectile trajectory is predictable and testable.

- [ ] Moving/collapsing platform is fair and telegraphed.

- [ ] Temporal distortion has clear gameplay meaning.

- [ ] Freeze/dash interactions are consistent.

- [ ] No unavoidable hazard immediately after checkpoint.



### Level and state

- [ ] All four sections exist and can be reached.

- [ ] Collectibles are collected once and score correctly.

- [ ] Checkpoint respawn is safe and consistent.

- [ ] Timer reaches zero correctly.

- [ ] Final stabilization can succeed and fail appropriately.

- [ ] Victory and game-over states are distinct.

- [ ] Restart and return-to-menu work without page refresh.



### UI, VFX and audio

- [ ] All menu buttons work.

- [ ] Settings change actual values.

- [ ] HUD remains readable at common sizes.

- [ ] Reduced-effects options work if shown.

- [ ] Audio controls work if audio is included.

- [ ] Missing audio/assets do not crash the game.

- [ ] Effects and temporary entities are cleaned up.

- [ ] Credits identify external assets and licenses.



### Final delivery

- [ ] README has setup, controls and build commands.

- [ ] SPEC/PRD requirements reviewed.

- [ ] Asset credits complete.

- [ ] No critical issue hidden or misrepresented.

- [ ] Full successful run demonstrated before claiming completion.



---



## 20. Required AI Completion Report



After each phase, report:



```text

PHASE COMPLETED:

- Phase number and name



IMPLEMENTED:

- Concrete features added or changed



FILES CHANGED:

- Exact file paths



VALIDATION:

- Exact commands/checks actually run

- Observed results only



MANUAL TESTS:

- Tests performed and outcomes

- If not performed, state “Not manually tested”



KNOWN ISSUES:

- Remaining bugs, missing assets, or incomplete requirements



SPEC COVERAGE:

- Requirements satisfied in this phase

- Requirements intentionally deferred



NEXT STEP:

- Exact next phase and suggested prompt

```



Do not mark a checklist item complete merely because code was generated. Verify in the running game or with an appropriate test.



---



## 21. Suggested First Prompt for Antigravity



Paste this only after saving the document as `SPEC.md` in the project root:



\> Read `SPEC.md`, `PRD.md` if present, `README.md`, `package.json`, and inspect the existing source code before editing. We are starting Phase 1 — Project Foundation only. Do not implement later phases yet. Preserve working code and use Phaser 3 + JavaScript ES modules + Vite unless the existing project has a working equivalent. Stabilize startup flow, canvas scaling, boot/preload flow, and a minimal test scene. Keep dependencies minimal. Run the actual available development/build checks and report exact results; do not claim unrun tests. End with the required AI Completion Report from Section 20. If a key requirement cannot be reconciled with the existing project, explain it before making a destructive change.



---



## 22. Final Definition of Done



CHRONO SHIFT is ready for submission only when:

- It has a polished, cohesive sci-fi visual identity and readable modern UI.

- A player can launch, understand, play, finish, lose, retry and return to menu.

- Chrono Freeze and Chrono Dash are functional and materially affect gameplay.

- Vectors, angles/rotation, trajectories, geometry and timing are demonstrated through real hazards.

- Four sections lead into a real final Chrono Core encounter.

- Health, energy, timer, score, collectibles, checkpoints and results remain consistent.

- Required VFX improve feedback without hiding hazards or harming performance.

- The project builds reliably and works offline after dependencies/assets are present.

- Documentation, controls, test status and third-party credits are honest and complete.

- Every required checklist item has been tested or any unverified item is clearly disclosed.



**Core principle:** Do not trade a complete, stable, fair and memorable game for a larger collection of unfinished features. Build in phases, test each milestone, and keep visual ambition tied to reliable gameplay.


---

## 23. Visual Overhaul — Implementation Contract

This section translates the visual direction into concrete Phaser implementation requirements. It supplements Sections 1–22; it does not replace existing gameplay, architecture, competition, or phase requirements. All values are initial targets to tune through browser testing, not claims about the current build.

### 23.1 Scene composition and rendering layers

Use the existing scene architecture where compatible. Keep environment rendering separate from gameplay entities, gameplay state, and HUD rendering. A typical gameplay composition is:

1. **Sky/backdrop:** deep-navy gradient, atmospheric glow, sparse stars or distant light points.
2. **Cloud field:** broad cloud silhouettes at multiple depths; slow drift only.
3. **Far skyline:** small, low-contrast towers and floating-island silhouettes.
4. **Midground city:** larger towers, suspended bridges, conduits, antennas, and energy structures.
5. **Temporal layer:** occasional violet fractures, cyan arcs, or restrained distortion cues placed away from critical collision silhouettes.
6. **Gameplay plane:** platforms, player, hazards, projectiles, collectibles, checkpoints, and interaction objects.
7. **Foreground accents:** sparse clouds, rails, cables, or silhouettes that add depth without crossing the player/hazard read area.
8. **HUD/UI layer:** fixed-to-camera UI, independent of world parallax and Chrono Freeze.

Use Phaser Containers or focused helper modules for related decorative elements only where they simplify lifecycle and depth management. Do not place all gameplay and decoration in one unmaintainable scene class. World-space objects must remain in world coordinates; HUD elements must use camera-fixed positioning or a dedicated UI scene.

### 23.2 Parallax and viewport targets

Use `setScrollFactor` or an equivalent camera-relative approach for parallax. Initial target factors:

| Layer | Initial scroll factor | Purpose |
|---|---:|---|
| Sky gradient / distant glow | 0.00–0.03 | Nearly stationary depth anchor |
| Clouds | 0.05–0.10 | Slow atmospheric motion |
| Far skyline / floating islands | 0.10–0.18 | Distant scale |
| Midground towers / bridges | 0.25–0.40 | Readable forward travel |
| Foreground accents | 0.50–0.70 | Stronger depth, used sparingly |
| Gameplay objects | 1.00 | Correct world-space movement and collision |

Treat these as starting values; confirm that camera motion produces visible depth without making the player appear to slide against the route. Avoid moving decorative layers in ways that imply false collision or obscure an incoming obstacle.

Use a logical landscape design size around 1280×720 and Phaser's responsive scaling strategy (for example, `Scale.FIT` with centered canvas placement) if compatible with the existing project. Handle smaller laptop windows without clipping the player, mission objective, timer, health, energy, or ability status. Prefer repositioning or compacting HUD groups over shrinking text below a readable size. Recalculate camera/UI bounds on resize; avoid creating a second Phaser game instance or duplicate resize listeners.

### 23.3 Original procedural art and textures

When suitable approved art is unavailable, generate original visuals using Phaser Graphics, Canvas, or reusable local texture-generation helpers. Suitable procedural elements include:

- Layered towers, windows, bridge segments, railings, and suspended platforms.
- Clouds and distant skyline silhouettes.
- A distinct Kael Veyron silhouette with helmet, suit panels, boots, cyan suit seams, and a visible Chrono Gauntlet.
- Laser emitters, geometric blades, projectiles, energy cells, checkpoint beacons, and the Chrono Core.
- UI frames, icons, ability rings, impact shapes, and subtle background patterns.

Generate reusable textures once during boot/preload or an explicit initialization step, cache them, and reuse them. Do not regenerate large textures every frame. Prefer vector-like shapes and modest texture sizes over heavy full-screen shaders or high-resolution art that harms integrated-GPU performance. If external assets are added, record source, license, modification, and use in `ASSET_CREDITS.md`; do not extract proprietary assets from the demonstration video.

### 23.4 Player render object and physics body

Separate the player’s authoritative physics/collision body from the decorative character render. A `Player` entity may own a physics sprite/body plus a child Container or sibling render object, but there must be one authoritative position and one collision body. Helmet glow, suit panels, limb pivots, the gauntlet, trail, and afterimages must not enlarge collision bounds.

Required visual states and transitions:

- `idle/ready` → `run`
- `run` → `jump-ascent` → `fall` → `landing` → `run`
- `run` or `landing` → `slide` → `run`
- eligible movement state → `dash` → prior valid movement state
- any living state → `damage` feedback, then restore the previous valid state after invulnerability
- lethal damage/fall/timeout → `death/failure` and a real game-state transition

Use state-driven transitions rather than multiple independent booleans that can conflict. Animation should remain time-based and should not depend on a fixed frame rate. If no sprite sheet is ready, use a deliberately articulated original procedural character with simple limb pivots and readable poses; do not treat a debug rectangle as final art. Sliding must reduce the physics profile safely and restore it without placing the player inside a barrier. Landing feedback must not delay input.

### 23.5 Chrono Dash visual lifecycle

Dash behavior must remain governed by the existing Chrono/Player system and its vector movement rules. Visual effects are feedback only; they must not be the source of movement or collision logic.

On successful activation, subject to the existing energy and cooldown rules:

1. Emit a compact cyan/electric-blue burst at the dash origin.
2. Spawn a short, capped series of player afterimages using the current render pose, tint, and alpha.
3. Render a tapered directional trail behind the player, using a pooled emitter, reused graphics object, or bounded trail segments.
4. Emit a small number of directional particles; avoid one or more new unbounded emitters per frame.
5. Add a restrained shockwave or exit/landing impact where appropriate.
6. Update the HUD immediately to show energy consumption and the ability's active/cooldown state.

Initial lifecycle targets: dash duration remains approximately 0.25–0.40 seconds; afterimages fade over roughly 0.12–0.28 seconds; trail segments/particles must have explicit maximum counts and lifetimes. These values are tunable. Every temporary effect must be destroyed, returned to a pool, or reset after its lifetime. Restarting or changing scenes must clear outstanding tweens, timers, emitters, and effects.

Dash must respect collision rules, level boundaries, and the documented invulnerability policy. Do not let the visual trail imply that the player passed through a solid obstacle when the collision system blocked movement. If the dash is rejected for insufficient energy or invalid state, show a short readable rejection cue without spawning the successful-dash effect.

### 23.6 Chrono Freeze state and feedback

Implement Freeze as selective suspension of explicitly eligible hazard entities—not a global scene pause, global time scale, or frozen update loop. Each eligible hazard must expose a clear freeze/resume contract, preserving its prior state and enough information to resume safely.

While Freeze is active:

- Eligible projectile velocity, rotating hazard angular progression, and moving/collapsing platform progression are suspended or held according to their documented behavior.
- The player controller and input remain responsive.
- HUD, UI animations needed for feedback, and the mission countdown continue.
- Ineligible entities continue their documented behavior.
- Pause remains distinct: pause suspends the relevant gameplay simulation and countdown together.
- At expiry, hazards resume without teleporting, jumping forward, duplicating timers, or immediately applying an unfair collision.

On activation, use an expanding cyan ring/pulse centered on the player, a short controlled temporal ripple, a clear player pulse, and a restrained cyan/blue rim or particle treatment on frozen hazards. Give frozen objects a visible but readable active state and provide an end cue when normal motion resumes. Avoid strobing and full-screen effects that hide hazards or text. Effects must honor reduced-motion options where available.

### 23.7 Hazard motion, collision geometry, and fairness

Hazards require explicit state and update behavior, such as `idle → telegraph → active → recovery`, and must use the authoritative game simulation delta time. Their visuals and hitboxes must agree closely enough that the player can infer danger from what is shown.

- **Laser gates:** visible emitters, a warning phase, clear active beam, and collision only during the intended active state.
- **Rotating geometric hazard:** angle progression drives its actual collision shape or a documented fair approximation. Do not rotate only the art while leaving an unrelated hitbox.
- **Projectile:** velocity components determine its path; show a short trail and enough warning time to react.
- **Moving/collapsing platform:** show a warning cue before movement/collapse and provide a tested route or recovery opportunity.
- **Temporal distortion zone:** change a documented gameplay parameter or communicate a specific, consistent hazard; do not use an unexplained decorative tint.
- **Collectibles/checkpoints:** use clear silhouettes, one-time collection/activation, and short pickup/beacon feedback.

Place hazards with safe reaction time and recovery space. Do not stack a newly introduced mechanic with another unfamiliar hazard immediately after a checkpoint. Test the same collision behavior during normal motion, Freeze, Dash, pause/resume, and checkpoint respawn.

### 23.8 HUD, menus, and state transitions

Keep the HUD fixed to the camera and separate from world parallax. Use consistent spacing, dark translucent backing where necessary, high-contrast white text, cyan/electric-blue energy indicators, violet anomaly accents, and orange danger cues. Do not use color as the only communication channel: pair ability states and warnings with labels, icons, or shape changes.

Keep the following visible only when useful and readable: health, energy, mission countdown, score/progress, current section/objective, Freeze/Dash availability, checkpoint status, and final encounter progress. Compact or reposition the HUD on smaller viewports without hiding essential information.

Menu, briefing, settings, pause, game-over, victory, and results screens must use the existing state/scene architecture. All buttons and keyboard focus/confirm actions must be functional. A real game-over or victory transition must stop active gameplay and its hazards. Restart must reset game state, timers, input listeners, physics bodies, checkpoints, collectibles, score, and transient effects without requiring a browser refresh. Returning to menu must not leave a hidden active gameplay scene running.

### 23.9 Cleanup and integrated-GPU performance

- Use object pooling or capped/reused emitters for repeated particles, projectiles, and afterimages where profiling shows a benefit.
- Put explicit limits on particles, trail segments, temporary graphics, and active tweens.
- Remove event listeners and input handlers when scenes stop; avoid duplicate listeners on restart.
- Destroy or reset timers, tweens, temporary display objects, and physics bodies on completion, retry, or scene transition.
- Avoid allocations and texture generation in hot per-frame update loops.
- Use delta time for movement, animation progression, rotation, particles, and effects.
- Prefer simple alpha/tint, pre-generated textures, and modest glow accents over expensive full-screen shaders.
- Keep the game playable when optional audio or effects are disabled or unavailable.
- Measure performance in the running browser on the available machine; report observed results rather than assuming a stable 60 FPS.

### 23.10 Development diagnostics

Provide a development-only debug option or key/config flag to render collision bounds, projectile velocity vectors, rotating hazard angles, player state, hazard state, Freeze eligibility/active state, energy values, and checkpoint spawn. Keep this overlay disabled in the normal player-facing build. Debug drawing must not change physics or gameplay outcomes and must be removed/disabled in final recordings unless intentionally disclosed.

### 23.11 Visual and gameplay validation matrix

Run the relevant subset after each phase, and run the full matrix before submission. Record pass/fail/not-run status with evidence; do not mark an item passed from code inspection alone when browser behavior is required.

| Area | Test | Expected result |
|---|---|---|
| Startup | Run the documented development command | Game starts without fatal errors; only one game instance exists |
| Build | Run the documented production build | Build exits successfully; warnings/errors are reported honestly |
| Environment | Move/camera-scroll through the level | Sky, clouds, skyline, midground and foreground show distinct restrained parallax |
| Resize | Resize browser across supported laptop sizes | Canvas and HUD stay usable; player and hazards remain visible; no duplicate listeners |
| Controls | Test every documented keyboard control | Correct action occurs once per press; gameplay keys do not scroll the page |
| Movement | Run, jump, land, slide, and recover | Responsive transitions; no mid-air repeat jump; collider restores safely |
| Dash | Test directions, low energy, cooldown, walls, gaps, and boundaries | Vector direction is correct; energy is charged once; collision is respected; VFX expire |
| Freeze | Freeze eligible and ineligible objects while countdown runs | Only eligible hazards suspend; player/UI/countdown continue; resume is safe |
| Hazards | Test laser warning/active phases, rotation, projectile, and platforms | Collision matches visible danger; trajectories and timing are predictable |
| Collectibles | Collect and revisit after respawn/restart | Each pickup grants its reward once per intended run; no farming/duplication |
| Checkpoint | Activate and die/respawn | Safe spawn and consistent health/energy/score/collectible policy |
| Pause | Pause with moving hazards and active effects | World simulation and countdown stop; resume restores valid states |
| Failure | Reach zero health or countdown / fatal fall | One clear game-over transition; no active hazards continue behind the screen |
| Completion | Complete the final stabilization objective | Gameplay ends in a distinct victory/results state; results are consistent |
| Restart | Retry repeatedly and return to menu | No duplicate scenes, bodies, listeners, pickups, timers, or particles |
| Visual clarity | Test against bright and dark backgrounds | Character, hazards, objective, and HUD remain distinguishable |
| Console | Inspect browser console during a full run | No repeated or fatal runtime errors; any remaining issue is documented |
| Performance | Observe a representative gameplay segment | Frame pacing is acceptable on the test device; actual measured/observed limitations are recorded |

---

## 24. Visual Overhaul Phase Mapping

Preserve the existing sequential Phases 1–12. Use the following requirements to make the visual overhaul actionable within those phases; do not skip a phase just to add a later effect.

- **Phase 1 — Project Foundation:** audit existing code and documents; confirm the app starts; stabilize Phaser/Vite entry, canvas scaling, boot/preload flow, and a minimal original scene. Do not claim a visual overhaul is complete here.
- **Phase 2 — Visual Identity and Menus:** establish the palette, typography, layered floating-city environment, parallax factors, reusable procedural environment art, title/menu/briefing/settings/credits, responsive layout, and working menu actions. **Exit:** browser-observed coherent environment and working menu flows.
- **Phase 3 — Player Controller:** separate physics from rendering; create Kael’s readable silhouette and idle/run/jump/fall/landing/slide/damage states; test movement and collision before adding signature VFX.
- **Phase 4 — Chrono Abilities:** implement selective Freeze and vector Dash state first, then bounded shockwave/trail/afterimage feedback; verify energy, collision, cooldown, countdown, and pause behavior.
- **Phase 5 — Mathematical Hazards:** implement angle-driven rotating collision, trajectory-driven projectiles, moving/collapsing platforms, laser gates, telegraphs, and temporal distortion with fair collision and documented Freeze behavior.
- **Phase 6 — Level and Progression:** arrange a finite traversable route through the four required sections, with intentional landmarks, collectibles, checkpoints, and recovery space.
- **Phase 7 — HUD and Game States:** finish responsive HUD, authoritative state updates, pause, game over, victory, results, restart, and return-to-menu behavior.
- **Phase 8 — VFX and Animation Polish:** refine dash/freeze/damage/landing/pickup/checkpoint/projectile/platform/reactor effects; enforce lifetimes, limits, cleanup, and reduced-motion behavior.
- **Phase 9 — Audio, Controls and Responsiveness:** test all keyboard paths, browser focus, resize behavior, optional audio controls, and reduced-motion settings.
- **Phase 10 — Chrono Core Finale:** create a distinct reactor chamber and readable stabilization interaction with real prerequisites, progress, success/failure transitions, and a memorable but short victory effect.
- **Phase 11 — Quality Assurance and Optimization:** run the validation matrix, test repeated restart/scene changes, inspect console errors, and observe performance on the target machine. Fix blockers before adding optional effects.
- **Phase 12 — Competition Delivery:** complete factual asset/tool credits, setup/build/control instructions, known limitations, test status, progress evidence, demo route, and pitch materials. Never fabricate test results or implementation status.

At every phase boundary, use the completion report in Section 20. The next phase begins only after the current phase’s exit criteria are checked and the user authorizes or requests continuation.

---

## 25. Revision History

| Revision | Date | Summary | Status |
|---|---|---|---|
| Original implementation specification | 2026-10-13 | Defined the game vision, mechanics, architecture, QA checklist, and 12 sequential development phases. | Baseline requirements; implementation must be verified separately. |
| Visual Overhaul v2 | 2026-10-13 | Added concrete Phaser layer composition and parallax targets; procedural art guidance; player render/physics separation; animation-state transitions; Dash trail/afterimage lifecycle; selective Freeze implementation and feedback; hazard motion/collision fairness; responsive HUD/state handling; cleanup and integrated-GPU performance rules; development diagnostics; validation matrix; and visual-overhaul phase mapping. | Requirements only; no source-code implementation or tests are implied by this document revision. |