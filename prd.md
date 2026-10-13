# PRODUCT REQUIREMENTS DOCUMENT (PRD)
# CHRONO SHIFT
## “Bend Time. Defy Fate.”

**Genre:** SCI-FI • TIME MANIPULATION • HIGH-SPEED ACTION  
**Event:** RESPAWN — 2D Game Jam, Pravrutti 2.0  
**Team:** PixelForge  
**Platform:** Web Browser  
**Game Engine:** Phaser 3  
**Language:** JavaScript (ES Modules)  
**Build Tool:** Vite  
**Target:** A polished, original, lightweight 2D/2.5D sci-fi action runner with mathematics integrated directly into gameplay.

---

# 1. DOCUMENT PURPOSE

This document is the single source of truth for designing and implementing CHRONO SHIFT.

Antigravity must use this specification to understand:

- What the game is.
- Why the game exists.
- The complete story and world.
- The player character and abilities.
- Every gameplay mechanic.
- The mathematical systems powering gameplay.
- All screens, menus, HUD elements, controls, and feedback.
- Level design and progression.
- Enemies, environmental hazards, collectibles, and the final objective.
- Visual design, animation, sound, and accessibility.
- Technical architecture and project structure.
- Testing, optimization, and completion criteria.
- RESPAWN competition requirements and submission deliverables.

**Implementation rule:** Build a working, complete, original game that follows this specification. Do not replace functional gameplay with static mockups, decorative buttons, placeholder screens, or non-interactive demonstrations.

When a feature is too expensive for the competition timeframe, implement the smallest functional version that preserves the core experience.

---

# 2. GAME IDENTITY

## 2.1 Official title

CHRONO SHIFT

## 2.2 Official tagline

“Bend Time. Defy Fate.”

## 2.3 Genre classification

- Science fiction.
- High-speed action platformer.
- Time-manipulation game.
- Runner-inspired obstacle course.
- Physics and geometry-based gameplay.
- Single-player arcade experience.

## 2.4 Core concept

CHRONO SHIFT is a futuristic action game in which the player races through a collapsing city where time and physical reality have become unstable.

The player must run, jump, dodge, slide, and manipulate time to overcome impossible obstacles. Using a device called the Chrono Gauntlet, the player can freeze hazards, perform accelerated dashes, and exploit the movement of geometric structures.

Every action depends on timing, velocity, direction, angles, distance, and spatial reasoning.

The player must reach the Chrono Core before the countdown reaches zero and reality collapses permanently.

## 2.5 Core promise

The player should feel that they are:

1. Racing against an approaching catastrophe.
2. Controlling time rather than merely reacting to obstacles.
3. Solving spatial and mathematical challenges through action.
4. Becoming faster and more skilled as the level progresses.
5. Completing a cinematic mission with a meaningful ending.

## 2.6 Design pillars

**Pillar 1 — Time is a gameplay mechanic**

Time manipulation must change the state of actual gameplay objects, not merely apply a visual filter.

**Pillar 2 — Mathematics drives gameplay**

Vectors, trajectories, angles, geometry, motion, and timing must directly influence obstacles, abilities, and player decisions.

**Pillar 3 — Immediate responsiveness**

Movement and abilities must feel fast, predictable, and responsive.

**Pillar 4 — Readable visual action**

Hazards, safe paths, interactable objects, and ability effects must be easy to distinguish.

**Pillar 5 — Complete experience over excessive scope**

One polished mission with a beginning, middle, climax, and ending is preferable to several incomplete levels.

---

# 3. EVENT ALIGNMENT AND CONSTRAINTS

CHRONO SHIFT must be designed around the official RESPAWN SCI-FI theme and its stated emphasis on mathematics and geometry as central gameplay elements.

## 3.1 Mandatory design requirements

- Original sci-fi setting and presentation.
- Original game-specific code and assets created during the permitted competition build window.
- Functional movement and collision detection.
- At least one genuinely useful time-manipulation mechanic.
- Mathematical systems that materially affect gameplay.
- An actual objective and a defined win condition.
- A functional failure or game-over condition.
- Playable gameplay rather than a menu-only prototype.
- A clear final encounter or concluding challenge.
- A restart option.
- Appropriate performance on an ordinary laptop with integrated graphics.
- Documentation of the engine, libraries, external assets, and AI tools as required by the organizers.

## 3.2 Competition compliance

The official event rules and organizer instructions take precedence over this PRD.

Antigravity must not assume that all AI-generated code or assets are automatically permitted. Before relying on AI-generated competition-specific material, the team should confirm the applicable rules with the organizers.

Do not import a completed game or a pre-built game project. Do not misrepresent external assets as original creations.

Use permitted engines, libraries, tools, and assets, and document them accurately.

## 3.3 Build-window priority

The essential game must become playable as early as possible.

Priority order:

1. Functional player movement.
2. Working collision and obstacles.
3. Chrono Freeze.
4. Chrono Dash.
5. A complete playable level.
6. Countdown, health, energy, victory, and defeat.
7. Mathematical gameplay systems.
8. Visual and audio polish.
9. Optional enhancements.

Do not spend the initial build window creating elaborate menus or cinematic scenes before the game itself works.

---

# 4. STORY AND WORLD

## 4.1 Setting

The year is 2189.

Humanity has constructed Aethelon, a technologically advanced city powered by a revolutionary energy source called the Chrono Core.

Scientists discover that time can be manipulated by converting temporal energy into controlled fields. The technology promises instantaneous transportation, limitless energy, and the ability to control physical processes.

During a critical experiment, the Chrono Core becomes unstable.

The resulting explosion fractures the city's timeline.

Buildings alternate between different states of existence. Roads disappear and reappear. Gravity behaves unpredictably in certain zones. Drones repeat the same movements. Projectiles become suspended in the air. Geometric structures rotate through impossible orientations.

The city is approaching total temporal collapse.

## 4.2 Main character

**Name:** Kael Veyron

**Role:** Experimental pilot and temporal rescue operative.

**Equipment:** Chrono Gauntlet.

Kael was part of the team responsible for testing the temporal technology. Equipped with a prototype Chrono Gauntlet, Kael is the only person capable of navigating the unstable temporal field surrounding the Core.

Kael must travel through the fractured city, stabilize its failing systems, and reach the Core before the final collapse.

## 4.3 Central conflict

The environment is no longer governed by stable time.

The player cannot rely entirely on speed or reflexes. Some obstacles must be frozen, others must be crossed at a particular angle, and some require calculating the right moment to jump or dash.

The central challenge is to use time manipulation intelligently rather than continuously activating abilities.

## 4.4 Narrative objective

Reach the Chrono Core, disable the unstable temporal field, and restore the city's timeline before the countdown reaches zero.

## 4.5 Narrative delivery

Keep the story lightweight and integrated into gameplay.

Use:

- A short opening cinematic or animated intro.
- A mission briefing.
- Environmental storytelling.
- Brief messages from the city's automated AI.
- Short transitions between level sections.
- A final reactor sequence.
- A victory ending.

