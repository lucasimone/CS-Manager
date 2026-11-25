# CS-Manager 2.0.0: user guide

Open `index.html` (identified by the CS-Manager icon in the browser tab) and configure the contract workbook and timesheet folder in **Settings**. See `INSTALLATION.md` for setup and permissions. The application reads selected files locally in your browser.

For practical instructions in Italian, French or English, open **Guide** in the application sidebar.

A blank template contains the expected sheets and headers, but no contracts, resources, PO sheets, formulas or historical data. Populate the workbook before analyzing timesheets.

## Contracts and profiles

Use **Contracts** to browse contracts and open a dedicated page to view, create or edit one. Saving writes to the selected workbook after the browser grants access. The contract page shows associated resources, planned NS and OS hours, rates, calculated costs and comparisons with budget and FTU. New resources can use suggestions from existing people and profiles. A newly added resource may also need manual integration in the workbook's PO sheet. Recalculate and review the workbook in Excel after changes, especially where formulas or queries are involved.

**Profiles and rates** summarizes available people and rates and provides filters for contractor, project manager and status. Contract consumption includes cost, remaining budget, monthly and per-person views, and projections based on available data. Forecasts are estimates and can be incomplete when source information is missing.

## Timesheet checks

When a timesheet profile ends with a recognized seniority after a hyphen or space, such as `PDVS-STD` or `PDVS Senior`, it is displayed separately if no dedicated seniority value is present.

In Settings, select a contracts workbook or create a blank template in step 1 and choose the annual timesheet folder in step 2, then start the analysis. Settings shows the selected workbook and folder names. The browser does not provide the folder’s full path. The year is read from each timesheet; its month is checked against the folder. An incorrect year cannot be detected without an external expected year. A compact analysis window shows progress through the reading and review phases. Close it when the analysis finishes to view results. Open a timesheet for its checks, explanations and a preview of values saved in Excel. The preview can show up to 60 columns and may differ from Excel formatting; scroll horizontally for later columns. A diamond marks a formula without a saved value. Select a cell reference in an alert to locate it in a visible sheet. Formula checks cover columns A through J; later columns do not trigger formula anomalies. Contract, NS and OS hours, and total checks remain active. The app does not recalculate formulas. A missing saved value can also mean a formula intentionally returns blank; check in Excel, recalculate, save and reanalyze.

The review checks whether exactly one person, PO and CS association exists in the roster. Missing or duplicate associations require review against the timesheet and contracts workbook. Unreadable or unrecognized files show the underlying read issue. Daily totals of 0, 4.25 and 8.5 hours are accepted; 5 hours is also accepted on Friday. Other totals are flagged for review, and weekend hours are checked separately. Automatic profile, seniority, holiday and NS/OS ratio checks are not applied. Duplicates and extra hours without an NS/OS classification are excluded from costs.

You can record a decision, add a comment and manually mark a timesheet as validated. Review decisions are saved in one `CS-Manager-controls.json` file in the selected annual folder, using relative paths to distinguish files. Previous per-folder control files are imported without deletion and kept as backups. Open the revision history in the timesheet details. When matching content suggests a moved file, verify the proposed old path before linking it manually; otherwise save it as a new record. If a check no longer detects an issue, an earlier anomalous flag does not keep it anomalous; manual rejections remain recorded. A changed timesheet may require validation again. For an anomalous check, you can explicitly select manual OK or accept it with a comment. The original automatic result remains in the record and revision history. After resolving the checks, you can save and validate the review. Unclassified extra hours and duplicates remain excluded from costs even when manually validated. If migration is pending, saving retries it after requesting permission. If the annual folder was not selected through a supported browser, select it in Settings and rerun analysis. The browser must have write permission for the annual folder. Import stops on conflicting or changed legacy files; resolve the conflict before retrying. During analysis, the annual archive is loaded once for the review phase and changed controls are saved together. If the archive or a staged timesheet changes during analysis, no staged changes are saved and analysis must be repeated. Concurrent changes are checked before saving, but simultaneous writes from different computers cannot be fully prevented: avoid concurrent editing and keep backups. Use the filters to find validated entries or those awaiting review.

## Financial review email

In Settings, enter the shared annual timesheet base path manually; browsers do not expose the full selected folder path. In Delivery, select a month and either a CS or PO to review file states, costs by profile and the monthly total. The other selector is filled automatically for a unique match; when several match, select the intended one. Calculable costs may include files not yet validated; missing costs make the total partial. Enter separate shared timesheet and PDF locations and prepare the summary. The timesheet location is prefilled from the base path and selected month and can be edited. The English draft lists validated people, hours and costs with profile and monthly totals. Unvalidated or uncosted timesheets in the selected group prevent preparation. Review warnings about unidentified files, missing roster people and exclusions. Open the draft in the default email client and check it before sending; the files are not attached automatically.

## Top bar

Select **Analyze** in the top bar to start the same analysis using the configured sources. A compact window shows progress and any access requests.

Use the button in the top bar, to the right of the sidebar, to collapse or reopen it. Use the language selector and theme control in the top bar. The bell shows the number of timesheets with issues or read errors from the current analysis and opens the filtered results.

## PDF from the browser

For a saved, validated timesheet, select **Print PDF from browser** and choose A4 portrait and Save as PDF in the print dialog. Standard forms are reconstructed in a portrait layout with the heading, daily hours, totals and signature spaces; the standard form uses the embedded PDF_TEMPLATE workbook for its labels and layout and fills it with the validated timesheet values; technical column K is excluded; V2 timesheets are also mapped to the template, combining on-site and near-site additional hours in the corresponding categories; refer to the source for that breakdown. Other layouts use a generic table. The A4 form uses 16 mm top and bottom margins and 8 mm side margins; a physical printer may require wider margins. Check the values and one-page A4 preview against the workbook: formatting can differ, formula values may be unavailable, and signatures are not added. The timesheet is not modified.

## Release history

Click the version number in the application to view the changelog, or read `docs/CHANGELOG.md`.

Existing `TS-CHECKER-controlli.json` and per-folder `CS-Manager-controls.json` files are imported and left unchanged as backups. If both exist in one folder, resolve the conflict before continuing. History includes changes recorded since this release and any history present in imported records.

In timesheet details, use the Issues and Timesheet details tabs to switch between issues and the Excel preview. Selecting a cell reference in an issue opens the preview.

## Manual exclusions

In a timesheet detail, choose **Exclude from validation**, enter a reason and set your user name in the top bar. Excluded files remain visible and are omitted from costs. Restore a file from its detail and run the analysis again before validation. If an excluded file changes, review its exclusion. Exclusions are stored in the annual control archive; a writable annual folder is required.

From a timesheet’s details, select Contact PM to review an editable email draft with the issues in English and the file name. Check the PM and recipient. The file is not attached automatically.

In timesheet details, copy the suggested PDF filename (the Excel filename followed by -VALIDATED.pdf) and paste it into the browser save dialog. The suggestion uses the original Excel filename.

In timesheet details, use the Checks, Issues, Preview and History tabs. The compact action bar follows the workflow: contact the PM, exclude if necessary, copy the suggested filename and print after validation.

Timesheet details places the validation checkbox and Save checks in the top toolbar. Saving checks does not automatically validate; printing requires a saved validation.
