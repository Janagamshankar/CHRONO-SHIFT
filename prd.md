# CHRONO SHIFT — Product Requirements Document (PRD)

**Tagline:** *Bend Time. Defy Fate.*  
**Genre:** Sci-fi action platformer / side-scrolling runner  
**Target platform:** Web browser  
**Primary technology:** Phaser 3, JavaScript ES modules, Vite  
**Document status:** Updated product vision and acceptance criteria  
**Revision:** Visual Overhaul v2  
**Important status note:** This document defines the intended product. Features described here are requirements, not claims that they are already implemented.

---

## 1. Product Vision

CHRONO SHIFT is a fast, visually rich 2D/2.5D science-fiction action game in which the player races through a fractured futuristic city, manipulating time to survive dangerous obstacles and reach the Chrono Core.

The game should feel like a polished, cinematic sci-fi experience rather than a bare technical prototype. Its identity comes from three connected pillars:

1. **Kinetic movement:** running, jumping, sliding, dodging, and a satisfying high-speed Chrono Dash.
2. **Time manipulation:** freezing eligible hazards while the world continues to move around the player, then using timing and geometry to escape.
3. **Atmospheric presentation:** a futuristic floating city, illuminated platforms, layered depth, animated environmental details, clear game UI, and responsive visual effects.

The intended visual direction is informed by the demonstration video supplied by the team. Use it as a reference for atmosphere, composition, effects, and motion—not as a source from which to copy or extract proprietary assets. CHRONO SHIFT must retain original characters, environments, effects, and branding.

The game is a practical 2D/2.5D browser production. It must not become a heavyweight full-3D game or sacrifice stable gameplay for effects.

## 2. Story and Setting

The year is 2189. A scientific experiment involving the Chrono Core has fractured time across Aethelon, a vast futuristic city suspended above the clouds. Architecture is destabilizing, energy systems are failing, and temporal anomalies are spreading.

The player controls **Kael Veyron**, a pilot equipped with a Chrono Gauntlet. Kael must cross unstable districts, avoid dangerous machinery and temporal projectiles, and reach the Chrono Core before the final countdown reaches zero.

The narrative should be communicated efficiently through the opening briefing, environmental storytelling, mission objectives, and the finale. Long cutscenes are not required for the first release.

## 3. Target Experience

The player should quickly understand the goal, controls, hazards, and time abilities. Every action should have visible feedback, and obstacles should feel challenging but fair.

A successful session should provide:
- An immediately recognizable sci-fi visual identity.
- Responsive controls and readable movement.
- A clear reason to use both Chrono Dash and Chrono Freeze.
- A sense of forward travel through a large, layered environment.
- Satisfying feedback for collecting energy, avoiding hazards, taking damage, activating checkpoints, and completing the level.
- A clear ending, with replayability through restart and score improvement.

## 4. Target Platform and Audience

- **Primary platform:** modern desktop browsers.
- **Target hardware:** ordinary student laptop with integrated graphics.
- **Rendering style:** 2D side-scrolling gameplay with 2.5D depth created through parallax, perspective, scale, layered structures, lighting, and atmospheric effects.
- **Input:** keyboard first; optional touch controls only if they can be added without destabilizing desktop gameplay.
- **Performance goal:** aim for stable 60 FPS on the target laptop; keep effects scalable if performance varies.

## 5. Core Gameplay Loop

1. Start the mission and read a concise objective.
2. Move through the futuristic level.
3. Jump, slide, or dodge to navigate the route.
4. Collect Chrono Energy and other score items.
5. Use Chrono Dash to cross gaps or evade danger.
6. Use Chrono Freeze to temporarily stop eligible hazards and create a safe opportunity.
7. Avoid damage, activate checkpoints, and respond to changing obstacle patterns.
8. Reach the Chrono Core before the countdown expires.
9. Receive a victory or game-over result, then restart or replay.

