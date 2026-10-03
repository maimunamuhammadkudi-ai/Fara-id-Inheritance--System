const SPREADSHEET_ID = '1_uZex1PtNV3paHSQicv_H2WQ3By6O-eK50PAf9RsMPM';

const SHEET_NAMES = {
  CASES: 'Cases',
  HEIRS: 'Heirs',
  RULES: 'Rules',
  SOURCES: 'Sources',
  CALCULATIONS: 'Calculations',
  AUDIT: 'AuditLogs',
  SCHOLAR: 'ScholarReview'
};


/* =========================================================
   DATABASE CONNECTION
   ========================================================= */

function getDatabase_() {
  if (!SPREADSHEET_ID) {
    throw new Error('Spreadsheet ID is missing.');
  }

  return SpreadsheetApp.openById(SPREADSHEET_ID);
}


/* =========================================================
   SETUP DATABASE
   ========================================================= */

function setupDatabase() {

  const ss = getDatabase_();

  createSheetIfNotExists_(ss, SHEET_NAMES.CASES, [
    'CaseID',
    'DateCreated',
    'DeceasedName',
    'DateOfDeath',
    'GrossEstate',
    'Liabilities',
    'FuneralExpenses',
    'ValidBequests',
    'NetEstate',
    'Status',
    'ScholarStatus',
    'Notes'
  ]);

  createSheetIfNotExists_(ss, SHEET_NAMES.HEIRS, [
    'CaseID',
    'HeirID',
    'Relationship',
    'Gender',
    'Count',
    'Eligible',
    'Excluded',
    'ExclusionReason',
    'FixedShare',
    'ResidualShare',
    'FinalShare',
    'Amount',
    'RuleApplied'
  ]);

  createSheetIfNotExists_(ss, SHEET_NAMES.RULES, [
    'RuleID',
    'RuleName',
    'Description',
    'Conditions',
    'DoesNotApply',
    'Formula',
    'Source',
    'Reference',
    'Exceptions',
    'ScholarStatus'
  ]);

  createSheetIfNotExists_(ss, SHEET_NAMES.SOURCES, [
    'SourceID',
    'Book',
    'Author',
    'Section',
    'QuranOrHadith',
    'RuleSupported',
    'Notes'
  ]);

  createSheetIfNotExists_(ss, SHEET_NAMES.CALCULATIONS, [
    'CaseID',
    'Heir',
    'OriginalShare',
    'AdjustedShare',
    'Amount',
    'Explanation',
    'RuleApplied'
  ]);

  createSheetIfNotExists_(ss, SHEET_NAMES.AUDIT, [
    'Timestamp',
    'User',
    'Action',
    'CaseID',
    'PreviousValue',
    'NewValue',
    'Message'
  ]);

  createSheetIfNotExists_(ss, SHEET_NAMES.SCHOLAR, [
    'CaseID',
    'Scholar',
    'ReviewDate',
    'Issues',
    'Corrections',
    'ApprovalStatus',
    'Comments'
  ]);

  seedBasicRulesAndSources_();

  return {
    success: true,
    message: 'Inheritance database setup completed successfully.'
  };
}


/* =========================================================
   CREATE SHEET
   ========================================================= */

function createSheetIfNotExists_(ss, name, headers) {

  let sheet = ss.getSheetByName(name);

  if (!sheet) {

    sheet = ss.insertSheet(name);

    sheet.appendRow(headers);

    sheet.setFrozenRows(1);

    sheet
      .getRange(1, 1, 1, headers.length)
      .setFontWeight('bold');

    sheet.autoResizeColumns(1, headers.length);
  }
}


/* =========================================================
   BASIC RULES AND SOURCES
   ========================================================= */

