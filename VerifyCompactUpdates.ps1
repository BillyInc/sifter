function Test-ComponentUpdate {
    param($filePath)
    
    $fileName = Split-Path $filePath -Leaf
    $content = Get-Content $filePath -Raw
    
    $tests = @{
        HasInterface = $false
        HasCompactProp = $false
        HasFunctionParam = $false
        HasDefaultValue = $false
        UsesCompactInJSX = $false
        FileName = $fileName
        FilePath = $filePath
    }
    
    # Test 1: Has Props interface/type
    if ($content -match "(interface|type).*Props") {
        $tests.HasInterface = $true
    }
    
    # Test 2: Has compact prop in interface
    if ($content -match "compact\?.*(:|boolean)") {
        $tests.HasCompactProp = $true
    }
    
    # Test 3: Has compact in function parameters
    if ($content -match "function.*\((.*compact.*)\)" -or 
        $content -match "const.*=.*\((.*compact.*)\)" -or
        $content -match "React\.FC<.*Props>") {
        $tests.HasFunctionParam = $true
    }
    
    # Test 4: Has default value for compact
    if ($content -match "compact\s*=\s*(false|true)" -or 
        $content -match "compact\s*:\s*boolean\s*=\s*(false|true)") {
        $tests.HasDefaultValue = $true
    }
    
    # Test 5: Uses compact in JSX/rendering logic
    if ($content -match "compact.*className" -or 
        $content -match "compact.*\?" -or
        $content -match "\{.*compact.*\}" -and $content -match "className") {
        $tests.UsesCompactInJSX = $true
    }
    
    return $tests
}

function Get-ComponentStatus {
    param($tests)
    
    $status = "❌ Not Updated"
    $color = "Red"
    
    if ($tests.HasInterface -and $tests.HasCompactProp -and $tests.HasFunctionParam) {
        if ($tests.UsesCompactInJSX) {
            $status = "✅ Fully Implemented"
            $color = "Green"
        } elseif ($tests.HasDefaultValue) {
            $status = "⚠️  Prop Added (No Styling)"
            $color = "Yellow"
        } else {
            $status = "⚠️  Interface Updated"
            $color = "Yellow"
        }
    } elseif ($tests.HasCompactProp) {
        $status = "⚠️  Partial Update"
        $color = "Yellow"
    }
    
    return @{
        Status = $status
        Color = $color
    }
}

# Get all component files
$componentFiles = Get-ChildItem -Path ".\src" -Filter "*.tsx" -Recurse -File | 
    Where-Object { $_.FullName -match "components" }

$results = @()
$criticalComponents = @(
    "EABatchDashboard",
    "IndividualDashboard", 
    "ResearcherDashboard",
    "VerdictCard",
    "MetricBreakdown",
    "SmartInputParser",
    "LoadingState",
    "BatchResultsTable"
)

Write-Host "🔍 VERIFYING COMPONENT UPDATES" -ForegroundColor Cyan
Write-Host "=" * 80 -ForegroundColor Cyan

foreach ($file in $componentFiles) {
    $tests = Test-ComponentUpdate -filePath $file.FullName
    $status = Get-ComponentStatus -tests $tests
    
    $isCritical = $false
    foreach ($critical in $criticalComponents) {
        if ($file.Name -match $critical) {
            $isCritical = $true
            break
        }
    }
    
    $result = [PSCustomObject]@{
        FileName = $file.Name
        Status = $status.Status
        Color = $status.Color
        IsCritical = $isCritical
        HasInterface = $tests.HasInterface
        HasCompactProp = $tests.HasCompactProp
        HasFunctionParam = $tests.HasFunctionParam
        HasDefaultValue = $tests.HasDefaultValue
        UsesCompactInJSX = $tests.UsesCompactInJSX
        FilePath = $file.FullName
    }
    
    $results += $result
}

