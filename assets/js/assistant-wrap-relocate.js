
        (function () {
            function moveAndDedupeAssistant() {
                try {
                    var wrap = document.querySelector('.wrap') || document.getElementById('wrap') || document.body;
                    if (!wrap) return;

                    // Grab all matching nodes with these ids (there should only be one each)
                    var badges = Array.from(document.querySelectorAll('#assist-badge'));
                    var bubbles = Array.from(document.querySelectorAll('#assist-bubble'));

                    // If more than one badge exists remove the duplicates (keep the first found)
                    if (badges.length > 1) {
                        for (var i = 1; i < badges.length; i++) {
                            try { badges[i].parentNode && badges[i].parentNode.removeChild(badges[i]); } catch (e) { }
                        }
                    }
                    if (bubbles.length > 1) {
                        for (var j = 1; j < bubbles.length; j++) {
                            try { bubbles[j].parentNode && bubbles[j].parentNode.removeChild(bubbles[j]); } catch (e) { }
                        }
                    }

                    // Now get the (single) elements, possibly newly deduped
                    var badge = document.querySelector('#assist-badge');
                    var bubble = document.querySelector('#assist-bubble');

                    // Keep badge in wrap so its absolute placement remains tied to HUD.
                    if (badge && !wrap.contains(badge)) {
                        wrap.appendChild(badge);
                    }
                    // Keep bubble at top document layer so high z-index reliably beats modal overlays.
                    if (bubble) {
                        var topLayerParent = document.body || document.documentElement;
                        if (topLayerParent && bubble.parentNode !== topLayerParent) {
                            topLayerParent.appendChild(bubble);
                        }
                    }

                    // Tweak bubble offset based on actual badge size (makes bottom gap robust)
                    if (badge && bubble) {
                        try {
                            var rect = badge.getBoundingClientRect();
                            var pos = window.getComputedStyle(bubble).position;
                            if (pos === 'fixed') {
                                var gap = 8;
                                var pad = 8;
                                var bRect = bubble.getBoundingClientRect();
                                var bW = Math.max(160, Math.round(bRect.width || 220));
                                var left = Math.round(rect.left + (rect.width - bW) / 2);
                                left = Math.max(pad, Math.min(left, window.innerWidth - bW - pad));
                                var bottom = Math.max(pad, Math.round(window.innerHeight - rect.top + gap));
                                bubble.style.setProperty('left', left + 'px', 'important');
                                bubble.style.setProperty('top', 'auto', 'important');
                                bubble.style.setProperty('right', 'auto', 'important');
                                bubble.style.setProperty('bottom', bottom + 'px', 'important');
                            } else {
                                var badgeH = Math.round(rect.height) || 52;
                                // set bubble bottom to badge height + small gap (in px)
                                bubble.style.bottom = (12 + badgeH + 4) + 'px';
                            }
                        } catch (e) { }
                    }

                    // Accessibility / interactivity guard
                    if (badge) {
                        badge.setAttribute('role', 'button');
                        badge.setAttribute('tabindex', '0');
                    }

                } catch (e) {
                    console.warn('assistant relocate failed', e);
                }
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', moveAndDedupeAssistant);
            } else {
                setTimeout(moveAndDedupeAssistant, 0);
            }

            // Run again after a short delay to catch any late-inserted assistant nodes
            setTimeout(moveAndDedupeAssistant, 600);

            // Optional: re-run on window resize/orientation change (keeps the bubble offset correct)
            window.addEventListener('resize', function () { setTimeout(moveAndDedupeAssistant, 120); }, { passive: true });
        })();
    