function seedBasicRulesAndSources_() {

  const ss = getDatabase_();

  const rules = ss.getSheetByName(SHEET_NAMES.RULES);
  const sources = ss.getSheetByName(SHEET_NAMES.SOURCES);

  if (rules && rules.getLastRow() <= 1) {

    const basicRules = [

      [
        'R001',
        'Husband share - no children',
        'Husband receives 1/2 in the basic no-child case.',
        'No son or daughter.',
        'Children exist.',
        '1/2',
        'Quran',
        'An-Nisa 4:12',
        'Basic implementation.',
        'Pending scholar review'
      ],

      [
        'R002',
        'Husband share - with children',
        'Husband receives 1/4 in the basic case where children exist.',
        'One or more children exist.',
        'No children.',
        '1/4',
        'Quran',
        'An-Nisa 4:12',
        'Basic implementation.',
        'Pending scholar review'
      ],

      [
        'R003',
        'Wife share - no children',
        'Wife or wives collectively receive 1/4 in the basic no-child case.',
        'No children.',
        'Children exist.',
        '1/4 collective',
        'Quran',
        'An-Nisa 4:12',
        'Multiple wives divide the collective share.',
        'Pending scholar review'
      ],

      [
        'R004',
        'Wife share - with children',
        'Wife or wives collectively receive 1/8 when children exist.',
        'Children exist.',
        'No children.',
        '1/8 collective',
        'Quran',
        'An-Nisa 4:12',
        'Multiple wives divide the collective share.',
        'Pending scholar review'
      ],

      [
        'R005',
        'One daughter without son',
        'One daughter receives 1/2 in the basic case with no son.',
        'One daughter and no son.',
        'Son exists.',
        '1/2',
        'Quran',
        'An-Nisa 4:11',
        'Basic implementation.',
        'Pending scholar review'
      ],

      [
        'R006',
        'Multiple daughters without son',
        'Two or more daughters collectively receive 2/3 in the basic case with no son.',
        'Two or more daughters and no son.',
        'Son exists.',
        '2/3 collective',
        'Quran',
        'An-Nisa 4:11',
        'Basic implementation.',
        'Pending scholar review'
      ],

      [
        'R007',
        'Sons and daughters',
        'Sons and daughters share the applicable residue using a 2:1 male-to-female unit ratio.',
        'At least one son exists.',
        'No son.',
        'Residue; 2:1',
        'Quran',
        'An-Nisa 4:11',
        'Advanced cases require review.',
        'Pending scholar review'
      ],

      [
        'R008',
        'Father with children',
        'Father receives 1/6 in the basic case with children.',
        'Children exist.',
        'No children.',
        '1/6',
        'Quran',
        'An-Nisa 4:11',
        'Additional father rights may apply.',
        'Pending scholar review'
      ],

      [
        'R009',
        'Mother with children',
        'Mother receives 1/6 in the basic case with children.',
        'Children exist.',
        'No children.',
        '1/6',
        'Quran',
        'An-Nisa 4:11',
        'Other conditions require review.',
        'Pending scholar review'
      ],

      [
        'R010',
        'Mother no-child case',
        'Mother receives 1/3 in the basic no-child case.',
        'No children.',
        'Children or reducing conditions.',
        '1/3',
        'Quran',
        'An-Nisa 4:11',
        'Complex cases require review.',
        'Pending scholar review'
      ]

    ];

    rules
      .getRange(2, 1, basicRules.length, basicRules[0].length)
      .setValues(basicRules);
  }


  if (sources && sources.getLastRow() <= 1) {

    const basicSources = [

      [
        'S001',
        'The Noble Quran',
        '',
        'Surah An-Nisa',
        '4:11',
        'Shares of children and parents',
        'Primary source'
      ],

      [
        'S002',
        'The Noble Quran',
        '',
        'Surah An-Nisa',
        '4:12',
        'Shares of spouses',
        'Primary source'
      ],

      [
        'S003',
        'The Noble Quran',
        '',
        'Surah An-Nisa',
        '4:176',
        'Kalalah and siblings',
        'For later implementation'
      ]

    ];

    sources
      .getRange(2, 1, basicSources.length, basicSources[0].length)
      .setValues(basicSources);
  }
}


/* =========================================================
   MAIN FARAID CALCULATION
   ========================================================= */