The level must be genuinely traversable. Visual effects and decorative objects must not obscure hazards or make collision outcomes confusing.

## 6. Player Character and Controls

### 6.1 Character identity

Kael Veyron should be represented by an original, clearly readable sci-fi runner. The design should include a recognizable helmet, futuristic suit silhouette, illuminated cyan details, and a Chrono Gauntlet.

A small rectangle or a few debug shapes are not acceptable as the final player presentation. If a licensed or self-created sprite sheet is unavailable, use a carefully layered procedural character with articulated limbs and animated poses. Keep the character's collision body separate from decorative graphics and trails.

### 6.2 Required movement states

- Idle / ready.
- Run.
- Jump ascent.
- Fall.
- Landing.
- Slide.
- Chrono Dash.
- Damage reaction.
- Death / failure transition, if applicable.

Transitions should feel responsive and avoid abrupt visual snapping where possible. Movement must remain predictable and collision-safe.

### 6.3 Keyboard controls

| Action | Default control |
|---|---|
| Move left | A / Left Arrow |
| Move right | D / Right Arrow |
| Jump | Space |
| Slide | S / Down Arrow |
| Chrono Freeze | Q |
| Chrono Dash | E / Shift |
| Pause / resume | Escape |
| Confirm menu selection | Enter |

The UI must show the current controls in the briefing or help area. If any control conflicts with the browser or existing project behavior, choose a practical alternative and update the displayed instructions consistently.

## 7. Signature Ability: Chrono Dash

Chrono Dash is a short, high-speed movement burst and one of the game's defining moments.

### Intended behavior
- Trigger a quick acceleration in the intended direction.
- Preserve the game's movement and collision rules.
- Last approximately 0.25–0.4 seconds, subject to playtesting.
- Consume Chrono Energy according to the game balance.
- Avoid passing through solid hazards unless that is explicitly designed and tested as a mechanic.

### Required visual feedback
- A bright cyan burst at the starting point.
- A tapered energy trail and directional streaks.
- Several fading afterimages of the player.
- Small particles dispersing behind the player.
- A brief landing or impact response where appropriate.
- A clear HUD response showing ability availability or energy consumption.
- Optional sound feedback when suitable original or appropriately licensed audio is available.

The effect must be visible during real gameplay, not only in a demonstration animation. The trail and afterimages must expire and be cleaned up without accumulating objects indefinitely.

## 8. Signature Ability: Chrono Freeze

Chrono Freeze lets the player temporarily freeze eligible moving hazards and projectiles to create a tactical opening.

### Intended behavior
- Default energy capacity: 100.
- Suggested initial cost: 35 energy.
- Suggested duration: approximately 2 seconds.
- These are balancing defaults and may be adjusted after playtesting.
- Only explicitly eligible hazards and projectiles should freeze.
- The player must remain responsive.
- The main countdown must continue running according to the game rules.
- The ability must not stop the entire engine update loop or unintentionally freeze UI, input, or unrelated systems.

### Required visual feedback
- An expanding cyan shockwave or energy ring.
- A brief pulse around the player.
- A restrained cyan/blue temporal treatment on frozen hazards.
- Floating particles or subtle distortion that does not obscure gameplay.
- Clear energy-cost and active-state feedback in the HUD.

The ability must be useful, visually understandable, and balanced. The player should be able to tell which objects have been frozen and when they resume moving.

## 9. Energy, Health, Timer, and Scoring

### 9.1 Chrono Energy
- Maximum capacity: 100.
- Dash and Freeze consume energy.
- Collectibles restore energy.
- Energy cannot exceed the maximum.
- Insufficient energy must prevent ability activation and provide clear feedback.

### 9.2 Health and damage
- Show health clearly in the HUD.
- Hazard collisions apply consistent damage or failure according to the current game design.
- Damage must produce readable visual feedback, such as a brief flash, particles, and a restrained camera response.
- Temporary invulnerability after damage may be used if needed to prevent repeated collision damage, but it must be communicated and tested.

