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
        if (!this.goodKey(query)) {
            return false;
        }
        if (!this.goodField(query)) {
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

    public static opMatch(oppy: string, object: any): boolean {
        if (oppy === "LT" || oppy === "GT" || oppy === "EQ") {
           return true;
        }
    }

    public static recurse(query: any, splitId: string, query2: any): boolean {
        let top = Object.values(query);
        if (!Validity.notEmpty(top[0])) {
            return false;
        }
        let med = Object.values(top[0]);
        let type = typeof med[0];
        if (type !== "object") {     // ie GT: {course_avg = 97}
            let test = Object.values(query);
            let test2 = Object.keys(test[0]);
            let splitTest = test2[0].split("_", 1);
            if (splitId !== splitTest[0]) {
                return false;
            }
        } else {
            let keys = [];
            let k;
            for (k in query) {
                keys.push(k);
            }
            if (keys[0] === "AND" || keys[0] === "OR") {
                let inside = Object.values(query);
                let test: any = inside[0];
                this.recurse(test[0], splitId, query2);
                this.recurse(test[1], splitId, query2);
                return true;
            }
        }
        return true;
    }

    public static goodKey(query: any): boolean {
        let a;
        let b = query.OPTIONS.COLUMNS.valueOf();
        for (a in b) {
            let test = b[a];
            let splitTest = test.split("_", 2);
            if (splitTest[1] === "dept" || splitTest[1] === "id" || splitTest[1] === "avg" ||
                splitTest[1] === "instructor" || splitTest[1] === "title" || splitTest[1] === "pass" ||
                splitTest[1] === "fail" || splitTest[1] === "audit" || splitTest[1] === "uuid" ||
                splitTest[1] === "year") {
                //
            } else {
                return false;
            }
        }

        let keys = [];
        let k;
        for (k in query.OPTIONS) {
            keys.push(k);
        }
        if (keys[1] === "ORDER") {
            let d = query.OPTIONS.ORDER.valueOf();
            let splitTest = d.split("_", 2);
            if (splitTest[1] === "dept" || splitTest[1] === "id" || splitTest[1] === "avg" ||
                splitTest[1] === "instructor" || splitTest[1] === "title" || splitTest[1] === "pass" ||
                splitTest[1] === "fail" || splitTest[1] === "audit" || splitTest[1] === "uuid" ||
                splitTest[1] === "year") {
                //
            } else {
                return false;
            }
        }

        let q = query.WHERE;
        let size = Object.keys(q).length;
        if (size > 0) {
            let bool = this.recurseKey(q, query);
            if (bool) {
                return true;
            } else {
                return false;
            }
        }
    }

    public static recurseKey(query: any, query2: any): boolean {
        let top = Object.values(query);
        let med = Object.values(top[0]);
        let type = typeof med[0];
        if (type !== "object") {     // ie GT: {course_avg = 97}
            let opCheck = Object.values(query2);
            let oppy = Object.keys(opCheck[0]);
            if (!Validity.opMatch(oppy[0], opCheck[0])) {
                return false;
            }
            let test = Object.values(query);
            let test2 = Object.keys(test[0]);
            let splitTest = test2[0].split("_", 2);
            if (splitTest[1] === "dept" || splitTest[1] === "id" || splitTest[1] === "avg" ||
                splitTest[1] === "instructor" || splitTest[1] === "title" || splitTest[1] === "pass" ||
                splitTest[1] === "fail" || splitTest[1] === "audit" || splitTest[1] === "uuid"
                || splitTest[1] === "year") {
                //
            } else {
                return false;
            }
        } else {
            let keys = [];
            let k;
            for (k in query) {
                keys.push(k);
            }
            if (keys[0] === "AND" || keys[0] === "OR") {
                let inside = Object.values(query);
                let test: any = inside[0];
                this.recurseKey(test[0], query2);
                this.recurseKey(test[1], query2);
                return true;
            }
        }
        return true;
    }

    public static goodField(query: any): boolean {
        let q = query.WHERE;
        let size = Object.keys(q).length;
        if (size > 0) {
            let bool = this.recurseField(q, query);
            if (bool) {
                return true;
            } else {
                return false;
            }
        }
    }

    public static recurseField(query: any, query2: any): boolean {
        let top = Object.values(query);
        let med = Object.values(top[0]);
        let type = typeof med[0];
        if (med[0] === null || med[0] === undefined) {
            return false;
        }
        if (type !== "object") {     // ie GT: {course_avg = 97}
            let test = Object.values(query);
            let test2 = Object.keys(test[0]);
            let splitTest = test2[0].split("_", 2);
            if (splitTest[1] === "dept" || splitTest[1] === "id" || splitTest[1] === "instructor"
                || splitTest[1] === "title" || splitTest[1] === "uuid") {
                if (type !== "string") {
                    return false;
                } else {
                    let h;
                    let med2: string = med[0];
                    for (h = 0; h < med2.length; h++) {
                        if (h === 0) {
                            //
                        } else {
                            if (/\*/.test(med2.charAt(h))) {
                                return false;
                            }
                        }
                    }
                }
            } else {
                if (type !== "number") {
                    return false;
                }
            }
        } else {
            let keys = [];
            let k;
            for (k in query) {
                keys.push(k);
            }
            if (keys[0] === "AND" || keys[0] === "OR") {
                let inside = Object.values(query);
                let test: any = inside[0];
                this.recurseField(test[0], query2);
                this.recurseField(test[1], query2);
                return true;
            }
        }
        return true;
    }

}
