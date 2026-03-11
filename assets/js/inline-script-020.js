
        (function () {
            const intro = document.getElementById('aiIntro');
            const textBox = document.getElementById('aiIntroText');
            const startButtons = Array.from(document.querySelectorAll('#aiStartBtn, #aiEnduranceBtn, #aiTutorialBtn'));

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
            if (startButtons.length) {
                startButtons.forEach((startBtn) => {
                    startBtn.addEventListener('click', () => {
                        try {
                            if (intro) {
                                // Ensure CSS fade class can win even after inline styles
                                intro.style.removeProperty('opacity');
                                intro.style.removeProperty('pointer-events');
                                intro.classList.add('fade-out');
                                // Fully hide after fade so the board is guaranteed visible
                                setTimeout(() => {
                                    if (!intro) return;
                                    intro.style.display = 'none';
                                    intro.style.visibility = 'hidden';
                                    intro.setAttribute('aria-hidden', 'true');
                                }, 650);
                            }
                            const isTutorialBtn = !!(startBtn && startBtn.id === 'aiTutorialBtn');
                            if (!isTutorialBtn && typeof startGame === 'function') startGame();
                        } catch (e) { console.warn(e); }
                    });
                });
            }
        })();
    
