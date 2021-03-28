import {InsightDatasetKind, InsightError} from "./IInsightFacade";
import * as fs from "fs-extra";

const teamURL = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team160/";
export default class AddRoom {
    public static roomAdd(zip: any, content: string, roomOut: any[], id: string, files: string[]): Promise<string[]> {
        const parse5 = require("parse5");
        let buildings: any;
        let urlList: any[] = [];
        let roomsPromise: any[] = [];
        let roomsHTML: any[] = [];
        return new Promise((resolve, reject) => {
            zip.loadAsync(content, {base64: true}).then(() => {
                zip.folder("rooms").file("index.htm").async("string").then((data: any) => {
                    let index = parse5.parse(data);
                    buildings = this.findBuildingsHelper(index, id);
                    urlList = this.getUrlList(buildings);
                    return;
                }).then(() => {
                    let list: any[] = [];
                    for (let url of urlList) {
                        let promise = new Promise((resolve2, reject2) => {
                            this.getGeo(url, resolve2, reject2);
                        });
                        list.push(promise);
                    }
                    // from https://stackoverflow.com/questions/36759061/how-to-chain-a-promise-all-with-other-promises
                    return Promise.all(list).then((data: any) => {
                        for (let i = 0; i < buildings.length; i++) {
                            buildings[i]["lat"] = data[i]["lat"];
                            buildings[i]["lon"] = data[i]["lon"];
                        }
                    });
                }).then(() => {
                    for (let building of buildings) {
                        let path = "rooms/campus/discover/buildings-and-classrooms/";
                        let sn = id + "_shortname";
                        let load = zip.folder(path).file(building[sn]).async("string").then((data: any) => {
                            roomsHTML.push(data);
                        });
                        roomsPromise.push(load);
                    }
                    Promise.all(roomsPromise).then(() => {
                        let roomsOut = this.createRoomsOut(id, roomsHTML, buildings);
                        if (roomsOut.length <= 0) {
                            reject(new InsightError());
                        }
                        this.writeToDisk(roomsOut, id);
                        files.push(id);
                        resolve(files);
                    });
                });
            });
        });
    }

    private static writeToDisk(roomsOut: any, id: string) {
        let output = JSON.stringify(roomsOut);
        let path = "./data/" + id;
        fs.writeFileSync(path, output);
    }

    private static createRoomsOut(id: string, roomsHTML: any, buildings: any): any {
        const parse5 = require("parse5");
        let roomsOut: any[] = [];
        for (let building = 0; building < roomsHTML.length; building++) {
            if (buildings[building]["lat"] === undefined) {
                continue;
            }
            let rooms = parse5.parse(roomsHTML[building]);
            let roomList = this.findRoomInfoHelper(rooms, id, buildings[building]);
            if (roomList !== -1) {
                roomsOut = roomsOut.concat(roomList);
            }
        }
        return roomsOut;
    }

    private static getGeo(url: any, resolve2: (value?: unknown) => void, reject2: (reason?: any) => void) {
        const http = require("http");
        // from https://nodejs.org/api/http.html#http_http_get_options_callback
        http.get(url, (res: any) => {
            let rawData = "";
            res.on("data", (chunk: any) => {
                rawData += chunk;
            });
            res.on("end", () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    resolve2(parsedData);
                } catch (e) {
                    reject2(new InsightError());
                }
            });
        });
    }

    private static getUrlList(buildings: any): any {
        let urlList: any[] = [];
        for (let building of buildings) {
            let addr = building["rooms_address"].replace(/ /g, "%20");
            let url = teamURL + addr;
            urlList.push(url);
        }
        return urlList;
    }

    private static findRoomInfoHelper(element: any, id: string, building: any): any {
        if (element.nodeName === "tbody") {
            return this.findRoom(element, id, building);
        }
        // from c2:Intro to HTML parsing https://www.youtube.com/watch?v=pL7-618Vlq8
        if (element.childNodes && element.childNodes.length > 0) {
            for (let child of element.childNodes) {
                let recur = this.findRoomInfoHelper(child, id, building);
                if (recur !== -1) {
                    return recur;
                }
            }
        }
        return -1;
    }

    private static createRoom(id: string, rnum: string, cap: number, furn: string,
                              rtype: string, rhref: string, b: any): any {
        let fullname = id + "_fullname";
        let shortname = id + "_shortname";
        let rnumber = id + "_number";
        let roomname = id + "_name";
        let address = id + "_address";
        let lat = id + "_lat";
        let lon = id + "_lon";
        let seats = id + "_seats";
        let type = id + "_type";
        let furniture = id + "_furniture";
        let href = id + "_href";
        let out: any = {};
        out[fullname] = b[fullname];
        out[shortname] = b[shortname];
        out[rnumber] = rnum;
        out[roomname] = b[shortname] + "_" + rnum;
        out[address] = b[address];
        out[lat] = b["lat"];
        out[lon] = b["lon"];
        out[seats] = Number(cap);
        out[type] = rtype;
        out[furniture] = furn;
        out[href] = rhref;
        out["kind"] = InsightDatasetKind.Rooms;
        return out;
    }

    private static findRoom(element: any, id: string, building: any): any {
        let roomList: any[] = [];
        let roomNum = "";
        let roomCap = 0;
        let roomFurn = "";
        let roomType = "";
        let href = "";
        for (let tr of element.childNodes) {
            if (tr.nodeName === "#text") {
                continue;
            }
            for (let td = 0; td < tr.childNodes.length; td++) {
                if (td === 1) {
                    roomNum = tr.childNodes[td].childNodes[1].childNodes[0].value;
                } else if (td === 3) {
                    roomCap  = tr.childNodes[td].childNodes[0].value.trim();
                } else if (td === 5) {
                    roomFurn  = tr.childNodes[td].childNodes[0].value.trim();
                } else if (td === 7) {
                    roomType  = tr.childNodes[td].childNodes[0].value.trim();
                } else if (td === 9) {
                    href  = tr.childNodes[td].childNodes[1].attrs[0].value;
                }
            }
            let room = this.createRoom(id, roomNum, roomCap, roomFurn, roomType, href, building);
            roomList.push(room);
        }
        return roomList;
    }

    private static findBuildingsHelper(element: any, id: string): any {
        if (element.nodeName === "tbody") {
            return this.findBuildings(element, id);
        }
        // from c2:Intro to HTML parsing https://www.youtube.com/watch?v=pL7-618Vlq8
        if (element.childNodes && element.childNodes.length > 0) {
            for (let child of element.childNodes) {
                let recur = this.findBuildingsHelper(child, id);
                if (recur !== -1) {
                    return recur;
                }
            }
        }
        return -1;
    }

    private static findBuildings(element: any, id: string): any {
        let buildings: any[] = [];
        let fullname = id + "_fullname";
        let shortname = id + "_shortname";
        let address = id + "_address";
        for (let tr of element.childNodes) {
            if (tr.nodeName === "#text") {
                continue;
            }
            let building: any = {};
            for (let td = 0; td < tr.childNodes.length; td++) {
                if (td === 3) {
                    building[shortname] = tr.childNodes[td].childNodes[0].value.trim();
                } else if (td === 5) {
                    building[fullname] = tr.childNodes[td].childNodes[1].childNodes[0].value.trim();
                } else if (td === 7) {
                    building[address] = tr.childNodes[td].childNodes[0].value.trim();
                }
            }
            buildings.push(building);
        }
        return buildings;
    }
}