Avoid lengthy dialogue, voice-acting requirements, or complicated branching narratives.

---

# 5. GAMEPLAY OVERVIEW

## 5.1 Game format

The game should use a 2D side-view or 2.5D-inspired perspective.

The character is visible on screen while the environment moves around the player. Use layered backgrounds, perspective-like platforms, parallax, glowing structures, and foreground effects to create depth.

Do not attempt full 3D third-person gameplay in the core competition version.

## 5.2 Primary gameplay loop

1. The player enters a new section of Aethelon.
2. The environment introduces a movement or timing challenge.
3. The player identifies the hazard and its movement pattern.
4. The player jumps, slides, dodges, freezes time, or dashes.
5. Correct timing and spatial reasoning allow the player to progress.
6. The player collects temporal energy and reaches checkpoints.
7. Obstacles become more complex as the mission progresses.
8. The player enters the Chrono Core chamber.
9. The player completes the final challenge.
10. The game displays a victory sequence and mission results.

## 5.3 Camera and movement model

Use a side-scrolling camera with smooth horizontal following.

The player should remain near the left-center region of the viewport while the environment scrolls toward them.

The character may move horizontally within the gameplay space for limited positioning, but the primary direction of progress is forward.

The camera must not move so aggressively that it obscures hazards or causes motion discomfort.

## 5.4 Game modes

### Required

- Main Menu.
- Tutorial or introductory gameplay.
- Main Mission.
- Pause.
- Victory.
- Game Over.

### Optional

- Practice Mode.
- Time Trial.
- Replay with best score.
- Additional challenge sections.

Optional modes must not delay completion of the core mission.

---

# 6. PLAYER CHARACTER AND MOVEMENT

## 6.1 Player representation

Kael must have a recognizable futuristic silhouette.

Required visual characteristics:

- Futuristic pilot suit.
- Distinctive Chrono Gauntlet.
- Cyan or blue energy accents.
- Visible movement and jump animations.
- Clear damage feedback.
- Visible energy activation effect.

The character can initially be implemented using an original sprite, a small original sprite sheet, or a consistent procedural drawing system.

Do not block gameplay implementation while waiting for elaborate character art.

## 6.2 Running

The character moves forward automatically or through sustained directional input, depending on the chosen implementation.

Recommended core behavior:

- Continuous forward progress.
- Controlled lateral positioning where the level supports it.
- Smooth acceleration and deceleration where appropriate.
- Consistent collision dimensions.
- Speed increases in selected later sections.

If using automatic forward running, provide a short tutorial explaining that the primary challenge is timing, jumping, sliding, and time manipulation.

## 6.3 Jump

The player can jump to avoid ground hazards, cross gaps, and reach elevated platforms.

Requirements:

- A distinct jump animation.
- A clear takeoff and landing.
- A configurable jump impulse.
- Gravity-based movement.
- Collision with platforms.
- Prevention of unlimited repeated jumps while airborne.
- A short grace window for forgiving platforming, if feasible.
- Optional double jump only if it can be implemented reliably.

The default implementation should use a single jump.

## 6.4 Slide

The player can slide beneath overhead barriers.

Requirements:

- A dedicated slide action.
- Temporary reduction of the player's collision height.
- A clear slide animation or pose.
- Automatic return to the normal collision shape after the slide duration.
- No accidental permanent crouching.
- Correct interaction with time freeze.

## 6.5 Dodge

The player can quickly reposition or evade a hazard.

A dodge may be implemented as a short lateral burst or a temporary invulnerability window, but it must have consistent, visible behavior.

Do not grant unlimited invulnerability.

## 6.6 Landing and falling

- The character must land on valid platforms.
- Falling into a gap should cause a defined failure or health penalty.
- The player must not become permanently stuck below the level.
- Recovery should use a checkpoint or restart mechanism.

## 6.7 Movement tuning

Keep movement values configurable in a central configuration module.

Expose settings for:

- Running speed.
- Maximum speed.
- Jump impulse.
- Gravity.
- Lateral movement speed.
- Slide duration.
- Dash duration.
- Dash speed.
- Collision padding.
- Invulnerability duration.

Avoid scattering unrelated magic numbers throughout the code.

---

# 7. THE CHRONO GAUNTLET

The Chrono Gauntlet is the defining gameplay feature.

It gives Kael access to two primary abilities.

## 7.1 Ability A — CHRONO FREEZE

**Purpose:** Temporarily stop selected hazards and moving environmental objects.

### Gameplay behavior

When the player activates Chrono Freeze:

1. The Gauntlet emits a visible temporal pulse.
2. Eligible hazards stop moving.
3. Eligible projectiles stop advancing.
4. Eligible rotating obstacles stop rotating.
5. Eligible collapsing platforms pause their collapse sequence.
6. A visible frozen-state effect appears.
7. The player can cross the temporarily safe area.
8. The effect ends after its duration or when the energy budget is exhausted.

### Default tuning

- Initial duration: approximately 2 seconds.
- Initial energy cost: 35 units on a 100-unit scale.
- Cooldown: approximately 1.5 seconds after activation or expiration.
- Values must be configurable and balanced through testing.

These are proposed gameplay values, not official event requirements.

### Important implementation rule

Chrono Freeze must affect real gameplay state.

Do not merely tint the screen blue while leaving the hazards active.

### Selective freezing

Freeze only eligible temporal objects.

The following must normally remain active:

- UI animations.
- The player.
- The main game timer.
- Victory and defeat transitions.
- Input processing.
- The core game loop.

This prevents time freeze from stopping the entire game or making the countdown exploitable.

### Frozen-object feedback

Use a combination of:

- Cyan outlines.
- Brief particle bursts.
- Reduced animation speed to zero.
- Frozen projectiles with visible trails.
- A subtle screen effect.
- A remaining-duration indicator.

### Counterplay

Some late-game obstacles may be resistant to Chrono Freeze. Clearly communicate this before the player reaches them.

Do not introduce freeze-resistant hazards without visual or tutorial guidance.

## 7.2 Ability B — CHRONO DASH

**Purpose:** Perform a rapid temporal burst to cross dangerous areas.

### Gameplay behavior

When activated:

1. The Gauntlet charges briefly.
2. A direction vector is calculated.
3. The player accelerates along that vector.
4. A temporal trail follows the character.
5. The player crosses a gap or avoids an approaching hazard.
6. Normal movement resumes after the dash.

### Default tuning

- Dash duration: approximately 0.25–0.4 seconds.
- Dash energy cost: approximately 25 units on a 100-unit scale.
- Short cooldown to prevent continuous activation.
- Dash distance determined by speed and duration.

These values are starting points for testing.

### Dash rules

- The dash must have a clear beginning and end.
- It must not allow the player to escape the level bounds.
- It must not permanently bypass the final challenge.
- Collisions must be handled predictably.
- The dash must respect the player's position and the direction of travel.
- If a dash crosses a gap, the destination must be reachable and safe.
- The player must receive feedback when energy is insufficient.

