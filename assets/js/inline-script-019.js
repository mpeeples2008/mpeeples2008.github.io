
        document.addEventListener("DOMContentLoaded", function () {
            // ensure the neutral mouth opacity is controlled by CSS, not inline attribute
            const neutralMouth = document.querySelector('.mouth-shape.neutral');
            if (neutralMouth) {
                neutralMouth.removeAttribute('opacity');
            }
        });
    

