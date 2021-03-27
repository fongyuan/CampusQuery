import Decimal from "decimal.js";

export default class ApplyFunctions {
    private static max: number;
    private static min: number;
    private static numRows: any;
    private static sumAvg: Decimal;
    private static set: Set<any>;
    private static sum: number;
    private static object: any;
    // private static array: any;

    public static maxApply(keyFromQuery: string, name: string, result: any): void {
        result.forEach((item: any) => ApplyFunctions.maxCallback(item, name,
            ApplyFunctions.max = Number.MIN_SAFE_INTEGER, keyFromQuery));
    }

    public static maxCallback(item: any, name: string, max: number, keyFromQuery: string): void {
        for (const a in item) {
            let course = item[a];
            if (course[keyFromQuery] > this.max) {
                this.max = course[keyFromQuery];
            }
        }
        let first = item[0];
        first[name] = this.max;
    }

    public static minApply(keyFromQuery: string, name: string, result: any): void {
        result.forEach((item: any) => ApplyFunctions.minCallback(item, name,
            ApplyFunctions.min = Number.MAX_SAFE_INTEGER, keyFromQuery));
    }

    public static minCallback(item: any, name: string, min: number, keyFromQuery: string): void {
        for (const a in item) {
            let course = item[a];
            if (course[keyFromQuery] < this.min) {
                this.min = course[keyFromQuery];
            }
        }
        let first = item[0];
        first[name] = this.min;
    }

    public static avgApply(keyFromQuery: string, name: string, result: any): any {
        result.forEach((item: any) => ApplyFunctions.avgCallback(item, name,
            ApplyFunctions.sumAvg = new Decimal(0), ApplyFunctions.numRows = 0, keyFromQuery));
    }

    public static avgCallback(item: any, name: string, sumAvg: Decimal, numRows: any, keyFromQuery: string): void {
        for (const a in item) {
            let course = item[a];
            let newVal2 = new Decimal(course[keyFromQuery]);
            this.sumAvg = Decimal.add(this.sumAvg, newVal2);
            this.numRows += 1;
        }
        let avg = this.sumAvg.toNumber() / this.numRows;
        let res = Number(avg.toFixed(2));
        let first = item[0];
        first[name] = res;
    }

    public static countApply(keyFromQuery: string, name: string, result: any): any {
        result.forEach((item: any) => ApplyFunctions.countCallback(item, name,
            ApplyFunctions.set = new Set(), keyFromQuery));
    }

    public static countCallback(item: any, name: string, set: Set<any>, keyFromQuery: string): void {
        for (const a in item) {
            let course = item[a];
            this.set.add(course[keyFromQuery]);
        }
        let first = item[0];
        first[name] = this.set.size;
    }

    public static sumApply(keyFromQuery: string, name: string, result: any): any {
        result.forEach((item: any) => ApplyFunctions.sumCallback(item, name,
            ApplyFunctions.sum = 0, keyFromQuery));
    }

    public static sumCallback(item: any, name: string, sum: number, keyFromQuery: string): void {
        for (const a in item) {
            let course = item[a];
            this.sum += course[keyFromQuery];
        }
        let first = item[0];
        first[name] = Number(this.sum.toFixed(2));
    }

    public static transformColumns(columnKeys: any, result: any): any[] {
        let array: any[] = [];
        result.forEach((item: any) => ApplyFunctions.columnCallback(item, columnKeys,
            ApplyFunctions.object = new Object(), array));
        return array;
    }

    public static columnCallback(item: any, columnKeys: any, object: object, array: any): any {
        let course = item[0];
        for (const a in columnKeys) {
            let key2: string = columnKeys[a];
            let field: any = course[key2];
            this.object[key2] = field;
        }
        array.push(this.object);
    }
}