### Mathematical behavior

Let the dash direction be represented by a unit vector:

\[
\mathbf{d}=(\cos\theta,\sin\theta)
\]

The dash displacement is approximately:

\[
\Delta\mathbf{p}=v_d t_d\mathbf{d}
\]

where:

- \(v_d\) is dash speed.
- \(t_d\) is dash duration.
- \(\theta\) is the dash direction.
- \(\Delta\mathbf{p}\) is the resulting displacement.

In a side-scrolling level, the available dash directions may be constrained to forward and limited vertical or lateral movement.

The math must drive the actual dash implementation.

## 7.3 Ability energy system

The Chrono Gauntlet has an energy meter.

Requirements:

- Maximum energy: 100 units.
- Energy displayed clearly in the HUD.
- Freeze and dash consume energy.
- Energy can be replenished through collectibles or designated recharge points.
- Insufficient energy prevents activation.
- Invalid activation produces visual feedback.
- Energy cannot exceed the configured maximum.
- Energy values must remain synchronized with the HUD.

Use a configurable energy manager rather than separate, inconsistent energy values in multiple systems.

## 7.4 Ability balance

The game should encourage strategic use of both abilities.

- Freeze is for pausing specific threats.
- Dash is for crossing dangerous spaces quickly.
- Jumping remains useful even when energy is depleted.
- Sliding remains useful against overhead obstacles.
- Some obstacle sequences should be possible without using every ability.
- The player must not be forced into an unavoidable failure solely because of a poorly placed energy requirement.

---

# 8. MATHEMATICS AS A CORE GAMEPLAY SYSTEM

This is one of the most important requirements in CHRONO SHIFT.

Mathematics must be directly responsible for gameplay outcomes.

The game should visibly demonstrate mathematical principles through movement, hazards, trajectories, rotations, and timing.

## 8.1 Vectors and direction

Use vectors for:

- Player movement.
- Dash direction.
- Projectile movement.
- Knockback or impact direction, if implemented.
- Directional hazard warnings.
- Movement between platforms.

A vector represents both magnitude and direction.

The player should be able to understand that the direction and magnitude of an action influence its result.

## 8.2 Angles and rotating obstacles

Implement at least one rotating obstacle whose collision or safe passage depends on its angular position.

For an object rotating at angular velocity \(\omega\):

\[
\theta(t)=\theta_0+\omega t
\]

where:

- \(\theta_0\) is the initial angle.
- \(\omega\) is angular velocity.
- \(t\) is elapsed time.

The safe passage should depend on the actual orientation of the obstacle.

Chrono Freeze must pause the rotation of eligible objects.

## 8.3 Projectile trajectories

Include projectiles or energy bolts that move along predictable paths.

A basic trajectory can be represented as:

\[
x(t)=x_0+v_x t
\]

\[
y(t)=y_0+v_y t+\frac{1}{2}gt^2
\]

where:

- \(x_0,y_0\) are the initial coordinates.
- \(v_x,v_y\) are initial velocity components.
- \(g\) represents vertical acceleration.

If using a simplified straight-line projectile, its movement vector must still determine its path.

The player should be able to learn and avoid projectile patterns.

## 8.4 Geometry and collision

Use actual geometric relationships for:

- Platform dimensions.
- Gaps.
- Rotating barriers.
- Triangular or polygonal hazards.
- Safe zones.
- Collectibles.
- Collision bounds.

Arcade-style rectangular collision bodies may be used for efficient gameplay, even if the rendered obstacle looks more complex.

The rendered shape and collision shape must be visually understandable and reasonably aligned.

## 8.5 Timing and motion

Use elapsed time and motion calculations to control:

- Hazard activation.
- Moving platforms.
- Freeze duration.
- Dash duration.
- Jump timing.
- Countdown.
- Obstacle sequences.
- Checkpoint activation.

Prefer delta-time-based movement so behavior remains consistent across frame rates.

## 8.6 Spatial reasoning challenges

At least one obstacle sequence should require the player to combine two or more concepts.

Example:

A rotating triangular barrier sweeps across a gap while projectiles travel toward the player's path.

The player must:

1. Read the rotation.
2. Predict the safe opening.
3. Freeze the barrier or projectiles.
4. Jump or dash through the opening.
5. Land on a safe platform.

This sequence combines geometry, angle, timing, and movement.

## 8.7 Mathematical visibility

The game should make its mathematical behavior easy to demonstrate during the competition presentation.

Possible visual aids:

- A brief directional arrow during dash.
- A visible projectile trail.
- A rotation indicator around moving hazards.
- A clear safe-zone outline.
- A trajectory preview for a special obstacle.
- A temporal field radius around frozen objects.

Use these sparingly so the game remains an action game rather than a mathematics worksheet.

## 8.8 Required minimum mathematical mechanics

The final build must include:

1. Vector-based player dash.
2. At least one rotating geometric hazard.
3. At least one moving projectile or trajectory-based hazard.
4. Timing-based obstacle interaction.
5. Collision detection based on geometry.
6. Time freeze that changes the movement state of eligible objects.

If time permits, add a second combined geometry challenge in the final section.

---

# 9. LEVEL DESIGN

## 9.1 Overall structure

Create one continuous mission divided into four themed sections.

Each section should introduce or reinforce a gameplay idea.

### SECTION 1 — AWAKENING

**Purpose:** Introduce the player, controls, and world.

Environment:

- A futuristic transit platform.
- Bright cyan energy conduits.
- Distant skyscrapers.
- Damaged transport systems.
- Small environmental anomalies.

Gameplay:

- Basic running.
- Jumping.
- Sliding beneath a barrier.
- Collecting temporal energy.
- A low-risk Chrono Freeze tutorial.

The player should learn movement before encountering demanding obstacles.

### SECTION 2 — BROKEN TIMELINE

**Purpose:** Introduce mathematics and more complex movement.

Environment:

- Broken roads.
- Suspended debris.
- Rotating geometric structures.
- Drones.
- Unstable energy barriers.

Gameplay:

- Rotating obstacles.
- Moving projectiles.
- Gaps requiring a jump or dash.
- Freeze-and-cross sequences.
- Energy management.

This section must clearly demonstrate the relationship between angles, vectors, motion, and timing.

### SECTION 3 — ZERO ZONE

**Purpose:** Increase pressure and combine abilities.

Environment:

- More fragmented architecture.
- Bright temporal distortions.
- Moving platforms.
- Large energy structures.
- More intense environmental effects.

Gameplay:

- Faster hazard patterns.
- Combinations of overhead and ground hazards.
- Sequential movement challenges.
- Freeze-resistant obstacles introduced with clear warnings.
- Limited safe areas.
- A final approach checkpoint.

Do not increase difficulty simply by making everything faster. Use more interesting combinations of already-understood mechanics.

### SECTION 4 — CHRONO CORE

**Purpose:** Deliver the climax and resolve the story.

Environment:

