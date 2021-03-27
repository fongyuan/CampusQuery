import NewValidity from "./NewValidity";
import KeyValidity from "./KeyValidity";

export default class RoomKeyValidity {
    public static goodRoomKey(query: any): boolean {
        let a;
        let b = query.OPTIONS.COLUMNS.valueOf();
        for (a in b) {
            let test = b[a];
            let splitTest = test.split("_", 2);
            if (splitTest[1] !== "lat" && splitTest[1] !== "lon" && splitTest[1] !== "seats" &&
                splitTest[1] !== "fullname" && splitTest[1] !== "shortname" && splitTest[1] !== "number" &&
                splitTest[1] !== "name" && splitTest[1] !== "address" && splitTest[1] !== "type" &&
                splitTest[1] !== "furniture" && splitTest[1] !== "href") {
                if (!NewValidity.checkIfInApply(query, splitTest[0])) {
                    return false;
                }
            }
        }
        if (!RoomKeyValidity.keyOptions(query)) {
             return false;
        }
        let q = query.WHERE;
        let size = Object.keys(q).length;
        if (size === 0) {
            return true;
        }
        if (size > 0) {
            let bool = this.recurseKey(q, query);
            if (bool) {
                return true;
            } else {
                return false;
            }
        }
    }

    public static isRoomsKey(splitTest: any): boolean {
        if (splitTest[1] !== "lat" && splitTest[1] !== "lon" && splitTest[1] !== "seats" &&
            splitTest[1] !== "fullname" && splitTest[1] !== "shortname" && splitTest[1] !== "number" &&
            splitTest[1] !== "name" && splitTest[1] !== "address" && splitTest[1] !== "type" &&
            splitTest[1] !== "furniture" && splitTest[1] !== "href") {
            return false;
        }
        return true;
    }

    public static keyOptions(query: any): boolean {
        let keys = [];
        let k;
        for (k in query.OPTIONS) {
            keys.push(k);
        }
        if (keys[1] === "ORDER") {
            let d = query.OPTIONS.ORDER.valueOf();
            if (typeof d === "object") {
                if (!NewValidity.keyOrderObject(query)) {
                    return false;
                }
            } else {
                if (/_/.test(d)) {
                    let splitTest = d.split("_", 2);
                    if (!RoomKeyValidity.isRoomsKey(splitTest) ||
                        !RoomKeyValidity.checkInCol(query, splitTest[1])) {
                        return false;
                    }
                } else {
                    if (!RoomKeyValidity.checkInCol(query, d) &&
                        !NewValidity.checkIfInApply(query, d)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    public static checkInCol(query: any, toCheck: any): boolean {
        let a;
        let b = query.OPTIONS.COLUMNS.valueOf();
        for (a in b) {
            let test = b[a];
            let splitTest = test.split("_", 2);
            if (splitTest[1] === toCheck) {
                return true;
            }
        }
        return false;
    }

    public static opMatch(oppy: string, object: any, query: any): boolean {
        if (oppy === "LT" || oppy === "GT" || oppy === "EQ") {
            let top = Object.values(query);
            let med = Object.values(top[0]);
            if (med.length > 1) {
                return false;
            }
            let test = Object.values(query);
            let test2 = Object.keys(test[0]);
            let splitTest = test2[0].split("_", 2);
            if (splitTest[1] === "fullname" || splitTest[1] === "shortname" || splitTest[1] === "number"
                || splitTest[1] === "name" || splitTest[1] === "address" || splitTest[1] === "type"
                || splitTest[1] === "furniture" || splitTest[1] === "href") {
                return false;
            } else {
                return true;
            }
        } else {
            if (oppy === "IS") {
                let top = Object.values(query);
                let med = Object.values(top[0]);
                if (med.length > 1) {
                    return false;
                }
                let test = Object.values(query);
                let test2 = Object.keys(test[0]);
                let splitTest = test2[0].split("_", 2);
                if (splitTest[1] === "lat" || splitTest[1] === "lon" || splitTest[1] === "seats") {
                    return false;
                } else {
                    return true;
                }
            } else {
                return true;
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
            if (!RoomKeyValidity.opMatch(oppy[0], opCheck[0], query)) {
                return false;
            }
            let test = Object.values(query);
            let test2 = Object.keys(test[0]);
            let splitTest = test2[0].split("_", 2);
            if (!RoomKeyValidity.isRoomsKey(splitTest)) {
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
        if (size === 0) {
            return true;
        }
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
            if (splitTest[1] === "fullname" || splitTest[1] === "shortname" || splitTest[1] === "number"
                || splitTest[1] === "name" || splitTest[1] === "address" || splitTest[1] === "type"
                || splitTest[1] === "furniture" || splitTest[1] === "href") {
                if (type !== "string") {
                    return false;
                } else {
                    let h;
                    let med2: string = med[0];
                    for (h = 0; h < med2.length - 1; h++) {
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
