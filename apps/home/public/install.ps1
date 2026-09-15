# duyet CLI installer. PowerShell 5.1 and PowerShell 7.
# Usage: irm https://duyet.net/install.ps1 | iex
#
# Env / params:
#   DUYET_CHANNEL / -Channel          stable (default) | beta
#   DUYET_VERSION / -Version          pin a version (overrides channel)
#   DUYET_INSTALL_DIR                 default $env:LOCALAPPDATA\duyet\bin
#   DUYET_MODIFY_PATH / -Yes          skip Y/n and add user PATH
#   DUYET_BASE_URL                    default https://duyet.net
#   DUYET_GITHUB                      default https://github.com/duyet/monorepo
#   DUYET_SKIP_VERIFY                 tests only
#
# The v1 Windows binary is not Authenticode-signed. Windows SmartScreen may warn.

[CmdletBinding()]
param(
    [string]$Channel = $(if ($env:DUYET_CHANNEL) { $env:DUYET_CHANNEL } else { "stable" }),
    [string]$Version = $(if ($env:DUYET_VERSION) { $env:DUYET_VERSION } else { "" }),
    [string]$InstallDir = $(if ($env:DUYET_INSTALL_DIR) { $env:DUYET_INSTALL_DIR } else { (Join-Path $env:LOCALAPPDATA "duyet\bin") }),
    [switch]$Yes
)

$ErrorActionPreference = "Stop"
$BaseUrl = if ($env:DUYET_BASE_URL) { $env:DUYET_BASE_URL.TrimEnd("/") } else { "https://duyet.net" }
$GithubRepo = if ($env:DUYET_GITHUB) { $env:DUYET_GITHUB.TrimEnd("/") } else { "https://github.com/duyet/monorepo" }
$SkipVerify = $env:DUYET_SKIP_VERIFY -eq "1"
$Target = "x86_64-pc-windows-msvc"

function Write-DuyetInfo([string]$Message) {
    Write-Output "duyet-install: $Message"
}

function Get-DuyetTarget {
    param([string]$Arch = $env:PROCESSOR_ARCHITECTURE)
    switch -Regex ($Arch) {
        "AMD64|X64" { return "x86_64-pc-windows-msvc" }
        default { throw "unsupported Windows architecture: $Arch (v1 ships x64 only)" }
    }
}

function Get-DuyetJsonProperty {
    param(
        [Parameter(Mandatory = $true)]$Object,
        [Parameter(Mandatory = $true)][string]$Path
    )
    $cur = $Object
    foreach ($part in $Path.Split(".")) {
        if ($null -eq $cur) { return $null }
        if ($cur -is [System.Collections.IDictionary]) {
            $cur = $cur[$part]
        } else {
            $prop = $cur.PSObject.Properties[$part]
            if ($null -eq $prop) { return $null }
            $cur = $prop.Value
        }
    }
    return $cur
}

function ConvertFrom-DuyetManifest([string]$Json) {
    return $Json | ConvertFrom-Json
}

