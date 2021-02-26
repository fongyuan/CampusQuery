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

    private createCourse(id: string, course: any): any {
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
        let out: any = {};
        out[dept] = course["Subject"];
        out[cid] = course["Course"];
        out[avg] = course["Avg"];
        out[instructor] = course["Professor"];
        out[title] = course["Title"];
        out[pass] = course["Pass"];
        out[fail] = course["Fail"];
        out[audit] = course["Audit"];
        out[uuid] = course["id"];
        if (course["Section"] === "overall") {
            out[year] = 1990;
        } else {
            out[year] = course["Year"];
        }
        out[section] = course["Section"];
        return out;
    }

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
        return zip.loadAsync(content, {base64: true}).then(() => {
            if (zip.folder(/courses/).length === 0) {
                return Promise.reject(new InsightError());
            }
            let list: any[] = [];
            zip.folder("courses").forEach((relativepath: string, file: any) => {
                let inCourse = file.async("string");
                list.push(inCourse);
            });
            Promise.all(list).then((data: any) => {
                for (let i = 0; i < list.length; i++) {
                    let currCourse = JSON.parse(data[i]);
                    let sections = currCourse["result"];
                    if (sections.length <= 0) {
                        continue;
                    }
                    for (const each of sections) {
                        courseOut.push(this.createCourse(id, each));
                    }
                }
                let output = JSON.stringify(courseOut);
                let path = "./data/" + id;
                fs.writeFile(path, output, (err: any) => {
                    if (err) {
                        throw err;
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
