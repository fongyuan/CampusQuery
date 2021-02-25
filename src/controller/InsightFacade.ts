import Log from "../Util";
import {
    IInsightFacade,
    InsightDataset,
    InsightDatasetKind,
} from "./IInsightFacade";
import { InsightError, NotFoundError } from "./IInsightFacade";
import * as JSZip from "jszip";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }
    private idValidation(id: string): boolean {
        if (id === undefined) {
            return false;
        }
        if (id === null) {
            return false;
        }
        if (id === "") {
            return false;
        }
        if (/\s/.test(id)) {
            return false;
        }
        if (/\_/.test(id)) {
            return false;
        }
        return true;
    }

    // eslint-disable-next-line @typescript-eslint/tslint/config
    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        let zip = new JSZip();
        let courseOut: any[] = [];
        if (kind !== InsightDatasetKind.Courses) {
            return Promise.reject(new InsightError());
        }
        let fs = require("fs");
        let files = fs.readdirSync("./data");
        if (files.includes(id)) {
            return Promise.reject(new InsightError());
        }
        if (!this.idValidation(id)) {
            return Promise.reject(new InsightError());
        }
        // eslint-disable-next-line @typescript-eslint/tslint/config
        return zip.loadAsync(content, {base64: true}).then(() => {
            if (zip.folder(/courses/).length === 0) {
                return Promise.reject(new InsightError());
            }
            let list: any[] = [];
            zip.folder("courses").forEach(function (relativepath: string, file: any) {
                let inCourse = file.async("string");
                list.push(inCourse);
            });
            Promise.all(list).then(function (data: any) {
                let dept = id + "_dept";
                let cid = id + "_id";
                let avg = id + "_avg";
                let instructor = id + "_instructor";
                let title = id + "_title";
                let pass = id + "_pass";
                let fail = id + "_fail";
                let audit = id + "_audit";
                let uuid = id + "_uuid";
                let year = id + "_year";
                let section = id + "_section";
                for (let i = 0; i < list.length; i++) {
                    let currCourse = JSON.parse(data[i]);
                    let sections = currCourse["result"];
                    if (sections.length <= 0) {
                        continue;
                    }
                    for (const each of sections) {
                        let out: any = {};
                        out[dept] = each["Subject"];
                        out[cid] = each["Course"];
                        out[avg] = each["Avg"];
                        out[instructor] = each["Professor"];
                        out[title] = each["Title"];
                        out[pass] = each["Pass"];
                        out[fail] = each["Fail"];
                        out[audit] = each["Audit"];
                        out[uuid] = each["id"];
                        if (each["Section"] === "overall") {
                            out[year] = 1990;
                        } else {
                            out[year] = each["Year"];
                        }
                        out[section] = each["Section"];
                        courseOut.push(out);
                    }
                }
                let output = JSON.stringify(courseOut);
                let path = "./data/" + id;
                fs.writeFile(path, output, (err: any) => {
                    if (err) {
                        // eslint-disable-next-line no-console
                        console.log(err);
                    }
                });
            });
            files.push(id);
            return Promise.resolve(files);
        });
        // return Promise.reject("Not implemented.");
    }

    public removeDataset(id: string): Promise<string> {
        return Promise.reject("Not implemented.");
    }

    public performQuery(query: any): Promise<any[]> {
        return Promise.reject("Not implemented.");
    }

    public listDatasets(): Promise<InsightDataset[]> {
        return Promise.reject("Not implemented.");
    }
}