- A central reactor chamber.
- A large glowing Chrono Core.
- Rotating energy rings.
- Suspended geometric structures.
- Strong cyan and orange lighting.
- Temporal distortion effects.

Gameplay:

1. Reach the reactor platform.
2. Avoid the core's projectile patterns.
3. Read the movement of rotating rings.
4. Use Chrono Freeze at a useful moment.
5. Dash through an opening or across a dangerous gap.
6. Activate the stabilizer.
7. Complete the final interaction.
8. Trigger the victory sequence.

The final challenge must be beatable and should test the mechanics learned earlier.

## 9.2 Level layout requirements

The level must have:

- A clear starting point.
- A visible forward path.
- Safe and dangerous areas.
- Clearly telegraphed hazards.
- Collectible placement that encourages exploration or risk.
- At least one checkpoint if feasible.
- A clear final objective.
- No unavoidable collision caused by incorrect obstacle placement.
- A reliable end-of-level transition.

## 9.3 Difficulty progression

Early gameplay should be forgiving.

Middle gameplay should require ability use and timing.

Late gameplay should combine previously learned systems.

Difficulty must be tested by playing the game, not guessed from code.

## 9.4 Checkpoint system

At minimum, implement restart from the beginning.

A checkpoint before the final section is recommended.

When a checkpoint is reached:

- Save the checkpoint state in memory.
- Display a clear checkpoint notification.
- Ensure the player can recover from a later failure.
- Prevent the player from respawning inside an obstacle.

Persistent storage is not required for the core competition build.

---

# 10. HAZARDS AND ENVIRONMENTAL OBJECTS

Implement a small set of reusable hazard types.

## 10.1 Ground energy barrier

A ground-level obstacle that requires a jump or an alternate path.

Requirements:

- Clear warning.
- Predictable collision.
- Appropriate damage or failure behavior.
- Distinctive orange or red hazard lighting.

## 10.2 Overhead barrier

A horizontal barrier that requires sliding or another clearly communicated maneuver.

## 10.3 Rotating geometric blade

A rotating obstacle whose safe opening changes over time.

Requirements:

- Real angular movement.
- Collision or safe passage based on the active orientation.
- Visible rotation direction.
- Eligible interaction with Chrono Freeze.

## 10.4 Temporal projectile

A moving energy projectile with a visible trajectory.

Requirements:

- Predictable movement.
- Distinctive trail.
- Collision detection.
- Ability to freeze when configured as freeze-eligible.
- A clear warning if it moves toward the player's position.

## 10.5 Collapsing platform

A platform that begins collapsing after the player approaches or lands on it.

Requirements:

- A visible warning before collapse.
- A defined collapse delay.
- Collision removal or fall behavior after collapse.
- Chrono Freeze pauses the collapse timer if the platform is eligible.

## 10.6 Moving platform

A platform that moves between defined positions.

Movement should use a deterministic path or interpolation.

The platform must not teleport unexpectedly unless the teleport is a deliberate, clearly communicated temporal effect.

## 10.7 Temporal distortion zone

An environmental region that visually suggests unstable time.

In the core build, this can modify the movement of selected hazards or trigger a short gameplay event.

It must not create invisible or unexplained damage.

## 10.8 Hazard implementation rules

- Use a common hazard interface or shared behavior where practical.
- Make speed, damage, and freeze eligibility configurable.
- Use collision callbacks or a centralized collision system.
- Remove or recycle off-screen objects.
- Prevent hazards from spawning directly on top of the player.
- Ensure every damaging interaction has clear feedback.

---

# 11. ENEMIES AND DRONES

Enemies are secondary to the obstacle course.

Do not create a complex combat system unless the essential game is already complete.

## 11.1 Scout drone

A hovering surveillance drone that moves in a predictable pattern.

It may fire a limited number of projectiles or create a temporary hazard.

Requirements:

- Distinctive silhouette.
- Visible movement.
- Readable attack warning.
- Optional Chrono Freeze interaction.

## 11.2 Enemy scope

The minimum viable game can use environmental hazards without enemies.

If an enemy is implemented, it must have a real effect on gameplay and should not merely be decorative.

Avoid complex enemy navigation, dialogue trees, or multiple combat classes.

---

# 12. COLLECTIBLES AND REWARDS

## 12.1 Temporal energy shards

Glowing energy fragments placed along the route.

When collected:

- The shard disappears or plays a collection animation.
- Energy increases by a configured amount.
- Energy cannot exceed 100.
- A sound and visual effect confirm collection.
- The HUD updates immediately.

## 12.2 Optional score items

Additional collectibles may increase the mission score.

Use them to reward risky but achievable routes.

## 12.3 Scoring system

The score can be calculated using:

- Distance travelled.
- Energy shards collected.
- Successful obstacle passages.
- Remaining health.
- Completion time.
- Optional skill bonuses.

Use configurable weights.

The score must never prevent the player from completing the core mission.

## 12.4 Results screen

At the end of a run, display:

- Mission outcome.
- Final score.
- Distance completed.
- Energy shards collected.
- Time remaining or completion time.
- Optional best score.
- Restart button.
- Main Menu button.

Store a local best score only if time permits. Do not require accounts or a backend.

---

# 13. HEALTH, DAMAGE, AND FAILURE

## 13.1 Health system

Use a simple health system.

Recommended starting configuration:

- Maximum health: 100.
- Minor collision: configurable damage.
- Major hazard or fall: larger damage or immediate failure.
- Temporary invulnerability after damage to prevent repeated instant damage from one collision.

All damage values must be configurable and tested.

## 13.2 Damage feedback

When damage occurs:

- Flash the character briefly.
- Play a short hit effect.
- Update the health bar immediately.
- Provide a subtle visual warning.
- Prevent multiple damage events from being triggered continuously by the same collision.

## 13.3 Game-over conditions

The player loses when:

- Health reaches zero.
- The player falls into a fatal gap.
- The mission countdown reaches zero.

These conditions should be configurable so the final level can be balanced.

## 13.4 Recovery

The Game Over screen must provide:

- Restart Mission.
- Return to Main Menu.

If checkpoints are implemented, provide the appropriate checkpoint restart.

Do not leave the game in a frozen state without a visible recovery option.

---

# 14. COUNTDOWN AND MISSION TIMER

The story revolves around an impending temporal collapse.

Implement a visible mission countdown.

## 14.1 Behavior

- Begin the countdown when active gameplay starts.
- Pause the countdown when the game is paused.
- Continue the countdown during Chrono Freeze.
- Do not allow Chrono Freeze to stop the main timer.
- Stop the timer after victory or defeat.
- Display a clear warning as the remaining time becomes low.

## 14.2 Balance

Use a configurable starting duration.

The countdown should create urgency without making a first-time player fail before they can learn the controls.

Tune it through repeated playtesting.

Do not choose an arbitrary short countdown simply because the title contains “Zero Second.”

## 14.3 Visual feedback

Use a high-contrast digital timer.

At low time remaining:

