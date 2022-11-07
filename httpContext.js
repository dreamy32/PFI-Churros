/////////////////////////////////////////////////////////////////////
// This module define the HttpContext class
// When the server receive a http request an instance of the 
// HttpContext is created and will hold all information of the
// request also the payload if the verb is GET or PUT
/////////////////////////////////////////////////////////////////////
// Author : Nicolas Chourot
// Lionel-Groulx College
/////////////////////////////////////////////////////////////////////

const queryString = require("query-string");
const Response = require('./response');
const utilities = require('./utilities.js');
let httpContext = null;
module.exports =
    class HttpContext {
        constructor(req, res) {
            this.req = req;
            this.res = res;
            this.path = utilities.decomposePath(req.url);
            this.secure = req.headers['x-forwarded-proto'] != undefined;
            this.host = (this.secure ? "https://" : "http://") + req.headers["host"];
            this.hostIp = req.headers['x-forwarded-for'] != undefined ? req.headers['x-forwarded-for'] : "127.0.0.1";
            this.response = new Response(this);
            this.payload = null;
            httpContext = this;
        }
        static get() { return httpContext; }
        getJSONPayload() {
            return new Promise(resolve => {
                let body = [];
                this.req.on('data', chunk => {
                    body.push(chunk);
                }).on('end', () => {
                    if (body.length > 0) {
                        if (this.req.headers['content-type'] == "application/json")
                            this.payload = JSON.parse(body);
                        else
                            if (this.req.headers["content-type"] === "application/x-www-form-urlencoded")
                                this.payload = queryString.parse(body.toString());
                            else
                                this.payload = body.toString();
                    }
                    resolve(this.payload);
                });
            })
        }
        static async create(req, res) {
            let httpContext = new HttpContext(req, res);
            await httpContext.getJSONPayload();
            return httpContext;
        }
    }