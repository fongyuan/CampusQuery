import ExecuteQ from "./ExecuteQ";

export default class Sort {
    public static upObjectSort(n: any, m: any) {
        let qq = ExecuteQ.queryQ;
        let qq2 = qq.OPTIONS.ORDER.keys.valueOf();
        let a = 0;
        let n2 = n[qq2[a]];
        let m2 = m[qq2[a]];
        if (n2 === m2) {
            if (a < (qq2.length - 1)) {
                return Sort.recurseUpObjectSort(n, m, a + 1);
            } else {
                return 0;
            }
        } else {
            return n2 < m2 ? -1 : 1;
        }
    }

    public static recurseUpObjectSort(n: any, m: any, a: any) {
        let qq = ExecuteQ.queryQ;
        let qq2 = qq.OPTIONS.ORDER.keys.valueOf();
        let n2 = n[qq2[a]];
        let m2 = m[qq2[a]];
        if (n2 === m2) {
            if (a < (qq2.length - 1)) {
                Sort.recurseUpObjectSort(n, m, a + 1);
            } else {
                return 0;
            }
        } else {
            return n2 < m2 ? -1 : 1;
        }
    }

    public static downObjectSort(n: any, m: any) {
        let qq = ExecuteQ.queryQ;
        let qq2 = qq.OPTIONS.ORDER.keys.valueOf();
        let a = 0;
        let n2 = n[qq2[a]];
        let m2 = m[qq2[a]];
        if (n2 === m2) {
            if (a < (qq2.length - 1)) {
                return Sort.recurseDownObjectSort(n, m, a + 1);
            } else {
                return 0;
            }
        } else {
            return n2 > m2 ? -1 : 1;
        }
    }

    public static recurseDownObjectSort(n: any, m: any, a: any) {
        let qq = ExecuteQ.queryQ;
        let qq2 = qq.OPTIONS.ORDER.keys.valueOf();
        let n2 = n[qq2[a]];
        let m2 = m[qq2[a]];
        if (n2 === m2) {
            if (a < (qq2.length - 1)) {
                Sort.recurseDownObjectSort(n, m, a + 1);
            } else {
                return 0;
            }
        } else {
            return n2 > m2 ? -1 : 1;
        }
    }
}
