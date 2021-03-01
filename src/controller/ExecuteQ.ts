import * as fs from "fs";

export default class ExecuteQ {
    private static queryQ: any;

    public static execute(query: any): any {
        let temp: any;
        let finalResult: any[] = [];
        this.queryQ = query;
        return new Promise((resolve) => {
            fs.readFile("../data/courses", "utf-8", (err, infs) => {
                if (err) {
                    throw err;
                }
                temp = JSON.parse(infs.toString());
                resolve("done");
            });
        }).then(() => {
            const variable: any[] = this.filter(query, temp, finalResult);
            const variable2: any[] = this.columns(query, temp, variable);
            const var3: any[] = this.sort(query, temp, variable2);
            return var3;
        });
    }

    public static filter(query: any, temp: any, result: any): any[] {
        let s = this;
        let q = query.WHERE;
        let size = Object.keys(q).length;
        if (size > 0) {
            const test = s.recurseFilter(q, query, temp, result);
            return test;
        } else {
            return result;
        }
    }

    public static recurseFilter(query: any, query2: any, temp: any, result: any): any[] {
        let s = this;
        let keys = [];
        let k;
        for (k in query) {
            keys.push(k);
        }
        if (keys[0] === "AND" || keys[0] === "OR") {
            let top = Object.values(query);
            let med = Object.values(top[0]);
            let type = typeof med[0];

            if (type === "object") {     // not GT yet
                let inside = Object.values(query);
                let testy: any = inside[0];
                if (keys[0] === "AND") {
                    return s.andCombine(s.recurseFilter(testy[0], query2, temp, result),
                        s.recurseFilter(testy[1], query2, temp, result));
                }
                if (keys[0] === "OR") {
                    return s.orCombine(s.recurseFilter(testy[0], query2, temp, result),
                        s.recurseFilter(testy[1], query2, temp, result));
                }
            }
        } else {
            let inside = Object.values(query);
            let idKey = Object.keys(inside[0]);
            let field = Object.values(inside[0]);
            if (keys[0] === "GT") {
                return this.greater(temp, idKey[0], field[0], result);
            }
            if (keys[0] === "LT") {
                return this.lessThan(temp, idKey[0], field[0], result);
            }
            if (keys[0] === "EQ") {
                return this.equalTo(temp, idKey[0], field[0], result);
            }
            if (keys[0] === "IS") {
                return this.sCompare(temp, idKey[0], field[0], result);
            }
        }
    }

    public static andCombine(arr1: any, arr2: any): any[] {
        const testC = arr1.filter((value: any) => arr2.includes(value));
        return testC;
    }

    public static orCombine(arr1: any, arr2: any): any {
        const testD = arr1.concat(arr2.filter((value: any) => arr1.indexOf(value) < 0));
        return testD;
    }

    public static greater(temp: any, idKey: string, field: any, result: any): any[] {
        let toAdd: any[] = [];
        for (const a in temp) {
            let obj = temp[a];   // {}
            Object.keys(obj).forEach(function (key) {
                if (key === idKey) {
                    if (obj[key] > field) {
                        toAdd.push(obj);
                    }
                }
            });
        }
        return toAdd;
    }

    public static lessThan(temp: any, idKey: string, field: any, result: any): any[] {
        let toAdd: any[] = [];
        for (const a in temp) {
            let obj = temp[a];   // {}
            Object.keys(obj).forEach(function (key) {
                if (key === idKey) {
                    if (obj[key] < field) {
                        toAdd.push(obj);
                    }
                }
            });
        }
        return toAdd;
    }

    public static equalTo(temp: any, idKey: string, field: any, result: any): any[] {
        let toAdd: any[] = [];
        for (const a in temp) {
            let obj = temp[a];   // {}
            Object.keys(obj).forEach(function (key) {
                if (key === idKey) {
                    if (obj[key] === field) {
                        toAdd.push(obj);
                    }
                }
            });
        }
        return toAdd;
    }

    public static sCompare(temp: any, idKey: string, field: any, result: any): any[] {
        let toAdd: any = [];
        for (const a in temp) {
            let obj = temp[a];   // {}
            Object.keys(obj).forEach(function (key) {
                if (key === idKey) {
                    if (obj[key] === field) {
                        toAdd.push(obj);
                    }
                }
            });
        }
        return toAdd;
    }

    public static columns(query: any, temp: any, result: any): any[] {
        let d = query.OPTIONS.COLUMNS.valueOf();
        for (const a in result) {
            let obj = result[a];   // {}
            Object.keys(obj).forEach(function (key) {
                let c = 0;
                while (c < d.length) {
                    let test = d[c];
                    if (key === test) {
                        return;
                    }
                    c += 1;
                }
                delete obj[key];
            });
        }
        return result;
    }

    public static sort(query: any, temp: any, result: any): any[] {
        if (query.OPTIONS.ORDER.length > 0) {
            const test1 = query.OPTIONS.ORDER;
            let splitTest = test1.split("_", 2);
            if (splitTest[1] === "dept" || splitTest[1] === "id" || splitTest[1] === "instructor" ||
                splitTest[1] === "title" || splitTest[1] === "uuid") {
                result.sort(this.numSort);
            } else {
                result.sort(this.numSort);
            }
        } else {
            result.sort();
        }
        return result;
    }

    public static numSort(n: any, m: any) {
        let qq = ExecuteQ.queryQ;
        let qq2 = qq.OPTIONS.ORDER;
        let n2 = n[qq2];
        let m2 = m[qq2];
        if (n2 === m2) {
            return 0;
        } else {
            return n2 < m2 ? -1 : 1;
        }
    }

}


