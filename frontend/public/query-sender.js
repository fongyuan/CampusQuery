/**
 * Receives a query object as parameter and sends it as Ajax request to the POST /query REST endpoint.
 *
 * @param query The query object
 * @returns {Promise} Promise that must be fulfilled if the Ajax request is successful and be rejected otherwise.
 */
CampusExplorer.sendQuery = (query) => {
    return new Promise((resolve, reject) => {
        let xmlreq = new XMLHttpRequest();
        xmlreq.open("POST", '/server', true);
        xmlreq.setRequestHeader("Content-Type", "application/json");
        xmlreq.send(JSON.stringify(query));
    });
};