# Display results
Write-Host "`n📋 COMPONENT STATUS REPORT" -ForegroundColor Cyan
Write-Host "-" * 80 -ForegroundColor Cyan

# Show critical components first
$criticalResults = $results | Where-Object { $_.IsCritical } | Sort-Object FileName
$nonCriticalResults = $results | Where-Object { -not $_.IsCritical } | Sort-Object FileName

Write-Host "`n🚨 CRITICAL COMPONENTS:" -ForegroundColor Red
foreach ($result in $criticalResults) {
    Write-Host "  $($result.FileName.PadRight(40)) - " -NoNewline
    Write-Host $result.Status -ForegroundColor $result.Color
}

Write-Host "`n📦 ALL COMPONENTS:" -ForegroundColor White
foreach ($result in $nonCriticalResults) {
    Write-Host "  $($result.FileName.PadRight(40)) - " -NoNewline
    Write-Host $result.Status -ForegroundColor $result.Color
}

# Generate summary
$total = $results.Count
$criticalTotal = $criticalResults.Count
$fullyImplemented = ($results | Where-Object { $_.Status -eq "✅ Fully Implemented" }).Count
$propAdded = ($results | Where-Object { $_.Status -eq "⚠️  Prop Added (No Styling)" }).Count
$interfaceUpdated = ($results | Where-Object { $_.Status -eq "⚠️  Interface Updated" }).Count
$partial = ($results | Where-Object { $_.Status -eq "⚠️  Partial Update" }).Count
$notUpdated = ($results | Where-Object { $_.Status -eq "❌ Not Updated" }).Count

$criticalFullyImplemented = ($criticalResults | Where-Object { $_.Status -eq "✅ Fully Implemented" }).Count

Write-Host "`n📊 SUMMARY STATISTICS" -ForegroundColor Cyan
Write-Host "-" * 80 -ForegroundColor Cyan

Write-Host "Total Components Analyzed: $total" -ForegroundColor Gray
Write-Host "Critical Components: $criticalTotal" -ForegroundColor White
Write-Host "✅ Fully Implemented: $fullyImplemented ($([math]::Round(($fullyImplemented/$total)*100, 1))%)" -ForegroundColor Green
Write-Host "  └ Critical Components Fully Implemented: $criticalFullyImplemented/$criticalTotal" -ForegroundColor $(if ($criticalFullyImplemented -eq $criticalTotal) { "Green" } else { "Yellow" })
Write-Host "⚠️  Prop Added (No Styling): $propAdded" -ForegroundColor Yellow
Write-Host "⚠️  Interface Updated: $interfaceUpdated" -ForegroundColor Yellow
Write-Host "⚠️  Partial Update: $partial" -ForegroundColor DarkYellow
Write-Host "❌ Not Updated: $notUpdated" -ForegroundColor Red

# Check for specific components that need attention
$missingCriticalCompact = $criticalResults | Where-Object { 
    -not $_.HasCompactProp -or -not $_.HasFunctionParam 
} | Select-Object -ExpandProperty FileName

if ($missingCriticalCompact.Count -gt 0) {
    Write-Host "`n🔴 CRITICAL ISSUES FOUND:" -ForegroundColor Red
    Write-Host "The following critical components are missing compact prop:" -ForegroundColor Red
    $missingCriticalCompact | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}

# Show components that need styling implementation
$needsStyling = $results | Where-Object { 
    $_.HasCompactProp -and $_.HasFunctionParam -and -not $_.UsesCompactInJSX 
} | Select-Object FileName, Status

if ($needsStyling.Count -gt 0) {
    Write-Host "`n🎨 COMPONENTS NEEDING STYLING IMPLEMENTATION:" -ForegroundColor Yellow
    $needsStyling | ForEach-Object { 
        Write-Host "  $($_.FileName.PadRight(40)) - $($_.Status)" -ForegroundColor Yellow 
    }
}

Write-Host "`n📄 Report complete!" -ForegroundColor Cyan
