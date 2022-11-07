/////////////////////////////////////////////////////////////////////
// This module define the base Controller class of all controllers.
/////////////////////////////////////////////////////////////////////
// Important note about derived controllers class:
// They must respect pluralize convention:
// RessourceNamesController in order to have proper routing
/////////////////////////////////////////////////////////////////////
// Author : Nicolas Chourot
// Lionel-Groulx College
/////////////////////////////////////////////////////////////////////
const TokenManager = require('../tokenManager');
module.exports =
    class Controller {
        constructor(HttpContext, repository = null, needReadAuthorization = false, needWriteAuthorization = true) {
            // if true, will require a valid bearer token from request header
            this.needReadAuthorization = needReadAuthorization;
            this.needWriteAuthorization = needWriteAuthorization;
            this.HttpContext = HttpContext;
            this.repository = repository;
        }
        readAuthorization() {
            if (this.needReadAuthorization)
                return TokenManager.requestAuthorized(this.HttpContext.req)
            return true
        }
        writeAuthorization() {
            if (this.needWriteAuthorization)
                return TokenManager.requestAuthorized(this.HttpContext.req)
            return true;
        }
        head() {
            if (this.repository != null) {
                this.HttpContext.response.ETag(this.repository.ETag);
            } else
                this.HttpContext.response.notImplemented();
        }
        get(id) {
            if (this.readAuthorization()) {
                if (this.repository != null) {
                    if (id !== undefined) {
                        if (!isNaN(id)) {
                            let data = this.repository.get(id);
                            if (data != null)
                                this.HttpContext.response.JSON(data);
                            else
                                this.HttpContext.response.notFound();
                        } else
                            this.HttpContext.response.badRequest();
                    }
                    else
                        this.HttpContext.response.JSON(this.repository.getAll(this.HttpContext.path.params), this.repository.ETag);
                }
                else
                    this.HttpContext.response.notImplemented();
            } else
                this.HttpContext.response.unAuthorized();
        }
        post(data) {
            if (this.writeAuthorization()) {
                if (this.repository != null) {
                    data = this.repository.add(data);
                    if (data) {
                        if (data.conflict)
                            this.HttpContext.response.conflict();
                        else
                            this.HttpContext.response.created(data);
                    } else
                        this.HttpContext.response.unprocessable();
                } else
                    this.HttpContext.response.notImplemented();
            } else
                this.HttpContext.response.unAuthorized();
        }
        put(data) {
            if (this.writeAuthorization()) {
                if (this.repository != null) {
                    let updateResult = this.repository.update(data);
                    if (updateResult == this.repository.updateResult.ok)
                        this.HttpContext.response.ok();
                    else
                        if (updateResult == this.repository.updateResult.conflict)
                            this.HttpContext.response.conflict();
                        else
                            if (updateResult == this.repository.updateResult.notfound)
                                this.HttpContext.response.notFound();
                            else // this.repository.updateResult.invalid
                                this.HttpContext.response.unprocessable();
                } else
                    this.HttpContext.response.notImplemented();
            } else
                this.HttpContext.response.unAuthorized();
        }
        remove(id) {
            if (this.writeAuthorization()) {
                if (this.repository != null) {
                    if (this.repository.remove(id))
                        this.HttpContext.response.accepted();
                    else
                        this.HttpContext.response.notFound();
                } else
                    this.HttpContext.response.notImplemented();
            } else
                this.HttpContext.response.unAuthorized();
        }
    }
