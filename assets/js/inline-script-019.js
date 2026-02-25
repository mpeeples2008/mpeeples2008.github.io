
        document.addEventListener("DOMContentLoaded", function () {
            // ensure the neutral mouth opacity is controlled by CSS, not inline attribute
            const neutralMouth = document.querySelector('.mouth-shape.neutral');
            if (neutralMouth) {
                neutralMouth.removeAttribute('opacity');
                console.log("Neutral mouth opacity attribute removed.");
            } else {
                console.warn("Neutral mouth not found — check SVG structure.");
            }
        });
    

