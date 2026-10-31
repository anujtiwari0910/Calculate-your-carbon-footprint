/* =========================================================
   CODE YOUR CARBON
   COMPLETE SCRIPT
   ========================================================= */


/* =========================================================
   GLOBAL HELPERS
========================================================= */

const $ = (id) => document.getElementById(id);

const STORAGE_KEY = "carbonHistory";
const BUDGET_KEY = "carbonBudget";
const THEME_KEY = "carbonTheme";


/* =========================================================
   EMISSION FACTORS
   NOTE:
   These are starter/illustrative factors.
   Replace with authoritative region-specific factors
   before using this calculator for scientific reporting.
========================================================= */

const FACTORS = {

    transport: {

        car: {
            petrol: 0.18,
            diesel: 0.20,
            cng: 0.12,
            ev: 0.05
        },

        bike: {
            petrol: 0.08,
            diesel: 0.09,
            cng: 0.06,
            ev: 0.03
        },

        bus: 0.05,

        metro: 0.03,

        walk: 0

    },


    electricity: 0.70,


    food: {

        vegetarian: 0.40,

        nonVegetarian: 1.50

    },


    waste: 0.50,


    cooking: {

        lpg: 0.25,

        electric: 0.12,

        png: 0.20,

        biogas: 0.05

    }

};


/* =========================================================
   APPLICATION STATE
========================================================= */

let currentResult = null;

let historyData = [];

let historyChart = null;


/* =========================================================
   SAFE EVENT LISTENER
========================================================= */

function on(id, event, handler) {

    const element = $(id);

    if (!element) {
        return;
    }

    element.addEventListener(event, handler);

}


/* =========================================================
   NUMBER HELPER
========================================================= */

function numberValue(id, fallback = 0) {

    const element = $(id);

    if (!element) {
        return fallback;
    }

    const value = parseFloat(element.value);

    return Number.isFinite(value)
        ? value
        : fallback;

}


/* =========================================================
   TEXT HELPER
========================================================= */

function textValue(id, fallback = "") {

    const element = $(id);

    if (!element) {
        return fallback;
    }

    return element.value || fallback;

}


/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    loadTheme();

    loadHistory();

    loadBudget();

    setupRangeLabels();

    setupTransportFields();

    setupWhatIfControls();

    setupButtons();

    renderHistory();

    updateMissions();

    updateTwin();

});


/* =========================================================
   BUTTON SETUP
========================================================= */

function setupButtons() {

    /* Calculate */

    on(
        "calculateBtn",
        "click",
        calculateFootprint
    );


    /* IMPORTANT:
       HTML uses resetFormBtn
       NOT resetBtn
    */

    on(
        "resetFormBtn",
        "click",
        resetCalculatorForm
    );


    /* Clear history */

    on(
        "clearHistoryBtn",
        "click",
        clearHistory
    );


    /* Download */

    on(
        "downloadBtn",
        "click",
        downloadHistory
    );


    /* Share */

    on(
        "shareBtn",
        "click",
        shareResult
    );


    /* Budget */

    on(
        "saveBudget",
        "click",
        saveCarbonBudget
    );


    /* Theme */

    on(
        "themeToggle",
        "click",
        toggleTheme
    );


    /* What-if */

    on(
        "whatIfTransport",
        "change",
        runWhatIf
    );

    on(
        "whatIfVeg",
        "change",
        runWhatIf
    );

    on(
        "whatIfElectricity",
        "input",
        runWhatIf
    );

    on(
        "whatIfWaste",
        "input",
        runWhatIf
    );

    on(
        "whatIfSolar",
        "input",
        runWhatIf
    );

}


/* =========================================================
   TRANSPORT SETUP
========================================================= */

function setupTransportFields() {

    on(
        "transportMode",
        "change",
        updateTransportFields
    );

    updateTransportFields();

}


/* =========================================================
   TRANSPORT FIELD VISIBILITY
========================================================= */

function updateTransportFields() {

    const mode =
        textValue(
            "transportMode",
            "car"
        );


    const fuelGroup =
        $("fuelGroup");


    if (fuelGroup) {

        if (
            mode === "car" ||
            mode === "bike"
        ) {

            fuelGroup.classList.remove(
                "hidden"
            );

        } else {

            fuelGroup.classList.add(
                "hidden"
            );

        }

    }

}


/* =========================================================
   RANGE LABELS
========================================================= */

function setupRangeLabels() {

    updateRangeLabel(
        "solar",
        "solarValue",
        "%"
    );

    updateRangeLabel(
        "recycling",
        "recyclingValue",
        "%"
    );


    updateRangeLabel(
        "whatIfElectricity",
        "whatIfElectricityValue",
        "%"
    );


    updateRangeLabel(
        "whatIfWaste",
        "whatIfWasteValue",
        "%"
    );


    updateRangeLabel(
        "whatIfSolar",
        "whatIfSolarValue",
        "%"
    );


    on(
        "solar",
        "input",
        () =>
            updateRangeLabel(
                "solar",
                "solarValue",
                "%"
            )
    );


    on(
        "recycling",
        "input",
        () =>
            updateRangeLabel(
                "recycling",
                "recyclingValue",
                "%"
            )
    );


    on(
        "whatIfElectricity",
        "input",
        () =>
            updateRangeLabel(
                "whatIfElectricity",
                "whatIfElectricityValue",
                "%"
            )
    );


    on(
        "whatIfWaste",
        "input",
        () =>
            updateRangeLabel(
                "whatIfWaste",
                "whatIfWasteValue",
                "%"
            )
    );


    on(
        "whatIfSolar",
        "input",
        () =>
            updateRangeLabel(
                "whatIfSolar",
                "whatIfSolarValue",
                "%"
            )
    );

}


