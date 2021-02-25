export default class Validity {
    public static isValid(query: any): boolean {
        if (this.hasNothing(query)) {
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

    public static hasNothing(query: any): boolean {
        let keys = [];
        let k;
        for (k in query) {
            keys.push(k);
        }
        if (keys.length === 0) {
            return true;
        } else {
            return false;
        }
    }

    public static hasOptions(query: any): boolean {
        let keys = [];
        let k;
        for (k in query) {
            keys.push(k);
        }
        if (keys[1] === "OPTIONS") {
            if (query.OPTIONS.COLUMNS.length === 0) {
                return false;
            } else {
                return true;
            }
        } else {
            return false;
        }
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
        let setId = query.OPTIONS.COLUMNS[0];
        let splitId = setId.split("_", 1);
        if (query.OPTIONS.ORDER.length > 0) {
            let test = query.OPTIONS.ORDER;
            let splitTest = test.split("_", 1);
            if (splitId[0] !== splitTest[0]) {
                return false;
            }
        }

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

    public static recurse(query: any, splitId: string, query2: any): boolean {
        let top = Object.values(query);
        let med = Object.values(top[0]);
        let type = typeof med[0];
        if (type !== "object") {     // ie GT: {course_avg = 97}
            let test = Object.values(query);
            let test2 = Object.keys(test[0]);
            let splitTest = test2[0].split("_", 1);
            if (splitId[0] !== splitTest[0]) {
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
                let c = "b";
            } else {
                return false;
            }
        }

        if (query.OPTIONS.ORDER.length > 0) {
            let d = query.OPTIONS.ORDER.valueOf();
            let splitTest = d.split("_", 2);
            if (splitTest[1] === "dept" || splitTest[1] === "id" || splitTest[1] === "avg" ||
                    splitTest[1] === "instructor" || splitTest[1] === "title" || splitTest[1] === "pass" ||
                    splitTest[1] === "fail" || splitTest[1] === "audit" || splitTest[1] === "uuid" ||
                    splitTest[1] === "year") {
                    let bee = "d";
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
            let test = Object.values(query);
            let test2 = Object.keys(test[0]);
            let splitTest = test2[0].split("_", 2);
            if (splitTest[1] === "dept" || splitTest[1] === "id" || splitTest[1] === "avg" ||
                splitTest[1] === "instructor" || splitTest[1] === "title" || splitTest[1] === "pass" ||
                splitTest[1] === "fail" || splitTest[1] === "audit" || splitTest[1] === "uuid"
                || splitTest[1] === "year") {
                let a = "dumb esLint";
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
                            let nothing = "b";
                        } else {
                            if (med2.charAt(h) === "*") {
                                return false;
                            }
                        }
                    }
                }
            } else {
                if (type !== "number") {
                    return false;
                } else {
                    let a = "dumb esLint";
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