function calculateBasicFaraid(input) {

  const result = {
    success: false,
    supported: true,
    message: '',
    netEstate: 0,
    distribution: [],
    explanations: [],
    remaining: 0,
    requiresScholarReview: true,
    disclaimer:
      'Educational/administrative tool only. Scholar review is required before any real disbursement.'
  };

  try {

    if (!input) {
      result.message = 'No calculation data was received.';
      return result;
    }

    const grossEstate = Number(input.grossEstate) || 0;
    const liabilities = Number(input.liabilities) || 0;
    const funeralExpenses = Number(input.funeralExpenses) || 0;
    const validBequests = Number(input.validBequests) || 0;

    if (grossEstate <= 0) {
      result.message = 'Gross estate must be greater than zero.';
      return result;
    }

    if (liabilities < 0 ||
        funeralExpenses < 0 ||
        validBequests < 0) {

      result.message =
        'Liabilities, funeral expenses and valid bequests cannot be negative.';

      return result;
    }

    const netEstate =
      grossEstate -
      liabilities -
      funeralExpenses -
      validBequests;

    if (netEstate <= 0) {
      result.message =
        'There is no positive estate available for distribution.';

      result.netEstate = netEstate;

      return result;
    }

    result.netEstate = round2_(netEstate);

    const heirs =
      Array.isArray(input.heirs)
        ? input.heirs
        : [];

    if (heirs.length === 0) {
      result.message = 'Please enter at least one heir.';
      return result;
    }


    /* -----------------------------------------
       COUNT HEIRS
       ----------------------------------------- */

    const husbandCount =
      countRel_(heirs, 'Husband');

    const wifeCount =
      countRel_(heirs, 'Wife');

    const sonCount =
      countRel_(heirs, 'Son');

    const daughterCount =
      countRel_(heirs, 'Daughter');

    const fatherCount =
      countRel_(heirs, 'Father');

    const motherCount =
      countRel_(heirs, 'Mother');


    const hasChildren =
      sonCount > 0 ||
      daughterCount > 0;


    const rows = [];

    let fixedTotal = 0;


    /* =====================================================
       HUSBAND
       ===================================================== */

    if (husbandCount > 0) {

      if (husbandCount !== 1) {
        result.message =
          'Only one husband is permitted in this basic calculation.';
        return result;
      }

      const share =
        hasChildren
          ? 1 / 4
          : 1 / 2;

      rows.push(
        makeRow_(
          'Husband',
          1,
          share,
          0,
          hasChildren ? 'R002' : 'R001',
          hasChildren
            ? 'Husband receives the basic 1/4 fixed share because children exist.'
            : 'Husband receives the basic 1/2 fixed share because there are no children.'
        )
      );

      fixedTotal += share;
    }


    /* =====================================================
       WIFE
       ===================================================== */

    if (wifeCount > 0) {

      const collectiveShare =
        hasChildren
          ? 1 / 8
          : 1 / 4;

      rows.push(
        makeRow_(
          'Wife',
          wifeCount,
          collectiveShare,
          0,
          hasChildren ? 'R004' : 'R003',
          hasChildren
            ? 'Wife or wives collectively receive the basic 1/8 share because children exist.'
            : 'Wife or wives collectively receive the basic 1/4 share because there are no children.'
        )
      );

      fixedTotal += collectiveShare;
    }


    /* =====================================================
       FATHER
       ===================================================== */

    if (fatherCount > 0) {

      if (fatherCount !== 1) {
        result.message =
          'Only one father is permitted in this basic calculation.';
        return result;
      }

      if (hasChildren) {

        const share = 1 / 6;

        rows.push(
          makeRow_(
            'Father',
            1,
            share,
            0,
            'R008',
            'Father receives the basic 1/6 share because children exist.'
          )
        );

        fixedTotal += share;

      }
    }


    /* =====================================================
       MOTHER
       ===================================================== */

    if (motherCount > 0) {

      if (motherCount !== 1) {
        result.message =
          'Only one mother is permitted in this basic calculation.';
        return result;
      }

      const share =
        hasChildren
          ? 1 / 6
          : 1 / 3;

      rows.push(
        makeRow_(
          'Mother',
          1,
          share,
          0,
          hasChildren ? 'R009' : 'R010',
          hasChildren
            ? 'Mother receives the basic 1/6 share because children exist.'
            : 'Mother receives the basic 1/3 share in this basic no-child case.'
        )
      );

      fixedTotal += share;
    }


    /* =====================================================
       CHILDREN
       ===================================================== */

    const residue =
      1 - fixedTotal;


    if (sonCount > 0) {

      const maleUnits =
        sonCount * 2;

      const femaleUnits =
        daughterCount;

      const totalUnits =
        maleUnits +
        femaleUnits;


      if (totalUnits <= 0) {
        result.message =
          'Unable to calculate the children shares.';
        return result;
      }


      const sonShare =
        residue *
        (maleUnits / totalUnits);


      rows.push(
        makeRow_(
          'Son',
          sonCount,
          0,
          sonShare,
          'R007',
          'Son(s) receive the applicable residue using two male units for each son.'
        )
      );


      if (daughterCount > 0) {

        const daughterShare =
          residue *
          (femaleUnits / totalUnits);

        rows.push(
          makeRow_(
            'Daughter',
            daughterCount,
            0,
            daughterShare,
            'R007',
            'Daughter(s) share the applicable residue using one female unit for each daughter.'
          )
        );
      }

    } else if (daughterCount === 1) {

      const share = 1 / 2;

      rows.push(
        makeRow_(
          'Daughter',
          1,
          share,
          0,
          'R005',
          'One daughter receives the basic 1/2 fixed share when there is no son.'
        )
      );

      fixedTotal += share;

    } else if (daughterCount > 1) {

      const share = 2 / 3;

      rows.push(
        makeRow_(
          'Daughter',
          daughterCount,
          share,
          0,
          'R006',
          'Two or more daughters collectively receive the basic 2/3 share when there is no son.'
        )
      );

      fixedTotal += share;
    }


    /* =====================================================
       FATHER AS LIMITED RESIDUARY
       ===================================================== */

    if (
      fatherCount === 1 &&
      !hasChildren &&
      residue > 0 &&
      rows.every(function(row) {
        return row.relationship !== 'Father';
      })
    ) {

      rows.push(
        makeRow_(
          'Father',
          1,
          0,
          residue,
          'R008',
          'Father receives the remaining residue in this limited basic no-child case.'
        )
      );
    }


    /* =====================================================
       BUILD DISTRIBUTION
       ===================================================== */

    let distributed = 0;

    const distribution = [];

    rows.forEach(function(row) {

      const totalShare =
        (row.fixedShare || 0) +
        (row.residualShare || 0);

      const totalAmount =
        totalShare *
        netEstate;

      const perPersonAmount =
        row.count > 0
          ? totalAmount / row.count
          : 0;

      distributed += totalAmount;

      distribution.push({

        relationship:
          row.relationship,

        count:
          row.count,

        fixedShare:
          row.fixedShare,

        residualShare:
          row.residualShare,

        totalShare:
          totalShare,

        totalAmount:
          round2_(totalAmount),

        perPersonAmount:
          round2_(perPersonAmount),

        ruleApplied:
          row.rule,

        explanation:
          row.explanation,

        status:
          totalShare > 0
            ? 'Eligible'
            : 'No share in basic calculation'
      });
    });


    const remaining =
      round2_(
        netEstate -
        distributed
      );


    result.distribution =
      distribution;

    result.remaining =
      remaining;

    result.explanations =
      distribution.map(function(item) {
        return item.explanation;
      });


    result.success = true;

    result.message =
      'Basic calculation completed. Scholar review is required before any real disbursement.';


    /* =====================================================
       SAFETY CHECK
       ===================================================== */

    if (
      Math.abs(
        (distributed + remaining) -
        netEstate
      ) > 0.05
    ) {

      result.success = false;

      result.message =
        'Calculation inconsistency detected. Do not use this result.';
    }


    return result;

  } catch (err) {

    result.success = false;

    result.message =
      'System error: ' +
      err.message;

    return result;
  }
}


