document.addEventListener("DOMContentLoaded", () => {
    const startBtn = document.getElementById('start-btn');
    const bgVideo = document.getElementById('bg-video');
    const animationWrapper = document.querySelector('.animation-wrapper'); 
    const hiScoreValue = document.getElementById('hi-score-value');

    const targetScore = 18300;
    const duration = 1500;
    const startTime = performance.now();

    function animateScore(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(progress * targetScore);
        hiScoreValue.textContent = current.toString().padStart(6, "0");
        if (progress < 1) requestAnimationFrame(animateScore);
    }
    requestAnimationFrame(animateScore);

    startBtn.addEventListener('click', () => {

        bgVideo.style.display = "block";

        const startScreen = document.querySelector('.start-screen');
        startScreen.classList.add('screen-out');

        setTimeout(() => {
            startScreen.style.display = 'none';
            animationWrapper.style.display = 'flex';
            document.querySelector('.unicorn').style.display = 'block';
            document.querySelector('.happy').style.display = 'block';
            document.querySelector('.new').style.display = 'block';
            document.querySelector('.year').style.display = 'block';
            document.querySelector('.narwhal').style.display = 'block';

        }, 400);
    });
});
