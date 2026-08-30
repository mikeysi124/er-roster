const fs = require('fs');
const assert = require('assert');

// Mock Globals
global.document = {
    getElementById: () => null,
    addEventListener: () => {},
    createElement: (tag) => ({
        className: '',
        innerHTML: '',
        style: {},
        setAttribute: () => {},
        querySelector: () => ({ textContent: '' }),
        appendChild: () => {},
        click: () => {},
        remove: () => {}
    }),
    body: {
        appendChild: () => {},
        classList: { add: () => {}, remove: () => {} }
    }
};
global.window = {
    addEventListener: () => {},
    setTimeout: (fn) => fn()
};
global.localStorage = { getItem: () => 'en', setItem: () => {} };
global.lucide = { createIcons: () => {} };

let appJsCode = fs.readFileSync('./translations.js', 'utf8') + '\n' + fs.readFileSync('./app.js', 'utf8');

// Mock showToast by renaming the original function so it doesn't conflict
appJsCode = appJsCode.replace('function showToast(msg, isError = false) {', 'function original_showToast_disabled(msg, isError = false) {');

// Strip 'let' to expose globals
appJsCode = appJsCode.replace(/let doctors = /g, 'global.doctors = ');
appJsCode = appJsCode.replace(/let offData = /g, 'global.offData = ');
appJsCode = appJsCode.replace(/let extraSlotsData = /g, 'global.extraSlotsData = ');
appJsCode = appJsCode.replace(/let manualOverrides = /g, 'global.manualOverrides = ');
appJsCode = appJsCode.replace(/let quota = /g, 'global.quota = ');
appJsCode = appJsCode.replace(/let globalResult = /g, 'global.globalResult = ');
appJsCode = appJsCode.replace(/let scheduleDates = /g, 'global.scheduleDates = ');

let lastToastMessage = null;
global.showToast = (msg, isError = false) => {
    lastToastMessage = msg;
};

eval(appJsCode);

console.log("Running Shift-Based Scheduling Unit Tests...");
let passed = 0;

let mockDOM = {};
global.document.getElementById = (id) => {
    if (!mockDOM[id]) {
        mockDOM[id] = {
            value: '', checked: false,
            classList: { add: () => {}, remove: () => {} },
            style: {},
            dispatchEvent: () => {},
            setAttribute: () => {},
            removeAttribute: () => {},
            querySelectorAll: () => [],
            innerHTML: '',
            appendChild: () => {},
            insertBefore: () => {}
        };
    }
    return mockDOM[id];
};

function resetMocks() {
    mockDOM = {};
    lastToastMessage = null;
    const defaultVals = {
        'inputMonth': '1', 'inputYear': '2026', 'inputDefaultSlots': '1',
        'inputSpecialHols': '', 'inputNoDuty': '', 'inputDoctorRoles': '',
        'inputDefaultRoleSlots': '', 'inputRoleQuotas': '', 'inputSinglePoolQuota': '',
        'inputConflicts': '', 'inputSpecialDays': '0', 'inputSpecialDocs': '',
        'chkUseSpecialRule': false, 'inputOffDutyPeriod': '1', 'chkPreventLongGaps': false,
        'chkBalanceShifts': false, 'chkAllowBlankDays': false, 'chkRoleBased': false,
        'chkCustomDateRange': false, 'lockConditionType': 'firstNDays',
        'selectLockWeekday': '0', 'inputSpecialStartDay': '1', 'chkSoftAlternate': false,
        'selectAlternateStrength': 'medium',
        
        // Shift-Based fields
        'chkShiftBased': false,
        'inputMorningSlots': '1',
        'inputAfternoonSlots': '1',
        'inputNightSlots': '1',
        'inputNightCap': '0'
    };
    for (let key in defaultVals) {
        let val = defaultVals[key];
        let obj = {
            classList: { add: () => {}, remove: () => {} },
            style: {},
            dispatchEvent: () => {},
            setAttribute: () => {},
            removeAttribute: () => {},
            querySelectorAll: () => [],
            innerHTML: '',
            appendChild: () => {},
            insertBefore: () => {}
        };
        if (typeof val === 'boolean') obj.checked = val;
        else obj.value = val;
        mockDOM[key] = obj;
    }
    
    global.doctors = [];
    global.offData = [];
    global.extraSlotsData = [];
    global.manualOverrides = {};
    global.quota = {};
    global.globalResult = null;
    global.scheduleDates = [];
}

