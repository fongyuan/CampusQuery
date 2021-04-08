import Server from "../src/rest/Server";

import InsightFacade from "../src/controller/InsightFacade";
import chai = require("chai");
import chaiHttp = require("chai-http");
import Response = ChaiHttp.Response;
import {expect} from "chai";
import Log from "../src/Util";

describe("Facade D3", function () {

    let facade: InsightFacade = null;
    let server: Server = null;

    chai.use(chaiHttp);

    before(function () {
        facade = new InsightFacade();
        server = new Server(4321);
        // TODO: start server here once and handle errors properly
    });

    after(function () {
        server.stop().then((p) => {
            Log.trace("message1");
        }).catch((err) => {
            Log.trace("message");
        });
        // TODO: stop server here once!
    });

    beforeEach(function () {
        // might want to add some process logging here to keep track of what"s going on
    });

    afterEach(function () {
        // might want to add some process logging here to keep track of what"s going on
    });

    // Sample on how to format PUT requests

    // it("PUT test for courses dataset", function () {
    //     try {
    //         return chai.request("http://localhost:4321/dataset/mycourses/courses")
    //             .put("dataset/mycourses/courses")
    //             .send("./test/data/courses")
    //             .set("Content-Type", "application/x-zip-compressed")
    //             .then(function (res: Response) {
    //                 // some logging here please!
    //                 expect(res.status).to.be.equal(204);
    //             })
    //             .catch(function (err) {
    //                 // some logging here please!
    //                 expect.fail();
    //             });
    //     } catch (err) {
    //         // and some more logging here!
    //     }
    // });


    // The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
