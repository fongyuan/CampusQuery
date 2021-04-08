/**
 * Builds a query object using the current document object model (DOM).
 * Must use the browser's global document object {@link https://developer.mozilla.org/en-US/docs/Web/API/Document}
 * to read DOM information.
 *
 * @returns query object adhering to the query EBNF
 */
CampusExplorer.buildQuery = () => {
    let query = {};
    const dataType = document.getElementsByClassName("nav-item tab active");
    const type = dataType[0].getAttribute("data-type").toLowerCase();
    const con = document.getElementsByClassName("conditions-container");
    let conToCheck;
    if (type === "courses") {
        conToCheck = 0;
    } else {
        conToCheck = 1;
    }
    function fieldMapping(label) {
        let finalField;
        if (label === "Department") {
            finalField = "dept";
        } else if (label === "Average") {
            finalField = "avg";
        } else if (label === "Full Name") {
            finalField = "fullname";
        } else if (label === "Link") {
            finalField = "href";
        } else if (label === "Latitude") {
            finalField = "lat";
        } else if (label === "Longitude") {
            finalField = "lon";
        } else if (label === "Short Name") {
            finalField = "shortname";
        } else {
            finalField = label.toLowerCase();
        }
        return finalField;
    }

    if (con[conToCheck].hasChildNodes()) {
        if (con[conToCheck].childElementCount > 1) {
            let all = [];
            let conditions = document.getElementsByClassName("control-group condition-type");
            let condition;
            for (let a = 0; a < conditions[conToCheck].children.length; a++) {
                if (conditions[conToCheck].children[a].childNodes[1].checked === true) {
                    let c = conditions[conToCheck].children[a].childNodes[1].defaultValue;
                    if (c === "all") {
                        condition = "AND";
                    } else if (c === "any") {
                        condition = "OR";
                    } else if (c === "none") {
                        condition = "NOT";
                    }
                }
            }
            for (let i = 0; i < con[conToCheck].childElementCount; i++) {
                let fieldVal;
                for (let j = 0; j < con[conToCheck].children[i].childNodes[3].childNodes[1].length; j++) {
                    if (con[conToCheck].children[i].childNodes[3].childNodes[1][j].defaultSelected === true) {
                        fieldVal = fieldMapping(con[conToCheck].children[i].childNodes[3].childNodes[1][j].label);
                    }
                }
                const idField = type + "_" + fieldVal;   // courses_dept
                let opVal;
                for (let j = 0; j < con[conToCheck].children[i].childNodes[5].childNodes[1].length; j++) {
                    if (con[conToCheck].children[i].childNodes[5].childNodes[1][j].defaultSelected === true) {
                        opVal = con[conToCheck].children[i].childNodes[5].childNodes[1][j].label;
                    }
                }
                const textBox = con[conToCheck].children[i].childNodes[7];
                let text;
                if (opVal === "IS") {
                    text = textBox.childNodes[1].defaultValue;
                } else {
                    text = Number(textBox.childNodes[1].defaultValue);
                }
                let innerObject = {};
                innerObject[idField] = text;
                let object = {};
                object[opVal] = innerObject;   // {IS: {}}
                const notBox = con[conToCheck].children[i].childNodes[1];
                if (notBox.children[0].defaultChecked === true) {
                    let notObj = {}
                    notObj["NOT"] = object;
                    all.push(notObj);
                } else {
                    all.push(object);
                }
            }
            let object2 = {};
            object2[condition] = all;
            query["WHERE"] = object2;
        } else {
            let fieldVal;
            for (let j = 0; j < con[conToCheck].children[0].childNodes[3].childNodes[1].length; j++) {
                if (con[conToCheck].children[0].childNodes[3].childNodes[1][j].defaultSelected === true) {
                    fieldVal = fieldMapping(con[conToCheck].children[0].childNodes[3].childNodes[1][j].label);
                }
            }
            const idField = type + "_" + fieldVal;   // courses_dept
            let opVal;
            for (let j = 0; j < con[conToCheck].children[0].childNodes[5].childNodes[1].length; j++) {
                if (con[conToCheck].children[0].childNodes[5].childNodes[1][j].defaultSelected === true) {
                    opVal = con[conToCheck].children[0].childNodes[5].childNodes[1][j].label;
                }
            }
            const textBox = con[conToCheck].children[0].childNodes[7];
            let text;
            if (opVal === "IS") {
                text = textBox.childNodes[1].defaultValue;
            } else {
                text = Number(textBox.childNodes[1].defaultValue);
            }
            let innerObject = {};
            innerObject[idField] = text;
            let object = {};
            object[opVal] = innerObject;   // {IS: {}}
            const notBox = con[conToCheck].children[0].childNodes[1];
            if (notBox.children[0].defaultChecked === true) {
                let notObj = {}
                notObj["NOT"] = object;
                query["WHERE"] = notObj;
            } else {
                query["WHERE"] = object;
            }
        }
    } else {
        query["WHERE"] = {};
    }
    let allColumn = [];
    const columns = document.getElementsByClassName("form-group columns");
    let col = columns[conToCheck];
    for (let i = 0; i < col.children[1].children.length; i++) {
        if (col.children[1].children[i].className === "control field" &&
            col.children[1].children[i].children[0].defaultChecked === true) {
            let cToMap = fieldMapping(col.children[1].children[i].children[0].defaultValue);
            let c = type + "_" + cToMap;
            allColumn.push(c);
        } else if (col.children[1].children[i].className === "control transformation"
            && col.children[1].children[i].children[0].defaultChecked === true) {
            let c = col.children[1].children[i].children[0].defaultValue;
            allColumn.push(c);
        }
    }
    let optionsObj = {};
    optionsObj["COLUMNS"] = allColumn;
    let allOption = [];
    const order = document.getElementsByClassName("control order fields");
    const o = order[conToCheck];
    for (let i = 0; i < o.childNodes[1].length; i++) {
        if (o.childNodes[1][i].className === "" &&
            o.childNodes[1][i].defaultSelected === true) {
            let actualO = fieldMapping(o.childNodes[1][i].label);
            let oComplete = type + "_" + actualO;
            allOption.push(oComplete);
        } else if (o.childNodes[1][i].className === "transformation" &&
            o.childNodes[1][i].defaultSelected === true) {
            let c = o.childNodes[1][i].label;
            allOption.push(c);
        }
    }
    if (type === "courses") {
        if (allOption.length > 0 && document.getElementById("courses-order").checked === true) {
            let c2Order = {};
            c2Order["dir"] = "DOWN";
            c2Order["keys"] = allOption;
            optionsObj["ORDER"] = c2Order;
        } else if (allOption.length > 0 && document.getElementById("courses-order").checked === false) {
            let c2Order = {};
            c2Order["dir"] = "UP";
            c2Order["keys"] = allOption;
            optionsObj["ORDER"] = c2Order;
        }
    } else {
        if (allOption.length > 0 && document.getElementById("rooms-order").checked === true) {
            let c2Order = {};
            c2Order["dir"] = "DOWN";
            c2Order["keys"] = allOption;
            optionsObj["ORDER"] = c2Order;
        } else if (allOption.length > 0 && document.getElementById("rooms-order").checked === false) {
            let c2Order = {};
            c2Order["dir"] = "UP";
            c2Order["keys"] = allOption;
            optionsObj["ORDER"] = c2Order;
        }
    }
    query["OPTIONS"] = optionsObj;
    const transformBox = document.getElementsByClassName("transformations-container");
    if (transformBox[conToCheck].hasChildNodes()) {
        let transformObj = {};
        let allGroup = [];
        const groups = document.getElementsByClassName("form-group groups");
        let grp = groups[conToCheck];
        for (let i = 0; i < grp.children[1].children.length; i++) {
            if (grp.children[1].children[i].className === "control field" &&
                grp.children[1].children[i].children[0].defaultChecked === true) {
                let cToMap = fieldMapping(grp.children[1].children[i].children[0].defaultValue);
                let c = type + "_" + cToMap;
                allGroup.push(c);
            }
        }
        let applyObj = [];
        let apply = transformBox[conToCheck];
        for (let i = 0; i < apply.children.length; i++) {
            let applyRule = {};
            let applyToken = {};
            let title = apply.children[i].children[0].children[0].defaultValue;
            let operator;
            for (let j = 0; j < apply.children[i].children[1].children[0].length; j++) {
                if (apply.children[i].children[1].children[0][j].defaultSelected === true) {
                    operator = apply.children[i].children[1].children[0][j].label;
                }
            }
            let tokenField;
            for (let k = 0; k < apply.children[i].children[2].children[0].length; k++) {
                if (apply.children[i].children[2].children[0][k].defaultSelected === true) {
                    let tToMap = fieldMapping(apply.children[i].children[2].children[0][k].label);
                    tokenField = type + "_" + tToMap;
                    applyToken[operator] = tokenField;
                }
            }
            applyRule[title] = applyToken;
            applyObj.push(applyRule);
        }
        transformObj["GROUP"] = allGroup;
        transformObj["APPLY"] = applyObj;
        query["TRANSFORMATIONS"] = transformObj;
    }
    return query;
};

