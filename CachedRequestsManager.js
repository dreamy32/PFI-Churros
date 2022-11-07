const utilities = require('./utilities');
let CachedRequestsExpirationTime = require("./serverVariables").get("requestscache.expirationTime");

// Get requests cache
global.CachedRequests = [];

class CachedRequestsManager {
    static add(url, content, ETag = "") {
        if (url != "") {
            CachedRequests.push({ url, content, ETag, Expire_Time: utilities.nowInSeconds() + CachedRequestsExpirationTime });
            log(BgCyan, FgWhite, "Response content of request Get: ", url, " added in requests cache");
        }
    }
    static find(url) {
        try {
            if (url != "") {
                for (let endpoint of CachedRequests) {
                    if (endpoint.url == url) {
                        // renew cached url
                        endpoint.Expire_Time = utilities.nowInSeconds() + CachedRequestsExpirationTime;
                        log(BgGreen, FgWhite, "Response content of request Get: ", url, " retreived from requests cache");
                        let content = endpoint.content;
                        let ETag = endpoint.ETag;
                        return { ETag, content };
                    }
                }
            }
        } catch (error) {
            console.log("requests cache error", error);
        }
        return null;
    }
    static clear(url) {
        if (url != "") {
            let indexToDelete = [];
            let index = 0;
            for (let endpoint of CachedRequests) {
                // target all entries related to the same APIendpoint url base
                if (endpoint.url.toLowerCase().indexOf(url.toLowerCase()) > -1)
                    indexToDelete.push(index);
                index++;
            }
            if (index > 0)
                utilities.deleteByIndex(CachedRequests, indexToDelete);
        }
    }
    static flushExpired() {
        let indexToDelete = [];
        let index = 0;
        let now = utilities.nowInSeconds();
        for (let endpoint of CachedRequests) {
            if (endpoint.Expire_Time < now) {
                log(BgYellow, FgBlack, "Cached response of request GET:", endpoint.url + " expired");
                indexToDelete.push(index);
            }
            index++;
        }
        utilities.deleteByIndex(CachedRequests, indexToDelete);
    }
    static get(HttpContext) {
        return new Promise(async (resolve) => {
            if (HttpContext.req.method == 'GET') {
                let cacheFound = CachedRequestsManager.find(HttpContext.req.url);
                if (cacheFound != null) {
                    HttpContext.response.JSON(cacheFound.content, cacheFound.ETag, true);
                    resolve(true);
                }
            }
            resolve(false);
        });
    }

}

// periodic cleaning of expired cached requests
setInterval(CachedRequestsManager.flushExpired, CachedRequestsExpirationTime * 1000);
log(BgWhite, FgBlack, "Periodic cached requests cleaning process started...");

module.exports = CachedRequestsManager;
