# Export a validated CS-Manager timesheet using desktop Excel on Windows.
# The selected workbook is opened read-only and is never saved by this script.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Windows.Forms
[System.Windows.Forms.Application]::EnableVisualStyles()
$excel = $null
$book = $null
$sheet = $null
$tempPdf = $null
try {
    $requestDialog = New-Object System.Windows.Forms.OpenFileDialog
    $requestDialog.Title = 'Select the CS-Manager PDF request downloaded from the app'
    $requestDialog.Filter = 'CS-Manager request (*.json)|*.json'
    if ($requestDialog.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK) { return }
    $request = [System.IO.File]::ReadAllText($requestDialog.FileName, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
    if ($request.schema -cne 'cs-manager-pdf-request/v1' -or $request.relativePath -isnot [string] -or $request.sheetName -isnot [string] -or $request.controlSignature -isnot [string] -or $request.sha256 -cnotmatch '^[a-f0-9]{64}$') { throw 'Invalid PDF request.' }
    $parts = @($request.relativePath -csplit '/')
    if ($parts.Count -lt 2 -or @($parts | Where-Object { $_ -eq '' -or $_ -eq '.' -or $_ -eq '..' -or $_.Contains('\') -or $_.Contains(':') }).Count -gt 0) { throw 'Invalid relative timesheet path.' }
    $folderDialog = New-Object System.Windows.Forms.FolderBrowserDialog
    $folderDialog.Description = 'Select the annual timesheet folder used in CS-Manager'
    if ($folderDialog.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK) { return }
    $root = [System.IO.Path]::GetFullPath($folderDialog.SelectedPath)
    $rootPrefix = $root.TrimEnd('\') + '\'
    $archivePath = [System.IO.Path]::Combine($root, 'CS-Manager-controls.json')
    if (-not [System.IO.File]::Exists($archivePath)) { throw 'The selected folder does not contain the annual CS-Manager control archive.' }
    $archiveHash = (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash
    $archive = [System.IO.File]::ReadAllText($archivePath, [System.Text.Encoding]::UTF8) | ConvertFrom-Json
    if ($archive.schema -cne 'cs-manager-year-control/v1' -or -not $archive.files) { throw 'The annual control archive is not recognized.' }
    $entry = $archive.files.PSObject.Properties | Where-Object { $_.Name -ceq $request.relativePath } | Select-Object -First 1
    if (-not $entry) { throw 'The timesheet is not present in the selected annual archive.' }
    $record = $entry.Value
    if ($record.schema -cne 'ts-checker-control/v1' -or $record.source.name -cne $parts[$parts.Count - 1] -or -not $record.validation -or $record.validation.validated -ne $true -or $record.source.sha256 -cne $request.sha256 -or $record.context.signature -cne $request.controlSignature -or -not $record.checks) { throw 'The timesheet is no longer validated for this request. Run the analysis and validate it again.' }
    foreach ($check in $record.checks) {
        if ($check.state -cne 'OK' -and $check.state -cne 'Accettato con commento') { throw 'The record has unresolved checks.' }
        if ($check.state -ceq 'Accettato con commento' -and [string]::IsNullOrWhiteSpace([string]$check.comment)) { throw 'An accepted check has no comment.' }
    }
    $relativeWindows = [string]::Join('\', [string[]]$parts)
    $sourcePath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($root, $relativeWindows))
    if (-not $sourcePath.StartsWith($rootPrefix, [System.StringComparison]::OrdinalIgnoreCase) -or -not [System.IO.File]::Exists($sourcePath) -or [System.IO.Path]::GetExtension($sourcePath).ToLowerInvariant() -notin @('.xlsx','.xlsm')) { throw 'The requested timesheet was not found in the selected annual folder.' }
    if ((Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash.ToLowerInvariant() -cne $request.sha256) { throw 'The timesheet has changed since validation. Run the analysis and validate it again.' }
    $saveDialog = New-Object System.Windows.Forms.SaveFileDialog
    $saveDialog.Title = 'Save the validated timesheet as PDF'
    $saveDialog.Filter = 'PDF document (*.pdf)|*.pdf'
    $saveDialog.DefaultExt = 'pdf'
    $saveDialog.AddExtension = $true
    $saveDialog.OverwritePrompt = $true
    $saveDialog.FileName = [System.IO.Path]::GetFileNameWithoutExtension($sourcePath) + '.pdf'
    if ($saveDialog.ShowDialog() -ne [System.Windows.Forms.DialogResult]::OK) { return }
    $destination = [System.IO.Path]::GetFullPath($saveDialog.FileName)
    if ([System.IO.Path]::GetExtension($destination).ToLowerInvariant() -ne '.pdf') { throw 'The destination must have the .pdf extension.' }
    $tempPdf = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), 'CS-Manager-' + [guid]::NewGuid().ToString('N') + '.pdf')
    if (Get-Process -Name EXCEL -ErrorAction SilentlyContinue) { throw 'Close open Excel windows and try again. This protects unsaved work in existing Excel sessions.' }
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $true
    $excel.DisplayAlerts = $false
    $excel.EnableEvents = $false
    $excel.AskToUpdateLinks = $false
    $excel.AutomationSecurity = 3
    try { $excel.Calculation = -4135 } catch { }
    $book = $excel.Workbooks.Open($sourcePath, 0, $true)
    try { $sheet = $book.Worksheets.Item($request.sheetName) } catch { throw 'The validated timesheet sheet was not found in the workbook.' }
    if ($sheet.Visible -ne -1) { throw 'The validated timesheet sheet is hidden.' }
    $area = [string]$sheet.PageSetup.PrintArea
    if ($area -and $sheet.Range($area).Areas.Count -gt 1) { throw 'The Excel print area contains separate ranges; configure a single print area in Excel first.' }
    $sheet.PageSetup.Zoom = $false
    $sheet.PageSetup.FitToPagesWide = 1
    $sheet.PageSetup.FitToPagesTall = 1
    $sheet.ExportAsFixedFormat(0, $tempPdf)
    if (-not [System.IO.File]::Exists($tempPdf)) { throw 'Excel did not create the PDF.' }
    if ((Get-FileHash -LiteralPath $sourcePath -Algorithm SHA256).Hash.ToLowerInvariant() -cne $request.sha256 -or (Get-FileHash -LiteralPath $archivePath -Algorithm SHA256).Hash -cne $archiveHash) { throw 'The timesheet or annual archive changed during export. No PDF was saved.' }
    [System.IO.File]::Copy($tempPdf, $destination, $true)
    [System.Windows.Forms.MessageBox]::Show('PDF created successfully.', 'CS-Manager', 'OK', 'Information') | Out-Null
} catch {
    [System.Windows.Forms.MessageBox]::Show($_.Exception.Message, 'CS-Manager - PDF export', 'OK', 'Error') | Out-Null
    exit 1
} finally {
    if ($book) { try { $book.Close($false) } catch {} }
    if ($excel) { try { $excel.Quit() } catch {} }
    foreach ($object in @($sheet,$book,$excel)) { if ($object -and [System.Runtime.InteropServices.Marshal]::IsComObject($object)) { [void][System.Runtime.InteropServices.Marshal]::FinalReleaseComObject($object) } }
    if ($tempPdf -and [System.IO.File]::Exists($tempPdf)) { [System.IO.File]::Delete($tempPdf) }
}
