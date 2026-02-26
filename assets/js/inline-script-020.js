
        (function () {
            const intro = document.getElementById('aiIntro');
            const textBox = document.getElementById('aiIntroText');
            const startBtn = document.getElementById('aiStartBtn');

            // Example boot-up lines (can be customized)
            const introLines = [
                "Containment breach detected.",
                "Containment AI online.",
                "Autonomous containment protocols malfunctioning.",
                "Human operator required..."
            ];

            let lineIndex = 0;

            function nextLine() {
                if (lineIndex < introLines.length) {
                    textBox.textContent = introLines[lineIndex++];
                    setTimeout(nextLine, 2200);
                }
            }

            // Start cycling through lines after a short delay
            window.addEventListener('load', () => setTimeout(nextLine, 600));

            // Handle Start button click
            startBtn.addEventListener('click', () => {
                try {
                    // fade out intro
                    intro.classList.add('fade-out');

                    const musicAllowed = (window.musicEnabled !== false);
                    if (!musicAllowed) {
                        if (typeof startGame === 'function') startGame();
                        return;
                    }

                    // start music (replace with your own playMusic() or audio element)
                    if (window.musicAudio) {
                        window.musicAudio.play().catch(() => { });
                    } else {
                        const bg = new Audio("https://raw.githubusercontent.com/mpeeples2008/sound_image_assets/main/Robobozo.mp3");
                        bg.loop = true;
                        bg.volume = Number(window.musicVolume) || 0.2;
                        window.musicAudio = bg;
                        bg.play().catch(() => { });
                    }

                    // trigger your existing game start function if needed
                    if (typeof startGame === 'function') startGame();
                } catch (e) { console.warn(e); }
            });
        })();
    
