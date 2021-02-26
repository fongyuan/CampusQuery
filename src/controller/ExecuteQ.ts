import * as fs from "fs";

export default class ExecuteQ {
    public static execute(query: any): any {
        let temp: any;
        let result: any[] = [];
        return new Promise((resolve) => {
            fs.readFile("../data/courses", "utf-8", (err, infs) => {
                if (err) {
                    throw err;
                }
                temp = JSON.parse(infs.toString());
                resolve("done");
            });
        }).then(() => {
            this.filter(query, temp, result);
            this.columns(query, temp, result);
            this.sort(query, temp, result);
        });
    }

    public static filter(query: any, temp: any, result: any): any {
        let q = query.WHERE;
        let size = Object.keys(q).length;
        if (size > 0) {
            this.recurseFilter(q, query, temp, result);
        }
    }

    public static recurseFilter(query: any, query2: any, temp: any, result: any): any {
        let keys = [];
        let k;
        for (k in query) {
            keys.push(k);
        }
        if (keys[0] === "AND" || keys[0] === "OR") {
            let nothing;
        } else {
            let inside = Object.values(query);
            let idKey = Object.keys(inside[0]);
            let field = Object.values(inside[0]);
            this.greater(temp, idKey[0], field[0], result);
            }
        }

    public static greater(temp: any, idKey: string, field: any, result: any): any {
        let a: string | number;
        let toAdd: any = [];
        for (a in temp) {
            let obj = temp[a];   // {}
            Object.keys(obj).forEach(function (key) {
                if (key === idKey) {
                    if (obj[key] > field) {
                        toAdd.push(a);
                    }
                }
            });
            }
        let d;
        for (d = 0; d < toAdd.length; d++) {
            let add = toAdd[d];
            let add2 = temp[add];
            result.push(add2);
        }
    }

    //
    // public static sCompare(temp: any, op3: string, keyN: string, field: any) {
    //         let a;
    //         for (a in temp) {
    //             let obj = temp[a];   // {}
    //             let combo: any = obj + /\./ + keyN;
    //             if (combo === field) {
    //                 let nothing;
    //             } else {
    //                 delete temp[a];
    //             }
    //         }
    //     }
    //
    public static columns(query: any, temp: any, result: any): any {
        let d = query.OPTIONS.COLUMNS.valueOf();
        let a: string | number;
        for (a in result) {
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
    }

    public static sort(query: any, temp: any, result: any): any {
        temp.sort();
    }
}

