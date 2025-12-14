document.addEventListener("DOMContentLoaded", () => {

    const startBtn = document.getElementById('start-btn');
    const bgVideo = document.getElementById('bg-video');
    const animation = document.getElementById('new-year-animation');

    startBtn.addEventListener('click', () => {

        bgVideo.style.display = "block";
        document.querySelector('.start-screen').style.display = 'none';

        // Mostrar wrapper responsive
        document.getElementById('animation-wrapper').style.display = 'block';

        document.querySelector('.unicorn').style.display = 'block';
        document.querySelector('.message').style.display = 'block';
        document.querySelector('.narwhal').style.display = 'block';
    });

});
