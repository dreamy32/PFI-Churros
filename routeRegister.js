// Used to register custom routes
// must be used to support MVC controllers routes
let routes = [];
module.exports = 
class RouteRegister{
    static add(method, modelName, actionName="index"){
        routes.push(
            {   method, 
                modelName, 
                actionName
            });
    }
    static find(httpContext) {
        let path = httpContext.path;
        let foundRoute = null;
        routes.forEach(route => {
            if (route.method == httpContext.req.method){
                if (path.model != undefined && path.model == route.modelName) {
                    if (path.action != undefined && path.action == route.actionName) {
                        route.id = path.id;
                        foundRoute = route;
                    }
                }
            }
        });
        return foundRoute;
    }
}