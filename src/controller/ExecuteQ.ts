import * as fs from "fs";
import {resolve as pathResolve} from "path";
import {InsightError, ResultTooLargeError} from "./IInsightFacade";
import Comparators from "./Comparators";
import Validity from "./Validity";
import ApplyFunctions from "./ApplyFunctions";
import KeyValidity from "./KeyValidity";

export default class ExecuteQ {
    private static queryQ: any;
    private static variable2: Map<any, any>;

    public static execute(query: any): any {
        let temp: any;
        let finalResult: any[] = [];
        this.queryQ = query;
        let pathName = Comparators.getDatasetName(query);
        return new Promise((resolve) => {
            fs.readFile(pathResolve(__dirname, pathName), "utf-8", (err, infs) => {
                if (err) {
                    throw err;
                }
                temp = JSON.parse(infs.toString());
                resolve("done");
            });
        }).then(() => {
            let typeOfData = temp[0].kind;
            if (!KeyValidity.goodKey(this.queryQ, typeOfData)) {
                return Promise.reject(new InsightError());
            }
            const variable: any[] = this.filter(query, temp, finalResult);
            if (Validity.hasTransform(query)) {
                ExecuteQ.variable2 = this.group(query, variable);
                this.applyFunc(query);
                let count = this.variable2.size;
                if (count > 5000) {
                    throw new ResultTooLargeError();
                }
                const tVariable: any[] = this.transformCol(query, ExecuteQ.variable2);
                const sortedResult: any[] = this.transformSort(query, tVariable);
                return sortedResult;
            } else {
                const variable4: any[] = this.columns(query, temp, variable);
                const variable5: any[] = this.sort(query, variable4);
                if (variable5.length > 5000) {
                    throw new ResultTooLargeError();
                }
                return variable5;
            }
        });
    }

    public static filter(query: any, temp: any, result: any): any[] {
        let s = this;
        let q = query.WHERE;
        let size = Object.keys(q).length;
        if (size === 0) {
            return temp;
        }
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
                    let recursed: any[] = [];
                    for (const x in testy) {
                        let r = s.recurseFilter(testy[x], query2, temp, result);
                        recursed.push(r);
                    }
                    while (recursed.length > 1) {
                        recursed.push(Comparators.andCombine(recursed[0], recursed[1]));
                        recursed.splice(0, 1);
                        recursed.splice(0, 1);
                    }
                    return recursed[0];
                }
                if (keys[0] === "OR") {
                    return Comparators.orCombine(s.recurseFilter(testy[0], query2, temp, result),
                        s.recurseFilter(testy[1], query2, temp, result));
                }
            }
        } else {
            let inside = Object.values(query);
            let idKey = Object.keys(inside[0]);
            let field = Object.values(inside[0]);
            return ExecuteQ.smallRecurse(keys[0], inside, idKey, field, temp, query2, result);
        }
    }

    public static smallRecurse(op: any, inside: any, idKey: any, field: any, temp: any, query2: any, result: any) {
        if (op === "GT") {
            return Comparators.greater(temp, idKey[0], field[0]);
        }
        if (op === "LT") {
            return Comparators.lessThan(temp, idKey[0], field[0]);
        }
        if (op === "EQ") {
            return Comparators.equalTo(temp, idKey[0], field[0]);
        }
        if (op === "IS") {
            return Comparators.sCompare(temp, idKey[0], field[0]);
        }
        if (op === "NOT") {
            return Comparators.negate(temp, this.recurseFilter(inside[0], query2, temp, result));
        }
    }

    public static group(query: any, result: any): Map<any, any> {
        let map = new Map();
        let groupList = query.TRANSFORMATIONS.GROUP.valueOf();
        for (const a in result) {
            let obj = result[a];
            let keyString = "";
            for (const b in groupList) {
                keyString += obj[groupList[b]];
            }
            if (map.has(keyString)) {
                let array = map.get(keyString);
                array.push(obj);
                map.set(keyString, array);
            } else {
                let array = [];
                array.push(obj);
                map.set(keyString, array);
            }
        }
        return map;
    }

    public static applyFunc(query: any): void {
        let apply = query.TRANSFORMATIONS.APPLY.valueOf();
        for (const a in apply) {
            let obj = apply[a];
            let obj2 = Object.values(obj)[0];
            let name = Object.keys(obj);
            let op = Object.keys(obj2);
            let key = Object.values(obj2);
            ExecuteQ.opApply(op[0], key[0], name[0]);
        }
    }

    public static opApply(op: any, key: any, name: string): void {
        if (op === "MAX") {
            ApplyFunctions.maxApply(key, name, ExecuteQ.variable2);
        }
        if (op === "MIN") {
            ApplyFunctions.minApply(key, name, ExecuteQ.variable2);
        }
        if (op === "AVG") {
            ApplyFunctions.avgApply(key, name, ExecuteQ.variable2);
        }
        if (op === "COUNT") {
            ApplyFunctions.countApply(key, name, ExecuteQ.variable2);
        }
        if (op === "SUM") {
            ApplyFunctions.sumApply(key, name, ExecuteQ.variable2);
        }
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

    private static transformCol(query: any, variable2: Map<any, any>): any[] {
        let d = query.OPTIONS.COLUMNS.valueOf();
        let result: any[] = ApplyFunctions.transformColumns(d, variable2);
        return result;
    }

    public static sort(query: any, result: any): any[] {
        let keys = [];
        let k;
        for (k in query.OPTIONS) {
            keys.push(k);
        }
        if (keys[1] === "ORDER") {
            if (query.OPTIONS.ORDER.length > 0) {
                result.sort(this.numSort);
            } else {
                result.sort();
            }
            return result;
        } else {
            return result;
        }
    }

    public static transformSort(query: any, result: any): any[] {
        let keys = [];
        let k;
        for (k in query.OPTIONS) {
            keys.push(k);
        }
        if (keys[1] === "ORDER") {
            let orderItem = query.OPTIONS.ORDER.valueOf();
            if (typeof orderItem === "object") {
                if (query.OPTIONS.ORDER.dir === "UP") {
                    result.sort(this.upObjectSort);
                } else {
                    result.sort(this.downObjectSort);
                }
                // result.sort(this.objectSort);
            } else {
                if (query.OPTIONS.ORDER.length > 0) {
                    result.sort(this.numSort);
                } else {
                    result.sort();
                }
            }
            return result;
        } else {
            return result;
        }
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

    public static upObjectSort(n: any, m: any) {
        let qq = ExecuteQ.queryQ;
        let qq2 = qq.OPTIONS.ORDER.keys.valueOf();
        for (const a in qq2) {
            let n2 = n[qq2[a]];
            let m2 = m[qq2[a]];
            if (n2 === m2) {
                return 0;
            } else {
                return n2 < m2 ? -1 : 1;
            }
        }
    }

    public static downObjectSort(n: any, m: any) {
        let qq = ExecuteQ.queryQ;
        let qq2 = qq.OPTIONS.ORDER.keys.valueOf();
        for (const a in qq2) {
            let n2 = n[qq2[a]];
            let m2 = m[qq2[a]];
            if (n2 === m2) {
                return 0;
            } else {
                return n2 > m2 ? -1 : 1;
            }
        }
    }
}


