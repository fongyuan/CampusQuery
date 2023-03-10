import NewValidity from "./NewValidity";

export default class Validity {
    public static isValid(query: any): boolean {
        if (!this.hasNothing(query)) {
            return false;
        }
        if (!this.hasWhere(query)) {
            return false;
        }
        if (!this.hasOptions(query)) {
            return false;
        }
        if (!this.whereOptionsOrder(query)) {
            return false;
        }
        if (!this.hasColumns(query)) {
            return false;
        }
        if (!NewValidity.validTransform(query)) {
            return false;
        }
        if (!this.validKeys(query)) {
            return false;
        }
        return true;
    }

    public static notEmpty(query: any): boolean {
        for (const k in query) {
            if (query.hasOwnProperty(k)) {
                return true;
            }
        }
        return false;
    }

    public static hasNothing(query: any): boolean {
        return Validity.notEmpty(query);
    }

    public static hasWhere(query: any): boolean {
        for (const k in query) {
            if (k === "WHERE") {
                return true;
            }
        }
        return false;
    }

    public static hasOptions(query: any): boolean {
        for (const k in query) {
            if (k === "OPTIONS") {
                return Validity.notEmpty(query.OPTIONS);
            }
        }
        return false;
    }

    public static whereOptionsOrder(query: any): boolean {
        let keys = [];
        for (const s in query) {
            keys.push(s);
        }
        if (keys[0] !== "WHERE" || keys[1] !== "OPTIONS") {
            return false;
        }
        return true;
    }

    public static hasColumns(query: any): boolean {
        for (const k in query.OPTIONS) {
            if (k === "COLUMNS") {
                return Validity.notEmpty(query.OPTIONS.COLUMNS);
            }
        }
        return false;
    }

    public static validKeys(query: any): boolean {
        if (!this.datasetCheck(query)) {
            return false;
        }
        return true;
    }

    public static datasetCheck(query: any): boolean {
        let keys = [];
        for (const k in query.OPTIONS) {
            keys.push(k);
        }
        if (keys[0] !== "COLUMNS") {
            return false;
        }
        let cols = query.OPTIONS.COLUMNS;
        let setId;
        for (const element of cols) {
            if (typeof element !== "string" || element === null || element === undefined) {
                return false;
            }
            if (/_/.test(element)) {
                setId = element;
            }
        }
        if (setId === undefined) {
            if (NewValidity.checkIfInApply(query, cols[0])) {
                setId = NewValidity.grabIdFromApply(query, cols[0]);
            }
        }
        let splitId = setId.split("_", 1);
        let y = query.OPTIONS.COLUMNS.valueOf();
        for (const x in y) {
            let test = y[x];
            let splitTest = test.split("_", 1);
            if (splitTest[0] !== splitId[0]) {
                if (NewValidity.hasTransform(query)) {
                    if (!NewValidity.checkIfInApply(query, splitTest[0])) {
                        return false;
                    }
                } else {
                    return false;
                }
            } else {
                if (NewValidity.hasTransform(query)) {
                    if (!NewValidity.checkIfInGroup(query, test)) {
                        return false;
                    }
                }
            }
        }
        return Validity.datasetCheck2(query, splitId, keys);
    }

    public static datasetCheck2(query: any, splitId: any, keys: any): boolean {
        if (!Validity.datasetOption(query, splitId[0], keys)) {
            return false;
        }
        if (NewValidity.hasTransform(query)) {
            if (!NewValidity.datasetTransform(query, splitId[0])) {
                return false;
            }
        }
        return Validity.datasetWhere(query, splitId[0]);
    }

    public static datasetOption(query: any, splitId: any, keys: any) {
        if (keys[1] === "ORDER") {
            let test = query.OPTIONS.ORDER;
            if ((typeof test !== "string" && typeof test !== "object") || test === null || test === undefined) {
                return false;
            }
            if (typeof test === "object") {
                if (!NewValidity.orderObject(query, splitId)) {
                    return false;
                }
            } else {
                let splitTest = test.split("_", 1);
                if (splitId !== splitTest[0]) {
                    if (NewValidity.hasTransform(query)) {
                        if (!NewValidity.checkIfInApply(query, splitTest[0])) {
                            return false;
                        }
                    } else {
                        return false;
                    }
                }
            }
        } else {
            if (keys.length > 2) {
                return false;
            }
            if (keys.length === 2 && keys[1] !== "ORDER") {
                return false;
            }
        }
        return true;
    }

    public static datasetWhere(query: any, splitId: string): boolean {
        let size = Object.keys(query.WHERE).length;
        if (size === 0) {
            return true;
        }
        if (size > 0) {
            let bool = this.recurse(query.WHERE, splitId, query);
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

    public static notCheck(query: any) {
        for (const x in query) {
            if (x === "NOT") {
                for (const y in query.NOT) {
                    if (y !== "IS" && y !== "GT" && y !== "EQ" && y !== "LT" && y !== "AND" && y !== "OR") {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    public static recurse(query: any, splitId: string, query2: any): boolean {
        let top = Object.values(query);
        let med = Object.values(top[0]);
        let type = typeof med[0];
        if (!Validity.notCheck(query)) {
            return false;
        }
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
            for (const k in query) {
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
                    if (!this.notRecurse(test, splitId, query2)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    public static notRecurse(query: any, splitId: string, query2: any) {
        for (const x in query) {
            if (x === "IS") {
                if (!this.isRecurse(query, splitId, query2)) {
                    return false;
                }
            } else {
                if (!this.recurse(query, splitId, query2)) {
                    return false;
                }
            }
        }
        return true;
    }
}
