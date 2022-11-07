////This funciton return the endpoints list in html
exports.list = (HttpContext) => {
    function EnumerateEndpoints(HttpContext, controllerFile){
        let endpoints = "";
        // get the controller class       
        let Controller = require('./controllers/' + controllerFile);
        // make instance on controller class
        let controller = new Controller(HttpContext);
        // get all the owned properties of controller class prototype
        let methods = Object.getOwnPropertyNames(Object.getPrototypeOf(controller));
        // get the model name
        let resourceName = controllerFile.replace('sController.js','').toLowerCase();
        // pluralize model name
        let resourceNames = resourceName + 's';
        let resclass = null;
        try {
            // make instance of model
            resclass = new require("./models/" + resourceName);
            endpoints += "<h3>Resource " + resourceName + ": ";
            // stringnify the model instance
            endpoints += JSON.stringify(new resclass()).replace(/""/g,'"..."').replace(/,/g,', ') + '</h3>';
        } catch (error) {
            // no model associated with controller
            // must be an endpoint working with query strings
            resourceNames = resourceNames + "? return list of possible query strings";
        } 
        // if we have a get method, expose GET: /api/ModelsController and GET: /api/ModelsController/id endpoints
        if (methods.indexOf('get') > -1){
            endpoints += "<h4>GET : /api/" + resourceNames + "</h4>";
            // if we don't have an associated model expose only get endpoint
            if (resclass != null)
                endpoints += "<h4>GET : /api/" + resourceNames + "/id</h4>";
        }
        // if we have a post method, expose POST: /api/ModelsController endpoint
        if (methods.indexOf('post') > -1){
            endpoints += "<h4>POST : /api/" + resourceNames + "</h4>"; 
        }
        // if we have a put method, expose PUT: /api/ModelsController/id endpoint
        if (methods.indexOf('put') > -1){
            endpoints += "<h4>PUT : /api/" + resourceNames + "/id</h4>";
        }
        // if we have a remove method, expose DELETE: /api/ModelsController/id endpoint
        if (methods.indexOf('remove') > -1){
            endpoints += "<h4>DELETE : /api/" + resourceNames + "/id</h4>";
        }
        return endpoints + "<hr>";
    }

    let content = "<div style=font-family:arial>";
    content += "<h1>CRUD DEMO ENDPOINTS</h1><hr>";
    const path = require('path');
    const fs = require('fs');
    // construct controller directoty path
    const directoryPath = path.join(__dirname, "controllers");
    // get list of directories with in controller directoty
    fs.readdir(directoryPath, function(err, files) {
        if (err) {
          console.log("No endpoints");
        } else {
            // for each directory in controller directoty6
            files.forEach(function(file) {
                // if not Controller base class
                if (file != 'Controller.js') {
                    // expose all endpoints
                    content += EnumerateEndpoints(HttpContext, file);
                }
            });
            HttpContext.res.writeHead(200, {'content-type':'text/html'});
            HttpContext.res.end(content + "</div>" );
        }
    });
}