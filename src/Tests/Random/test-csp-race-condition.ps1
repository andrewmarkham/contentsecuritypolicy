# CSP nonce vs HTML script nonce checker

$url = "https://localhost:5001/"
$concurrentRequests = 20

$differentNonceCount = 0
$iteration = 0

Write-Host "Starting CSP nonce vs HTML script nonce check (High Load - $concurrentRequests concurrent requests)...`n"

# Disable certificate validation for localhost
Add-Type @"
using System.Net;
using System.Security.Cryptography.X509Certificates;
public class TrustAllCertsPolicy : ICertificatePolicy {
    public bool CheckValidationResult(ServicePoint srvPoint, X509Certificate certificate, WebRequest request, int certificateProblem) {
        return true;
    }
}
"@
[System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertsPolicy
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

function Extract-NonceFromCsp {
    param([string]$headerValue)

    if ([string]::IsNullOrEmpty($headerValue)) { return $null }

    if ($headerValue -match "'nonce-([\w-]+)'") {
        return $matches[1]
    }
    return $null
}

function Extract-NonceFromFirstScript {
    param([string]$htmlContent)

    if ([string]::IsNullOrEmpty($htmlContent)) { return $null }

    if ($htmlContent -match '<script[^>]+nonce\s*=\s*([''"]?)([a-f0-9\-]+)\1') {
        return $matches[2]
    }
    return $null
}


while ($true) {
    $iteration++

    # Execute concurrent requests using runspaces
    $runspaces = @()
    $runspacePool = [runspacefactory]::CreateRunspacePool(1, $concurrentRequests)
    $runspacePool.Open()

    for ($i = 0; $i -lt $concurrentRequests; $i++) {
        $powershell = [powershell]::Create()
        $powershell.RunspacePool = $runspacePool

        [void]$powershell.AddScript({
            param($url, $iteration, $requestNumber)

            # Disable certificate validation
            Add-Type @"
using System.Net;
using System.Security.Cryptography.X509Certificates;
public class TrustAllCertsPolicy : ICertificatePolicy {
    public bool CheckValidationResult(ServicePoint srvPoint, X509Certificate certificate, WebRequest request, int certificateProblem) {
        return true;
    }
}
"@
            [System.Net.ServicePointManager]::CertificatePolicy = New-Object TrustAllCertsPolicy
            [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12

            function Extract-NonceFromCsp {
                param([string]$headerValue)
                if ([string]::IsNullOrEmpty($headerValue)) { return $null }
                if ($headerValue -match "'nonce-([\w-]+)'") {
                    return $matches[1]
                }
                return $null
            }

            function Extract-NonceFromFirstScript {
                param([string]$htmlContent)
                if ([string]::IsNullOrEmpty($htmlContent)) { return $null }
                if ($htmlContent -match '<script[^>]+nonce\s*=\s*([''"]?)([a-f0-9\-]+)\1') {
                    return $matches[2]
                }
                return $null
            }

            try {
                $response = Invoke-WebRequest -Uri $url -MaximumRedirection 0 -UseBasicParsing -ErrorAction Stop

                $csp = $response.Headers['content-security-policy']
                $nonceCsp = Extract-NonceFromCsp -headerValue $csp

                $htmlContent = $response.Content
                $nonceScript = Extract-NonceFromFirstScript -htmlContent $htmlContent

                $isMatch = ($nonceCsp -eq $nonceScript) -and ($null -ne $nonceCsp)

                return @{
                    IsMatch = $isMatch
                    Iteration = $iteration
                    RequestNumber = $requestNumber
                    NonceCsp = $nonceCsp
                    NonceScript = $nonceScript
                    Error = $null
                }
            }
            catch {
                return @{
                    IsMatch = $true
                    Iteration = $iteration
                    RequestNumber = $requestNumber
                    NonceCsp = $null
                    NonceScript = $null
                    Error = $_.Exception.Message
                }
            }
        }).AddArgument($url).AddArgument($iteration).AddArgument($i)

        $runspaces += @{
            PowerShell = $powershell
            Handle = $powershell.BeginInvoke()
        }
    }

    # Wait for all runspaces to complete and display results
    foreach ($rs in $runspaces) {
        $result = $rs.PowerShell.EndInvoke($rs.Handle)
        $rs.PowerShell.Dispose()

        if ($null -eq $result) { continue }

        if ($result.Error) {
            Write-Host "[$($result.Iteration)-$($result.RequestNumber)] ERROR: $($result.Error)" -ForegroundColor Yellow
        }
        elseif (-not $result.IsMatch) {
            Write-Host "[$($result.Iteration)-$($result.RequestNumber)] MISMATCH" -ForegroundColor Red
            Write-Host "      CSP Nonce:    $($result.NonceCsp)"
            Write-Host "      Script Nonce: $($result.NonceScript)"
            $differentNonceCount++
        }
        else {
            Write-Host "[$($result.Iteration)-$($result.RequestNumber)] MATCH - $($result.NonceCsp)" -ForegroundColor Green
        }
    }

    $runspacePool.Close()
    $runspacePool.Dispose()

    Write-Host "`nTotal different nonce count: $differentNonceCount`n"
    Write-Host "─────────────────────────────────────────────────────────`n"
}