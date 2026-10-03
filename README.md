# Fara'id Inheritance System

A Google Apps Script web application prototype for recording inheritance cases and calculating a limited set of basic fara'id shares. The interface is in [Index.html](Index.html), its stylesheet partial is in [Styles.html](Styles.html), and calculation, spreadsheet setup, and persistence are handled in [Code.gs](Code.gs).

> **Important:** This is an educational and administrative prototype, not a source of religious or legal rulings. Its rules are incomplete and marked pending scholar review. A qualified Islamic inheritance scholar and the relevant legal authority must review every case before any estate is distributed.

## Prototype

The current interface follows this basic workflow:

```text
FARA'ID BASIC CALCULATOR

Case information
  Case ID: _____________   Deceased name: _____________   Date of death: ______

Estate information
  Gross estate: ________   Liabilities: _______________   Funeral: ____________
  Valid bequests: _______   Net estate = gross - liabilities - funeral - bequests

Surviving heirs
  Relationship [Wife v]   Gender [Female v]   Count [1]   [Remove]
  [+ Add Heir]

  [Calculate Inheritance]   [Clear Form]

Distribution result
  Net estate: __________   Remaining: __________   Status: Scholar review required
  Heir | Count | Fixed share | Residual share | Total amount | Per person
  ...calculation explanations and review notice...
```

### Example calculation

Example input for a basic case:

- Gross estate: 1,000,000
- Liabilities: 100,000
- Funeral expenses: 20,000
- Bequests entered: 30,000
- Heirs: one wife, two sons, and one daughter

The prototype calculates a net estate of 850,000. Under the currently implemented basic rules, the wife receives 1/8, and the children divide the remainder in a 2:1 ratio:

| Heir group | Share of net estate | Total amount | Per person |
| --- | ---: | ---: | ---: |
| Wife | 1/8 | 106,250 | 106,250 |
| Two sons | 7/10 | 595,000 | 297,500 |
| One daughter | 7/40 | 148,750 | 148,750 |
| **Total** | **1** | **850,000** | |

This example demonstrates the software's current arithmetic only; it is not a ruling about a real estate or a determination that the entered bequest is valid.

## Current scope

The interface accepts these heir relationships: husband, wife, son, daughter, father, and mother. The current backend includes basic rules for spouse shares, selected parent shares, daughters without sons, and children sharing a residue in a 2:1 male-to-female unit ratio. Some father cases are handled in a limited way.

The prototype does not comprehensively resolve exclusion (hajb), proportional adjustment ('awl), return (radd), grandparents, siblings, disputed opinions, or every combination of heirs. Its checks and rules are not sufficient to decide whether a case is complete or legally/religiously valid. A bequest is accepted as a numeric deduction; the app does not validate its permissibility or limit.

## Google Apps Script setup

1. Create or open a Google Apps Script project.
2. Add `Code.gs` as a script file, `Index.html` as an HTML file named `Index`, and `Styles.html` as an HTML file named `Styles`. The stylesheet is included with Apps Script's HTML templating, so a regular relative `Style.css` link will not work in the deployed web app.
3. In `Code.gs`, set `SPREADSHEET_ID` to the ID of a Google spreadsheet the script can access.
4. In the Apps Script editor, run `setupDatabase()` once and grant the requested spreadsheet permissions. This creates the case, heir, rule, source, calculation, audit, and scholar-review sheets, and seeds the basic rules and sources.
5. Deploy the project as a web app. Choose the execution identity and access scope appropriate for your organization, then open the deployed web-app URL.
6. Enter a unique Case ID, case details, estate amounts, and heirs, then calculate. Successful calculations are saved to the spreadsheet; duplicate Case IDs are rejected.

The deployment must be able to access the configured spreadsheet. Treat case details as sensitive personal data: limit access to the web app and spreadsheet, and use only authorized data.

## Project files

- [Code.gs](Code.gs): spreadsheet setup, basic calculation rules, web-app endpoint, and case persistence.
- [Index.html](Index.html): case-entry interface, heir form, results table, and review notices.
- [Styles.html](Styles.html): responsive stylesheet included by the Apps Script HTML template.

## Development check

Run `testBasicCalculation()` from the Apps Script editor to log the backend's built-in sample calculation. For an end-to-end check, initialize the spreadsheet, deploy the web app, and submit a new case with a unique Case ID. Verify the result and corresponding rows in the `Cases`, `Heirs`, and `Calculations` sheets. The built-in test exercises calculation logic; it does not verify a deployed web app or spreadsheet persistence.