$ErrorActionPreference = 'Stop'

py -3.13 -m venv .venv
if ($LASTEXITCODE -ne 0) {
    throw 'Python 3.13 no está instalado. Instala Python 3.13 y vuelve a ejecutar este script.'
}

& .\.venv\Scripts\python.exe -m pip install --upgrade pip
if ($LASTEXITCODE -ne 0) { throw 'No se pudo actualizar pip.' }

& .\.venv\Scripts\python.exe -m pip install -r requirements.txt
if ($LASTEXITCODE -ne 0) { throw 'No se pudieron instalar los requisitos de rembg.' }

Write-Host 'Instalación lista. Inicia el servicio con .\run.ps1'
