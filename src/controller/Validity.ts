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
            return this.recurse(q, splitId, query);
        }

        return true;
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
                let test = inside[0];
                // @ts-ignore
                this.recurse(test[0], splitId, query2);
                // @ts-ignore
                this.recurse(test[1], splitId, query2);
                return true;
            }
        }
        return true;
    }

    public static goodKey(query: any): boolean {
        return true;
    }

    public static goodField(query: any): boolean {
        return true;
    }
}
