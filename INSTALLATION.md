# CS-Manager 2.7.3: installation

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


## TM monthly collection (2.3.0)

In Delivery, select a month to view TM contracts and choose a CS/PO to inspect each expected person. Expected submissions use unique current person–CS–PO associations, excluding explicitly inactive resources, and contracts with verified date overlap and Active or Closed status. Unknown resource status and duplicate associations are flagged. Received means a matching analyzed file (including excluded files); duplicate files count once as received and do not qualify as validated. Missing means no matching analyzed file, not verified absence from a live folder. Reanalyze before using the counts. Historical roster assignments are unavailable; earlier months must be interpreted against the current roster. Financial confirmation for TM requires a complete unambiguous set of saved validations. PDF presence and DISP signatures remain manual checks. QTM/FP collection rules are not changed.


## PDF and DISP tracking (2.4.0)

In Delivery select a TM CS/PO and reporting month. After validating the timesheets, select the exact PDF folder with **Select PDF folder**. Files are checked by the expected `-VALIDATED.pdf` basename, PDF header and content hash, in that folder only; duplicate names are ambiguous. Verify the signature in DISP separately, then manually confirm each document in CS-Manager. Confirmations and revocations are saved with the reviewer, timestamp, PDF hash and source validation revision in the annual JSON archive. A changed PDF or validation requires a new confirmation. The PDF folder must be selected again after reload. TM financial draft preparation and opening require current PDF confirmations. A manual confirmation does not prove cryptographic validity or correspondence of PDF content to Excel; review both in DISP. DEMO uses fictional PDF placeholders, not signed documents. QTM/FP rules are unchanged.


## Financial delivery tracking (2.5.0)

In Delivery, select a TM contract and reporting month, verify the complete collection, saved validations, PDF presence and manual DISP confirmations. Enter the recipient, prepare the financial summary, and send the email through your usual client. After actually sending it, enter the actual date/time and select Confirm sent. The annual control archive records the declared sending date, reviewer, recipient, subject, total, summary hash and exact document revision references. The application does not verify that the email was sent, received or unchanged in the email client. Refresh history to see existing records. Revoke an incorrect record with a reason; prior events remain in the archive. QTM/FP workflow is unchanged. The DEMO only simulates this workflow and never sends actual emails.


## Timesheet calendar review (2.6.0)

Open Timesheet Detail, then Preview. The calendar displays the actual timesheet month and compares declared daily hours with EP calendar limits. Click a date for OS/NS/additional hours, review flags and source cell references. Click a cell reference to highlight its Excel preview cell. Use the issues-only filter to isolate anomalies, missing dates and unavailable calendar data. Blank hours and permitted below-limit hours are distinguished from missing date rows; neither automatically indicates a validation failure. Mixed OS/NS is a visual review flag; existing validation rules and archived control signatures remain unchanged. Local holidays require metadata in the master Calendar sheet. Unrecognized months and incomplete calendar data are explicitly flagged.


## Contract extensions (2.7.0)

Open a contract in **Contracts** and select **Clone for extension**. Review the new dates, budget and planned hours before using the extension. The clone starts as Pending under a generated `TMP-…` PO. The CS, descriptive fields and resources are copied, including profiles, rates and planned hours where available. Dates, budget and available balance start blank. The master workbook stores the new contract and roster rows in one save.

When the new PO is assigned, open the extension, select **Edit contract**, replace the temporary code with the final numeric PO and save. The app updates the extension and its resource associations together. Cloned resources use the roster and can be edited there. Integrate them into the definitive PO worksheet in Excel if you use worksheet formulas for balances or planning. Timesheets, financial history and the original PO worksheet are outside the clone.
