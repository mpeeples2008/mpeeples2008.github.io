
        // Minimal Assistant module (mobile friendly). Call Assistant.show(text, {priority:0, sticky:false})
        (function () {
            if (window.Assistant) return; // avoid double-insert
            const badge = document.getElementById('assist-badge');
            const bubble = document.getElementById('assist-bubble');
            const textEl = document.getElementById('assist-text');
            let queue = [];
            let busy = false;
            let lastShown = 0;
            const MIN_GAP = 1200; // ms between non-priority messages
            let activeTimer = null;
            let queuedTimer = null;
            window.assistantMuted = window.assistantMuted || false;
            function isAssistantActive() {
                try {
                    return !window.assistantMuted && !(document.body && document.body.classList.contains('assistant-disabled'));
                } catch (e) { return !window.assistantMuted; }
            }
            function clear() {
                try { if (activeTimer) { clearTimeout(activeTimer); activeTimer = null; } } catch (e) { }
                try { if (queuedTimer) { clearTimeout(queuedTimer); queuedTimer = null; } } catch (e) { }
                try { queue = []; } catch (e) { }
                busy = false;
                try { if (bubble) bubble.classList.remove('show'); } catch (e) { }
                try { if (badge) badge.classList.remove('notif'); } catch (e) { }
            }
            function positionBubbleNearBadge() {
                if (!badge || !bubble) return;
                try {
                    // Keep the speech bubble at the top document layer so it isn't trapped under .wrap popups.
                    const topLayerParent = document.body || document.documentElement;
                    if (topLayerParent && bubble.parentNode !== topLayerParent) {
                        topLayerParent.appendChild(bubble);
                    }
                    const gap = 8;
                    const pad = 8;
                    const badgeRect = badge.getBoundingClientRect();
                    bubble.style.setProperty('position', 'fixed', 'important');
                    bubble.style.setProperty('right', 'auto', 'important');
                    const bubbleRect = bubble.getBoundingClientRect();
                    const bubbleW = Math.max(160, Math.round(bubbleRect.width || 220));
                    let left = Math.round(badgeRect.left + (badgeRect.width - bubbleW) / 2);
                    left = Math.max(pad, Math.min(left, window.innerWidth - bubbleW - pad));
                    // Anchor by bottom so bubble always sits above the assistant and never overlaps it.
                    const bottom = Math.max(pad, Math.round(window.innerHeight - badgeRect.top + gap));
                    bubble.style.setProperty('left', left + 'px', 'important');
                    bubble.style.setProperty('top', 'auto', 'important');
                    bubble.style.setProperty('bottom', bottom + 'px', 'important');
                } catch (e) { }
            }

            function show(text, opts) {
                opts = opts || {}; if (!isAssistantActive()) return;
                // ensure short text
                if (typeof text !== 'string') text = String(text);
                if (text.length > 240) text = text.slice(0, 237) + '...';
                const msg = { text, opts };
                if (opts.priority && opts.priority > 0) queue.unshift(msg); else queue.push(msg);
                process();
            }

            function process() {
                if (!isAssistantActive()) { clear(); return; }
                if (busy) return;
                if (!queue.length) return;
                const msg = queue.shift();
                if (!isAssistantActive()) { clear(); return; }
                const now = Date.now();
                if (now - lastShown < MIN_GAP && !(msg.opts && msg.opts.priority > 0)) {
                    // requeue slightly later
                    try { if (queuedTimer) clearTimeout(queuedTimer); } catch (e) { }
                    queuedTimer = setTimeout(function () {
                        queuedTimer = null;
                        process();
                    }, MIN_GAP - (now - lastShown));
                    queue.unshift(msg);
                    return;
                }
                busy = true;
                lastShown = Date.now();
                textEl.textContent = msg.text;
                positionBubbleNearBadge();
                bubble.classList.add('show');
                requestAnimationFrame(positionBubbleNearBadge);
                badge.classList.add('notif');

                const duration = msg.opts && msg.opts.sticky ? 4200 : Math.max(1500, Math.min(5000, msg.text.length * 60));
                try { if (activeTimer) clearTimeout(activeTimer); } catch (e) { }
                activeTimer = setTimeout(() => {
                    activeTimer = null;
                    if (!isAssistantActive()) { clear(); return; }
                    bubble.classList.remove('show');
                    badge.classList.remove('notif');
                    busy = false;
                    // small delay then next
                    try { if (queuedTimer) clearTimeout(queuedTimer); } catch (e) { }
                    queuedTimer = setTimeout(function () {
                        queuedTimer = null;
                        process();
                    }, 120);
                }, duration);
            }

            function onBadgeClick(e) {
                if (e.detail && e.detail > 1) return;
                if (!isAssistantActive()) return;
                if (!bubble || !bubble.classList) return;
                if (bubble.classList.contains('show')) {
                    bubble.classList.remove('show');
                } else {
                    show("Alright, fine. I'm watching. Try not to break containment.", { priority: 1, sticky: true });
                }
            }

            function onResizeOrRotate() {
                requestAnimationFrame(positionBubbleNearBadge);
            }

            function destroy() {
                clear();
                try { if (badge) badge.removeEventListener('click', onBadgeClick); } catch (e) { }
                try { window.removeEventListener('resize', onResizeOrRotate); } catch (e) { }
                try { window.removeEventListener('orientationchange', onResizeOrRotate); } catch (e) { }
            }

            // tap the badge to show a short line or toggle
            if (badge) badge.addEventListener('click', onBadgeClick);
            window.addEventListener('resize', onResizeOrRotate, { passive: true });
            window.addEventListener('orientationchange', onResizeOrRotate, { passive: true });
            requestAnimationFrame(positionBubbleNearBadge);

            // expose to window for game integration
            window.Assistant = { show, clear, destroy };
        })();
    
