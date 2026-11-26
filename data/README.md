# Data folder

This optional folder is provided for your own workbooks and timesheets. No business data is included in the distribution. You may also select files and folders elsewhere in Settings.

The application stores timesheet review decisions in `CS-Manager-controls.json` at the root of the selected annual folder. The archive uses paths relative to that folder. Keep it with the timesheets when moving or backing up data. Copying the application alone does not copy files stored elsewhere.

Previous per-folder `CS-Manager-controls.json` and `TS-CHECKER-controlli.json` files are imported and left untouched as backups. Conflicts require review before importing.


## EP working calendar (2.1.0)

Add the `Calendar` worksheet to the selected master workbook, with headers `Date` and `Hours` (optional `Month` and `Day`). Include every date in each reporting month, including weekends and closures with explicit numeric zero. Supported daily limits are 0, 4.25, 5 and 8.5 hours. Excel date serials (1900/1904 systems), ISO dates and day/month/year dates are supported. Missing dates, duplicate dates and invalid values are not treated as zero. The application compares daily combined OS/NS hours (including detected additional hours) and calculated and reported monthly totals against the calendar. A failed calendar check cannot be manually accepted; correct the source and rerun analysis. Review the calendar status in Settings and monthly limit in timesheet details. The demo calendar is fictional and must not be used for actual EP validation. Location-specific holiday metadata and a full visual calendar are planned separately.


## Visual EP calendar (2.2.0)

Open **EP Calendar** under monthly operations or use the calendar links in Delivery and Timesheet Detail. Navigate by month, inspect daily limits and annual totals. A zero-hour day is distinct from missing calendar data; incomplete periods do not display confirmed totals. Optional `Location` (`LU`, `BR`, `LU/BR`) and `Reason` columns in the Calendar sheet provide descriptive holiday labels only; the numeric `Hours` column remains authoritative. Red outlines identify analyzed, non-excluded timesheets exceeding a daily limit. Demo holidays are fictional. No external calendar or holiday lookup is performed.


## TM monthly collection (2.3.0)

In Delivery, select a month to view TM contracts and choose a CS/PO to inspect each expected person. Expected submissions use unique current person–CS–PO associations, excluding explicitly inactive resources, and contracts with verified date overlap and Active or Closed status. Unknown resource status and duplicate associations are flagged. Received means a matching analyzed file (including excluded files); duplicate files count once as received and do not qualify as validated. Missing means no matching analyzed file, not verified absence from a live folder. Reanalyze before using the counts. Historical roster assignments are unavailable; earlier months must be interpreted against the current roster. Financial confirmation for TM requires a complete unambiguous set of saved validations. PDF presence and DISP signatures remain manual checks. QTM/FP collection rules are not changed.


## PDF and DISP tracking (2.4.0)

In Delivery select a TM CS/PO and reporting month. After validating the timesheets, select the exact PDF folder with **Select PDF folder**. Files are checked by the expected `-VALIDATED.pdf` basename, PDF header and content hash, in that folder only; duplicate names are ambiguous. Verify the signature in DISP separately, then manually confirm each document in CS-Manager. Confirmations and revocations are saved with the reviewer, timestamp, PDF hash and source validation revision in the annual JSON archive. A changed PDF or validation requires a new confirmation. The PDF folder must be selected again after reload. TM financial draft preparation and opening require current PDF confirmations. A manual confirmation does not prove cryptographic validity or correspondence of PDF content to Excel; review both in DISP. DEMO uses fictional PDF placeholders, not signed documents. QTM/FP rules are unchanged.


## Financial delivery tracking (2.5.0)

In Delivery, select a TM contract and reporting month, verify the complete collection, saved validations, PDF presence and manual DISP confirmations. Enter the recipient, prepare the financial summary, and send the email through your usual client. After actually sending it, enter the actual date/time and select Confirm sent. The annual control archive records the declared sending date, reviewer, recipient, subject, total, summary hash and exact document revision references. The application does not verify that the email was sent, received or unchanged in the email client. Refresh history to see existing records. Revoke an incorrect record with a reason; prior events remain in the archive. QTM/FP workflow is unchanged. The DEMO only simulates this workflow and never sends actual emails.
