/////////////////////////////////////////////////////////////////////
// This module define the http Response class
/////////////////////////////////////////////////////////////////////
// Author : Nicolas Chourot
// Lionel-Groulx College
/////////////////////////////////////////////////////////////////////
const Cache = require('./CachedRequestsManager');
module.exports =
    class Response {
        constructor(HttpContext) {
            this.HttpContext = HttpContext;
            this.res = HttpContext.res;
        }
        AddInCache(jsonObj, ETag) {
            if (this.HttpContext.req.method == 'GET' &&
                this.HttpContext.path.isAPI &&
                this.HttpContext.path.id == undefined)
                Cache.add(this.HttpContext.req.url, jsonObj, ETag);
        }

        status(number, errorMessage = null) {
            if (errorMessage) {
                this.res.writeHead(number, { 'content-type': 'application/json' });
                let errorContent = { "error_description": errorMessage };
                this.end(JSON.stringify(errorContent));
            } else {
                this.res.writeHead(number, { 'content-type': 'text/plain' });
                this.end();
            }
        }
        end(content = null) {
            if (content)
                this.res.end(content);
            else
                this.res.end();
        }
        ok() {
            // ok status
            this.status(200);
        }
        accepted() {
            // accepted status
            this.status(202);
        }
        created(jsonObj) {
            this.res.writeHead(201, { 'content-type': 'application/json' });
            this.end(JSON.stringify(jsonObj));
        }
        ETag(ETag) {
            this.res.writeHead(204, { 'ETag': ETag });
            this.end();
        }
        JSON(jsonObj, ETag = "", fromCache = false) {
            if (ETag != "")
                this.res.writeHead(200, { 'content-type': 'application/json', 'ETag': ETag });
            else
                this.res.writeHead(200, { 'content-type': 'application/json' });
            if (jsonObj != null) {
                if (!fromCache) // prevent from cache it again
                    this.AddInCache(jsonObj, ETag);
                let content = JSON.stringify(jsonObj);
                this.end(content);
            } else {
                this.end();
            }
        }
        HTML(content) {
            this.res.writeHead(200, { 'content-type': 'text/html' });
            this.end(content);
        }
        content(contentType, content) {
            // let the browers cache locally the receiverd content
            this.res.writeHead(200, { 'content-type': contentType, "Cache-Control": "public, max-age=31536000" });
            this.end(content);
        }
        noContent() {
            // no content status
            this.status(204);
        }
        notFound() {
            // not found status
            this.status(404);
        }
        forbidden() {
            // forbidden status
            this.status(403);
        }
        unAuthorized() {
            // forbidden status
            this.status(401);
        }
        notAloud() {
            // Method not aloud status
            this.status(405);
        }
        conflict() {
            // Conflict status
            this.status(409);
        }
        unsupported() {
            // Unsupported Media Type status
            this.status(415);
        }
        unprocessable() {
            // Unprocessable Entity status
            this.status(422);
        }
        badRequest() {
            // bad request status
            this.status(400);
        }
        unverifiedUser() {
            this.status(480);
        }
        userNotFound() {
            this.status(481);
        }
        wrongPassword() {
            this.status(482);
        }
        internalError() {
            // internal error status
            this.status(500);
        }
        notImplemented() {
            //Not implemented
            this.status(501);
        }

    }