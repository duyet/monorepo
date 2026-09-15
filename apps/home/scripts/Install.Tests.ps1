# Pester tests for install.ps1 target selection and manifest parsing.
# Run: Invoke-Pester -Path apps/home/scripts/Install.Tests.ps1

Describe "duyet install.ps1" {
    BeforeAll {
        # Pester 5 does not set $MyInvocation.MyCommand.Path; $PSScriptRoot does.
        $installPath = Join-Path $PSScriptRoot "../public/install.ps1"
        if (-not (Test-Path -LiteralPath $installPath)) {
            throw "missing installer at $installPath (PSScriptRoot=$PSScriptRoot)"
        }
        $env:DUYET_INSTALLER_TEST = "1"
        . $installPath
    }

    AfterAll {
        Remove-Item Env:DUYET_INSTALLER_TEST -ErrorAction SilentlyContinue
    }

    It "selects x64 Windows target" {
        Get-DuyetTarget -Arch "AMD64" | Should -Be "x86_64-pc-windows-msvc"
    }

    It "rejects non-x64 Windows" {
        { Get-DuyetTarget -Arch "x86" } | Should -Throw
    }

    It "parses stub channel manifest targets" {
        # Channel JSON on trunk is an empty schema filled by the #1444 host job.
        $json = @'
{
  "schema": "duyet.cli.channel.v1",
  "version": "0.1.0-beta.1",
  "tag": "duyet-v0.1.0-beta.1",
  "channel": "stable",
  "published_at": "1970-01-01T00:00:00Z",
  "targets": {
    "x86_64-pc-windows-msvc": {
      "url": "https://github.com/duyet/monorepo/releases/download/duyet-v0.1.0-beta.1/duyet-x86_64-pc-windows-msvc.zip",
      "sha256": "0000000000000000000000000000000000000000000000000000000000000000",
      "size": 0
    },
    "aarch64-apple-darwin": {
      "url": "https://github.com/duyet/monorepo/releases/download/duyet-v0.1.0-beta.1/duyet-aarch64-apple-darwin.tar.xz",
      "sha256": "0000000000000000000000000000000000000000000000000000000000000000",
      "size": 0
    }
  }
}
'@
        $manifest = ConvertFrom-DuyetManifest $json
        (Get-DuyetJsonProperty $manifest "tag") | Should -Be "duyet-v0.1.0-beta.1"
        (Get-DuyetJsonProperty $manifest "targets.x86_64-pc-windows-msvc.url") | Should -Match "duyet-x86_64-pc-windows-msvc.zip"
        (Get-DuyetJsonProperty $manifest "targets.aarch64-apple-darwin.url") | Should -Match "aarch64-apple-darwin"
    }
}