- Increase the visual urgency.
- Show a short warning.
- Intensify selected ambient effects.
- Avoid excessive flashing or screen shaking.

The timer must remain readable.

---

# 15. USER INTERFACE AND SCREENS

The UI must feel like a futuristic mission-control interface.

Use a bright, vibrant sci-fi style rather than an entirely dark interface.

Recommended palette:

- Electric cyan: primary technology and time powers.
- Bright blue: movement and player identity.
- Violet: temporal anomalies.
- Orange: hazards and warnings.
- White: important text.
- Deep navy: contrast and panel backgrounds.
- Green: mission completion and safe states.

Avoid excessive glow, clutter, and unreadable small text.

## 15.1 Loading screen

Display:

- CHRONO SHIFT logo or title.
- Tagline.
- Loading indicator.
- Brief animated temporal energy effect.

The loading screen should transition automatically when assets and initialization are complete.

Do not simulate loading indefinitely.

## 15.2 Main Menu

Required elements:

- CHRONO SHIFT.
- “Bend Time. Defy Fate.”
- Start Mission.
- How to Play.
- Settings.
- Credits.

Use a moving futuristic city background, subtle parallax, and restrained temporal effects.

All visible buttons must perform their intended actions.

### Start Mission

Opens the mission introduction or starts gameplay.

### How to Play

Displays controls and a short explanation of the two main abilities.

### Settings

Opens functional settings for available audio and display options.

### Credits

Shows the team and permitted technology or asset credits.

## 15.3 Mission briefing

Display a short mission statement:

“Aethelon is collapsing. Reach the Chrono Core, stabilize the timeline, and prevent Zero Second.”

Include a Start button.

Avoid lengthy text that delays gameplay.

## 15.4 In-game HUD

The HUD should remain visible during active gameplay.

### Upper left

- Player health.
- Chrono Energy.
- Small character or Gauntlet indicator if practical.

### Upper center

- Mission progress or section indicator.

### Upper right

- Countdown timer.
- Mission objective.

### Lower left

- Keyboard or touch movement guidance, depending on platform.

### Lower right

- Chrono Freeze control.
- Chrono Dash control.
- Optional jump or slide touch controls on mobile.

### Additional feedback

- Collectible notifications.
- Checkpoint notifications.
- Damage feedback.
- Ability cooldown.
- Low-energy warning.
- Low-time warning.
- Mission completion notification.

Do not place essential information over the character or directly over incoming hazards.

## 15.5 Pause menu

Include:

- Resume.
- Restart Mission.
- Settings.
- Main Menu.

Pausing must stop gameplay simulation, hazard movement, and countdown progression.

The pause screen must not accidentally trigger player abilities.

## 15.6 Victory screen

Display:

- “TIMELINE STABILIZED.”
- A short victory animation.
- Mission score.
- Performance summary.
- Restart Mission.
- Main Menu.

## 15.7 Game Over screen

Display:

- “TEMPORAL COLLAPSE.”
- A brief failure effect.
- Failure reason, if known.
- Restart Mission.
- Main Menu.

## 15.8 UI implementation rules

- Use consistent typography.
- Use readable font sizes.
- Use clear hover, active, disabled, and focus states.
- Provide keyboard navigation for menu actions.
- Prevent clicks from activating the same action multiple times.
- Avoid browser text selection during gameplay.
- Ensure UI scales appropriately with viewport dimensions.
- Do not use emoji as a substitute for every game icon.
- Prefer original icons or consistent vector shapes.

---

# 16. VISUAL DESIGN DIRECTION

## 16.1 Overall aesthetic

The game should look like a polished, colorful futuristic action title.

Visual references should be used only for high-level inspiration. Do not copy proprietary artwork, logos, characters, maps, or UI from existing commercial games.

The desired experience combines:

- Fast runner-style action.
- A visible player character.
- Strong movement feedback.
- Cinematic futuristic environments.
- Clear action-oriented HUD.
- Bright temporal energy effects.
- Geometric sci-fi structures.

## 16.2 Environment

Use a futuristic city with:

- Layered skyscrapers.
- Elevated roads.
- Energy rails.
- Holographic signs.
- Floating platforms.
- Reactor structures.
- Temporal fractures.
- Moving machinery.
- Suspended debris.

Use parallax layers to create depth.

## 16.3 Temporal effects

Create original visual effects for:

- Freeze activation.
- Frozen hazards.
- Dash trails.
- Temporal distortion.
- Energy collection.
- Damage.
- Checkpoints.
- Reactor stabilization.
- Victory.

Effects should be lightweight and performant.

## 16.4 Particle system

Use particles for:

- Energy sparks.
- Small debris.
- Dash trails.
- Collectible bursts.
- Reactor pulses.

Limit particle counts and lifetime.

Avoid generating thousands of new objects every frame.

## 16.5 Screen effects

Optional effects:

- Short screen shake on major impacts.
- Brief color shifts during temporal events.
- Subtle vignette.
- Camera movement during the final sequence.
- Controlled glow.

Every effect must be brief and must not hide gameplay.

Provide reduced-motion options where feasible.

## 16.6 Asset requirements

Use original, coherent art.

Possible implementation order:

1. Simple procedural shapes for the first playable build.
2. Original player sprite.
3. Original environment tiles or backgrounds.
4. Hazard sprites.
5. UI icons.
6. Particle effects.
7. Optional polished illustrations.

Do not let asset creation delay functional gameplay.

Maintain consistent scale, outline treatment, and color language.

---

# 17. AUDIO DESIGN

Audio is part of the game feedback system.

## 17.1 Required sound effects

If time permits, implement:

- Menu selection.
- Jump.
- Slide.
- Chrono Freeze activation.
- Chrono Freeze expiration.
- Chrono Dash.
- Energy collection.
- Damage.
- Checkpoint.
- Victory.
- Game Over.

Prioritize distinctive ability sounds over numerous minor effects.

## 17.2 Music

Use a suitable futuristic electronic soundtrack if permitted.

Music should intensify in later sections without overpowering gameplay feedback.

All external music and sound sources must be credited as required.

## 17.3 Audio settings

Include:

- Master volume.
- Music volume.
- Sound effects volume.
- Mute option.

Settings must have real effects on audio output.

## 17.4 Technical audio rules

- Handle browser audio activation restrictions appropriately.
- Do not start repeated music instances when changing scenes.
- Avoid extremely loud default volume.
- Prevent sound effects from stacking uncontrollably.
- The game must remain playable if audio fails to load.

---

# 18. CONTROLS AND INPUT

## 18.1 Desktop keyboard controls

| Action | Default input |
|---|---|
| Move left | A or Left Arrow |
| Move right | D or Right Arrow |
| Jump | Space |
| Slide | S or Down Arrow |
| Chrono Freeze | Q |
| Chrono Dash | E or Shift |
| Pause / Resume | Escape |
| Confirm menu selection | Enter |

The automatic-running model may reduce the need for continuous forward movement input.

If a key is used for multiple actions, document the behavior clearly.

