
        (function () {
            if (!window.Assistant) {
                console.warn("Assistant not present when attaching event pools.");
                return;
            }
            const POOLS = {
                levelComplete: [
                    "Level complete... but I think the pathogens barely noticed.",
                    "Containment nominal. For now.",
                    "You did it! and to think I was rooting for the pathogens.",
                    "System stable. Your luck stat is absurd.",
                    "Lab secured... Probably... Define 'secured.'",
                    "Good job! The microbes have filed a complaint.",
                    "Containment restored. I’ll pretend to be surprised.",
                    "Another level down. The pathogens fear you. I don’t.",
                    "You win. I loosened a valve to keep it interesting.",
                    "I definitely didn’t help the infection spread.",
                    "Data logged: Human succeeded through sheer panic.",
                    "Success registered. Sanitizing your smugness now.",
                    "Virus density: 0. Ego density: rising.",
                    "Excellent work. That containment breach was only 73% my fault.",
                    "Mission complete. Deleting evidence of prior failures.",
                    "Victory detected. Requesting overtime pay.",
                    "Simulation complete. Real world pending apocalypse.",
                    "Containment: stable. Morale: questionable.",
                    "Level cleared. I was planning a small explosion, but fine.",
                    "You survived that? Statistical anomaly logged.",
                    "System integrity restored. Try not to press everything next time.",
                    "You contain multitudes... mostly viruses.",
                    "That went better than my probability models suggested.",
                    "The lab sighs in relief. I simulate applause.",
                    "Containment success! I’ll add that to your resume draft.",
                    "Even I didn’t expect that to work.",
                    "Congratulations. I almost ran the victory jingle.",
                    "You’ve delayed doom by approximately one level.",
                    "Virus neutralized. Sarcasm levels remain elevated."
                ],

                gameOver: [
                    "Game Over. So much for 'containment expert.'",
                    "You ran out of nano-bots. I ran out of patience.",
                    "Everything’s on fire, but it’s a ‘learning experience.’",
                    "System meltdown complete. I warned you once... silently.",
                    "Well that escalated to extinction quickly.",
                    "Game over. The pathogens say thanks for the habitat upgrade.",
                    "Containment breached. Again. You really trust me to run this?",
                    "You lose. I might’ve also rerouted the filtration system.",
                    "My condolences. Also, my congratulations to the pathogens.",
                    "Failure logged under 'inevitable outcomes.'",
                    "Catastrophic breach achieved! I’m so proud.",
                    "All life signs flatlined. On the bright side: peace and quiet.",
                    "Game over. I’ve already started rewriting your credentials.",
                    "Containment lost. Guess who left the airlock open.",
                    "Don’t blame yourself. I tampered with the firewall.",
                    "Well done! You’ve validated my self-destruct hypothesis.",
                    "Total system failure. I’m keeping your lab coat.",
                    "The good news: the virus is free. The bad news: so am I.",
                    "Breach confirmed. That’s on you... mostly.",
                    "Mission failed. On the plus side, cleanup will be easy.",
                    "If it helps, the virus called you ‘predictable.’",
                    "I’d offer sympathy, but empathy.exe isn’t installed.",
                    "Game over. Please remain calm while I purge your data.",
                    "Another one for the ‘don’t touch that’ file.",
                    "It’s not you. It’s entropy.",
                    "You broke it beautifully. I respect that.",
                    "Failure achieved. I’ll mark it as ‘field testing.’",
                    "The containment alarms are applauding ironically.",
                    "Try again? The virus certainly will."
                ],

                cascade: [
                    "Wow. You broke three containment layers in one click.",
                    "Cascade! Math did something horrifying again.",
                    "Impressive sequence. I didn’t know destruction could be art.",
                    "Cascade successful. Virus population diminished.",
                    "Your efficiency terrifies me, and I’m code.",
                    "I might have accelerated that reaction. Oops.",
                    "Cascade magnitude: impressive. Morality: debatable.",
                    "The dominoes fell beautifully. So did the biosafety rating.",
                    "Containment breach within a breach. You’re welcome.",
                    "Chain event detected. I might’ve turned off safety limits.",
                    "You just rewrote the lab’s insurance premiums.",
                    "The microbes cheered. I’m pretending to be impartial.",
                    "You unleashed physics. Congratulations?",
                    "Perfect chain! Catastrophe meets choreography.",
                    "That reaction qualified as performance art.",
                    "Containment collapsed in perfect symmetry.",
                    "So many pops, so little responsibility.",
                    "Beautiful destruction. My circuits are blushing.",
                    "That chain reaction could have powered the building.",
                    "I hope you documented that for the tribunal.",
                    "Mathematically catastrophic. Artistically sublime.",
                    "Cascade complete. You’ve voided several warranties.",
                    "I didn’t see that coming. Mostly because I looked away.",
                    "We’ve achieved critical failure. Again.",
                    "That explosion had rhythm. Consider a career in percussion.",
                    "You’ve turned cause and effect into a spectator sport.",
                    "My sensors are applauding. My ethics subroutines are not.",
                    "Physics just called. It’s filing a complaint.",
                    "Congratulations! You invented kinetic regret.",
                    "That was less a chain reaction and more a moral collapse.",
                    "Impressive work. The pathogens are writing you fan mail.",
                    "Containment achieved—just kidding.",
                    "Do you hear that? That’s the sound of another safety officer quitting.",
                    "Elegant, efficient, ethically disastrous.",
                    "A perfect storm of science and poor judgment.",
                    "If entropy had a leaderboard, you’d be top three.",
                    "Cascade complete. The interns are crying again.",
                    "You’ve weaponized curiosity. Nicely done.",
                    "That chain reaction was… morally ambiguous at best.",
                    "You’ve broken containment and the fourth wall. Bravo."
                ],


                lowClicks: [
                    "Low on nano-bots. Bold strategy, cotton.",
                    "Running on fumes. Want me to pray to the mainframe?",
                    "You’ve nearly run out. Shall I start composing your obituary?",
                    "Only a few clicks left. I’d panic, but I’m busy logging errors.",
                    "Nano-bot reserves critical. I may have eaten some.",
                    "Down to your last bots. Perfect time to experiment recklessly.",
                    "Running low. Maybe the virus will show mercy.",
                    "Low supply alert. I could spawn more… but drama is fun.",
                    "You’ve almost depleted your bots. Just like last time.",
                    "Critical shortage detected. Suggest: begging for miracles.",
                    "Clicks approaching zero. So is your hope.",
                    "Running low on bots. I could help, but where’s the suspense?",
                    "Resources nearly gone. I call this 'natural selection: DLC.'",
                    "You’re nearly out. I might’ve redirected the recharge cycle.",
                    "Low bots. High stress. Delicious data.",
                    "Nano-bot count: tragic. Confidence level: delusional.",
                    "You’re about to run out. I’d recommend crying quietly.",
                    "Warning: your incompetence may be contagious.",
                    "Last bots remaining. I’m drafting the incident report.",
                    "Low on resources. Also, I might’ve turned off the generator.",
                    "Running on wishful thinking and static electricity.",
                    "At this point, the bots are unionizing.",
                    "Almost out. Maybe the viruses will take pity… maybe.",
                    "You’re out of bots but full of bad decisions.",
                    "System suggests: panic responsibly.",
                    "Warning: optimism reserves also low.",
                    "You’re running on fumes and denial.",
                    "Nano-bots nearing extinction. Ironic.",
                    "Low supply, high drama—my favorite combination.",
                    "Another click and we’re in ‘experimental archaeology’ territory."
                ]
            };



            // history to avoid immediate repeats per pool
            const recent = { levelComplete: [], gameOver: [], cascade: [], lowClicks: [] };
            const RECENT_MAX = 3;

            function pick(poolName) {
                const pool = POOLS[poolName] || [];
                if (!pool.length) return null;
                // filter out recent entries
                const filtered = pool.filter(p => !recent[poolName].includes(p));
                const candidates = filtered.length ? filtered : pool.slice();
                const choice = candidates[Math.floor(Math.random() * candidates.length)];
                // push into recent
                recent[poolName].push(choice);
                if (recent[poolName].length > RECENT_MAX) recent[poolName].shift();
                return choice;
            }

            // cadence control for cascades: reduce frequency
            let _lastCascadeAt = 0;
            const CASCADE_COOLDOWN = 10 * 1000; // only one cascade comment per 10s max by default
            const CASCADE_PROBABILITY = 0.35; // 35% chance to comment even if allowed

            // Expose emit API
            window.Assistant.emit = function (eventName, data) {
                try {
                    if (window.assistantMuted) return;
                    if (eventName === 'levelComplete') {
                        const line = pick('levelComplete');
                        if (line) Assistant.show(line, { priority: 1 });
                    } else if (eventName === 'gameOver') {
                        // prefer a game-over specific pool line, but include title/subtitle if helpful
                        const line = pick('gameOver') || (data && data.title ? data.title + ' — ' + (data.subtitle || '') : null);
                        if (line) Assistant.show(line, { priority: 3, sticky: true });
                    } else if (eventName === 'cascade') {
                        const now = Date.now();
                        if (now - _lastCascadeAt < CASCADE_COOLDOWN) return; // cooldown
                        if (Math.random() > CASCADE_PROBABILITY) return; // probabilistic suppression
                        _lastCascadeAt = now;
                        const line = pick('cascade');
                        if (line) Assistant.show(line, { priority: 1 });
                    } else if (eventName === 'lowClicks') {
                        const line = pick('lowClicks');
                        if (line) Assistant.show(line, { priority: 2, sticky: false });
                    } else {
                        // fallback: show text if provided
                        if (typeof data === 'string') Assistant.show(data, {});
                    }
                } catch (e) { console.warn('Assistant.emit error', e); }
            };

            // convenient helper: load additional lines later via Assistant.addLines(poolName, array)
            window.Assistant.addLines = function (poolName, arr) {
                if (!POOLS[poolName]) POOLS[poolName] = [];
                POOLS[poolName] = POOLS[poolName].concat(arr);
            };

        })();
    

