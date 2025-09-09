# Script para reiniciar el servidor backend
Write-Host "🔄 Reiniciando servidor backend..." -ForegroundColor Yellow

# Cambiar al directorio del backend
Set-Location "C:\Users\Camila\Desktop\app_criminalistica-1\mern-backend"

# Matar cualquier proceso de node que esté ejecutando el backend
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { 
    $_.MainModule.FileName -like "*node.exe*" 
} | ForEach-Object {
    Write-Host "🛑 Deteniendo proceso Node: PID $($_.Id)" -ForegroundColor Red
    Stop-Process -Id $_.Id -Force
}

Start-Sleep -Seconds 2

# Iniciar el servidor
Write-Host "🚀 Iniciando servidor backend..." -ForegroundColor Green
npm start
