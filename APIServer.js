/////////////////////////////////////////////////////////////////////
// This module define the APIServer class. It hold all the
// functionalities to serve a RestFull API web service repecting
// the MVC application architecture.
/////////////////////////////////////////////////////////////////////
// Author : Nicolas Chourot
// Lionel-Groulx College
/////////////////////////////////////////////////////////////////////

const HttpContext = require('./httpContext');
module.exports =
    class APIServer {
        constructor(port = process.env.PORT || 5000) {
            this.port = port;
            this.initMiddlewaresPipeline(); 
            this.accountsRouteConfig();
            this.httpContext = null;
            this.httpServer = require('http').createServer(async (req, res) => { this.handleHttpResquest(req, res) });
        }
        static accessControlConfig(res) {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', '*');
            res.setHeader('Access-Control-Allow-Headers', '*');
            res.setHeader('Access-Control-Expose-Headers', '*');
        }
        accountsRouteConfig() {
            const RouteRegister = require('./routeRegister');
            RouteRegister.add('GET', 'accounts');
            RouteRegister.add('POST', 'accounts', 'register');
            RouteRegister.add('GET', 'accounts', 'verify');
            RouteRegister.add('GET', 'accounts', 'logout');
            RouteRegister.add('PUT', 'accounts', 'modify');
            RouteRegister.add('GET', 'accounts', 'remove');
        }
        static CORS_Prefligth(HttpContext) {
            APIServer.accessControlConfig(HttpContext.res);
            return new Promise(async (resolve) => {
                if (HttpContext.req.method === 'OPTIONS') {
                    log('CORS preflight verifications');
                    HttpContext.response.end();
                    resolve(true);
                }
                resolve(false);
            });
        }
        initMiddlewaresPipeline() {
            const staticResourceServer = require('./staticRessourcesServer');
            const MiddlewaresPipeline = require('./middlewaresPipeline');
            this.middlewaresPipeline = new MiddlewaresPipeline();

            // common middlewares
            this.middlewaresPipeline.add(APIServer.CORS_Prefligth);
            this.middlewaresPipeline.add(staticResourceServer.sendRequestedRessource);

            // API middlewares
            const router = require('./router');
            const CachedRequestsManager = require('./CachedRequestsManager');
            this.middlewaresPipeline.add(CachedRequestsManager.get);
            this.middlewaresPipeline.add(router.TOKEN_EndPoint);
            this.middlewaresPipeline.add(router.Registered_EndPoint);
            this.middlewaresPipeline.add(router.List_EndPoints);
            this.middlewaresPipeline.add(router.API_EndPoint);
        }
        async handleHttpResquest(req, res) {
            this.markRequestProcessStartTime();
            this.httpContext = await HttpContext.create(req, res);
            this.showShortRequestInfo();
            if (!(await this.middlewaresPipeline.handleHttpRequest(this.httpContext)))
                this.httpContext.response.notFound();
            if (this.httpContext.req.method != "HEAD")
                this.showRequestProcessTime();
            //this.showMemoryUsage();
        }
        start() {
            this.httpServer.listen(this.port, () => { this.startupMessage() });
        }
        startupMessage() {
            log(FgGreen, "**********************************");
            log(FgGreen, "* API SERVER - version beta      *");
            log(FgGreen, "**********************************");
            log(FgGreen, "* Author: Nicolas Chourot        *");
            log(FgGreen, "* Lionel-Groulx College          *");
            log(FgGreen, "* Release date: august 30 2022   *");
            log(FgGreen, "**********************************");
            log(FgWhite, BgGreen, `HTTP Server running on port ${this.port}...`);
            this.showMemoryUsage();
        }
        showRequestInfo() {
            let time = require('date-and-time').format(new Date(), 'YYYY MMMM DD - HH:mm:ss');
            log(FgGreen, '<-------------------------', time, '-------------------------');
            log(FgGreen, Bright, `Request --> [${this.httpContext.req.method}::${this.httpContext.req.url}]`);
            log("User agent ", this.httpContext.req.headers["user-agent"]);
            log("Host ", this.httpContext.hostIp.substring(0, 15), "::", this.httpContext.host);
            if (this.httpContext.payload)
                log("Request payload ", JSON.stringify(this.httpContext.payload).substring(0, 127) + "...");
        }
        showShortRequestInfo() {
            if (this.httpContext.req.method != "HEAD") {
                log(FgGreen, Bright, `Request --> [${this.httpContext.req.method}::${this.httpContext.req.url}]`);
                if (this.httpContext.payload)
                    log("Request payload ", JSON.stringify(this.httpContext.payload).substring(0, 127) + "...");
            }
        }
        markRequestProcessStartTime() {
            this.requestProcessStartTime = process.hrtime();
        }
        showRequestProcessTime() {
            let requestProcessEndTime = process.hrtime(this.requestProcessStartTime);
            log(FgCyan, "Response time: ", Math.round((requestProcessEndTime[0] * 1000 + requestProcessEndTime[1] / 1000000) / 1000 * 10000) / 10000, "seconds");
        }
        showMemoryUsage() {
            // for more info https://www.valentinog.com/blog/node-usage/
            const used = process.memoryUsage();
            log(FgMagenta, "Memory usage: ", "RSet size:", Math.round(used.rss / 1024 / 1024 * 100) / 100, "Mb |",
                "Heap size:", Math.round(used.heapTotal / 1024 / 1024 * 100) / 100, "Mb |",
                "Used size:", Math.round(used.heapUsed / 1024 / 1024 * 100) / 100, "Mb");
        }
    }