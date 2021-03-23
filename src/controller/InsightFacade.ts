import Log from "../Util";
import {
    IInsightFacade,
    InsightDataset,
    InsightDatasetKind,
    InsightError,
    NotFoundError
} from "./IInsightFacade";
import * as JSZip from "jszip";
import * as fs from "fs-extra";
import Validity from "./Validity";
import ExecuteQ from "./ExecuteQ";
import AddCourse from "./AddCourse";
import AddRoom from "./AddRoom";
/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
    private idArray: Promise<string[]>;
    private promiseArray: string[][];
    constructor() {
        Log.trace("InsightFacadeImpl::init()");
    }

    public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
        let zip = new JSZip();
        let courseOut: any[] = [];
        let roomOut: any[] = [];
        if (!this.checkKind(kind)) {
            return Promise.reject(new InsightError());
        }
        let files = fs.readdirSync("./data");
        if (files.includes(id)) {
            return Promise.reject(new InsightError());
        }
        if (!this.idValidation(id)) {
            return Promise.reject(new InsightError());
        }
        if (kind === InsightDatasetKind.Courses) {
            return AddCourse.courseAdd(zip, content, courseOut, id, files);
        } else {
            return AddRoom.roomAdd(zip, content, roomOut, id, files);
        }
    }

    private checkKind(kind: InsightDatasetKind) {
        if (kind === InsightDatasetKind.Courses || kind === InsightDatasetKind.Rooms) {
            return true;
        }
        return false;
    }

    public removeDataset(id: string): Promise<string> {
        if (!this.idValidation(id)) {
            return Promise.reject(new InsightError());
        }
        // let fs = require("fs");
        let files = fs.readdirSync("./data");
        if (!files.includes(id)) {
            return Promise.reject(new NotFoundError());
        }
        let path = "./data/" + id;
        try {
            fs.unlinkSync(path);
        } catch (err) {
            // Log.error(err);
            return Promise.reject(new InsightError());
        }
        return Promise.resolve(id);
    }

    public performQuery(query: any): Promise<any[]> {
        if (!Validity.isValid(query)) {
            return Promise.reject(new InsightError());
        }
        return ExecuteQ.execute(query);
    }

    public listDatasets(): Promise<InsightDataset[]> {
        let files = fs.readdirSync("./data");
        let list: any[] = [];
        let out: InsightDataset[] = [];
        return new Promise((resolve, reject) => {
            for (const each of files) {
                let path = "./data/" + each;
                let infs = fs.readFileSync(path, "utf-8");
                let temp = JSON.parse(infs.toString());
                list.push(temp);
                let insightOut: InsightDataset = {id: "", numRows: 0, kind: InsightDatasetKind.Courses};
                insightOut.id = each;
                insightOut.numRows = temp.length;
                out.push(insightOut);
            }
            resolve(out);
        });
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
}