/* =========================================================
   RANGE LABEL HELPER
========================================================= */

function updateRangeLabel(
    inputId,
    labelId,
    suffix = ""
) {

    const input =
        $(inputId);

    const label =
        $(labelId);


    if (!input || !label) {
        return;
    }


    label.textContent =
        `${input.value}${suffix}`;

}


/* =========================================================
   MAIN CALCULATOR
========================================================= */

function calculateFootprint() {

    const result =
        calculateFromInputs();


    currentResult =
        result;


    renderResult();

    saveHistory(result);

    renderHistory();

    updateMissions();

    updateTwin();

    runWhatIf();

}


/* =========================================================
   CALCULATE FROM INPUTS
========================================================= */

function calculateFromInputs() {

    const transportMode =
        textValue(
            "transportMode",
            "car"
        );


    const fuelType =
        textValue(
            "fuelType",
            "petrol"
        );


    const distance =
        numberValue(
            "distance",
            0
        );


    const passengers =
        Math.max(
            1,
            numberValue(
                "passengers",
                1
            )
        );


    const electricityUse =
        numberValue(
            "electricity",
            0
        );


    const solar =
        numberValue(
            "solar",
            0
        );


    const vegMeals =
        numberValue(
            "vegMeals",
            0
        );


    const nonVegMeals =
        numberValue(
            "nonVegMeals",
            0
        );


    const wasteAmount =
        numberValue(
            "waste",
            0
        );


    const recycling =
        numberValue(
            "recycling",
            0
        );


    const cookingFuel =
        textValue(
            "cookingFuel",
            "lpg"
        );


    const cookingTime =
        numberValue(
            "cookingTime",
            0
        );


    /* =====================================================
       TRANSPORT
    ===================================================== */

    let transportFactor = 0;


    if (
        transportMode === "car" ||
        transportMode === "bike"
    ) {

        transportFactor =
            FACTORS.transport[
                transportMode
            ][fuelType] ||
            0;

    }


    else {

        transportFactor =
            FACTORS.transport[
                transportMode
            ] || 0;

    }


    const transport =
        distance *
        transportFactor /
        passengers;


    /* =====================================================
       ELECTRICITY
    ===================================================== */

    const gridShare =
        Math.max(
            0,
            1 - solar / 100
        );


    const electricity =
        electricityUse *
        FACTORS.electricity *
        gridShare;


    /* =====================================================
       FOOD
    ===================================================== */

    const food =
        vegMeals *
        FACTORS.food.vegetarian

        +

        nonVegMeals *
        FACTORS.food.nonVegetarian;


    /* =====================================================
       WASTE
    ===================================================== */

    const recyclingReduction =
        Math.min(
            recycling / 100,
            1
        );


    const waste =
        wasteAmount *
        FACTORS.waste *
        (1 - recyclingReduction);


    /* =====================================================
       COOKING
    ===================================================== */

    const cookingFactor =
        FACTORS.cooking[
            cookingFuel
        ] || 0;


    const cooking =
        cookingTime *
        cookingFactor;


    /* =====================================================
       TOTAL
    ===================================================== */

    const total =
        transport +
        electricity +
        food +
        waste +
        cooking;


    return {

        total,

        transport,

        electricity,

        food,

        waste,

        cooking,

        inputs: {

            transportMode,

            fuelType,

            distance,

            passengers,

            electricityUse,

            solar,

            vegMeals,

            nonVegMeals,

            wasteAmount,

            recycling,

            cookingFuel,

            cookingTime

        },

        date:
            new Date().toISOString()

    };

}


/* =========================================================
   RENDER RESULT
========================================================= */

function renderResult() {

    if (!currentResult) {
        return;
    }


    const r =
        currentResult;


    const total =
        r.total || 0;


    const totalElement =
        $("totalFootprint");


    if (totalElement) {

        totalElement.textContent =
            total.toFixed(2);

    }


    const hero =
        $("heroFootprint");


    if (hero) {

        hero.textContent =
            total.toFixed(2) +
            " kg";

    }


    const results =
        $("results");


    if (results) {

        results.classList.remove(
            "hidden"
        );

    }


    updateScore(total);

    renderHotspot(r);

    renderBreakdown(r);

    renderActions(r);

    renderPersonalActionPlan(r);

    renderCalculationBreakdown(r);

}


/* =========================================================
   SCORE
========================================================= */

function updateScore(total) {

    const badge =
        $("scoreBadge");


    if (!badge) {
        return;
    }


    let score = "A";


    if (total <= 4) {

        score = "A";

    }

    else if (total <= 7) {

        score = "B";

    }

    else if (total <= 10) {

        score = "C";

    }

    else {

        score = "D";

    }


    badge.textContent =
        score;


    badge.className =
        "score-badge score-" +
        score.toLowerCase();

}


