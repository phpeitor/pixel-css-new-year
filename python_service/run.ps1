$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath '.\.venv\Scripts\python.exe')) {
    throw 'Falta el entorno virtual. Ejecuta primero .\setup.ps1'
}

& .\.venv\Scripts\python.exe .\remove_bg_service.py
