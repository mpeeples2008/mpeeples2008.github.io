
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

            // Legacy intro click handler should not start/own music.
            if (startBtn) {
                startBtn.addEventListener('click', () => {
                    try {
                        if (intro) intro.classList.add('fade-out');
                        if (typeof startGame === 'function') startGame();
                    } catch (e) { console.warn(e); }
                });
            }
        })();
    
