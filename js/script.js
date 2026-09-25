document.addEventListener('DOMContentLoaded', () => {
    const animalList = document.getElementById('animal-list');
    const animalCount = document.getElementById('animal-count');
    const catalogError = document.getElementById('catalog-error');
    const emptyState = document.getElementById('empty-state');
    const loader = document.getElementById('loader');
    const pixelResult = document.getElementById('pixel-result');
    const pixelArt = document.getElementById('pixel-art');
    const matrixSize = document.getElementById('matrix-size');
    const resultName = document.getElementById('result-name');
    const copyBtn = document.getElementById('copy-btn');
    const copyFeedback = document.getElementById('copy-feedback');
    const GENERATION_DELAY = 700;
    let generationVersion = 0;
    let currentAnimal = null;

    async function requestJson(url) {
        const response = await fetch(url, {
            headers: { Accept: 'application/json' },
        });
        const data = await response.json().catch(() => null);

        if (!response.ok || !data) {
            throw new Error(data?.error || 'No se pudo conectar con el generador.');
        }

        return data;
    }

    function showError(message) {
        catalogError.textContent = message;
        catalogError.hidden = false;
    }

    function createAnimalButton(animal) {
        const button = document.createElement('button');
        button.className = 'animal-button';
        button.type = 'button';
        button.dataset.animal = animal.id;
        button.setAttribute('aria-pressed', 'false');
        button.innerHTML = `
            <span class="animal-emoji" aria-hidden="true">${animal.emoji}</span>
            <span class="animal-name">${animal.name}</span>
        `;
        button.addEventListener('click', () => generateAnimal(animal.id, button));
        return button;
    }

    async function loadCatalog() {
        try {
            const data = await requestJson('./backend/generate.php');
            const fragment = document.createDocumentFragment();

            data.animals.forEach((animal) => fragment.appendChild(createAnimalButton(animal)));
            animalList.replaceChildren(fragment);
            animalCount.textContent = `${data.animals.length} criaturas`;
            animalList.setAttribute('aria-busy', 'false');

            const requestedAnimal = new URLSearchParams(window.location.search).get('animal');
            const initialButton = Array.from(animalList.querySelectorAll('.animal-button'))
                .find((button) => button.dataset.animal === requestedAnimal);
            initialButton?.click();
        } catch (error) {
            animalList.setAttribute('aria-busy', 'false');
            showError(error.message);
        }
    }

    async function generateAnimal(animalId, selectedButton) {
        const requestVersion = ++generationVersion;

        document.querySelectorAll('.animal-button').forEach((button) => {
            button.setAttribute('aria-pressed', String(button === selectedButton));
        });

        catalogError.hidden = true;
        emptyState.hidden = true;
        pixelResult.hidden = true;
        copyBtn.disabled = true;
        loader.hidden = false;

        try {
            const [data] = await Promise.all([
                requestJson(`./backend/generate.php?animal=${encodeURIComponent(animalId)}`),
                wait(GENERATION_DELAY),
            ]);

            if (requestVersion !== generationVersion) {
                return;
            }

            pixelArt.style.setProperty('--pixel-size', `${data.pixelSize}px`);
            pixelArt.style.setProperty('--pixel-shadows', data.boxShadow);
            pixelResult.style.width = `${data.width * data.pixelSize}px`;
            pixelResult.style.height = `${data.height * data.pixelSize}px`;
            pixelArt.setAttribute('role', 'img');
            pixelArt.setAttribute('aria-label', `Pixel Art de ${data.name}`);
            matrixSize.textContent = `MATRIZ ${data.width} x ${data.height}`;
            resultName.textContent = `${data.emoji} ${data.name.toUpperCase()}`;
            currentAnimal = data;
            pixelResult.hidden = false;
            copyBtn.disabled = false;
        } catch (error) {
            if (requestVersion !== generationVersion) {
                return;
            }

            emptyState.hidden = false;
            showError(error.message);
        } finally {
            if (requestVersion === generationVersion) {
                loader.hidden = true;
            }
        }
    }

    function wait(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    function buildPortableCode(animal) {
        const shadows = animal.boxShadow
            .split(',')
            .map((shadow) => `    ${shadow.trim()};`)
            .join('\n');

        return `<!-- Pixel Art: ${animal.name} -->
<div class="pixel-art pixel-art--${animal.id}" aria-label="${animal.name}" role="img"></div>

<style>
.pixel-art {
    width: ${animal.pixelSize}px;
    height: ${animal.pixelSize}px;
    background: transparent;
    image-rendering: pixelated;
    box-shadow:
${shadows};
}
</style>`;
    }

    async function copyCode() {
        if (!currentAnimal) {
            return;
        }

        const code = buildPortableCode(currentAnimal);

        try {
            if (navigator.clipboard?.writeText) {
                await navigator.clipboard.writeText(code);
            } else {
                throw new Error('clipboard unavailable');
            }
            showCopyFeedback('CÓDIGO COPIADO ✓', false);
        } catch {
            const textArea = document.createElement('textarea');
            textArea.value = code;
            textArea.setAttribute('readonly', '');
            textArea.style.position = 'fixed';
            textArea.style.opacity = '0';
            document.body.appendChild(textArea);
            textArea.select();

            const copied = document.execCommand('copy');
            document.body.removeChild(textArea);
            showCopyFeedback(copied ? 'CÓDIGO COPIADO ✓' : 'NO SE PUDO COPIAR', !copied);
        }
    }

    function showCopyFeedback(message, isError) {
        copyFeedback.textContent = message;
        copyFeedback.classList.toggle('is-error', isError);
        copyFeedback.hidden = false;
        clearTimeout(showCopyFeedback.timeout);
        showCopyFeedback.timeout = setTimeout(() => {
            copyFeedback.hidden = true;
        }, 2400);
    }

    copyBtn.addEventListener('click', copyCode);

    loadCatalog();
});