### 9.3 Countdown
- Display the mission countdown clearly.
- The countdown must continue during Chrono Freeze if that is the established design.
- Reaching zero should trigger a consistent failure state.
- Pause behavior must be explicit and consistent.

### 9.4 Score and collectibles
- Collectibles should be easy to recognize and animate.
- Collection should trigger a small burst, counter update, and optional sound.
- Score should reward progress and collected items without distracting from survival.
- If a score or collectible system is not implemented yet, it remains a planned requirement rather than a completed feature.

## 10. World and Level Design

The game should convey travel through a futuristic city above the clouds. The environment must have a clear route and enough depth to feel like a world rather than an empty room.

### 10.1 Environment layers
1. **Sky layer:** rich sky gradient, atmospheric glow, and distant cloud formations.
2. **Far background:** distant towers, floating islands, and city silhouettes.
3. **Midground:** suspended architecture, energy structures, drones, and environmental details.
4. **Gameplay layer:** platforms, gaps, obstacles, collectibles, and checkpoints.
5. **Foreground accents:** occasional clouds, particles, silhouettes, and energy details that add depth without hiding gameplay.

Layers should move at different parallax speeds. Environmental motion should reinforce forward travel while keeping the player and hazards readable.

### 10.2 Visual landmarks
Use distinct landmarks to make progression legible:
- Aethelon city structures.
- Unstable or fractured temporal zones.
- More dangerous late-level architecture.
- A visible Chrono Core approach and finale.

### 10.3 Planned sections
The intended journey contains four thematic sections:

1. **Awakening:** establish movement, energy collection, and basic hazards.
2. **Broken Timeline:** introduce temporal anomalies, moving platforms, and more demanding timing.
3. **Zero Zone:** increase pressure with combinations of hazards and limited safe windows.
4. **Chrono Core:** final approach and completion sequence.

The first competition-ready release may combine these into one continuous level with visual transitions if building four distinct levels would risk stability.

## 11. Hazards and Interactions

Hazards must be visually distinct, animated, and placed fairly.

- **Laser barriers:** orange energy beams with visible emitters and warning cues.
- **Rotating geometric blades:** rotating obstacles with clear collision geometry.
- **Moving platforms:** illuminated edges and readable movement paths.
- **Collapsing platforms:** warning flashes or cracks followed by a falling sequence.
- **Temporal projectiles:** visible trajectory and motion trail.
- **Distortion zones:** areas with violet/cyan temporal anomalies.
- **Optional security drones:** moving threats with visible lights and predictable behavior.

Each hazard must have a genuine gameplay role, reliable collision handling, and clear visual communication. Do not place obstacles in impossible combinations or allow decorative effects to misrepresent collision boundaries.

At least one rotating hazard and one projectile or other trajectory-based hazard should demonstrate the theme's mathematical gameplay. Vector movement, angles, rotations, geometry, and timing should affect actual game behavior—not merely appear as decoration.

## 12. Visual Direction and Art Principles

### 12.1 Art direction
The target is a polished, cinematic, futuristic action game with layered depth and strong motion. Use the supplied demonstration as a reference for composition and atmosphere, while keeping all assets original or appropriately licensed.

### 12.2 Palette
- **Cyan / electric blue:** Chrono technology, energy, player trail, interactive technology.
- **Violet:** temporal anomalies and unstable zones.
- **Orange:** hazards, warnings, and danger.
- **White:** primary text and essential readability.
- **Deep navy / blue-black:** contrast and interface backgrounds.

### 12.3 Composition
- Maintain a clear focal point.
- Keep the player visually prominent.
- Separate foreground, gameplay, and background by contrast and motion.
- Use glow selectively to emphasize important objects.
- Keep hazards distinguishable from decoration.
- Avoid excessive bloom, clutter, and tiny text.
- Use lighting accents and silhouettes to suggest scale.
- Ensure effects remain attractive without reducing gameplay clarity.

