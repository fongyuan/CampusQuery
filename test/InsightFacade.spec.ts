import * as chai from "chai";
import { expect } from "chai";
import * as fs from "fs-extra";
import * as chaiAsPromised from "chai-as-promised";
import {
    InsightDataset,
    InsightDatasetKind,
    InsightError,
    NotFoundError as InsightNotFoundError,
} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
import Log from "../src/Util";
import TestUtil from "./TestUtil";
import { NotFoundError } from "restify";

// This extends chai with assertions that natively support Promises
chai.use(chaiAsPromised);

// This should match the schema given to TestUtil.validate(..) in TestUtil.readTestQueries(..)
// except 'filename' which is injected when the file is read.
export interface ITestQuery {
    title: string;
    query: any; // make any to allow testing structurally invalid queries
    isQueryValid: boolean;
    result: any;
    filename: string; // This is injected when reading the file
}
// test "class" -> test obj
describe("InsightFacade Add/Remove/List Dataset", function () {
    // Reference any datasets you've added to test/data here and they will
    // automatically be loaded in the 'before' hook.
    const datasetsToLoad: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
        wrongRoot: "./test/data/wrongRoot.zip",
        noJSON: "./test/data/noJSON.zip",
        someValid: "./test/data/someValid.zip",
        textOnly: "./test/data/textOnly.zip",
        oneJSON: "./test/data/oneJSON.zip",
        // notZip: "./test/data/notZip.txt",
        justOneSection: "./test/data/justOneSection.zip",
    };
    let datasets: { [id: string]: string } = {};
    let insightFacade: InsightFacade;
    const cacheDir = __dirname + "/../data";

    // run before test suite
    before(function () {
        // This section runs once and loads all datasets specified in the datasetsToLoad object
        // into the datasets object
        Log.test(`Before all`);
        if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir);
        }
        for (const id of Object.keys(datasetsToLoad)) {
            datasets[id] = fs
                .readFileSync(datasetsToLoad[id])
                .toString("base64");
        }
        try {
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });

    // runs b4 each unit test
    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);

    });

    afterEach(function () {
        // This section resets the data directory (removing any cached data) and resets the InsightFacade instance
        // This runs after each test, which should make each test independent from the previous one
        Log.test(`AfterTest: ${this.currentTest.title}`);
        try {
            fs.removeSync(cacheDir);
            fs.mkdirSync(cacheDir);
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });

    // This is a unit test. You should create more like this!
    it("Should add a valid dataset", function () {
        const id: string = "courses";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    // invalid id (just whitespace) dataset test
    it("Should reject because of invalid id of whitespace", function () {
        const id: string = "    ";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    // invalid id (with underscore) dataset test
    it("Should reject because of invalid id containing underscore", function () {
        const id: string = "class_average";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    // invalid id (undefined) dataset test
    it("Should reject because of invalid id of undefined", function () {
        const id: string = undefined;
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    // invalid id (null) dataset test
    it("Should reject because of invalid id of null", function () {
        const id: string = null;
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    // invalid kind
    it("Should reject because the kind is rooms, which is invalid", function () {
        const id: string = "courses";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Rooms,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    // id already in dataset
    it("Should reject because id is already in dataset", function () {
        let id: string = "courses";
        const expected: string[] = [id];
        let futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult)
            .to.eventually.deep.equal(expected)
            .then(() => {
                id = "courses";
                const futureResult2 = insightFacade.addDataset(
                    id,
                    datasets[id],
                    InsightDatasetKind.Courses,
                );
                return expect(futureResult2).to.be.rejectedWith(InsightError);
            });
    });

    // root directory "courses" does not exist
    it("Should reject because there's no courses root folder", function () {
        const id: string = "wrongRoot";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    // rejects dataset because it does not contain valid JSON course
    it("Should reject because there's no valid JSON course", function () {
        const id: string = "noJSON";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    // adds dataset because it has some valid courses but skips invalid
    it("Should add dataset because it has some valid courses but skips invalid", function () {
        const id: string = "someValid";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    // rejects because dataset has no JSON files, only text files
    it("Should reject because dataset has no JSON files, only text files", function () {
        const id: string = "textOnly";
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    // adds dataset because it has one valid JSON file, skips text files
    it("Should add dataset because it has some valid course but skips text files", function () {
        const id: string = "oneJSON";
        const expected: string[] = [id];
        const futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    // rejects because it is a text file not a zip file
    /*    it("Should reject because it is a text file not a zip file", function () {
            const id: string = "notZip";
            const futureResult: Promise<string[]> = insightFacade.addDataset(
                id,
                datasets[id],
                InsightDatasetKind.Courses,
            );
            return expect(futureResult).to.be.rejectedWith(InsightError);
        });*/

    // successfully removes a dataset
    it("Should remove a valid dataset", function () {
        let id: string = "courses";
        const expected: string[] = [id];
        let futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult)
            .to.eventually.deep.equal(expected)
            .then(() => {
                id = "courses";
                const expected2: string = "courses";
                const futureResult2: Promise<
                    string
                    > = insightFacade.removeDataset(id);
                return expect(futureResult2).to.eventually.deep.equal(
                    expected2,
                );
            });
    });

    // fails to remove a dataset because dataset with this id hasn't been added yet
    it("Should reject to remove dataset because it has not been added yet", function () {
        const id: string = "courses";
        const futureResult: Promise<string> = insightFacade.removeDataset(id);
        return expect(futureResult).to.be.rejectedWith(InsightNotFoundError);
    });

    // fails to remove a dataset because invalid id (whitespace only)
    it("Should reject to remove dataset because id is whitespace only", function () {
        const id: string = "   ";
        const futureResult: Promise<string> = insightFacade.removeDataset(id);
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    // fails to remove a dataset because invalid id (underscore)
    it("Should reject to remove dataset because id has underscore", function () {
        const id: string = "course_averages";
        const futureResult: Promise<string> = insightFacade.removeDataset(id);
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    // fails to remove a dataset because invalid id (undefined)
    it("Should reject to remove dataset because id of undefined", function () {
        const id: string = undefined;
        const futureResult: Promise<string> = insightFacade.removeDataset(id);
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    // fails to remove a dataset because invalid id (null)
    it("Should reject to remove dataset because id of null", function () {
        const id: string = null;
        const futureResult: Promise<string> = insightFacade.removeDataset(id);
        return expect(futureResult).to.be.rejectedWith(InsightError);
    });

    // successfully lists one dataset (numRows is 64612)
    it("Should list a valid dataset", function () {
        let id: string = "courses";
        const expected: string[] = [id];
        let futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult)
            .to.eventually.deep.equal(expected)
            .then(() => {
                const expected2: InsightDataset[] = [{
                    id: "courses",
                    kind: InsightDatasetKind.Courses,
                    numRows: 64612,
                }];
                const futureResult2: Promise<
                    InsightDataset[]
                    > = insightFacade.listDatasets();
                return expect(futureResult2).to.eventually.deep.equal(
                    expected2,
                );
            });
    });

    // lists no datasets because none have been added
    it("Should list no datasets", function () {
        const expected: InsightDataset[] = [];
        const futureResult: Promise<
            InsightDataset[]
            > = insightFacade.listDatasets();
        return expect(futureResult).to.eventually.deep.equal(expected);
    });

    // lists two datasets
    it("Should list two valid datasets", function () {
        let id: string = "courses";
        const expected: string[] = [id];
        let futureResult: Promise<string[]> = insightFacade.addDataset(
            id,
            datasets[id],
            InsightDatasetKind.Courses,
        );
        return expect(futureResult)
            .to.eventually.deep.equal(expected)
            .then(() => {
                let id2: string = "justOneSection";
                const expected2: string[] = [id, id2];
                let futureResult2: Promise<string[]> = insightFacade.addDataset(
                    id2,
                    datasets[id2],
                    InsightDatasetKind.Courses,
                );
                return expect(futureResult2)
                    .to.eventually.deep.equal(expected2)
                    .then(() => {
                        const expected3: InsightDataset[] = [];
                        let out1: InsightDataset = {
                            id: "courses",
                            kind: InsightDatasetKind.Courses,
                            numRows: 64612,
                        };
                        let out2: InsightDataset = {
                            id: "justOneSection",
                            kind: InsightDatasetKind.Courses,
                            numRows: 1,
                        };
                        expected3.push(out1);
                        expected3.push(out2);
                        const futureResult3: Promise<
                            InsightDataset[]
                            > = insightFacade.listDatasets();
                        return expect(futureResult3).to.eventually.deep.equal(
                            expected3,
                        );
                    });
            });
    });
});

/*
 * This test suite dynamically generates tests from the JSON files in test/queries.
 * You should not need to modify it; instead, add additional files to the queries directory.
 * You can still make tests the normal way, this is just a convenient tool for a majority of queries.
 */
describe("InsightFacade PerformQuery", () => {
    const datasetsToQuery: {
        [id: string]: { path: string; kind: InsightDatasetKind };
    } = {
        courses: {
            path: "./test/data/courses.zip",
            kind: InsightDatasetKind.Courses,
        },
    };
    let insightFacade: InsightFacade;
    let testQueries: ITestQuery[] = [];

    // Load all the test queries, and call addDataset on the insightFacade instance for all the datasets
    before(function () {
        Log.test(`Before: ${this.test.parent.title}`);

        // Load the query JSON files under test/queries.
        // Fail if there is a problem reading ANY query.
        try {
            testQueries = TestUtil.readTestQueries();
        } catch (err) {
            expect.fail(
                "",
                "",
                `Failed to read one or more test queries. ${err}`,
            );
        }

        // Load the datasets specified in datasetsToQuery and add them to InsightFacade.
        // Will fail* if there is a problem reading ANY dataset.
        const loadDatasetPromises: Array<Promise<string[]>> = [];
        insightFacade = new InsightFacade();
        for (const id of Object.keys(datasetsToQuery)) {
            const ds = datasetsToQuery[id];
            const data = fs.readFileSync(ds.path).toString("base64");
            loadDatasetPromises.push(
                insightFacade.addDataset(id, data, ds.kind),
            );
        }
        return Promise.all(loadDatasetPromises).catch((err) => {
            /* *IMPORTANT NOTE: This catch is to let this run even without the implemented addDataset,
             * for the purposes of seeing all your tests run.
             * TODO For C1, remove this catch block (but keep the Promise.all)
             */
            return Promise.resolve("HACK TO LET QUERIES RUN");
        });
    });

    beforeEach(function () {
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    after(function () {
        Log.test(`After: ${this.test.parent.title}`);
    });

    afterEach(function () {
        Log.test(`AfterTest: ${this.currentTest.title}`);
    });

    // Dynamically create and run a test for each query in testQueries
    // Creates an extra "test" called "Should run test queries" as a byproduct. Don't worry about it
    it("Should run test queries", function () {
        describe("Dynamic InsightFacade PerformQuery tests", function () {
            for (const test of testQueries) {
                it(`[${test.filename}] ${test.title}`, function () {
                    const futureResult: Promise<
                        any[]
                        > = insightFacade.performQuery(test.query);
                    return TestUtil.verifyQueryResult(futureResult, test);
                });
            }
        });
    });
});
