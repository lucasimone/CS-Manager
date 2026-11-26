# CS-Manager 2.2.0: installation

1. Copy the entire `CS-Manager` folder to the target computer. Keep its folders together.
2. Open `index.html` in a recent version of Chrome or Edge. No installation is required for the normal workflow.
3. Open **Settings** and select your contract workbook and timesheet folder. You can download a blank workbook template from step 1 and then select the saved file. These files are not included in the package. The workbook must contain the sheets `Contracts` and `Persone e tariffe PO`; timesheets are organized by year and month folders `01` to `12`.
4. Grant browser access when requested. Writing contract changes requires write permission for the selected workbook; saving timesheet reviews and importing old control files requires write permission for the selected annual timesheet folder. The browser may ask you to reconnect files or folders later.

If browser security prevents opening local files directly, run `python3 -m http.server 8000 --bind 127.0.0.1` from this folder and open `http://127.0.0.1:8000/`. This fallback requires Python on the computer. Stop the server with Ctrl+C.

Use the flag selector in the top bar to choose Italian, French or English. The button in the top bar, to the right of the sidebar, collapses or reopens it. Open **Guide** in the sidebar for practical instructions. See `docs/USER_GUIDE.md` for usage and `docs/CHANGELOG.md` for release history. The application checks saved formula values in columns A through J; it does not recalculate formulas or run Excel macros. Its controls and file access depend on browser support and permissions.

For future updates, copy the complete new release folder and follow its installation instructions. Keep your workbooks, timesheets and control files backed up separately.

The browser tab displays the CS-Manager icon. If an older icon remains after an update, refresh the page.

Timesheet years are read from the files; month folders are checked separately. An incorrect year cannot be detected without an external expected year.

Use Chrome or Edge to select the annual folder with the folder picker; saving reviews needs a writable folder handle. The annual folder contains one active `CS-Manager-controls.json` archive. Previous per-folder control files are imported and kept as backups.
Avoid simultaneous writes to the same annual archive from different computers; keep a backup of the annual folder.

After updating, run the analysis again to apply the current check rules, including person, PO and CS association checks, to existing reviews. Some timesheets may need review or validation again.

Settings displays the selected Excel file and timesheet folder names; the browser does not expose the complete folder path.

Manual review choices and automatic results are retained separately in the annual control archive.

Validated timesheets can also be printed to PDF from the browser on macOS or Windows. Standard forms use a reconstructed portrait layout using the embedded PDF_TEMPLATE workbook and the timesheet values; the technical column K is excluded; V2 timesheets also use the template; additional on-site and near-site hours are combined by category. Other layouts use a generic table. The result may differ from Excel; select A4 portrait and check the values and one-page print preview. The A4 layout uses 16 mm top and bottom margins and 8 mm side margins; a physical printer may require wider margins. Signatures are not added.

The annual archive is read in batches during analysis. Keep the annual folder accessible until processing completes.

From a timesheet’s details, select Contact PM to review an editable email draft with the issues in English and the file name. Check the PM and recipient. The file is not attached automatically.

In timesheet details, copy the suggested PDF filename (the Excel filename followed by -VALIDATED.pdf) and paste it into the browser save dialog. The suggestion uses the original Excel filename.

In timesheet details, use the Checks, Issues, Preview and History tabs. The compact action bar follows the workflow: contact the PM, exclude if necessary, copy the suggested filename and print after validation.

Timesheet details places the validation checkbox and Save checks in the top toolbar. Saving checks does not automatically validate; printing requires a saved validation.


## Working calendar requirement (2.1.0)

For timesheet validation, the master workbook must contain a `Calendar` sheet with `Date` and `Hours` headers and explicit daily limits, including zero-hour closures. Check calendar coverage in Settings before analysis. See the [user guide](docs/USER_GUIDE.md).


## Visual EP calendar (2.2.0)

Open **EP Calendar** under monthly operations or use the calendar links in Delivery and Timesheet Detail. Navigate by month, inspect daily limits and annual totals. A zero-hour day is distinct from missing calendar data; incomplete periods do not display confirmed totals. Optional `Location` (`LU`, `BR`, `LU/BR`) and `Reason` columns in the Calendar sheet provide descriptive holiday labels only; the numeric `Hours` column remains authoritative. Red outlines identify analyzed, non-excluded timesheets exceeding a daily limit. Demo holidays are fictional. No external calendar or holiday lookup is performed.
