import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import * as fs from "fs-extra";

export default class AddCourse {
    public static courseAdd(zip: any, content: string, courseOut: any[],
                            id: string, files: string[]): Promise<string[]> {
        return new Promise((resolve, reject) => {
            zip.loadAsync(content, {base64: true}).then(() => {
                let list: any[] = [];
                zip.folder("courses").forEach((relativepath: string, file: any) => {
                    let inCourse = file.async("string");
                    list.push(inCourse);
                });
                Promise.all(list).then((data: any) => {
                    if (list.length <= 0) {
                        reject(new InsightError());
                    }
                    this.parseJSON(list, data, courseOut, id);
                    if (courseOut.length <= 0) {
                        reject(new InsightError());
                    }
                    let output = JSON.stringify(courseOut);
                    let path = "./data/" + id;
                    fs.writeFileSync(path, output);
                    files.push(id);
                    resolve(files);
                });
            });
        });
    }

    private static parseJSON(list: any[], data: any, courseOut: any[], id: string) {
        for (let i = 0; i < list.length; i++) {
            let currCourse;
            try {
                currCourse = JSON.parse(data[i]);
            } catch (e) {
                continue;
            }
            let sections = currCourse["result"];
            if (sections.length <= 0) {
                continue;
            }
            for (const each of sections) {
                courseOut.push(this.createCourse(id, each));
            }
        }
    }

    private static createCourse(id: string, course: any): any {
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
        out[uuid] = String(course["id"]);
        if (course["Section"] === "overall") {
            out[year] = 1900;
        } else {
            out[year] = Number(course["Year"]);
        }
        out[section] = course["Section"];
        out["kind"] = InsightDatasetKind.Courses;
        return out;
    }
}
