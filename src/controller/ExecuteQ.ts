import * as fs from "fs";

export default class ExecuteQ {
    public static execute(query: any): any {
        let temp: any;
        return new Promise((resolve) => {
            fs.readFile("./data/courses", "utf-8", (err, infs) => {
                if (err) {
                    throw err;
                }
                temp = JSON.parse(infs.toString());
                resolve("done");
            });
        }).then(() => {
            this.filter(query, temp);
        }).then(() => {
            this.columns(query, temp);
        }).then(() => {
            this.sort(query, temp);
        });
    }


    public static filter(query: any, temp: any): any {
        let q = query.WHERE;
        let size = Object.keys(q).length;
        if (size > 0) {
            this.recurseFilter(q, query, temp);
        }
    }

    public static recurseFilter(query: any, query2: any, temp: any): any {
        let top = Object.values(query);
        let med = Object.values(top[0]);
        let type = typeof med[0];
        if (type !== "object") {     // ie GT: {course_avg = 97}
            let op = Object.values(query2);
            let op2 = Object.keys(op[0]);
            let op3 = op2[0];  // gets the op

            let test1 = Object.values(query);
            let test2 = Object.keys(test1[0]);
            let splitTest = test2[0].split("_", 2);
            let keyN = splitTest[1];

            if (op3 === "GT" || op3 === "EQ" || op3 === "LT") {
                this.mCompare(temp, op3, keyN, med);
            } else {
                this.sCompare(temp, op3, keyN, med);
            }

        } else {
            let keys = [];
            let k;
            for (k in query) {
                keys.push(k);
            }
            if (keys[0] === "AND") {
                let inside = Object.values(query);
                let test: any = inside[0];
                this.recurseFilter(test[0], query2, temp);
                this.recurseFilter(test[1], query2, temp);
            }

            if (keys[0] === "OR") {
                let inside = Object.values(query);
                let test: any = inside[0];
                this.recurseFilter(test[0], query2, temp);
                this.recurseFilter(test[1], query2, temp);
            }  // NOT?
        }
    }

    public static mCompare(temp: any, op3: string, keyN: string, field: any) {
        if (op3 === "GT") {
            let a;
            for (a in temp) {
                let obj = temp[a];   // {}
                let combo: any = obj + /\./ + keyN;
                if (combo > field) {
                    let nothing;
                } else {
                    delete temp[a];
                }
            }
        }

        if (op3 === "LT") {
            let a;
            for (a in temp) {
                let obj = temp[a];   // {}
                let combo: any = obj + /\./ + keyN;
                if (combo < field) {
                    let nothing;
                } else {
                    delete temp[a];
                }
            }
        }

        if (op3 === "EQ") {
            let a;
            for (a in temp) {
                let obj = temp[a];   // {}
                let combo: any = obj + /\./ + keyN;
                if (combo === field) {
                    let nothing;
                } else {
                    delete temp[a];
                }
            }
        }
    }

    public static sCompare(temp: any, op3: string, keyN: string, field: any) {
            let a;
            for (a in temp) {
                let obj = temp[a];   // {}
                let combo: any = obj + /\./ + keyN;
                if (combo === field) {
                    let nothing;
                } else {
                    delete temp[a];
                }
            }
        }

    public static columns(query: any, temp: any): any {
        let a;
        let b = query.OPTIONS.COLUMNS.valueOf();
        for (a in b) {
            let test = b[a];
            let splitTest = test.split("_", 2);
            let col = splitTest[1];
            b[a] = col;
        }
        let d;
        for (d in temp) {
            let obj = temp[d];   // {}
            let eff;
            for (eff in obj) {
                let str = obj[eff];
                let splitStr = str.split(":", 1);
                let match;
                for (match in b) {
                    if (splitStr[0] === b[match]) {
                        let nothing;
                    } else {
                        delete temp[d];
                    }
                }
            }
        }
    }

    public static sort(query: any, temp: any): any {
        temp.sort();
    }
}

