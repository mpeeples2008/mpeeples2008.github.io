
        document.addEventListener('DOMContentLoaded', function () {
            try {
                const helpBtn = document.getElementById('helpBtn');
                const helpPopup = document.getElementById('helpPopup');
                const helpClose = document.getElementById('helpClose');
                const helpPrev = document.getElementById('helpPrev');
                const helpNext = document.getElementById('helpNext');
                const helpPage = document.getElementById('helpPage');
                const slideRoot = document.getElementById('howtoSlides');
                const slides = slideRoot ? Array.from(slideRoot.querySelectorAll('.howto-card')) : [];
                let currentSlide = 0;

                function renderSlide(idx) {
                    if (!slides.length) return;
                    const total = slides.length;
                    currentSlide = ((Number(idx) % total) + total) % total;
                    slides.forEach(function (el, i) { el.classList.toggle('active', i === currentSlide); });
                    if (helpPage) helpPage.textContent = (currentSlide + 1) + ' / ' + total;
                }

                function showHelp() {
                    if (!helpPopup) return;
                    helpPopup.classList.add('show');
                    helpPopup.setAttribute('aria-hidden', 'false');
                    renderSlide(currentSlide);
                }
                function hideHelp() {
                    if (!helpPopup) return;
                    helpPopup.classList.remove('show');
                    helpPopup.setAttribute('aria-hidden', 'true');
                }

                if (helpBtn) helpBtn.addEventListener('click', function (e) { showHelp(); });
                if (helpClose) helpClose.addEventListener('click', function (e) { hideHelp(); });
                if (helpPrev) helpPrev.addEventListener('click', function (e) { renderSlide(currentSlide - 1); });
                if (helpNext) helpNext.addEventListener('click', function (e) { renderSlide(currentSlide + 1); });
                renderSlide(0);

                // close on Escape
                document.addEventListener('keydown', function (e) {
                    if (!helpPopup || !helpPopup.classList.contains('show')) return;
                    if (e.key === 'Escape') { hideHelp(); return; }
                    if (e.key === 'ArrowLeft') { renderSlide(currentSlide - 1); return; }
                    if (e.key === 'ArrowRight') { renderSlide(currentSlide + 1); return; }
                });
                // click outside to close (optional): if click occurs outside popup while shown
                document.addEventListener('click', function (e) {
                    if (!helpPopup) return;
                    if (!helpPopup.classList.contains('show')) return;
                    // if click target is inside popup, do nothing
                    if (helpPopup.contains(e.target)) return;
                    // if click target is the help button, do nothing (it toggles separately)
                    if (helpBtn && helpBtn.contains(e.target)) return;
                    hideHelp();
                });

            } catch (e) { console.warn('help popup wiring failed', e); }
        });
    