/* =========================================================
   HOTSPOT
========================================================= */

function getHotspot(r) {

    const categories = {

        Transport:
            r.transport,

        Electricity:
            r.electricity,

        Food:
            r.food,

        Waste:
            r.waste,

        Cooking:
            r.cooking

    };


    let biggest =
        "Transport";


    Object.keys(categories)
        .forEach(category => {

            if (
                categories[category] >
                categories[biggest]
            ) {

                biggest =
                    category;

            }

        });


    return {

        name:
            biggest,

        value:
            categories[biggest]

    };

}


/* =========================================================
   RENDER HOTSPOT
========================================================= */

function renderHotspot(r) {

    const hotspot =
        getHotspot(r);


    const title =
        $("hotspot");


    const text =
        $("hotspotText");


    if (title) {

        title.textContent =
            hotspot.name;

    }


    if (text) {

        text.textContent =
            `${hotspot.value.toFixed(2)} kg CO₂e/day is coming from ${hotspot.name.toLowerCase()}.`;

    }

}


/* =========================================================
   BREAKDOWN
========================================================= */

function renderBreakdown(r) {

    const chartCanvas =
        $("breakdownChart");


    if (!chartCanvas) {
        return;
    }


    if (
        typeof Chart ===
        "undefined"
    ) {

        return;

    }


    const labels = [
        "Transport",
        "Electricity",
        "Food",
        "Waste",
        "Cooking"
    ];


    const values = [

        r.transport,

        r.electricity,

        r.food,

        r.waste,

        r.cooking

    ];


    if (historyChart) {

        /*
           This is separate from historyChart
           but kept safe in case an older version
           stored the breakdown chart here.
        */

    }


    if (
        chartCanvas._carbonChart
    ) {

        chartCanvas
            ._carbonChart
            .destroy();

    }


    chartCanvas._carbonChart =
        new Chart(
            chartCanvas,
            {

                type: "doughnut",

                data: {

                    labels,

                    datasets: [{

                        data: values

                    }]

                },

                options: {

                    responsive: true,

                    plugins: {

                        legend: {

                            position:
                                "bottom"

                        }

                    }

                }

            }

        );

}


/* =========================================================
   CALCULATION BREAKDOWN
========================================================= */

function renderCalculationBreakdown(r) {

    const container =
        $("calculationBreakdown");


    if (!container) {
        return;
    }


    container.innerHTML = `

        <div class="breakdown-row">

            <span>Transport</span>

            <strong>
                ${r.transport.toFixed(2)} kg
            </strong>

        </div>


        <div class="breakdown-row">

            <span>Electricity</span>

            <strong>
                ${r.electricity.toFixed(2)} kg
            </strong>

        </div>


        <div class="breakdown-row">

            <span>Food</span>

            <strong>
                ${r.food.toFixed(2)} kg
            </strong>

        </div>


        <div class="breakdown-row">

            <span>Waste</span>

            <strong>
                ${r.waste.toFixed(2)} kg
            </strong>

        </div>


        <div class="breakdown-row">

            <span>Cooking</span>

            <strong>
                ${r.cooking.toFixed(2)} kg
            </strong>

        </div>


        <div class="breakdown-row total">

            <span>Total</span>

            <strong>
                ${r.total.toFixed(2)} kg CO₂e/day
            </strong>

        </div>

    `;

}


/* =========================================================
   STANDARD ACTIONS
========================================================= */

function renderActions(r) {

    const container =
        $("actionList");


    if (!container) {
        return;
    }


    const actions = [];


    if (
        r.transport >
        r.total * 0.30
    ) {

        actions.push(
            "Replace some vehicle trips with metro, bus, cycling or walking."
        );

    }


    if (
        r.electricity >
        r.total * 0.25
    ) {

        actions.push(
            "Reduce unnecessary electricity use and increase renewable electricity where possible."
        );

    }


    if (
        r.food >
        r.total * 0.25
    ) {

        actions.push(
            "Try replacing some high-impact meals with lower-impact meals."
        );

    }


    if (
        r.waste >
        0.5
    ) {

        actions.push(
            "Increase waste segregation, reuse and recycling."
        );

    }


    if (
        r.cooking >
        0.5
    ) {

        actions.push(
            "Use efficient cooking appliances and reduce unnecessary cooking energy."
        );

    }


    if (!actions.length) {

        actions.push(
            "Keep tracking your footprint and look for small improvements across transport, food and electricity."
        );

    }


    container.innerHTML =
        actions
            .slice(0, 4)
            .map(
                action => `
                    <div class="action-item">
                        🌱 ${action}
                    </div>
                `
            )
            .join("");

}


/* =========================================================
   PERSONAL ACTION PLAN
========================================================= */

