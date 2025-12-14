document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById('start-btn');
    const bgVideo = document.getElementById('bg-video');
    const animationWrapper = document.getElementById('animation-wrapper');
    const hiScoreValue = document.getElementById('hi-score-value');

    // 1) Animación HI-SCORE (contador de 0 a 123000)
    const targetScore = 123000;
    const duration = 1500; // ms
    const startTime = performance.now();

    function animateScore(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(progress * targetScore);

        // Formato 6 dígitos tipo arcade
        hiScoreValue.textContent = current.toString().padStart(6, "0");

        if (progress < 1) {
            requestAnimationFrame(animateScore);
        }
    }

    requestAnimationFrame(animateScore);

    // 2) Click en START
    startBtn.addEventListener('click', () => {
        // Mostrar video de fondo
        bgVideo.style.display = "block";

        // Ocultar pantalla de inicio con efecto
        const startScreen = document.querySelector('.start-screen');
        startScreen.classList.add('screen-out');

        setTimeout(() => {
            startScreen.style.display = 'none';

            // Mostrar bloque responsive con pixel art
            animationWrapper.style.display = 'block';

            document.querySelector('.unicorn').style.display = 'block';
            document.querySelector('.message').style.display = 'block';
            document.querySelector('.narwhal').style.display = 'block';
        }, 400); // coincide con duración de screen-out
    });
});
