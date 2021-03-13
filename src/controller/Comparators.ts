export default class Comparators {
    public static andCombine(arr1: any, arr2: any): any[] {
        if (arr1.length > arr2.length) {
            const testC = arr2.filter((value: any) => arr1.includes(value));
            return testC;
        } else {
            const testC = arr1.filter((value: any) => arr2.includes(value));
            return testC;
        }
    }

    public static orCombine(arr1: any, arr2: any): any {
        if (arr1.length > arr2.length) {
            const testC = arr2.concat(arr1.filter((value: any) => arr2.indexOf(value) < 0));
            return testC;
        } else {
            const testC = arr1.concat(arr2.filter((value: any) => arr1.indexOf(value) < 0));
            return testC;
        }
    }

    public static greater(temp: any, idKey: string, field: any): any[] {
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

    public static lessThan(temp: any, idKey: string, field: any): any[] {
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

    public static equalTo(temp: any, idKey: string, field: any): any[] {
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

    public static sCompare(temp: any, idKey: string, field: any): any[] {
        let s = this;
        let first = field.charAt(0);
        let last = field.charAt(field.length - 1);
        if (field.length === 1 && /\*/.test(field) || field.length === 2 && /\*\*/.test(field)) {
            return temp;
        }
        if (/\*/.test(first) && !(/\*/.test(last))) {
            let newField = field.substring(1, field.length);
            return s.endsWith(temp, idKey, newField);
        }
        if (!(/\*/.test(first)) && /\*/.test(last)) {
            let newField = field.substring(0, field.length - 1);
            return s.startsWith(temp, idKey, newField);
        }
        if (/\*/.test(first) && /\*/.test(first)) {
            let newField = field.substring(1, field.length - 1);
            return s.containsIt(temp, idKey, newField);
        }
        if (!(/\*/.test(first)) && !(/\*/.test(last))) {
            return s.noWild(temp, idKey, field);
        }
    }

    public static endsWith(temp: any, idKey: string, field: any): any[] {
        let toAdd: any[] = [];
        for (const a in temp) {
            let obj = temp[a];   // {}
            Object.keys(obj).forEach(function (key) {
                if (key === idKey) {
                    if (obj[key].endsWith(field)) {
                        toAdd.push(obj);
                    }
                }
            });
        }
        return toAdd;
    }

    public static startsWith(temp: any, idKey: string, field: any): any[] {
        let toAdd: any[] = [];
        for (const a in temp) {
            let obj = temp[a];   // {}
            Object.keys(obj).forEach(function (key) {
                if (key === idKey) {
                    if (obj[key].startsWith(field)) {
                        toAdd.push(obj);
                    }
                }
            });
        }
        return toAdd;
    }

    public static containsIt(temp: any, idKey: string, field: any): any[] {
        let toAdd: any[] = [];
        for (const a in temp) {
            let obj = temp[a];   // {}
            Object.keys(obj).forEach(function (key) {
                if (key === idKey) {
                    if (obj[key].includes(field)) {
                        toAdd.push(obj);
                    }
                }
            });
        }
        return toAdd;
    }

    public static noWild(temp: any, idKey: string, field: any): any[] {
        let toAdd: any[] = [];
        for (const a in temp) {
            let obj = temp[a];
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

    public static negate(temp: any, array: any[]): any[] {
        const testC = temp.filter((value: any) => !array.includes(value));
        return testC;
    }
}