function generatePersonalActionPlan(r) {

    const actions = [];


    /* =====================================================
       TRANSPORT
    ===================================================== */

    if (r.transport > 0) {

        const saving =
            Math.max(
                0.1,
                r.transport * 0.20
            );


        actions.push({

            icon: "🚗",

            title:
                "Reduce vehicle travel",

            text:
                "Replace some regular car or motorcycle trips with metro, bus, cycling or walking.",

            daily:
                saving

        });

    }


    /* =====================================================
       FOOD
    ===================================================== */

    if (
        r.inputs.nonVegMeals > 0
    ) {

        const saving =
            Math.max(
                0,
                FACTORS.food.nonVegetarian -
                FACTORS.food.vegetarian
            );


        actions.push({

            icon: "🥗",

            title:
                "Replace one non-vegetarian meal",

            text:
                "Try replacing one non-vegetarian meal with a vegetarian meal.",

            daily:
                saving

        });

    }


    /* =====================================================
       ELECTRICITY
    ===================================================== */

    if (
        r.electricity > 0
    ) {

        const saving =
            r.electricity * 0.15;


        actions.push({

            icon: "⚡",

            title:
                "Reduce electricity use",

            text:
                "Reduce unnecessary cooling, lighting and standby electricity consumption.",

            daily:
                saving

        });

    }


    /* =====================================================
       SOLAR
    ===================================================== */

    if (
        r.inputs.solar < 25 &&
        r.electricity > 0
    ) {

        const solarSaving =
            r.inputs.electricityUse *
            FACTORS.electricity *
            0.25;


        actions.push({

            icon: "☀️",

            title:
                "Increase renewable electricity",

            text:
                "Increasing your renewable electricity share could reduce your electricity footprint.",

            daily:
                solarSaving

        });

    }


    /* =====================================================
       WASTE
    ===================================================== */

    if (
        r.inputs.recycling < 50 &&
        r.waste > 0
    ) {

        const saving =
            r.waste * 0.25;


        actions.push({

            icon: "♻️",

            title:
                "Increase recycling",

            text:
                "Improve waste segregation and recycling to reduce your waste footprint.",

            daily:
                saving

        });

    }


    /* =====================================================
       COOKING
    ===================================================== */

    if (
        r.cooking > 0
    ) {

        const saving =
            r.cooking * 0.15;


        actions.push({

            icon: "🍳",

            title:
                "Improve cooking efficiency",

            text:
                "Reduce unnecessary cooking energy and use efficient appliances.",

            daily:
                saving

        });

    }


    return actions

        .sort(
            (a, b) =>
                b.daily - a.daily
        )

        .slice(0, 3);

}


/* =========================================================
   RENDER PERSONAL ACTION PLAN
========================================================= */

function renderPersonalActionPlan(r) {

    const container =
        $("personalActionPlan");


    /*
       If the HTML section has not been added yet,
       do nothing instead of breaking the calculator.
    */

    if (!container) {
        return;
    }


    const actions =
        generatePersonalActionPlan(r);


    if (!actions.length) {

        container.innerHTML = `

            <div class="action-plan-empty">

                <strong>
                    Your footprint is already quite low.
                </strong>

                <span>
                    Continue tracking your habits and look for further improvements.
                </span>

            </div>

        `;

        return;

    }


    const totalDailySaving =
        actions.reduce(
            (sum, action) =>
                sum + action.daily,
            0
        );


    const yearlySaving =
        totalDailySaving * 365;


    container.innerHTML = `

        ${actions.map(
            (action, index) => `

                <div class="personal-action">

                    <div class="personal-action-icon">

                        ${action.icon}

                    </div>


                    <div>

                        <h4>

                            ${index + 1}.
                            ${action.title}

                        </h4>


                        <p>

                            ${action.text}

                        </p>

                    </div>


                    <div class="personal-action-impact">

                        ~${action.daily.toFixed(2)}
                        kg/day

                    </div>

                </div>

            `
        ).join("")}


        <div class="action-plan-total">

            <strong>

                Potential combined annual reduction

            </strong>


            <span>

                ${yearlySaving.toFixed(0)}
                kg CO₂e/year

            </span>

        </div>

    `;

}


/* =========================================================
   WHAT-IF SIMULATOR
========================================================= */

function setupWhatIfControls() {

    const controls = [

        "whatIfTransport",

        "whatIfVeg",

        "whatIfElectricity",

        "whatIfWaste",

        "whatIfSolar"

    ];


    controls.forEach(id => {

        on(
            id,
            "input",
            runWhatIf
        );

        on(
            id,
            "change",
            runWhatIf
        );

    });

}


/* =========================================================
   RUN WHAT-IF
========================================================= */

