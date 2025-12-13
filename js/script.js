document.addEventListener("DOMContentLoaded", () => {

    const startBtn = document.getElementById('start-btn');
    const bgVideo = document.getElementById('bg-video');
    const animation = document.getElementById('new-year-animation');

    startBtn.addEventListener('click', () => {

        // Mostrar video de fondo
        bgVideo.style.display = "block";

        // Ocultar pantalla de inicio
        document.querySelector('.start-screen').style.display = 'none';

        // Mostrar animación centrada
        animation.style.display = 'block';

        document.querySelector('.unicorn').style.display = 'block';
        document.querySelector('.message').style.display = 'block';
        document.querySelector('.narwhal').style.display = 'block';
    });
});
