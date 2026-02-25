
        document.addEventListener('DOMContentLoaded', function () {
            function assign(el) {
                const d = (Math.random() * 1.2) - 0.6;
                el.style.animationDelay = d.toFixed(2) + 's';
                if (el.closest('.virus--size-0')) el.style.setProperty('--breathe-duration', (5.5 + Math.random() * 0.6).toFixed(2) + 's');
                if (el.closest('.virus--size-1')) el.style.setProperty('--breathe-duration', (4.0 + Math.random() * 0.5).toFixed(2) + 's');
                if (el.closest('.virus--size-2')) el.style.setProperty('--breathe-duration', (3.2 + Math.random() * 0.4).toFixed(2) + 's');
            }
            const elems = document.querySelectorAll('.virus--size-0 .face-sprite, .virus--size-1 .face-sprite, .virus--size-2 .face-sprite');
            elems.forEach(assign);
            const board = document.querySelector('#board');
            if (board && window.MutationObserver) {
                const mo = new MutationObserver(muts => {
                    muts.forEach(m => {
                        m.addedNodes.forEach(node => {
                            if (!node || node.nodeType !== 1) return;
                            const faces = node.querySelectorAll && node.querySelectorAll('.face-sprite');
                            if (faces && faces.length) { faces.forEach(assign); }
                            if (node.classList && node.classList.contains('face-sprite')) assign(node);
                        });
                    });
                });
                mo.observe(board, { childList: true, subtree: true });
            }
        });
    