function runWhatIf() {

    if (!currentResult) {
        return;
    }


    const r =
        currentResult;


    const selectedTransport =
        textValue(
            "whatIfTransport",
            r.inputs.transportMode
        );


    const extraVegMeals =
        numberValue(
            "whatIfVeg",
            0
        );


    const electricityReduction =
        numberValue(
            "whatIfElectricity",
            0
        );


    const wasteReduction =
        numberValue(
            "whatIfWaste",
            0
        );


    const solarShare =
        numberValue(
            "whatIfSolar",
            r.inputs.solar
        );


    /* =====================================================
       TRANSPORT SCENARIO
    ===================================================== */

    let transportFactor = 0;


    if (
        selectedTransport === "car" ||
        selectedTransport === "bike"
    ) {

        transportFactor =
            FACTORS.transport[
                selectedTransport
            ][
                r.inputs.fuelType
            ] || 0;

    }

    else {

        transportFactor =
            FACTORS.transport[
                selectedTransport
            ] || 0;

    }


    const scenarioTransport =
        r.inputs.distance *
        transportFactor /
        Math.max(
            1,
            r.inputs.passengers
        );


    /* =====================================================
       FOOD SCENARIO
    ===================================================== */

    const mealsShift =
        Math.min(
            extraVegMeals,
            r.inputs.nonVegMeals
        );


    const scenarioFood =
        r.food -
        mealsShift *
        (
            FACTORS.food.nonVegetarian -
            FACTORS.food.vegetarian
        );


    /* =====================================================
       ELECTRICITY SCENARIO
    ===================================================== */

    const scenarioElectricityUse =
        r.inputs.electricityUse *
        (
            1 -
            electricityReduction / 100
        );


    const scenarioGridShare =
        Math.max(
            0,
            1 -
            solarShare / 100
        );


    const scenarioElectricity =
        scenarioElectricityUse *
        FACTORS.electricity *
        scenarioGridShare;


    /* =====================================================
       WASTE SCENARIO
    ===================================================== */

    const scenarioWaste =
        r.waste *
        (
            1 -
            wasteReduction / 100
        );


    /* =====================================================
       COOKING
    ===================================================== */

    const scenarioCooking =
        r.cooking;


    /* =====================================================
       TOTAL
    ===================================================== */

    const scenarioTotal =

        scenarioTransport +

        scenarioElectricity +

        scenarioFood +

        scenarioWaste +

        scenarioCooking;


    const saving =
        Math.max(
            0,
            r.total -
            scenarioTotal
        );


    const percentage =
        r.total > 0
            ? saving / r.total * 100
            : 0;


    const footprint =
        $("scenarioFootprint");


    const savingElement =
        $("scenarioSaving");


    const progress =
        $("scenarioProgress");


    const scenarioText =
        $("scenarioText");


    if (footprint) {

        footprint.textContent =
            scenarioTotal.toFixed(2);

    }


    if (savingElement) {

        savingElement.textContent =
            saving.toFixed(2);

    }


    if (progress) {

        progress.style.width =
            `${Math.min(
                100,
                percentage
            )}%`;

    }


    if (scenarioText) {

        scenarioText.textContent =
            saving > 0

                ? `This scenario could reduce your footprint by approximately ${saving.toFixed(2)} kg CO₂e/day (${percentage.toFixed(1)}%).`

                : "Try changing the scenario options to see how your footprint could change.";

    }

}


/* =========================================================
   CARBON BUDGET
========================================================= */

function saveCarbonBudget() {

    const budget =
        numberValue(
            "carbonBudget",
            0
        );


    if (
        !Number.isFinite(budget) ||
        budget <= 0
    ) {

        alert(
            "Please enter a valid carbon budget."
        );

        return;

    }


    localStorage.setItem(
        BUDGET_KEY,
        String(budget)
    );


    updateBudget();

}


/* =========================================================
   LOAD BUDGET
========================================================= */

function loadBudget() {

    const stored =
        parseFloat(
            localStorage.getItem(
                BUDGET_KEY
            )
        );


    if (
        Number.isFinite(stored)
    ) {

        const input =
            $("carbonBudget");


        if (input) {

            input.value =
                stored;

        }

    }


    updateBudget();

}


/* =========================================================
   UPDATE BUDGET
========================================================= */

function updateBudget() {

    const input =
        $("carbonBudget");


    const status =
        $("budgetStatus");


    const progress =
        $("budgetProgress");


    if (!input) {
        return;
    }


    const budget =
        parseFloat(
            input.value
        );


    if (
        !Number.isFinite(budget) ||
        budget <= 0
    ) {

        if (status) {

            status.textContent =
                "Set a budget to start tracking.";

        }

        if (progress) {

            progress.style.width =
                "0%";

        }

        return;

    }


    const latest =
        currentResult
            ? currentResult.total
            : historyData.length
                ? historyData[
                    historyData.length - 1
                ].total
                : 0;


    if (!latest) {

        if (status) {

            status.textContent =
                "Calculate your footprint to compare it with your budget.";

        }

        return;

    }


    const percentage =
        latest /
        budget *
        100;


    if (status) {

        if (latest <= budget) {

            status.textContent =
                `You are ${(
                    budget - latest
                ).toFixed(2)} kg CO₂e below your daily budget.`;

        }

        else {

            status.textContent =
                `You are ${(
                    latest - budget
                ).toFixed(2)} kg CO₂e above your daily budget.`;

        }

    }


    if (progress) {

        progress.style.width =
            `${Math.min(
                100,
                percentage
            )}%`;

    }

}


/* =========================================================
   HISTORY
========================================================= */

function loadHistory() {

    try {

        const stored =
            JSON.parse(
                localStorage.getItem(
                    STORAGE_KEY
                ) || "[]"
            );


        historyData =
            Array.isArray(stored)
                ? stored
                : [];

    }

    catch (error) {

        console.error(
            "Could not load history:",
            error
        );


        historyData = [];

    }

}


/* =========================================================
   SAVE HISTORY
========================================================= */