## 18.2 Input behavior

- Movement must respond promptly.
- Held keys must not create repeated unintended activations.
- One-shot abilities should trigger once per valid press.
- Inputs should be ignored while the game is paused.
- Inputs should not activate abilities on the main menu.
- Focus loss should pause or safely suspend gameplay.
- The game must handle key release and window focus changes without getting stuck moving.

## 18.3 Touch controls

Touch support is recommended if feasible after desktop gameplay works.

Touch interface:

- Left-side movement area or directional controls.
- Jump button.
- Slide button.
- Chrono Freeze button.
- Chrono Dash button.
- Pause button.

Requirements:

- Large touch targets.
- No dependence on keyboard input on touch devices.
- No unwanted page scrolling while playing.
- Touch events must not accidentally trigger browser navigation.
- The game must remain usable in landscape orientation.

Desktop browser playability is the primary requirement.

---

# 19. TECHNICAL ARCHITECTURE

## 19.1 Technology stack

Use:

- Phaser 3 for the game engine.
- JavaScript with ES modules.
- Vite for local development and production builds.
- HTML for the application entry point.
- CSS for any surrounding page styling.
- Phaser rendering and physics systems.
- Local browser storage only for optional settings or best score.

Official references:

- Phaser documentation: https://docs.phaser.io/
- Phaser scenes: https://docs.phaser.io/phaser/concepts/scenes
- Phaser input: https://docs.phaser.io/phaser/concepts/input
- Phaser physics: https://docs.phaser.io/phaser/concepts/physics
- Vite guide: https://vite.dev/guide/

## 19.2 Architecture principles

- Keep gameplay logic separate from visual presentation where practical.
- Use scenes for distinct screens and game states.
- Keep configuration values centralized.
- Use reusable hazard behaviors.
- Avoid unnecessary dependencies.
- Avoid backend infrastructure unless an essential requirement emerges.
- Do not require login or an internet connection for the core game after it has loaded.
- Keep the game runnable through the local Vite development server.
- Ensure the production build works independently of the development environment.

## 19.3 Recommended scenes

### BootScene

Initializes the game and prepares loading.

### PreloadScene

Loads permitted assets and prepares resources.

### MenuScene

Displays the main menu.

### BriefingScene

Explains the mission.

### GameScene

Runs the main gameplay and level logic.

### PauseScene or pause overlay

Provides pause controls.

### ResultScene

Displays victory or defeat and results.

A separate tutorial scene is optional. A tutorial overlay inside GameScene is acceptable.

## 19.4 Recommended modules

- `config.js` — game configuration and tunable values.
- `Player.js` — player movement, animation, and abilities.
- `ChronoSystem.js` — energy, freeze, dash, and cooldown logic.
- `Hazard.js` — common hazard behavior.
- `Projectile.js` — projectile movement and collision.
- `LevelManager.js` — section progression and spawning.
- `CollisionManager.js` — collision rules and damage.
- `HUD.js` — health, energy, timer, and mission progress.
- `AudioManager.js` — sound and music.
- `ScoreManager.js` — scoring and results.
- `GameStateManager.js` — active, paused, victory, and defeat states.

These modules may be consolidated if the initial project is small. Do not create empty abstractions solely to match the list.

## 19.5 Suggested project structure

    chrono-shift/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── README.md
    ├── public/
    │   └── assets/
    │       ├── images/
    │       ├── audio/
    │       └── fonts/
    └── src/
        ├── main.js
        ├── config.js
        ├── scenes/
        │   ├── BootScene.js
        │   ├── PreloadScene.js
        │   ├── MenuScene.js
        │   ├── BriefingScene.js
        │   ├── GameScene.js
        │   └── ResultScene.js
        ├── entities/
        │   ├── Player.js
        │   ├── Hazard.js
        │   └── Projectile.js
        ├── systems/
        │   ├── ChronoSystem.js
        │   ├── LevelManager.js
        │   ├── CollisionManager.js
        │   ├── ScoreManager.js
        │   └── AudioManager.js
        ├── ui/
        │   └── HUD.js
        └── styles/
            └── main.css

The structure is a recommendation, not a reason to rewrite a working project. Adapt it to the scaffold Antigravity creates.

## 19.6 State management

Use explicit game states:

- BOOT.
- MENU.
- BRIEFING.
- PLAYING.
- PAUSED.
- VICTORY.
- GAME_OVER.

Only PLAYING should advance active gameplay and the mission countdown.

Pause must freeze the relevant simulation.

Victory and Game Over must stop active hazard interactions and prevent additional damage events.

## 19.7 Performance

Target smooth gameplay on an ordinary laptop with integrated graphics.

Requirements:

- Aim for 60 FPS on a typical modern laptop.
- Keep object counts controlled.
- Use lightweight collision bodies.
- Avoid unnecessary full-screen filters.
- Reuse objects where practical.
- Remove or recycle off-screen projectiles.
- Avoid unbounded particle creation.
- Avoid heavy 3D rendering libraries.
- Prevent memory leaks when restarting.
- Avoid excessive per-frame object allocation.
- Use delta time for movement.

The target is a design goal; verify actual performance through testing.

---

# 20. GAMEPLAY SYSTEM DETAILS

## 20.1 Collision system

The collision system must support:

- Player versus platforms.
- Player versus hazards.
- Player versus projectiles.
- Player versus collectibles.
- Player versus checkpoints.
- Player versus level boundaries.

Collision requirements:

- Prevent repeated damage from a single sustained overlap.
- Use appropriate collision bodies.
- Ensure collision detection remains correct during dash.
- Avoid tunneling through thin hazards at high speed.
- Keep player movement bounded.
- Ensure the player can land on moving platforms where supported.

If the default physics system cannot reliably handle high-speed dashing, use appropriate movement substeps or a controlled dash collision strategy.

## 20.2 Object lifecycle

Objects must be created and destroyed safely.

- Recycle or remove off-screen hazards.
- Remove collected objects.
- Stop updates for inactive objects.
- Clear scene-specific timers when the scene stops.
- Remove duplicate event listeners.
- Reset all transient state on restart.

## 20.3 Spawn logic

Hazards must be placed or spawned using defined patterns.

Do not generate completely random, unfair obstacle combinations.

Random variation is acceptable only within safe, tested parameters.

Every generated sequence must provide a valid route or a clearly telegraphed ability-based solution.

## 20.4 Deterministic patterns

Prefer deterministic hazard patterns for the core level.

This allows:

- Fair difficulty.
- Repeatable testing.
- Reliable progress recordings.
- Easier debugging.
- More consistent player learning.

## 20.5 Restart logic

Restart must reset:

- Player position.
- Health.
- Energy.
- Timer.
- Score.
- Collected items.
- Hazard positions.
- Projectile states.
- Ability cooldowns.
- Freeze states.
- Dash state.
- Checkpoint state, according to the restart option.
- Mission progression.
- Temporary visual effects.

Restarting must not create duplicate timers, audio tracks, or event handlers.

