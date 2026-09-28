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
    const imageInput = document.getElementById('image-input');
    const imageDropzone = document.getElementById('image-dropzone');
    const imageFeedback = document.getElementById('image-feedback');
    const resolutionInput = document.getElementById('pixel-resolution');
    const resolutionValue = document.getElementById('resolution-value');
    const paletteInput = document.getElementById('palette-size');
    const paletteValue = document.getElementById('palette-value');
    const removeBackgroundWithAi = document.getElementById('remove-bg-ai');
    const removeWhiteBackground = document.getElementById('remove-white-background');
    const HIDDEN_ANIMALS = new Set(['perro', 'gato', 'zorro', 'panda', 'ballena', 'tigre']);
    const GENERATION_DELAY = 700;
    let generationVersion = 0;
    let currentAnimal = null;
    let selectedImage = null;

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

    function openImageLightbox(imageSrc, imageAlt, triggerElement) {
        if (document.querySelector(".logo-lightbox")) {
            return;
        }

        const rect = triggerElement.getBoundingClientRect();
        const elementCX = rect.left + rect.width / 2;
        const elementCY = rect.top + rect.height / 2;
        const vpCX = window.innerWidth / 2;
        const vpCY = window.innerHeight / 2;
        const dx = elementCX - vpCX;
        const dy = elementCY - vpCY;

        const overlay = document.createElement("div");
        overlay.className = "logo-lightbox";
        overlay.setAttribute("role", "dialog");
        overlay.setAttribute("aria-modal", "true");
        overlay.setAttribute("aria-label", `${imageAlt} ampliado`);
        overlay.style.setProperty("--lbx", dx + "px");
        overlay.style.setProperty("--lby", dy + "px");

        const img = document.createElement("img");
        img.src = imageSrc;
        img.className = "logo-lightbox__img";
        img.alt = imageAlt;

        const closeBtn = document.createElement("button");
        closeBtn.className = "logo-lightbox__close";
        closeBtn.setAttribute("aria-label", "Cerrar");
        closeBtn.innerHTML = "&times;";

        overlay.appendChild(img);
        overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);

        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                overlay.classList.add("logo-lightbox--open");
                closeBtn.focus();
            });
        });

        function onKey(e) {
            if (e.key === "Escape") {
                closeLightbox();
            }
        }

        function closeLightbox() {
            document.removeEventListener("keydown", onKey);
            overlay.classList.remove("logo-lightbox--open");
            overlay.classList.add("logo-lightbox--closing");
            window.setTimeout(function () {
                overlay.remove();
                triggerElement.focus();
            }, 420);
        }

        closeBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            closeLightbox();
        });

        overlay.addEventListener("click", function (e) {
            if (e.target === overlay) closeLightbox();
        });

        document.addEventListener("keydown", onKey);
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

            const visibleAnimals = data.animals.filter((animal) => !HIDDEN_ANIMALS.has(animal.id));
            visibleAnimals.forEach((animal) => fragment.appendChild(createAnimalButton(animal)));
            animalList.replaceChildren(fragment);
            animalCount.textContent = `${visibleAnimals.length} criaturas`;
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
        selectedImage = null;

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
            fitPreview(data.width * data.pixelSize, data.height * data.pixelSize);
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

    function fitPreview(width, height) {
        const stage = document.getElementById('pixel-stage');
        const scale = Math.min(1, (stage.clientWidth - 36) / width, (stage.clientHeight - 36) / height);
        pixelResult.style.setProperty('--result-scale', String(Math.max(0.2, scale)));
    }

    function showImageFeedback(message, isError = false) {
        imageFeedback.textContent = message;
        imageFeedback.classList.toggle('is-error', isError);
        imageFeedback.hidden = false;
    }

    function getImageBitmap(file) {
        if (window.createImageBitmap) {
            return createImageBitmap(file);
        }

        return new Promise((resolve, reject) => {
            const image = new Image();
            const objectUrl = URL.createObjectURL(file);
            image.onload = () => {
                URL.revokeObjectURL(objectUrl);
                resolve(image);
            };
            image.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error('No se pudo abrir esta imagen.'));
            };
            image.src = objectUrl;
        });
    }

    function medianCutPalette(pixels, limit) {
        const colorCounts = new Map();
        for (let index = 0; index < pixels.length; index += 4) {
            const alpha = pixels[index + 3];
            if (alpha < 40) continue;

            const key = `${pixels[index]},${pixels[index + 1]},${pixels[index + 2]}`;
            const entry = colorCounts.get(key);
            if (entry) entry.count += alpha / 255;
            else colorCounts.set(key, {
                r: pixels[index], g: pixels[index + 1], b: pixels[index + 2], count: alpha / 255,
            });
        }

        let boxes = [Array.from(colorCounts.values())];
        while (boxes.length < limit) {
            let splitIndex = -1;
            let splitChannel = 'r';
            let largestRange = -1;

            boxes.forEach((box, index) => {
                if (box.length < 2) return;
                for (const channel of ['r', 'g', 'b']) {
                    const values = box.map((color) => color[channel]);
                    const range = Math.max(...values) - Math.min(...values);
                    if (range > largestRange) {
                        largestRange = range;
                        splitIndex = index;
                        splitChannel = channel;
                    }
                }
            });

            if (splitIndex < 0) break;
            const box = boxes[splitIndex].sort((a, b) => a[splitChannel] - b[splitChannel]);
            const halfWeight = box.reduce((sum, color) => sum + color.count, 0) / 2;
            let accumulated = 0;
            let median = 1;
            for (; median < box.length; median += 1) {
                accumulated += box[median - 1].count;
                if (accumulated >= halfWeight) break;
            }

            boxes.splice(splitIndex, 1, box.slice(0, median), box.slice(median));
        }

        return boxes.map((box) => {
            const weight = box.reduce((sum, color) => sum + color.count, 0);
            return ['r', 'g', 'b'].map((channel) => Math.round(
                box.reduce((sum, color) => sum + color[channel] * color.count, 0) / weight,
            ));
        });
    }

    function clearEdgeWhite(imageData) {
        const { data, width, height } = imageData;
        const total = width * height;
        const visited = new Uint8Array(total);
        const queue = new Int32Array(total);
        let readIndex = 0;
        let writeIndex = 0;

        function isBackground(index) {
            const offset = index * 4;
            if (data[offset + 3] < 40) return true;
            const red = data[offset];
            const green = data[offset + 1];
            const blue = data[offset + 2];
            return Math.min(red, green, blue) >= 215
                && Math.max(red, green, blue) - Math.min(red, green, blue) <= 34;
        }

        function enqueue(index) {
            if (visited[index]) return;
            visited[index] = 1;
            if (isBackground(index)) {
                data[index * 4 + 3] = 0;
                queue[writeIndex++] = index;
            }
        }

        for (let x = 0; x < width; x += 1) {
            enqueue(x);
            if (height > 1) enqueue((height - 1) * width + x);
        }
        for (let y = 1; y < height - 1; y += 1) {
            enqueue(y * width);
            if (width > 1) enqueue(y * width + width - 1);
        }

        while (readIndex < writeIndex) {
            const index = queue[readIndex++];
            const x = index % width;
            if (x > 0) enqueue(index - 1);
            if (x + 1 < width) enqueue(index + 1);
            if (index >= width) enqueue(index - width);
            if (index + width < total) enqueue(index + width);
        }
    }

    function intensifyNeutralShadows(pixels) {
        for (let index = 0; index < pixels.length; index += 4) {
            if (pixels[index + 3] < 40) continue;

            const red = pixels[index];
            const green = pixels[index + 1];
            const blue = pixels[index + 2];
            const lightness = (red + green + blue) / 3;
            const chroma = Math.max(red, green, blue) - Math.min(red, green, blue);
            if (lightness >= 205 || chroma >= 46) continue;

            const intensified = 255 * ((lightness / 255) ** 1.8);
            pixels[index] = Math.max(0, Math.round(intensified + (red - lightness) * 0.4));
            pixels[index + 1] = Math.max(0, Math.round(intensified + (green - lightness) * 0.4));
            pixels[index + 2] = Math.max(0, Math.round(intensified + (blue - lightness) * 0.4));
        }
    }

    async function requestBackgroundRemoval(file) {
        const formData = new FormData();
        formData.append('image', file);
        const response = await fetch('./backend/remove-background.php', {
            method: 'POST',
            body: formData,
            headers: { Accept: 'image/png, application/json' },
        });

        if (!response.ok) {
            const error = await response.json().catch(() => null);
            throw new Error(error?.error || 'El servicio de eliminación de fondo no está disponible.');
        }

        return response.blob();
    }

    function colorToHex([red, green, blue]) {
        return `#${[red, green, blue].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
    }

    async function generateFromImage(file) {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            showImageFeedback('Selecciona un archivo de imagen válido.', true);
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            showImageFeedback('La imagen supera el límite de 10 MB.', true);
            return;
        }

        const requestVersion = ++generationVersion;
        document.querySelectorAll('.animal-button').forEach((button) => button.setAttribute('aria-pressed', 'false'));
        catalogError.hidden = true;
        imageFeedback.hidden = true;
        emptyState.hidden = true;
        pixelResult.hidden = true;
        copyBtn.disabled = true;
        loader.hidden = false;

        let backgroundWarning = '';
        try {
            let imageSource = file;
            if (removeBackgroundWithAi.checked) {
                try {
                    imageSource = await requestBackgroundRemoval(file);
                } catch (error) {
                    if (!removeWhiteBackground.checked) throw error;
                    backgroundWarning = ' La IA no está disponible; se usó el borrado rápido de blanco.';
                }
            }

            if (requestVersion !== generationVersion) return;
            const image = await getImageBitmap(imageSource);
            const longestSide = Number(resolutionInput.value);
            const scale = longestSide / Math.max(image.width, image.height);
            const width = Math.max(1, Math.round(image.width * scale));
            const height = Math.max(1, Math.round(image.height * scale));
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext('2d', { willReadFrequently: true });
            context.imageSmoothingEnabled = true;
            context.imageSmoothingQuality = 'high';
            context.drawImage(image, 0, 0, width, height);
            if (typeof image.close === 'function') image.close();

            const imageData = context.getImageData(0, 0, width, height);
            if (!removeBackgroundWithAi.checked || backgroundWarning) {
                if (removeWhiteBackground.checked) clearEdgeWhite(imageData);
            }
            const pixels = imageData.data;
            intensifyNeutralShadows(pixels);
            const palette = medianCutPalette(pixels, Number(paletteInput.value));
            if (!palette.length) throw new Error('No se encontraron píxeles visibles en la imagen.');

            const shadows = [];
            for (let y = 0; y < height; y += 1) {
                for (let x = 0; x < width; x += 1) {
                    const offset = (y * width + x) * 4;
                    if (pixels[offset + 3] < 40) continue;
                    let nearest = palette[0];
                    let nearestDistance = Infinity;
                    for (const color of palette) {
                        const red = pixels[offset] - color[0];
                        const green = pixels[offset + 1] - color[1];
                        const blue = pixels[offset + 2] - color[2];
                        const distance = red * red + green * green + blue * blue;
                        if (distance < nearestDistance) {
                            nearest = color;
                            nearestDistance = distance;
                        }
                    }
                    shadows.push(`${x * 9}px ${y * 9}px 0 ${colorToHex(nearest)}`);
                }
            }

            if (requestVersion !== generationVersion) return;
            const imageName = file.name.replace(/\.[^.]+$/, '').replace(/[<>\r\n]/g, '').slice(0, 60) || 'Imagen';
            const data = {
                id: 'imagen',
                name: imageName,
                emoji: '🖼️',
                width,
                height,
                pixelSize: 9,
                boxShadow: shadows.join(', '),
            };

            pixelArt.style.setProperty('--pixel-size', `${data.pixelSize}px`);
            pixelArt.style.setProperty('--pixel-shadows', data.boxShadow);
            pixelResult.style.width = `${width * data.pixelSize}px`;
            pixelResult.style.height = `${height * data.pixelSize}px`;
            fitPreview(width * data.pixelSize, height * data.pixelSize);
            pixelArt.setAttribute('role', 'img');
            pixelArt.setAttribute('aria-label', `Pixel Art generado desde ${imageName}`);
            matrixSize.textContent = `MATRIZ ${width} x ${height}`;
            resultName.textContent = `${data.emoji} ${imageName.toUpperCase()}`;
            currentAnimal = data;
            selectedImage = file;
            pixelResult.hidden = false;
            copyBtn.disabled = false;
            const backgroundStatus = removeBackgroundWithAi.checked && !backgroundWarning
                ? ' Fondo eliminado con IA.'
                : '';
            showImageFeedback(`Imagen convertida: ${width} × ${height} píxeles · hasta ${palette.length} colores.${backgroundStatus}${backgroundWarning}`);
        } catch (error) {
            if (requestVersion === generationVersion) {
                emptyState.hidden = false;
                showImageFeedback(error.message || 'No se pudo procesar la imagen.', true);
            }
        } finally {
            if (requestVersion === generationVersion) loader.hidden = true;
        }
    }

    imageInput.addEventListener('change', () => {
        const [file] = imageInput.files || [];
        imageInput.value = '';
        generateFromImage(file);
    });

    [resolutionInput, paletteInput].forEach((input) => {
        input.addEventListener('input', () => {
            resolutionValue.value = `${resolutionInput.value} px`;
            paletteValue.value = paletteInput.value;
            if (selectedImage) generateFromImage(selectedImage);
        });
    });
    removeWhiteBackground.addEventListener('change', () => {
        if (selectedImage) generateFromImage(selectedImage);
    });
    removeBackgroundWithAi.addEventListener('change', () => {
        if (selectedImage) generateFromImage(selectedImage);
    });

    ['dragenter', 'dragover'].forEach((eventName) => {
        imageDropzone.addEventListener(eventName, (event) => {
            event.preventDefault();
            imageDropzone.classList.add('is-dragging');
        });
    });
    ['dragleave', 'drop'].forEach((eventName) => {
        imageDropzone.addEventListener(eventName, (event) => {
            event.preventDefault();
            imageDropzone.classList.remove('is-dragging');
        });
    });
    imageDropzone.addEventListener('drop', (event) => {
        generateFromImage(event.dataTransfer.files[0]);
    });

    window.addEventListener('resize', () => {
        if (currentAnimal) {
            fitPreview(currentAnimal.width * currentAnimal.pixelSize, currentAnimal.height * currentAnimal.pixelSize);
        }
    });

    function buildPortableCode(animal) {
        const safeName = animal.name.replace(/\*\//g, '* /').replace(/[\r\n]/g, ' ');
        const shadows = animal.boxShadow
            .split(',')
            .map((shadow, index, list) => `    ${shadow.trim()}${index === list.length - 1 ? ';' : ','}`)
            .join('\n');

        return `<!-- Pixel Art: ${safeName} -->
            <div class="pixel-art pixel-art--${animal.id}" aria-label="${animal.name}" role="img"></div>

            <style>
            .pixel-art {
                width: ${animal.pixelSize}px;
                height: ${animal.pixelSize}px;
                background: transparent;
                image-rendering: pixelated;
                box-shadow:
            ${shadows}
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

    const logoEl = document.querySelector(".logo");
	if (!logoEl) return;
	const logoImg = logoEl.querySelector(".box img");
	if (!logoImg) return;

	function openLogo() {
		openImageLightbox(logoImg.src, "Logo", logoEl);
	}

	logoEl.addEventListener("click", openLogo);
	logoEl.addEventListener("keydown", function(e) {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			openLogo();
		}
	});
});
