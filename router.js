/////////////////////////////////////////////////////////////////////
// This module define routers middlewares
/////////////////////////////////////////////////////////////////////
// Author : Nicolas Chourot
// Lionel-Groulx College
/////////////////////////////////////////////////////////////////////

var clc = require("cli-color");
exports.TOKEN_EndPoint = function (HttpContext) {
    return new Promise(async (resolve) => {
        if (HttpContext.req.url == '/token' && HttpContext.req.method == "POST") {
            try {
                const AccountsController = require('./controllers/AccountsController');
                let accountsController = new AccountsController(HttpContext);
                if (HttpContext.payload)
                    accountsController.login(HttpContext.payload);
                else
                    HttpContext.response.unsupported();
                resolve(true);
            } catch (error) {
                console.log((clc.red("Token_EndPoint Error message: \n", error.message)));
                console.log((clc.red("Stack: \n", error.stack)));
                HttpContext.response.notFound();
                resolve(true);
            }
        }
        // request not consumed
        // must be handled by another middleware
        resolve(false);
    });
}

// {method, ControllerName, Action}
exports.Registered_EndPoint = function (HttpContext) {
    return new Promise(async (resolve) => {
        const RouteRegister = require('./routeRegister');
        let route = RouteRegister.find(HttpContext);
        if (route != null) {
            try {
                // dynamically import the targeted controller
                // if it does not exist the catch section will be called
                const Controller = require('./controllers/' + HttpContext.path.controllerName);
                // instanciate the controller       
                let controller = new Controller(HttpContext);

                if (route.method === 'POST' || route.method === 'PUT') {
                    if (HttpContext.payload)
                        controller[route.actionName](HttpContext.payload);
                    else
                        HttpContext.response.unsupported();
                }
                else {
                    controller[route.actionName](route.id);
                }
                resolve(true);
            } catch (error) {
                console.log("Registered_EndPoint Error message: \n", error.message);
                console.log("Stack: \n", error.stack);
                HttpContext.response.notFound();
                resolve(true);
            }
        } else
            // not an registered endpoint
            // request not consumed
            // must be handled by another middleware
            resolve(false);
    });
}

exports.List_EndPoints = function (HttpContext) {
    return new Promise(async (resolve) => {
        if (HttpContext.req.url == "/api") {
            const Endpoints = require('./endpoints');
            Endpoints.list(HttpContext);
            // request consumed
            resolve(true);
        }
        resolve(false);
    });
}

/////////////////////////////////////////////////////////////////////
// API_EndPoint middleware
// parse the req.url that must have the following format:
// /api/{ressource name} or
// /api/{ressource name}/{id}
// then select the targeted controller
// using the http verb (req.method) and optionnal id
// call the right controller function (action)
// warning: this function does not handle sub resource
// of like the following : api/resource/id/subresource/id?....
//
// Important note about controllers:
// You must respect pluralize convention: 
// For ressource name RessourName you have to name the controller
// RessourceNamesController that must inherit from Controller class
/////////////////////////////////////////////////////////////////////
exports.API_EndPoint = function (HttpContext) {
    return new Promise(async (resolve) => {
        if (!HttpContext.path.isAPI) {
            resolve(false);
        } else {
            let controllerName = HttpContext.path.controllerName;
            let id = HttpContext.path.id;
            if (controllerName != undefined) {
                try {
                    // dynamically import the targeted controller
                    // if the controllerName does not exist the catch section will be called
                    const Controller = require('./controllers/' + controllerName);
                    // instanciate the controller       
                    let controller = new Controller(HttpContext);
                    switch (HttpContext.req.method) {
                        case 'HEAD':
                            controller.head();
                            resolve(true);
                            break;
                        case 'GET':
                            controller.get(id);
                            resolve(true);
                            break;
                        case 'POST':
                            if (HttpContext.payload)
                                controller.post(HttpContext.payload);
                            else
                                HttpContext.response.unsupported();
                            resolve(true);
                            break;
                        case 'PUT':
                            if (HttpContext.payload)
                                controller.put(HttpContext.payload);
                            else
                                HttpContext.response.unsupported();
                            resolve(true);
                            break;
                        case 'DELETE':
                            controller.remove(id);
                            resolve(true);
                            break;
                        default:
                            HttpContext.response.notImplemented();
                            resolve(true);
                            break;
                    }
                } catch (error) {
                    log(FgRed, "API_EndPoint Error message: \n", error.message);
                    log(FgRed, "Stack: \n", error.stack);
                    HttpContext.response.notFound();
                    resolve(true);
                }
            } else {
                // not an API endpoint
                // must be handled by another middleware
                resolve(false);
            }
        }
    });
}
