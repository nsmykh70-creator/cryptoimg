foreach ($p in @(1492,22828,24880,30440,34148)) {
  $conns = Get-NetTCPConnection -OwningProcess $p -LocalPort 3000 -ErrorAction SilentlyContinue
  if ($conns) {
    Write-Output "PID $p owns port 3000"
  }
}
