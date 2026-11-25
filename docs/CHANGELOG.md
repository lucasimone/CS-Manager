# CS-Manager changelog

### 2.0.3
- Protect contract and resource drafts and correct CSV exports and Excel date handling.
### 2.0.2
- Protect unsaved timesheet drafts when navigating, reopening, analyzing or clearing results.
### 2.0.1
- Fixed the duplicated heading on the timesheet details page.
### 2.0.0
- Redesigned timesheet validation workspace and derive PDF names from source filenames.
### 1.29.0
- Reorganized timesheet details with compact sequential actions and a checks tab.
### 1.28.0
- Added a copyable suggested filename for validated timesheet PDFs.
### 1.27.1
- Report PM contact draft issues in English regardless of interface language.
### 1.27.0
- Improved the PM contact dialog and personalized the greeting.
### 1.26.0
- Added an editable PM contact draft with timesheet issues and file location.
### 1.25.0
- Delivery: linked PO and CS selection and consistent field heights.
### 1.24.0
- Show analysis progress in a compact window, including when started from the top bar.
### 1.23.0
- Delivery: select by CS, use separate timesheet and PDF locations, and prefill the monthly path.
### 1.22.0
- Added Delivery with monthly status and cost review by PO and profile.
### 1.21.0
- Added an email draft by month, contract and PO with validated people and costs.
### 1.20.0
- Added a top bar button to start the analysis quickly.
### 1.19.3
- Recognize STD and seniority separated by spaces in profiles.
### 1.19.2
- Recognize seniority in combined timesheet profile fields.
### 1.19.1
- Increased PDF margins and aligned the note and total with the hour columns.
### 1.19.0
- Simplified timesheet actions and added issue and detail tabs; removed the Excel PDF button.
### 1.18.0
- Manually exclude files from validation and costs with a reason and restore action.
### 1.17.6
- Aligned the sidebar toggle and title together beside the divider.
### 1.17.5
- Moved the sidebar toggle to the top bar so the logo remains visible.
### 1.17.4
- Added balanced A4 print margins with extra space above and below.

### 1.17.3
- Expanded the A4 print area and ensured a white page background.

### 1.17.2
- Added A4 print guidance and a safe margin for one-page browser PDFs.

### 1.17.1
- Render validated V2 timesheets using the embedded PDF template, including the additional-hour categories.

### 1.17.0
- Use the embedded PDF_TEMPLATE workbook for the standard browser PDF layout.

### 1.16.1
- Adjusted the PDF table width and distributed daily rows over the page.

### 1.16.0
- Rebuilt the standard timesheet browser PDF as a single-page form based on the reference document.

### 1.15.4
- Halved the width of the standard PDF hour columns.

### 1.15.3
- Narrowed the standard PDF hour columns and increased the header height.

### 1.15.2
- Restored the full-width PDF form and adjusted the table columns.

### 1.15.1
- Reduced the width of the standard browser PDF form.

### 1.15.0
- Improved browser PDF layout for standard timesheets.

### 1.14.1
- Optimized annual control archive reading and saving during analysis.

### 1.14.0
- Browser PDF printing for validated timesheets using a reconstructed page.

### 1.13.0
- Prepare a one-page PDF for validated timesheets using desktop Excel on Windows.

### 1.12.1
- Fixed saving manual OK decisions for anomalous checks.

### 1.12.0
- Show the Excel file and timesheet folder names in Settings.

### 1.11.0
- Check person, PO and CS associations and show clearer alerts for unreadable files.

### 1.10.2
- Fixed stale anomalous status when the automatic check no longer finds an issue.

### 1.10.1
- Fixed saving and manual validation of checks, including retrying pending migration.

### 1.10.0
- Single annual archive with import of previous checks, revision history and manual linking of moved files.

### 1.9.1
- Excluded formula errors and missing values beyond column J from checks.

### 1.9.0
- Clearer alerts and preview of formula cells without saved values.

### 1.8.1
- Fixed logo alignment when the sidebar is collapsed and improved icon contrast.

### 1.8.0
- Updated top bar and icons, flag-based language selector and access to timesheet alerts.

### 1.7.0
- Simplified settings with workbook format validation, blank Excel template and year read from timesheets.

### 1.6.1
- Fixed long sidebar labels, including French translations.

### 1.6.0
- Multilingual practical guide available from the sidebar.

### 1.5.0
- New CS-Manager icon and browser tab favicon.

### 1.4.0
- Renamed the application CS-Manager and updated the interface, folders and documentation while preserving compatibility with existing reviews.

### 1.3.0
- Overall progress bar with reading and review phases and setup organized into three steps.
- Timesheet checks, comments and manual validation saved in one JSON file per folder.
- Daily and weekend hour checks with explanations and affected cells.
- Filters for validated and awaiting-validation timesheets; duplicates and unclassified extra hours remain excluded from costs.
- Removed automatic checks for profile, seniority, holidays and NS/OS ratio.
- Changelog accessible from the app’s version number.
- Improved version button contrast in light and dark themes.
- Copyable package with installation instructions and distribution build.
- English package file names and documentation; previous releases moved to backup.

### 1.2.0
- Dedicated timesheet detail page with issues and a preview of saved Excel values.

### 1.1.0
- Contract page for viewing, creating and editing data, saved directly to the selected Excel file.
- Manage associated resources, compare FTUs and check planned costs against budget.
- Add resources with suggestions from existing people and profiles; new resources require integration into the PO sheet.

### 1.0.0
- Review timesheets, browse contracts and profiles, and analyze consumption by PO.
- Filters, CSV export, consumption charts, and local file and folder settings.