async function runTest(name, testFn) {
    try {
        await testFn();
        console.log(`✅ ${name} PASSED`);
        passed++;
    } catch (e) {
        console.error(`❌ ${name} FAILED:`, e.message);
        console.error(e.stack);
    }
}

(async function runAll() {
    const SHORTAGE_MARKER = '__SHORTAGE__';
    const nightCountOf = (doc) => globalResult.schedule.reduce((acc, day) => {
        const n = day.selectedDocs.slice(-1)[0]; // 1 night slot = last slot
        return acc + (n && n.name === doc ? 1 : 0);
    }, 0);

    // TEST 1: cap binds — nobody exceeds it, even when total nights > total cap (blank days on)
    await runTest("TEST 1: Night cap is a hard limit", async () => {
        resetMocks();
        global.doctors = ["A", "B", "C", "D"];
        mockDOM['chkShiftBased'].checked = true;
        mockDOM['chkAllowBlankDays'].checked = true;
        mockDOM['inputMorningSlots'].value = '1';
        mockDOM['inputAfternoonSlots'].value = '0';
        mockDOM['inputNightSlots'].value = '1';
        mockDOM['inputNightCap'].value = '5'; // 4 docs × 5 = 20 < 31 nights → must leave shortages
        await window.generateSchedule();
        assert.ok(globalResult);
        let shortages = 0;
        for (const doc of doctors) assert.ok(nightCountOf(doc) <= 5, `${doc} has ${nightCountOf(doc)} nights > cap 5`);
        globalResult.schedule.forEach(d => { if (d.selectedDocs.slice(-1)[0].name === SHORTAGE_MARKER) shortages++; });
        assert.ok(shortages >= 11, `expected ≥11 blank nights, got ${shortages}`);
    });

    // TEST 2: cap = 0 → unchanged behaviour (no cap, no shortages)
    await runTest("TEST 2: Cap 0 means unlimited", async () => {
        resetMocks();
        global.doctors = ["A", "B", "C", "D"];
        mockDOM['chkShiftBased'].checked = true;
        mockDOM['inputMorningSlots'].value = '1';
        mockDOM['inputAfternoonSlots'].value = '0';
        mockDOM['inputNightSlots'].value = '1';
        mockDOM['inputNightCap'].value = '0';
        await window.generateSchedule();
        const blanks = globalResult.schedule.filter(d => d.selectedDocs.some(x => x.name === SHORTAGE_MARKER)).length;
        assert.strictEqual(blanks, 0);
    });

    // TEST 3: feasible cap (4 × 8 = 32 ≥ 31) → cap respected AND every night filled
    await runTest("TEST 3: Feasible cap fills every night", async () => {
        resetMocks();
        global.doctors = ["A", "B", "C", "D"];
        mockDOM['chkShiftBased'].checked = true;
        mockDOM['chkAllowBlankDays'].checked = true;
        mockDOM['inputMorningSlots'].value = '1';
        mockDOM['inputAfternoonSlots'].value = '0';
        mockDOM['inputNightSlots'].value = '1';
        mockDOM['inputNightCap'].value = '8';
        await window.generateSchedule();
        for (const doc of doctors) assert.ok(nightCountOf(doc) <= 8, `${doc} over cap`);
        const blanks = globalResult.schedule.filter(d => d.selectedDocs.slice(-1)[0].name === SHORTAGE_MARKER).length;
        assert.strictEqual(blanks, 0, `expected 0 blank nights, got ${blanks}`);
    });

    console.log(`\nnightCap: PASSED: ${passed}, FAILED: ${3 - passed}`);
    if (passed < 3) process.exit(1);
})();
