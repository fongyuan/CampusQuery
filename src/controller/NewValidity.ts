import Validity from "./Validity";

export default class NewValidity {
    public static validTransform(query: any): boolean {
        if (this.hasTransform(query)) {
            if (!Validity.notEmpty(query.TRANSFORMATIONS)) {
                return false;
            }
            let type = query.TRANSFORMATIONS.valueOf();
            if (typeof type !== "object") {
                return false;
            }
            let keys2 = [];
            for (const s in query) {
                keys2.push(s);
            }
            if (keys2[2] !== "TRANSFORMATIONS") {
                return false;
            }
            let keys = [];
            for (const s in query.TRANSFORMATIONS) {
                keys.push(s);
            }
            if (keys.length !== 2 || keys[0] !== "GROUP" || keys[1] !== "APPLY") {
                return false;
            } else {
                return true;
            }
        }
        return true;
    }

    public static hasTransform(query: any): boolean {
        for (const k in query) {
            if (k === "TRANSFORMATIONS") {
                return true;
            }
        }
        return false;
    }

    public static checkIfInApply(query: any, splitTest: any): boolean {
        let y;
        y = query.TRANSFORMATIONS.APPLY.valueOf();
        let x;
        for (x in y) {
            let test = Object.keys(y[x]);
            if (test[0] === splitTest) {
                return true;
            }
        }
        return false;
    }

    public static grabIdFromApply(query: any, applyKey: string): string {
        let y = query.TRANSFORMATIONS.APPLY.valueOf();
        for (const x in y) {
            let test = Object.keys(y[x]);
            if (test[0] === applyKey) {
                let k = Object.values(y[x])[0];
                return Object.values(k)[0];
            }
        }
    }

    public static checkIfInGroup(query: any, splitTest: any): boolean {
        let y;
        y = query.TRANSFORMATIONS.GROUP.valueOf();
        let x;
        for (x in y) {
            let test = y[x];
            if (test === splitTest) {
                return true;
            }
        }
        return false;
    }

    public static datasetTransform(query: any, splitId: any): boolean {
        for (const k in query) {
            if (k === "TRANSFORMATIONS") {
                if (!NewValidity.groupCheck(query, splitId)) {
                    return false;
                }
                if (!NewValidity.applyCheck(query, splitId)) {
                    return false;
                }
            }
        }
        return true;
    }

    public static groupCheck(query: any, splitId: any): boolean {
        if (!Validity.notEmpty(query.TRANSFORMATIONS.GROUP)) {
            return false;
        }
        let group = query.TRANSFORMATIONS.GROUP;
        for (const element of group) {
            if (typeof element !== "string" || element === null || element === undefined) {
                return false;
            }
        }
        let y;
        y = query.TRANSFORMATIONS.GROUP.valueOf();
        let x;
        for (x in y) {
            let test = y[x];
            let splitTest = test.split("_", 1);
            if (splitTest[0] !== splitId) {
                return false;
            }
        }
        return true;
    }

    public static applyCheck(query: any, splitId: any): boolean {
        if (!Validity.notEmpty(query.TRANSFORMATIONS.APPLY)) {
            return false;
        }
        let apply = query.TRANSFORMATIONS.APPLY.valueOf();
        for (const element of apply) {
            if (typeof element !== "object" || element === null || element === undefined) {
                return false;
            }
        }
        let unique = Object.keys(apply[0]);
        for (let i = 1; i < apply.length; i++) {
            if (Object.keys(apply[i])[0] === unique[0]) {
                return false;
            }
        }
        for (const x in apply) {
            let test = Object.values(apply[x])[0];
            let applyKey = Object.keys(test)[0];
            let applyField = Object.values(test)[0];
            let splitTest = applyField.split("_", 2);
            if (applyKey !== "MAX" && applyKey !== "MIN" && applyKey !== "AVG" && applyKey !== "COUNT" &&
                applyKey !== "SUM" ) {
                return false;
            }
            if (applyKey === "MAX" || applyKey === "MIN" || applyKey === "AVG" || applyKey === "SUM") {
                if (splitTest[1] !== "avg" && splitTest[1] !== "pass" &&  splitTest[1] !== "fail" &&
                    splitTest[1] !== "audit" && splitTest[1] !== "year" && splitTest[1] !== "lat" &&
                    splitTest[1] !== "lon" && splitTest[1] !== "seats") {
                    return false;
                }
            }
            if (splitTest[0] !== splitId) {
                return false;
            }
        }
        return true;
    }

    public static orderObject(query: any, splitId: any): boolean {
        let keys = [];
        let k;
        for (k in query.OPTIONS.ORDER) {
            keys.push(k);
        }
        if (keys[0] !== "dir" || keys[1] !== "keys" || keys.length !== 2) {
            return false;
        }
        let direction = query.OPTIONS.ORDER.dir;
        if (direction !== "UP" && direction !== "DOWN") {
            return false;
        }
        let keysToCheck = query.OPTIONS.ORDER.keys.valueOf();
        for (const x in keysToCheck) {
            if (!NewValidity.inCol(query, keysToCheck[x])) {
                return false;
            }
        }
        return true;
    }

    public static inCol(query: any, keyToCheck: any): boolean {
        let cols = query.OPTIONS.COLUMNS;
        for (const element of cols) {
                if (keyToCheck === element) {
                    return true;
                }
            }
        return false;
    }

    public static keyOrderObject(query: any): boolean {
        let keysToCheck = query.OPTIONS.ORDER.keys.valueOf();
        for (const x in keysToCheck) {
            if (!NewValidity.checkIfInApply(query, keysToCheck[x])) {
                if (!NewValidity.inCol(query, keysToCheck[x])) {
                    return false;
                }
            }
        }
        return true;
    }
}
