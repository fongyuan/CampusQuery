import KeyValidity from "./KeyValidity";

export default class Validity {
    public static isValid(query: any): boolean {
        if (!this.hasNothing(query)) {
            return false;
        }
        if (!this.hasOptions(query)) {
            return false;
        }
        if (!this.validKeys(query)) {
            return false;
        }
        return true;
    }

    public static notEmpty(query: any): boolean {
        let k;
        for (k in query) {
            if (query.hasOwnProperty(k)) {
                return true;
            }
        }
        return false;
    }

    public static hasNothing(query: any): boolean {
        return Validity.notEmpty(query);
    }

    public static hasOptions(query: any): boolean {
        return Validity.notEmpty(query.OPTIONS);
    }

    public static validKeys(query: any): boolean {
        if (!this.datasetCheck(query)) {
            return false;
        }
        if (!KeyValidity.goodKey(query)) {
            return false;
        }
        if (!KeyValidity.goodField(query)) {
            return false;
        }
        return true;
    }

    public static datasetCheck(query: any): boolean {
        if (query.OPTIONS.COLUMNS.length === 0) {
            return false;
        }
        let cols = query.OPTIONS.COLUMNS;
        for (const element of cols) {
            if (typeof element !== "string" || element === null || element === undefined) {
                return false;
            }
        }
        let setId = query.OPTIONS.COLUMNS[0];
        let splitId = setId.split("_", 1);
        let y;
        y = query.OPTIONS.COLUMNS.valueOf();
        let x;
        for (x in y) {
            let test = y[x];
            let splitTest = test.split("_", 1);
            if (splitTest[0] !== splitId[0]) {
                return false;
            }
        }
        let keys = [];
        let k;
        for (k in query.OPTIONS) {
            keys.push(k);
        }
        if (keys[1] === "ORDER") {
            let test = query.OPTIONS.ORDER;
            if (typeof test !== "string" || test === null || test === undefined) {
                return false;
            }
            let splitTest = test.split("_", 1);
            if (splitId[0] !== splitTest[0]) {
                return false;
            }
        }
        return Validity.datasetWhere(query, splitId[0]);
    }

    public static datasetWhere(query: any, splitId: string): boolean {
        let q = query.WHERE;
        let size = Object.keys(q).length;
        if (size > 0) {
            let bool = this.recurse(q, splitId, query);
            if (bool) {
                return true;
            } else {
                return false;
            }
        }
    }

    public static isRecurse(query: any, splitId: string, query2: any): boolean {
        let top = Object.values(query);
        if (!Validity.notEmpty(top[0])) {
            return false;
        }
        let test = Object.values(query);
        let test2 = Object.keys(test[0]);
        let splitTest = test2[0].split("_", 1);
        if (splitId !== splitTest[0]) {
            return false;
        } else {
            return true;
        }
    }

    public static recurse(query: any, splitId: string, query2: any): boolean {
        let top = Object.values(query);
        let med = Object.values(top[0]);
        let type = typeof med[0];
        if (type !== "object") {     // ie GT: {course_avg = 97}
            if (!Validity.notEmpty(top[0])) {
                return false;
            }
            let test = Object.values(query);
            let test2 = Object.keys(test[0]);
            let splitTest = test2[0].split("_", 1);
            if (splitId !== splitTest[0]) {
                return false;
            }
        } else {
            if (!Validity.notEmpty(query)) {
                return false;
            }
            let keys = [];
            let k;
            for (k in query) {
                keys.push(k);
            }
            let inside = Object.values(query);
            let test: any = inside[0];
            if (keys[0] === "AND" || keys[0] === "OR") {
                for (const x in test) {
                    if (!this.recurse(test[x], splitId, query2)) {
                        return false;
                    }
                }
                return true;
            } else {
                if (keys[0] === "NOT") {
                    for (const x in test) {
                        if (x === "IS") {
                            if (!this.isRecurse(test, splitId, query2)) {
                                return false;
                            }
                        } else {
                            if (!this.recurse(test, splitId, query2)) {
                                return false;
                            }
                        }
                    }
                }
            }
        }
        return true;
    }
}