/* =========================================================
   COUNT RELATIONSHIP
   ========================================================= */

function countRel_(heirs, relationship) {

  return heirs
    .filter(function(heir) {
      return String(
        heir.relationship || ''
      ).trim() === relationship;
    })
    .reduce(function(sum, heir) {

      return sum +
        (Number(heir.count) || 0);

    }, 0);
}


/* =========================================================
   CREATE CALCULATION ROW
   ========================================================= */

function makeRow_(
  relationship,
  count,
  fixed,
  residual,
  rule,
  explanation
) {

  return {

    relationship:
      relationship,

    count:
      count,

    fixedShare:
      fixed,

    residualShare:
      residual,

    rule:
      rule,

    explanation:
      explanation
  };
}


/* =========================================================
   ROUND NUMBER
   ========================================================= */

function round2_(number) {

  return Math.round(
    (
      Number(number) +
      Number.EPSILON
    ) * 100
  ) / 100;
}


/* =========================================================
   TEST DATABASE CONNECTION
   ========================================================= */

function testDatabaseConnection() {

  const ss =
    getDatabase_();

  return {

    success:
      true,

    spreadsheetName:
      ss.getName(),

    spreadsheetId:
      ss.getId()
  };
}


/* =========================================================
   WEB APP
   ========================================================= */

function doGet() {

  return HtmlService
    .createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Fara’id Basic Calculator')
    .setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.ALLOWALL
    );
}


function include(filename) {

  return HtmlService
    .createHtmlOutputFromFile(filename)
    .getContent();
}


/* =========================================================
   API CALCULATION
   ========================================================= */

function apiCalculate(payload) {

  const result =
    calculateBasicFaraid(payload);


  if (!result.success) {
    return result;
  }


  try {

    const saveResult =
      saveInheritanceCase_(
        payload,
        result
      );


    result.savedToSheet =
      saveResult.success;

    result.saveMessage =
      saveResult.message;

  } catch (err) {

    result.savedToSheet =
      false;

    result.saveMessage =
      'Calculation completed, but saving failed: ' +
      err.message;
  }


  return result;
}


/* =========================================================
   SAVE CASE
   ========================================================= */