---

# 21. ACCESSIBILITY AND USABILITY

Implement the following where feasible:

- Readable text.
- High contrast between hazards and safe platforms.
- Distinct visual signals beyond color alone.
- Reduced-motion option.
- Adjustable sound levels.
- Keyboard-accessible menus.
- Clear instructions before introducing a new hazard.
- No required rapid button sequence without warning.
- Consistent button behavior.
- Clear feedback when abilities cannot be used.

Do not rely only on red versus green to communicate danger and safety.

---

# 22. SECURITY, PRIVACY, AND OFFLINE BEHAVIOR

The core game does not need user accounts, a backend, payments, advertisements, or analytics.

Avoid collecting personal information.

Do not include API keys, secrets, or private credentials in the source code.

Do not add unnecessary third-party scripts.

The core mission should work without sending player data to an external server.

Optional best-score and settings storage should be local to the browser.

If external assets are used, ensure they are available in the final build and properly credited.

---

# 23. REQUIRED DEVELOPMENT MILESTONES

These milestones are intended to help the team complete the game during the competition window.

## Milestone 1 — Project setup

- Verify Node.js and npm.
- Create or inspect the Phaser project.
- Start the Vite development server.
- Confirm the game renders in the browser.
- Establish a minimal project structure.

**Acceptance:** The project starts without errors.

## Milestone 2 — Core movement

- Implement the player.
- Implement running.
- Implement jumping.
- Implement sliding.
- Add platforms and collision.
- Add camera following.

**Acceptance:** The player can navigate a short test section.

## Milestone 3 — Chrono abilities

- Implement energy management.
- Implement Chrono Freeze.
- Implement Chrono Dash.
- Add visual feedback.
- Add cooldowns.
- Verify interactions with hazards.

**Acceptance:** Both abilities change real gameplay and obey their costs and timing rules.

## Milestone 4 — Main level

- Build the four sections.
- Add rotating hazards.
- Add projectile patterns.
- Add gaps and moving platforms.
- Add energy collectibles.
- Add checkpoints if feasible.

**Acceptance:** The mission can be completed from start to finish.

## Milestone 5 — Game states and UI

- Add menu.
- Add mission briefing.
- Add HUD.
- Add pause.
- Add Game Over.
- Add victory screen.
- Add restart.

**Acceptance:** All essential screens and controls function correctly.

## Milestone 6 — Math and gameplay balance

- Verify vector-based dash.
- Verify rotation-based obstacle behavior.
- Verify trajectory-based hazards.
- Verify timing interactions.
- Test ability costs.
- Adjust countdown and health.
- Remove unfair obstacle sequences.

**Acceptance:** Mathematical behavior is demonstrable and materially affects gameplay.

## Milestone 7 — Polish

- Add original visual effects.
- Improve backgrounds.
- Add essential audio.
- Improve transitions.
- Refine the UI.
- Remove temporary development indicators.

**Acceptance:** The game presents a coherent, polished experience without breaking gameplay.

## Milestone 8 — Testing and release

- Test the full mission.
- Test all screens.
- Test keyboard input.
- Test restart and pause.
- Test collision edge cases.
- Test production build.
- Update README and credits.
- Prepare competition documentation.

**Acceptance:** The game can be launched and played reliably from the intended submission format.

---

# 24. TESTING REQUIREMENTS

Antigravity must test the game, not simply generate code and claim it works.

## 24.1 Functional tests

Verify:

- The game starts.
- The main menu appears.
- Start Mission works.
- Controls respond.
- Jumping works.
- Sliding works.
- Chrono Freeze works.
- Chrono Dash works.
- Energy is deducted correctly.
- Energy collectibles work.
- Hazards collide correctly.
- Damage updates health.
- The timer decreases.
- Pause stops gameplay.
- Resume continues gameplay.
- Game Over appears correctly.
- Victory appears correctly.
- Restart resets the game.
- Main Menu navigation works.

## 24.2 Mathematical tests

Verify:

- Dash direction and distance match configured values.
- Rotating hazards update their actual angle.
- Chrono Freeze pauses eligible rotations.
- Projectiles move along their defined paths.
- Freeze pauses eligible projectiles.
- Moving platforms follow their defined paths.
- Collision geometry matches intended safe passages.
- The timer continues during Chrono Freeze.
- Delta-time movement remains reasonable under different frame rates.

## 24.3 Edge-case tests

Verify:

- The player cannot jump indefinitely.
- The player cannot remain in slide mode permanently.
- Energy cannot become negative.
- Energy cannot exceed its maximum.
- Cooldowns do not become negative.
- Dash cannot be activated with insufficient energy.
- The player cannot move beyond level bounds.
- A paused player cannot take new movement actions.
- The player cannot receive infinite repeated damage from one overlap.
- Victory and Game Over cannot trigger repeatedly.
- Restart does not duplicate active systems.
- Window focus loss does not leave movement stuck.
- Missing audio does not crash the game.

## 24.4 Visual tests

Check:

- HUD elements do not overlap.
- Text is readable.
- The player is visible against the background.
- Hazard warnings are clear.
- Frozen objects are identifiable.
- Dash effects do not obscure the character.
- Menu buttons are visible.
- No major assets are missing.
- No unintended browser scrollbars interfere with gameplay.

## 24.5 Build tests

Run the actual commands supported by the generated project.

Typically:

    npm install
    npm run dev
    npm run build

Use the commands in the generated `package.json` and README if they differ.

Confirm the production build succeeds and test the production output where feasible.

Report actual test results. Never claim a test passed unless it was performed.

---

# 25. COMPETITION PRESENTATION AND DOCUMENTATION

## 25.1 Progress videos

The event requires three progress recordings, each approximately 4–5 minutes, around:

- 1 PM on October 13.
- 5 PM on October 13.
- 9 PM on October 13.

Follow the organizer's instructions regarding exact timing and upload location.

Each recording should show the development process and actual gameplay or implementation progress, with the date and time visible as required.

Suggested content:

**First recording:** Project setup, initial scene, player movement.

**Second recording:** Working movement, obstacles, Chrono Freeze, Chrono Dash, or the latest actual progress.

**Third recording:** The most complete playable build, mathematical mechanics, final objective, and any remaining limitations.

Do not fabricate footage or represent planned features as completed.

## 25.2 Documentation

Prepare documentation using the organizer-provided template and submit it by October 15.

Include, as applicable:

- Game title and tagline.
- Team name and members.
- Game concept.
- Story.
- Core gameplay.
- Controls.
- Mathematics and geometry.
- Technical architecture.
- Engine and libraries.
- Original and external assets.
- AI tools used.
- Screenshots.
- Known limitations.
- Installation and launch instructions.
- Testing performed.

Do not substitute this PRD for the organizer's official template if a specific template is required.

## 25.3 Final pitch

The event calls for a 5-minute pitch and 3-minute Q&A on October 16.

Suggested pitch structure:

