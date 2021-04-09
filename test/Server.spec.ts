import Server from "../src/rest/Server";

import InsightFacade from "../src/controller/InsightFacade";
import chai = require("chai");
import chaiHttp = require("chai-http");
import Response = ChaiHttp.Response;
import {expect} from "chai";
import * as fs from "fs-extra";
import Log from "../src/Util";
import TestUtil from "./TestUtil";
import {ITestQuery} from "./InsightFacade.spec";

describe("Facade D3", function () {

    const datasetsToLoad: { [id: string]: string } = {
        courses: "./test/data/courses.zip",
        rooms: "./test/data/rooms.zip",
        noIndex: "./test/data/noIndex.zip",
        missingBuilding: "./test/data/missingBuilding.zip",
        badGeo: "./test/data/badGeo.zip",
        wrongRoot: "./test/data/wrongRoot.zip",
        noJSON: "./test/data/noJSON.zip",
        someValid: "./test/data/someValid.zip",
        textOnly: "./test/data/textOnly.zip",
        oneJSON: "./test/data/oneJSON.zip",
        // notZip: "./test/data/notZip.txt",
        justOneSection: "./test/data/justOneSection.zip",
    };

    let facade: InsightFacade = null;
    let server: Server = null;
    let datasets: { [id: string]: string } = {};
    let insightFacade: InsightFacade;
    const cacheDir = __dirname + "/../data";

    chai.use(chaiHttp);

    before(function () {
        facade = new InsightFacade();
        server = new Server(4321);
        // TODO: start server here once and handle errors properly
        server.start();
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

    after(function () {
        // TODO: stop server here once!
        server.stop();
    });

    beforeEach(function () {
        // might want to add some process logging here to keep track of what"s going on
        Log.test(`BeforeTest: ${this.currentTest.title}`);
    });

    afterEach(function () {
        // might want to add some process logging here to keep track of what"s going on
        Log.test(`AfterTest: ${this.currentTest.title}`);
        try {
            fs.removeSync(cacheDir);
            fs.mkdirSync(cacheDir);
            insightFacade = new InsightFacade();
        } catch (err) {
            Log.error(err);
        }
    });

    // Sample on how to format PUT requests
    it("PUT test for courses dataset", function () {
        let inFile = fs.readFileSync("./test/data/courses.zip");
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/courses")
                .send(inFile)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    Log.trace("should succeed");
                    expect(res.status).to.be.equal(200);
                })
                .catch(function (err) {
                    // some logging here please!
                    Log.trace(err);
                    Log.trace("should not be here");
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
        }
    });

    it("PUT test courses, invalid dataset", function () {
        let inFile = fs.readFileSync("./test/data/wrongRoot.zip");
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/wrongRoot/courses")
                .send(inFile)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    Log.trace("should not be here");
                    expect(res.status).to.be.equal(200);
                })
                .catch(function (err) {
                    // some logging here please!
                    Log.trace("should be here");
                    expect(err.status).to.be.equal(400);
                });
        } catch (err) {
            // and some more logging here!
        }
    });

    it("PUT test for rooms dataset", function () {
        let inFile = fs.readFileSync("./test/data/rooms.zip");
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/rooms/rooms")
                .send(inFile)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    Log.trace("should succeed");
                    expect(res.status).to.be.equal(200);
                })
                .catch(function (err) {
                    // some logging here please!
                    Log.trace(err);
                    Log.trace("should not be here");
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
        }
    });

    it("DELETE test for courses", function () {
        let inFile = fs.readFileSync("./test/data/courses.zip");
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/courses")
                .send(inFile)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    Log.trace("should succeed dataset add");
                    try {
                        return chai.request("http://localhost:4321")
                            .del("/dataset/courses")
                            .then(function (res2: Response) {
                                Log.trace("should succeed delete");
                                expect(res2.status).to.be.equal(200);
                            })
                            .catch(function (err) {
                                Log.trace(err);
                                Log.trace("should not be here");
                                expect.fail();
                            });
                    } catch (err) {
                        // and some more logging here!
                    }
                })
                .catch(function (err) {
                    // some logging here please!
                    Log.trace(err);
                    Log.trace("should not be here");
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
        }
    });

    it("DELETE test for courses insight error", function () {
        try {
            return chai.request("http://localhost:4321")
                .del("/dataset/courses_fail")
                .then(function (res2: Response) {
                    Log.trace("should not be here");
                    expect.fail();
                })
                .catch(function (err) {
                    Log.trace("should be here");
                    expect(err.status).to.be.equal(400);
                });
        } catch (err) {
            // and some more logging here!
        }
    });

    it("DELETE test for courses not found error", function () {
        try {
            return chai.request("http://localhost:4321")
                .del("/dataset/courses")
                .then(function (res2: Response) {
                    Log.trace("should not be here");
                    expect.fail();
                })
                .catch(function (err) {
                    Log.trace("should be here");
                    expect(err.status).to.be.equal(404);
                });
        } catch (err) {
            // and some more logging here!
        }
    });

    it("POST test for courses", function () {
        let inFile = fs.readFileSync("./test/data/courses.zip");
        let inQuery = fs.readFileSync("./test/queries/simple2.json");
        let query = JSON.parse(inQuery.toString());
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/courses")
                .send(inFile)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    Log.trace("should succeed dataset add");
                    try {
                        return chai.request("http://localhost:4321")
                            .post("/query")
                            .send(query)
                            .then(function (res2: Response) {
                                Log.trace("should succeed delete");
                                expect(res2.status).to.be.equal(200);
                            })
                            .catch(function (err) {
                                Log.trace(err);
                                Log.trace("should not be here");
                                expect.fail();
                            });
                    } catch (err) {
                        // and some more logging here!
                    }
                })
                .catch(function (err) {
                    // some logging here please!
                    Log.trace(err);
                    Log.trace("should not be here");
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
        }
    });

    it("POST test for courses invalid query", function () {
        let inFile = fs.readFileSync("./test/data/courses.zip");
        let inQuery = fs.readFileSync("./test/queries/invalid.json");
        let query = JSON.parse(inQuery.toString());
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/courses")
                .send(inFile)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    Log.trace("should succeed dataset add");
                    try {
                        return chai.request("http://localhost:4321")
                            .post("/query")
                            .send(query)
                            .then(function (res2: Response) {
                                Log.trace("should not be here");
                                expect.fail();
                            })
                            .catch(function (err) {
                                Log.trace("should be here query");
                                expect(err.status).to.be.equal(400);
                            });
                    } catch (err) {
                        // and some more logging here!
                    }
                })
                .catch(function (err) {
                    // some logging here please!
                    Log.trace(err);
                    Log.trace("should not be here");
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
        }
    });

    it("GET test for courses", function () {
        let inFile = fs.readFileSync("./test/data/courses.zip");
        try {
            return chai.request("http://localhost:4321")
                .put("/dataset/courses/courses")
                .send(inFile)
                .set("Content-Type", "application/x-zip-compressed")
                .then(function (res: Response) {
                    // some logging here please!
                    Log.trace("should succeed dataset add");
                    try {
                        return chai.request("http://localhost:4321")
                            .get("/datasets")
                            .then(function (res2: Response) {
                                Log.trace("should succeed GET");
                                expect(res2.status).to.be.equal(200);
                            })
                            .catch(function (err) {
                                Log.trace(err);
                                Log.trace("should not be here for list dataset");
                                expect.fail();
                            });
                    } catch (err) {
                        // and some more logging here!
                    }
                })
                .catch(function (err) {
                    // some logging here please!
                    Log.trace(err);
                    Log.trace("should not be here for add dataset");
                    expect.fail();
                });
        } catch (err) {
            // and some more logging here!
        }
    });
    // The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