function saveInheritanceCase_(
  payload,
  result
) {

  const ss =
    getDatabase_();


  const casesSheet =
    ss.getSheetByName(
      SHEET_NAMES.CASES
    );

  const heirsSheet =
    ss.getSheetByName(
      SHEET_NAMES.HEIRS
    );

  const calculationsSheet =
    ss.getSheetByName(
      SHEET_NAMES.CALCULATIONS
    );


  if (
    !casesSheet ||
    !heirsSheet ||
    !calculationsSheet
  ) {

    throw new Error(
      'Database sheets are missing. Run setupDatabase() first.'
    );
  }


  const caseId =
    String(
      payload.caseId || ''
    ).trim();


  if (!caseId) {

    throw new Error(
      'Case ID is required.'
    );
  }


  /* -------------------------------------------------------
     CHECK DUPLICATE CASE ID
     ------------------------------------------------------- */

  const lastRow =
    casesSheet.getLastRow();


  if (lastRow > 1) {

    const existingIds =
      casesSheet
        .getRange(
          2,
          1,
          lastRow - 1,
          1
        )
        .getDisplayValues()
        .flat();


    if (
      existingIds.includes(caseId)
    ) {

      throw new Error(
        'This Case ID already exists. Please use a new Case ID.'
      );
    }
  }


  const now =
    new Date();


  const gross =
    Number(
      payload.grossEstate
    ) || 0;

  const liabilities =
    Number(
      payload.liabilities
    ) || 0;

  const funeral =
    Number(
      payload.funeralExpenses
    ) || 0;

  const bequests =
    Number(
      payload.validBequests
    ) || 0;


  /* -------------------------------------------------------
     SAVE CASE
     ------------------------------------------------------- */

  casesSheet.appendRow([

    caseId,

    now,

    payload.deceasedName || '',

    payload.dateOfDeath || '',

    gross,

    liabilities,

    funeral,

    bequests,

    result.netEstate,

    'Calculated',

    'Pending Scholar Review',

    'Basic calculation; scholar review required'

  ]);


  /* -------------------------------------------------------
     SAVE HEIRS
     ------------------------------------------------------- */

  const heirs =
    Array.isArray(payload.heirs)
      ? payload.heirs
      : [];


  const distribution =
    result.distribution || [];


  heirs.forEach(function(heir) {

    const relationship =
      String(
        heir.relationship || ''
      ).trim();


    const gender =
      String(
        heir.gender || ''
      ).trim();


    const count =
      Number(
        heir.count
      ) || 1;


    const calculated =
      distribution.find(
        function(item) {

          return item.relationship ===
            relationship;
        }
      );


    heirsSheet.appendRow([

      caseId,

      Utilities.getUuid(),

      relationship,

      gender,

      count,

      calculated
        ? calculated.totalShare > 0
        : false,

      false,

      '',

      calculated
        ? calculated.fixedShare
        : 0,

      calculated
        ? calculated.residualShare
        : 0,

      calculated
        ? calculated.totalShare
        : 0,

      calculated
        ? calculated.totalAmount
        : 0,

      calculated
        ? calculated.ruleApplied
        : ''

    ]);
  });


  /* -------------------------------------------------------
     SAVE CALCULATIONS
     ------------------------------------------------------- */

  distribution.forEach(function(item) {

    calculationsSheet.appendRow([

      caseId,

      item.relationship,

      item.fixedShare,

      item.totalShare,

      item.totalAmount,

      item.explanation,

      item.ruleApplied

    ]);
  });


  return {

    success:
      true,

    message:
      'Case and calculation saved successfully.'
  };
}


/* =========================================================
   SETUP API
   ========================================================= */

function apiSetup() {

  const result =
    setupDatabase();


  return {

    ok:
      result.success,

    message:
      result.message
  };
}


/* =========================================================
   TEST CALCULATION
   ========================================================= */

function testBasicCalculation() {

  const testCase = {

    caseId:
      'TEST-001',

    deceasedName:
      'Test Case',

    dateOfDeath:
      '',

    grossEstate:
      1000000,

    liabilities:
      50000,

    funeralExpenses:
      20000,

    validBequests:
      0,

    heirs: [

      {
        relationship:
          'Husband',

        gender:
          'Male',

        count:
          1
      },

      {
        relationship:
          'Daughter',

        gender:
          'Female',

        count:
          1
      },

      {
        relationship:
          'Father',

        gender:
          'Male',

        count:
          1
      },

      {
        relationship:
          'Mother',

        gender:
          'Female',

        count:
          1
      }

    ]
  };


  const result =
    calculateBasicFaraid(
      testCase
    );


  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );


  return result;
}