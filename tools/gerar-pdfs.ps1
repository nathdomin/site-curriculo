# Gera os currículos em PDF a partir dos HTMLs desta pasta, usando o Microsoft Edge.
# Uso (na raiz do projeto): powershell -File tools\gerar-pdfs.ps1

$ErrorActionPreference = 'Stop'

$edge = @(
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $edge) { throw 'Microsoft Edge não encontrado.' }

$root = Split-Path -Parent $PSScriptRoot
$pdfs = @{
    'curriculo-pt.html' = 'arquivos\curriculo_nathan_domingues.pdf'
    'resume-en.html'    = 'arquivos\nathan_domingues_resume_en.pdf'
}

foreach ($source in $pdfs.Keys) {
    $html = Join-Path $PSScriptRoot $source
    $pdf = Join-Path $root $pdfs[$source]
    # -Wait: o Edge devolve o controle antes de terminar de gravar o PDF
    $arguments = @('--headless=new', '--disable-gpu', '--no-pdf-header-footer', "--print-to-pdf=`"$pdf`"", "file:///$($html -replace '\\', '/')")
    Start-Process -FilePath $edge -ArgumentList $arguments -Wait -WindowStyle Hidden
    Write-Host "Gerado: $($pdfs[$source]) ($((Get-Item $pdf).LastWriteTime))"
}
