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
    let generationVersion = 0;

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
        loader.hidden = false;

        try {
            const data = await requestJson(`./backend/generate.php?animal=${encodeURIComponent(animalId)}`);

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
            pixelResult.hidden = false;
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

    loadCatalog();
});