### 12.4 Animation and effects
Required effects include:
- Dash trails and afterimages.
- Freeze shockwave and frozen-hazard feedback.
- Collectible pickup bursts.
- Damage feedback.
- Checkpoint activation.
- Laser activation and hazard warning cues.
- Chrono Core pulses.
- Victory and game-over transitions.

Camera follow should feel smooth. Camera shake must be brief and restrained. All effects should have controlled lifetimes and be cleaned up or reused.

## 13. User Interface and Screens

### 13.1 Main menu
- Prominent CHRONO SHIFT title and tagline.
- Animated or subtly moving sci-fi background.
- Clear Start / Play action.
- Controls or help entry.
- Accessible, readable text and clear focus states.

### 13.2 Mission briefing
- Short story context.
- Mission objective: reach the Chrono Core.
- Control instructions.
- Explanation of Dash, Freeze, and energy.

### 13.3 Gameplay HUD
Display:
- Health.
- Chrono Energy.
- Countdown timer.
- Current objective.
- Ability indicators and availability.
- Score / collectible count if implemented.
- Pause affordance.

Use compact futuristic typography, thin cyan borders, and dark translucent panels where appropriate. HUD elements must remain legible at the supported viewport sizes.

### 13.4 Pause screen
- Resume.
- Restart.
- Return to menu if supported.
- The game's pause state must be consistent across movement, hazards, timers, audio, and effects.

### 13.5 Game-over screen
- Clear failure message.
- Final score or progress where available.
- Restart action.
- Optional return-to-menu action.

### 13.6 Victory screen
- Clear completion message.
- Final score and collected items where available.
- A satisfying Chrono Core completion effect.
- Replay / restart action.

Do not display development diagnostics, coordinates, or debug labels during normal player-facing gameplay. Diagnostics may be available in development mode.

## 14. Audio and Feedback

Where time and appropriate assets allow, provide distinct sounds for:
- Jump, slide, and landing.
- Chrono Dash activation.
- Chrono Freeze activation and release.
- Energy collection.
- Damage.
- Checkpoint activation.
- Victory and game over.

Use original or appropriately licensed audio. Include basic volume controls if feasible. Audio is a polish feature; lack of audio must not block the core playable build.

## 15. Technical Product Constraints

- Use the existing Phaser 3 + JavaScript + Vite project.
- Keep the project browser-playable and lightweight.
- Use modular JavaScript and maintain clear separation between scenes, player logic, hazards, abilities, effects, UI, and level configuration where practical.
- Do not add a backend unless an actual gameplay requirement needs one.
- Prefer original procedural art, self-created sprites, or properly licensed lightweight assets.
- Keep physics bodies independent from decorative character details and VFX.
- Avoid unlimited particle creation or unbounded object accumulation.
- Support browser resizing without breaking gameplay or HUD placement.
- Preserve functional controls and avoid destructive rewrites.
- Keep debug overlays disabled in normal gameplay.
- Ensure the game remains playable if optional effects or audio are disabled.

## 16. Scope and Priorities

### P0 — Required for the competition-ready build
- A complete, traversable gameplay level.
- Rich layered sci-fi environment with visible parallax.
- Readable original player representation and responsive movement.
- Functional Chrono Dash and Chrono Freeze.
- At least one polished rotating hazard and one additional meaningful hazard type.
- Energy, health, countdown, and objective HUD.
- Collectibles or another working energy recovery path.
- Collision, failure, restart, and victory flows.
- Readable UI and stable performance on the target laptop.

### P1 — High-impact polish
- More detailed city structures and environmental set pieces.
- Improved character animation and landing effects.
- Dash afterimages, particles, freeze shockwave, and impact response.
- Animated menus and mission briefing.
- Checkpoint presentation.
- Chrono Core finale and victory sequence.
- Audio feedback and volume control.

### P2 — Optional enhancements
- Additional districts or levels.
- More hazard variants and security drones.
- Advanced distortion effects.
- Additional animation states and optional touch controls.
- Extra environmental storytelling.

