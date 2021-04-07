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
                const operators = document.getElementsByClassName("control operators");
                const op = operators[i];
                let opVal;
                for (let b = 0; b < op.firstElementChild.options.length; b++) {
                    if (op.firstElementChild[b].defaultSelected === true) {
                        opVal = op.firstElementChild[b].label;
                    }
                }
                const textBox = document.getElementsByClassName("control term");
                let text;
                if (opVal === "IS") {
                    text = textBox[i].childNodes[1].defaultValue;
                } else {
                    text = Number(textBox[i].childNodes[1].defaultValue);
                }
                let innerObject = {};
                innerObject[idField] = text;
                let object = {};
                object[opVal] = innerObject;   // {IS: {}}
                const notBox = document.getElementsByClassName("control not");
                if (notBox[i].children[0].defaultChecked === true) {
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
            const fieldBox = document.getElementsByClassName("control fields");
            const field = fieldBox[conToCheck];
            for (let i = 0; i < field.firstElementChild.options.length; i++) {
                if (field.firstElementChild[i].defaultSelected === true) {
                    fieldVal = fieldMapping(field.firstElementChild[i].label);
                }
            }
            const idField = type + "_" + fieldVal;   // courses_dept
            const operators = document.getElementsByClassName("control operators");
            const op = operators[0];
            let opVal;
            for (let i = 0; i < op.firstElementChild.options.length; i++) {
                if (op.firstElementChild[i].defaultSelected === true) {
                    opVal = op.firstElementChild[i].label;
                }
            }
            const textBox = document.getElementsByClassName("control term");
            let text;
            if (opVal === "IS") {
                text = textBox[0].childNodes[1].defaultValue;
            } else {
                text = Number(textBox[0].childNodes[1].defaultValue);
            }
            let innerObject = {};
            innerObject[idField] = text;
            let object = {};
            object[opVal] = innerObject;   // {IS: {}}
            query["WHERE"] = object;
        }
    } else {
        query["WHERE"] = {};
    }
    let allColumn = [];
    const columns = document.getElementsByClassName("form-group columns");
    let col = columns[conToCheck];
    for (let i = 0; i < col.children[1].children.length; i++) {
        if (col.children[1].children[i].children[0].defaultChecked === true) {
            let cToMap = fieldMapping(col.children[1].children[i].children[0].defaultValue);
            let c = type + "_" + cToMap;
            allColumn.push(c);
        }
    }
    let optionsObj = {};
    optionsObj["COLUMNS"] = allColumn;
    let allOption = [];
    const order = document.getElementsByClassName("control order fields");
    const o = order[conToCheck];
    for (let i = 0; i < o.childNodes[1].length; i++) {
        if (o.childNodes[1][i].defaultSelected === true) {
            let actualO = fieldMapping(o.childNodes[1][i].label);
            let oComplete = type + "_" + actualO;
            allOption.push(oComplete);
        }
    }
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
    query["OPTIONS"] = optionsObj;
    return query;
};