function saveHistory(result) {

    if (!result) {
        return;
    }


    historyData.push({
        total:
            result.total,

        transport:
            result.transport,

        electricity:
            result.electricity,

        food:
            result.food,

        waste:
            result.waste,

        cooking:
            result.cooking,

        date:
            result.date
    });


    /*
       Keep latest 30 calculations.
    */

    if (
        historyData.length >
        30
    ) {

        historyData =
            historyData.slice(-30);

    }


    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(
            historyData
        )
    );


    updateBudget();

}


/* =========================================================
   RENDER HISTORY
========================================================= */

function renderHistory() {

    const list =
        $("historyList");


    if (!list) {
        return;
    }


    if (!historyData.length) {

        list.innerHTML = `

            <div class="history-empty">

                No calculations yet.

            </div>

        `;

        renderHistoryChart();

        return;

    }


    const reversed =
        [...historyData]
            .reverse();


    list.innerHTML =
        reversed
            .map(
                (item, index) => {

                    const date =
                        new Date(
                            item.date
                        );


                    const formatted =
                        Number.isNaN(
                            date.getTime()
                        )

                            ? "Unknown date"

                            : date.toLocaleString();


                    return `

                        <div class="history-item">

                            <div>

                                <strong>

                                    ${item.total.toFixed(2)}
                                    kg CO₂e

                                </strong>


                                <small>

                                    ${formatted}

                                </small>

                            </div>


                            <span>

                                ${
                                    index === 0
                                        ? "Latest"
                                        : ""
                                }

                            </span>

                        </div>

                    `;

                }
            )
            .join("");


    renderHistoryChart();

}


/* =========================================================
   HISTORY CHART
========================================================= */

function renderHistoryChart() {

    const canvas =
        $("historyChart");


    if (!canvas) {
        return;
    }


    if (
        typeof Chart ===
        "undefined"
    ) {

        return;

    }


    if (historyChart) {

        historyChart.destroy();

        historyChart = null;

    }


    const labels =
        historyData.map(
            item => {

                const date =
                    new Date(
                        item.date
                    );


                return Number.isNaN(
                    date.getTime()
                )

                    ? ""

                    : date.toLocaleDateString();

            }
        );


    const values =
        historyData.map(
            item =>
                Number(
                    item.total.toFixed(2)
                )
        );


    historyChart =
        new Chart(
            canvas,
            {

                type: "line",

                data: {

                    labels,

                    datasets: [{

                        label:
                            "Daily CO₂e",

                        data:
                            values,

                        tension:
                            0.3,

                        fill:
                            false

                    }]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false,

                    scales: {

                        y: {

                            beginAtZero:
                                true

                        }

                    }

                }

            }

        );

}


/* =========================================================
   CLEAR HISTORY
========================================================= */

function clearHistory() {

    const confirmed =
        confirm(
            "Are you sure you want to clear all footprint history?"
        );


    if (!confirmed) {
        return;
    }


    /*
       Clear in-memory data.
    */

    historyData = [];


    /*
       Clear localStorage.
    */

    localStorage.removeItem(
        STORAGE_KEY
    );


    /*
       Clear chart.
    */

    if (historyChart) {

        historyChart.destroy();

        historyChart =
            null;

    }


    /*
       Clear list.
    */

    renderHistory();


    /*
       Recalculate mission/twin states.
    */

    updateMissions();

    updateTwin();


    alert(
        "History cleared successfully."
    );

}


/* =========================================================
   DOWNLOAD HISTORY
========================================================= */