1. **Opening — 30 seconds:** Introduce CHRONO SHIFT and the temporal catastrophe.
2. **Problem and concept — 40 seconds:** Explain the unstable world and the player's mission.
3. **Gameplay demonstration — 90 seconds:** Show running, jumping, Chrono Freeze, and Chrono Dash.
4. **Mathematics — 60 seconds:** Demonstrate vectors, trajectories, angles, and geometry in actual gameplay.
5. **Technical implementation — 40 seconds:** Explain the 2D engine, collision, game states, and performance decisions.
6. **Conclusion — 20 seconds:** Show the mission outcome and reiterate the tagline.

Adjust the timing to fit the actual build and avoid presenting features that are not implemented.

---

# 26. PRIORITY CLASSIFICATION

## P0 — Essential; must be implemented

- Original CHRONO SHIFT identity.
- Main menu.
- Player movement.
- Jump and slide.
- Functional collision.
- Chrono Freeze.
- Chrono Dash.
- Energy management.
- Rotating geometric obstacle.
- Projectile or trajectory-based hazard.
- Countdown.
- Health and failure state.
- One complete playable mission.
- Final objective and victory.
- Restart.
- Functional HUD.
- Competition-compliant development and documentation.

## P1 — High-value polish

- Four distinct level sections.
- Checkpoint.
- Energy collectibles.
- Score and results.
- Character animation.
- Parallax city.
- Particle effects.
- Sound effects.
- Pause menu.
- Clear mission briefing.
- Better hazard warnings.
- Responsive viewport scaling.

## P2 — Optional stretch goals

- Touch controls.
- Additional drone behavior.
- More elaborate reactor finale.
- Best-score persistence.
- Additional visual effects.
- Alternate challenge mode.
- Extra obstacle variations.
- More elaborate cinematic transitions.

If time is running out, stop P2 work and fix defects in P0 and P1.

---

# 27. DEFINITION OF DONE

CHRONO SHIFT is ready for submission only when the following conditions are satisfied.

## Gameplay

- [ ] The game can be launched.
- [ ] The main menu works.
- [ ] The player can move, jump, and slide.
- [ ] Chrono Freeze works on eligible hazards.
- [ ] Chrono Dash works and follows vector-based movement.
- [ ] Energy costs and cooldowns work.
- [ ] At least one rotating geometric hazard works.
- [ ] At least one projectile or trajectory-based hazard works.
- [ ] The timer works independently of Chrono Freeze.
- [ ] Health and collision work.
- [ ] The mission can be completed.
- [ ] A victory state exists.
- [ ] A Game Over state exists.
- [ ] Restart works without duplicating systems.

## Presentation

- [ ] The game uses the CHRONO SHIFT title.
- [ ] The tagline is displayed.
- [ ] The visual identity is consistent.
- [ ] HUD text is readable.
- [ ] Hazards are visually distinguishable.
- [ ] The ending provides closure.
- [ ] No major debug artifacts remain.

## Technical quality

- [ ] No known critical errors prevent gameplay.
- [ ] The production build succeeds.
- [ ] Restart and pause are reliable.
- [ ] Off-screen objects are cleaned up.
- [ ] The game performs reasonably on the target laptop.
- [ ] Missing optional audio does not crash the game.
- [ ] The README includes launch instructions.

## Competition

- [ ] The required progress recordings are captured and submitted.
- [ ] The required documentation is prepared.
- [ ] Assets and tools are disclosed as required.
- [ ] The official submission procedure is followed.
- [ ] The pitch is prepared around real, working gameplay.

---

# 28. IMPLEMENTATION INSTRUCTIONS FOR ANTIGRAVITY

Follow these instructions throughout development.

1. Inspect the existing project before changing files.
2. Preserve working code unless a change is necessary.
3. Use Phaser 3 and JavaScript with Vite unless the existing competition-compliant project already uses an appropriate working stack.
4. Do not introduce React, TypeScript, a backend, databases, or unnecessary dependencies unless there is a concrete requirement.
5. Build the game in small, testable milestones.
6. Implement the essential gameplay before elaborate artwork.
7. Use centralized configuration for movement, energy, timing, and difficulty.
8. Keep the game state, player state, and ability state consistent.
9. Ensure every visible button performs its intended action.
10. Ensure mathematical calculations determine real gameplay outcomes.
11. Use original or properly permitted assets.
12. Follow the official competition rules concerning the build window, tools, and assets.
13. Do not invent completed features.
14. Do not claim the game has been tested if it has not.
15. Do not leave critical functionality represented only by placeholders.
16. Do not rewrite the entire project to fix a small defect.
17. When errors occur, identify the root cause and make the smallest reliable fix.
18. After each milestone, run the project and verify the implemented behavior.
19. If a feature threatens the deadline, implement a smaller functional version rather than abandoning the core game.
20. At the end of every milestone, report completed features, tests performed, known bugs, and the next recommended task.

## Required response format after each milestone

**Milestone:** Name of milestone.

**Implemented:** Features actually completed.

**Files changed:** Files created or modified.

**Testing performed:** Actual commands and gameplay tests performed.

**Results:** Passed, failed, or not yet tested.

**Known issues:** Remaining defects or limitations.

**Next step:** The smallest high-priority task to continue development.

---

# 29. FIRST IMPLEMENTATION TASK

Begin by inspecting the project folder and its existing files.

If no project exists, create a minimal Phaser 3 + JavaScript + Vite project.

Do not attempt to implement the entire PRD in a single unverified code-generation step.

For the first milestone, implement only:

1. A working game canvas.
2. A simple original futuristic background.
3. A controllable player character.
4. A ground platform and collision.
5. Jumping and gravity.
6. Basic horizontal movement or the chosen automatic-running behavior.
7. A minimal HUD placeholder with the game title.
8. A reliable development server.

Run the game and confirm that movement and collision work before proceeding to Chrono Freeze and Chrono Dash.

Use simple original geometric shapes where necessary so gameplay can be tested immediately.

Once this milestone works, continue through the priorities in this PRD without discarding functional work.

---

# 30. FINAL PRODUCT VISION

CHRONO SHIFT should be a compact but memorable sci-fi experience.

The player races through a fractured future, uses mathematics to understand the environment, and manipulates time to survive obstacles that cannot be overcome through speed alone.

The game should communicate its concept through actual mechanics: vectors control dashes, angles determine safe openings, trajectories define projectile paths, and time manipulation changes the state of the world.

The final result should have a clear identity, responsive controls, fair difficulty, a polished presentation, and a satisfying ending.

**Official Game Name:** CHRONO SHIFT

**Official Tagline:** “Bend Time. Defy Fate.”

**Identity:** SCI-FI • TIME MANIPULATION • HIGH-SPEED ACTION

**Primary objective:** Reach the Chrono Core and stabilize the timeline before Zero Second.

**Core principle:** Make time manipulation and mathematics essential to playing the game—not merely visual decorations.

**Development principle:** Build a complete, working, original game first; polish it second; add optional features only when the essentials are reliable.