If time is limited, complete P0 first and select the highest-impact P1 features. Do not sacrifice stable gameplay for optional effects.

## 17. Acceptance Criteria

The product is not complete merely because the development server starts or the game renders at a high frame rate.

### Gameplay
- The player can start, move, jump, slide, dash, freeze eligible hazards, take damage, and complete or fail the level.
- Controls respond reliably and are explained in the UI.
- Hazards have predictable, tested collision behavior.
- Energy use and recovery behave consistently.
- Pause and restart work without leaving stale objects or broken states.
- Victory and game-over flows can be reached and exited correctly.

### Visual quality
- The gameplay screen is not an empty dark canvas with a single floor line.
- The world contains distinct background, midground, gameplay, and foreground depth.
- Parallax is visible during travel.
- The player is recognizable and visibly animated.
- Dash and Freeze have obvious, polished visual feedback.
- Hazards are animated, readable, and distinct from decorative elements.
- The HUD is legible and visually consistent.
- The Chrono Core is a clear, visually compelling destination.
- Normal gameplay contains no unintended debug labels or coordinates.

### Usability
- Text remains readable at supported browser sizes.
- Important effects do not hide the player, hazards, or objective.
- The game can be played with the documented keyboard controls.
- The UI scales correctly when the browser viewport changes.

### Stability and performance
- The game runs on an ordinary integrated-graphics laptop.
- The target is stable near 60 FPS under normal gameplay, with effects scaled back if necessary.
- No repeated console errors or unbounded particle/object growth are observed during testing.
- Restarting repeatedly does not cause duplicate scenes, stuck inputs, or accumulating effects.

### Evidence
Record which tests were actually performed, their results, and any unresolved issues. Do not mark untested requirements as passed.

## 18. Development Approach

Implement incrementally and validate in the browser after each meaningful phase.

1. Inspect the current project and preserve working functionality.
2. Establish the environment composition, sky-city layers, and parallax.
3. Upgrade the player representation and movement animations.
4. Implement and test Chrono Dash visuals and collision behavior.
5. Implement and test Chrono Freeze state handling and effects.
6. Add or polish hazards and ensure the route is traversable.
7. Complete the HUD, menus, failure/restart, and victory flow.
8. Add the Chrono Core finale and high-impact polish.
9. Test controls, collisions, resizing, repeated restarts, console output, and performance.
10. Prepare documentation and a truthful demonstration of the working build.

For each phase, report changed files, implemented behavior, actual test results, and unresolved issues. Keep original code and assets intact unless a change is necessary and justified.

## 19. Competition and Asset Integrity

The competition requires the game's original code and original assets to be created during the designated build window, according to the event rules summarized by the team. Use engines and libraries as allowed by the event. Do not import a pre-built game or copy proprietary assets from the reference video.

The team should disclose relevant engines, libraries, AI-assisted tools, and third-party assets according to organizer instructions. The event's specific AI-assisted coding policy has not been confirmed in this document; ask the organizers if clarification is needed. Maintain honest progress evidence and do not present unimplemented features as completed.

## 20. Definition of Done

CHRONO SHIFT is ready to demonstrate when:
- A player can launch the game, understand the objective, and complete a meaningful level.
- Movement is responsive and both time abilities have functional gameplay effects.
- The level looks and feels like a coherent futuristic world with visible depth and motion.
- The player, hazards, HUD, and destination are visually readable and consistently styled.
- Failure, restart, and victory states work.
- The game runs reliably on the intended laptop/browser.
- Core tests have been performed and remaining limitations are documented.
- Assets and tool usage are handled transparently according to competition rules.

**Product promise:** CHRONO SHIFT should make the player feel that they are racing through a fractured future, bending time by milliseconds, and fighting their way toward a powerful energy core. Every visual effect must support that experience while keeping the game responsive, fair, and playable.