function downloadHistory() {

    if (!historyData.length) {

        alert(
            "There is no history to download yet."
        );

        return;

    }


    const header = [
        "Date",
        "Total CO2e kg",
        "Transport kg",
        "Electricity kg",
        "Food kg",
        "Waste kg",
        "Cooking kg"
    ];


    const rows =
        historyData.map(
            item => [

                item.date,

                item.total,

                item.transport,

                item.electricity,

                item.food,

                item.waste,

                item.cooking

            ]
        );


    const csv = [

        header,

        ...rows

    ]

        .map(
            row =>
                row
                    .map(
                        value =>
                            `"${String(
                                value
                            ).replace(
                                /"/g,
                                '""'
                            )}"`
                    )
                    .join(",")
        )

        .join("\n");


    const blob =
        new Blob(
            [csv],
            {
                type:
                    "text/csv;charset=utf-8;"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "code-your-carbon-history.csv";


    document.body.appendChild(
        link
    );


    link.click();


    document.body.removeChild(
        link
    );


    URL.revokeObjectURL(
        url
    );

}


/* =========================================================
   SHARE
========================================================= */

async function shareResult() {

    if (!currentResult) {

        alert(
            "Calculate your footprint first."
        );

        return;

    }


    const r =
        currentResult;


    const hotspot =
        getHotspot(r);


    const shareText =

`🌱 Code Your Carbon

My daily carbon footprint:
${r.total.toFixed(2)} kg CO₂e

Biggest source:
${hotspot.name} (${hotspot.value.toFixed(2)} kg)

Transport:
${r.transport.toFixed(2)} kg

Electricity:
${r.electricity.toFixed(2)} kg

Food:
${r.food.toFixed(2)} kg

Waste:
${r.waste.toFixed(2)} kg

Cooking:
${r.cooking.toFixed(2)} kg

Calculate your own footprint with Code Your Carbon.`;



    if (
        navigator.share
    ) {

        try {

            await navigator.share({

                title:
                    "My Carbon Footprint",

                text:
                    shareText

            });

            return;

        }

        catch (error) {

            /*
               User may simply cancel sharing.
            */

            if (
                error &&
                error.name ===
                    "AbortError"
            ) {

                return;

            }

        }

    }


    /*
       Clipboard fallback.
    */

    try {

        await navigator.clipboard.writeText(
            shareText
        );


        alert(
            "Result copied to clipboard."
        );

    }

    catch (error) {

        /*
           Old-browser fallback.
        */

        const textarea =
            document.createElement(
                "textarea"
            );


        textarea.value =
            shareText;


        document.body.appendChild(
            textarea
        );


        textarea.select();


        try {

            document.execCommand(
                "copy"
            );


            alert(
                "Result copied to clipboard."
            );

        }

        catch (copyError) {

            alert(
                "Sharing is not supported in this browser."
            );

        }


        document.body.removeChild(
            textarea
        );

    }

}


/* =========================================================
   RESET CALCULATOR
========================================================= */

function resetCalculatorForm() {

    /*
       IMPORTANT:
       This resets only the calculator.
       It does NOT delete history.
    */


    const formInputs = [

        "transportMode",

        "fuelType",

        "distance",

        "passengers",

        "electricity",

        "solar",

        "vegMeals",

        "nonVegMeals",

        "waste",

        "recycling",

        "cookingFuel",

        "cookingTime"

    ];


    /*
       Explicit defaults are safer than form.reset()
       because the calculator may not be wrapped
       inside a <form>.
    */


    const defaults = {

        transportMode:
            "car",

        fuelType:
            "petrol",

        distance:
            "10",

        passengers:
            "1",

        electricity:
            "5",

        solar:
            "0",

        vegMeals:
            "2",

        nonVegMeals:
            "1",

        waste:
            "1",

        recycling:
            "0",

        cookingFuel:
            "lpg",

        cookingTime:
            "1"

    };


    formInputs.forEach(
        id => {

            const element =
                $(id);


            if (!element) {
                return;
            }


            if (
                defaults[id] !==
                undefined
            ) {

                element.value =
                    defaults[id];

            }

        }
    );


    /*
       Reset What-If controls.
    */

    const whatIfDefaults = {

        whatIfTransport:
            "metro",

        whatIfVeg:
            "0",

        whatIfElectricity:
            "0",

        whatIfWaste:
            "0",

        whatIfSolar:
            "0"

    };


    Object.entries(
        whatIfDefaults
    ).forEach(
        ([id, value]) => {

            const element =
                $(id);


            if (element) {

                element.value =
                    value;

            }

        }
    );


    /*
       Update labels.
    */

    setupRangeLabels();

    updateTransportFields();


    /*
       Reset scenario display.
    */

    const scenarioFootprint =
        $("scenarioFootprint");


    const scenarioSaving =
        $("scenarioSaving");


    const scenarioProgress =
        $("scenarioProgress");


    const scenarioText =
        $("scenarioText");


    if (scenarioFootprint) {

        scenarioFootprint.textContent =
            "0.00";

    }


    if (scenarioSaving) {

        scenarioSaving.textContent =
            "0.00";

    }


    if (scenarioProgress) {

        scenarioProgress.style.width =
            "0%";

    }


    if (scenarioText) {

        scenarioText.textContent =
            "Calculate your footprint and then adjust the scenario controls.";

    }


    /*
       Reset current result.
    */

    currentResult =
        null;


    /*
       Hide result section.
    */

    const results =
        $("results");


    if (results) {

        results.classList.add(
            "hidden"
        );

    }


    /*
       Clear result values.
    */

    const total =
        $("totalFootprint");


    const hero =
        $("heroFootprint");


    if (total) {

        total.textContent =
            "0.00";

    }


    if (hero) {

        hero.textContent =
            "0.00 kg";

    }


    /*
       Reset score.
    */

    const score =
        $("scoreBadge");


    if (score) {

        score.textContent =
            "—";

        score.className =
            "score-badge";

    }


    /*
       Reset hotspot.
    */

    const hotspot =
        $("hotspot");


    const hotspotText =
        $("hotspotText");


    if (hotspot) {

        hotspot.textContent =
            "—";

    }


    if (hotspotText) {

        hotspotText.textContent =
            "Calculate your footprint to identify your biggest carbon source.";

    }


    /*
       Reset action plan.
    */

    const actionPlan =
        $("personalActionPlan");


    if (actionPlan) {

        actionPlan.innerHTML = `

            <div class="action-plan-empty">

                <strong>
                    Calculate your footprint first.
                </strong>

                <span>
                    Your personalized recommendations will appear here.
                </span>

            </div>

        `;

    }


    /*
       Reset regular actions.
    */

    const actionList =
        $("actionList");


    if (actionList) {

        actionList.innerHTML = "";

    }


    /*
       Reset calculation breakdown.
    */

    const calculationBreakdown =
        $("calculationBreakdown");


    if (calculationBreakdown) {

        calculationBreakdown.innerHTML = "";

    }


    /*
       Clear breakdown chart.
    */

    const breakdownCanvas =
        $("breakdownChart");


    if (
        breakdownCanvas &&
        breakdownCanvas._carbonChart
    ) {

        breakdownCanvas
            ._carbonChart
            .destroy();


        breakdownCanvas._carbonChart =
            null;

    }


    /*
       Update range labels again.
    */

    updateRangeLabel(
        "solar",
        "solarValue",
        "%"
    );

    updateRangeLabel(
        "recycling",
        "recyclingValue",
        "%"
    );

    updateRangeLabel(
        "whatIfElectricity",
        "whatIfElectricityValue",
        "%"
    );

    updateRangeLabel(
        "whatIfWaste",
        "whatIfWasteValue",
        "%"
    );

    updateRangeLabel(
        "whatIfSolar",
        "whatIfSolarValue",
        "%"
    );


    /*
       Scroll back to calculator.
    */

    const calculator =
        $("calculator");


    if (calculator) {

        calculator.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

}


/* =========================================================
   MISSIONS
========================================================= */

function updateMissions() {

    const container =
        $("missions");


    if (!container) {
        return;
    }


    const missions = [

        {
            icon: "🚶",

            title:
                "Walk or cycle one short trip",

            description:
                "Replace one motorized trip with walking or cycling."
        },


        {
            icon: "🥗",

            title:
                "Choose one lower-impact meal",

            description:
                "Try one vegetarian meal today."
        },


        {
            icon: "⚡",

            title:
                "Reduce standby electricity",

            description:
                "Switch off unused devices and appliances."
        },


        {
            icon: "♻️",

            title:
                "Improve waste segregation",

            description:
                "Separate recyclable and organic waste."
        }

    ];


    container.innerHTML =
        missions
            .map(
                mission => `

                    <div class="mission-card">

                        <div class="mission-icon">

                            ${mission.icon}

                        </div>


                        <div>

                            <strong>

                                ${mission.title}

                            </strong>


                            <p>

                                ${mission.description}

                            </p>

                        </div>

                    </div>

                `
            )
            .join("");

}


/* =========================================================
   CARBON TWIN
========================================================= */

function updateTwin() {

    const title =
        $("twinTitle");


    const description =
        $("twinDescription");


    if (!title && !description) {
        return;
    }


    if (!historyData.length) {

        if (title) {

            title.textContent =
                "Your Carbon Twin";

        }


        if (description) {

            description.textContent =
                "Calculate your footprint a few times to build a personal footprint pattern.";

        }

        return;

    }


    const totals =
        historyData.map(
            item =>
                Number(item.total) || 0
        );


    const average =
        totals.reduce(
            (sum, value) =>
                sum + value,
            0
        ) /
        totals.length;


    const latest =
        totals[
            totals.length - 1
        ];


    if (title) {

        title.textContent =
            "Your Carbon Twin";

    }


    if (description) {

        description.textContent =
            `Your average recorded footprint is ${average.toFixed(2)} kg CO₂e/day. Your latest recorded footprint is ${latest.toFixed(2)} kg CO₂e/day.`;

    }

}


/* =========================================================
   THEME
========================================================= */

function loadTheme() {

    const theme =
        localStorage.getItem(
            THEME_KEY
        );


    if (
        theme === "dark"
    ) {

        document.body.classList.add(
            "dark-mode"
        );

    }


    updateThemeButton();

}


/* =========================================================
   TOGGLE THEME
========================================================= */

function toggleTheme() {

    document.body.classList.toggle(
        "dark-mode"
    );


    const dark =
        document.body.classList.contains(
            "dark-mode"
        );


    localStorage.setItem(
        THEME_KEY,
        dark
            ? "dark"
            : "light"
    );


    updateThemeButton();

}


/* =========================================================
   UPDATE THEME BUTTON
========================================================= */

function updateThemeButton() {

    const button =
        $("themeToggle");


    if (!button) {
        return;
    }


    const dark =
        document.body.classList.contains(
            "dark-mode"
        );


    button.textContent =
        dark
            ? "☀️"
            : "🌙";

}


/* =========================================================
   UTILITY: SHOW ELEMENT
========================================================= */

function show(id) {

    const element =
        $(id);


    if (element) {

        element.classList.remove(
            "hidden"
        );

    }

}


/* =========================================================
   UTILITY: HIDE ELEMENT
========================================================= */

function hide(id) {

    const element =
        $(id);


    if (element) {

        element.classList.add(
            "hidden"
        );

    }

}


/* =========================================================
   INITIAL RANGE UPDATE
========================================================= */

setTimeout(
    () => {

        updateRangeLabel(
            "solar",
            "solarValue",
            "%"
        );

        updateRangeLabel(
            "recycling",
            "recyclingValue",
            "%"
        );

        updateRangeLabel(
            "whatIfElectricity",
            "whatIfElectricityValue",
            "%"
        );

        updateRangeLabel(
            "whatIfWaste",
            "whatIfWasteValue",
            "%"
        );

        updateRangeLabel(
            "whatIfSolar",
            "whatIfSolarValue",
            "%"
        );

    },
    0
);


/* =========================================================
   END
========================================================= */