function Install-Duyet {
    param(
        [string]$Channel,
        [string]$Version,
        [string]$InstallDir,
        [switch]$Yes
    )
    $ModifyPath = $Yes -or ($env:DUYET_MODIFY_PATH -eq "1")
    $script:Target = Get-DuyetTarget
    $tmp = Join-Path ([System.IO.Path]::GetTempPath()) ("duyet-install-" + [guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $tmp | Out-Null
    try {
        $archiveName = "duyet-$Target.zip"
        $tag = $null
        $expectedSha = $null
        $archiveUrl = $null
        $sumsUrl = $null

        if ($Version) {
            $verStrip = $Version -replace "^duyet-v", "" -replace "^v", ""
            $tag = "duyet-v$verStrip"
            $archiveUrl = "$GithubRepo/releases/download/$tag/$archiveName"
            $sumsUrl = "$GithubRepo/releases/download/$tag/SHA256SUMS"
            Write-DuyetInfo "pinning version $verStrip (tag $tag)"
        } else {
            $manifestUrl = "$BaseUrl/cli/$Channel.json"
            Write-DuyetInfo "fetching channel manifest $manifestUrl"
            try {
                $manifestText = (Invoke-WebRequest -UseBasicParsing -Uri $manifestUrl).Content
            } catch {
                throw "failed to fetch $manifestUrl (channel manifests land with #1444)"
            }
            $manifest = ConvertFrom-DuyetManifest $manifestText
            $tag = [string](Get-DuyetJsonProperty $manifest "tag")
            $archiveUrl = [string](Get-DuyetJsonProperty $manifest "targets.$Target.url")
            $expectedSha = [string](Get-DuyetJsonProperty $manifest "targets.$Target.sha256")
            if (-not $archiveUrl) {
                if (-not $tag) {
                    throw "manifest $manifestUrl has no tag or targets.$Target.url (see #1444)"
                }
                $archiveUrl = "$GithubRepo/releases/download/$tag/$archiveName"
            } else {
                $archiveName = [System.IO.Path]::GetFileName(([Uri]$archiveUrl).AbsolutePath)
            }
            $sumsUrl = ($archiveUrl -replace "/[^/]+$", "/SHA256SUMS")
            Write-DuyetInfo "channel $Channel tag $tag"
        }

        $archivePath = Join-Path $tmp $archiveName
        Write-DuyetInfo "downloading $archiveUrl"
        try {
            Invoke-WebRequest -UseBasicParsing -Uri $archiveUrl -OutFile $archivePath
        } catch {
            throw "failed to download $archiveUrl (release artifacts come from #1444)"
        }

        if (-not $SkipVerify) {
            $hash = (Get-FileHash -Algorithm SHA256 -Path $archivePath).Hash.ToLowerInvariant()
            $verified = $false
            try {
                $sumsText = (Invoke-WebRequest -UseBasicParsing -Uri $sumsUrl).Content
                foreach ($line in ($sumsText -split "`n")) {
                    $line = $line.Trim()
                    if (-not $line) { continue }
                    $parts = $line -split "\s+"
                    if ($parts.Length -ge 2 -and ($parts[1] -eq $archiveName -or $parts[1] -eq "*$archiveName")) {
                        $want = $parts[0].ToLowerInvariant()
                        if ($want -ne $hash) {
                            throw "SHA256 mismatch for $archiveName"
                        }
                        $verified = $true
                        break
                    }
                }
                if (-not $verified) {
                    throw "SHA256SUMS has no entry for $archiveName"
                }
            } catch {
                if ($expectedSha -and $expectedSha -ne ("0" * 64)) {
                    if ($expectedSha.ToLowerInvariant() -ne $hash) {
                        throw "SHA256 mismatch: got $hash expected $expectedSha"
                    }
                    $verified = $true
                } elseif (-not $verified) {
                    throw "could not fetch SHA256SUMS from $sumsUrl and manifest has no sha256"
                }
            }
        }

        $extract = Join-Path $tmp "out"
        New-Item -ItemType Directory -Path $extract | Out-Null
        Expand-Archive -Path $archivePath -DestinationPath $extract -Force
        $bin = Get-ChildItem -Path $extract -Recurse -File | Where-Object { $_.Name -eq "duyet.exe" -or $_.Name -eq "duyet" } | Select-Object -First 1
        if (-not $bin) {
            throw "archive did not contain a duyet binary"
        }

        New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
        $dest = Join-Path $InstallDir "duyet.exe"
        Copy-Item -Path $bin.FullName -Destination $dest -Force
        Write-DuyetInfo "installed $dest"

        Write-Output ""
        Write-Output "SmartScreen: this binary is not Authenticode-signed in v1. If Windows blocks it, choose More info -> Run anyway."
        Write-Output ""

        try {
            & $dest version
        } catch {
            Write-DuyetInfo "warning: duyet version failed (binary may be a stub)"
        }

        $userPath = [Environment]::GetEnvironmentVariable("Path", "User")
        if (-not $userPath) { $userPath = "" }
        $already = ($userPath -split ";" | ForEach-Object { $_.TrimEnd("\") }) -contains $InstallDir.TrimEnd("\")

        if ($already) {
            Write-DuyetInfo "user PATH already contains $InstallDir"
        } elseif ($ModifyPath) {
            $newPath = if ($userPath) { "$userPath;$InstallDir" } else { $InstallDir }
            [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
            $env:Path = "$env:Path;$InstallDir"
            Write-DuyetInfo "added $InstallDir to the user PATH"
        } else {
            $answer = "n"
            if ([Environment]::UserInteractive) {
                $answer = Read-Host "Add $InstallDir to your user PATH? [Y/n]"
            }
            if ($answer -eq "" -or $answer -match "^[Yy]") {
                $newPath = if ($userPath) { "$userPath;$InstallDir" } else { $InstallDir }
                [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
                $env:Path = "$env:Path;$InstallDir"
                Write-DuyetInfo "added $InstallDir to the user PATH"
            } else {
                Write-DuyetInfo "not editing PATH. Add:"
                Write-Output "  $InstallDir"
            }
        }
    } finally {
        Remove-Item -Recurse -Force $tmp -ErrorAction SilentlyContinue
    }
}

$script:DuyetInstallerDotSourced = $MyInvocation.InvocationName -eq "." -or $MyInvocation.Line -match "^\.\s"
if (-not $script:DuyetInstallerDotSourced) {
    Install-Duyet -Channel $Channel -Version $Version -InstallDir $InstallDir -Yes:$Yes
}
