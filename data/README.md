# Data folder

This optional folder is provided for your own workbooks and timesheets. No business data is included in the distribution. You may also select files and folders elsewhere in Settings.

The application stores timesheet review decisions in `CS-Manager-controls.json` at the root of the selected annual folder. The archive uses paths relative to that folder. Keep it with the timesheets when moving or backing up data. Copying the application alone does not copy files stored elsewhere.

Previous per-folder `CS-Manager-controls.json` and `TS-CHECKER-controlli.json` files are imported and left untouched as backups. Conflicts require review before importing.


## EP working calendar (2.1.0)

Add the `Calendar` worksheet to the selected master workbook, with headers `Date` and `Hours` (optional `Month` and `Day`). Include every date in each reporting month, including weekends and closures with explicit numeric zero. Supported daily limits are 0, 4.25, 5 and 8.5 hours. Excel date serials (1900/1904 systems), ISO dates and day/month/year dates are supported. Missing dates, duplicate dates and invalid values are not treated as zero. The application compares daily combined OS/NS hours (including detected additional hours) and calculated and reported monthly totals against the calendar. A failed calendar check cannot be manually accepted; correct the source and rerun analysis. Review the calendar status in Settings and monthly limit in timesheet details. The demo calendar is fictional and must not be used for actual EP validation. Location-specific holiday metadata and a full visual calendar are planned separately.


## Visual EP calendar (2.2.0)

Open **EP Calendar** under monthly operations or use the calendar links in Delivery and Timesheet Detail. Navigate by month, inspect daily limits and annual totals. A zero-hour day is distinct from missing calendar data; incomplete periods do not display confirmed totals. Optional `Location` (`LU`, `BR`, `LU/BR`) and `Reason` columns in the Calendar sheet provide descriptive holiday labels only; the numeric `Hours` column remains authoritative. Red outlines identify analyzed, non-excluded timesheets exceeding a daily limit. Demo holidays are fictional. No external calendar or holiday lookup is performed.
