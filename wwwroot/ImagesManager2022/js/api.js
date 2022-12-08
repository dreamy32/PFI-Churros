const baseUrl = "http://localhost:5000"; // remplacer quand host sur glitch
const apiImageURL = `${baseUrl}/api/images`;
const apiAccountsURL = `${baseUrl}/accounts`;
const apiTokenURL = `${baseUrl}/token`;
//Storage Keys
const accessTokenKey = 'access_Token';
const userKey = 'user';
//
function HEAD(successCallBack, errorCallBack) {
  $.ajax({
    url: apiImageURL,
    type: "HEAD",
    contentType: "text/plain",
    complete: (request) => {
      successCallBack(request.getResponseHeader("ETag"));
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}
function POST(data, successCallBack, errorCallBack) {
  $.ajax({
    url: apiImageURL,
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(data),
    success: (data) => {
      successCallBack(data);
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}

function PUT(bookmark, successCallBack, errorCallBack) {
  $.ajax({
    url: apiImageURL + "/" + bookmark.Id,
    type: "PUT",
    contentType: "application/json",
    data: JSON.stringify(bookmark),
    success: () => {
      successCallBack();
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}
function DELETE(id, successCallBack, errorCallBack) {
  $.ajax({
    url: apiImageURL + "/" + id,
    type: "DELETE",
    success: () => {
      successCallBack();
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}
/*Local Storage utilities functions */
function tokenRequestURL() {
  return apiTokenURL;
}
function storeAccessToken(token) {
  sessionStorage.setItem(accessTokenKey, token);
}
function eraseAccessToken() {
  sessionStorage.removeItem(accessTokenKey);
}
function retrieveAccessToken() {
  return sessionStorage.getItem(accessTokenKey);
}
function getBearerAuthorizationToken() {
  return { 'Authorization': `Bearer ${retrieveAccessToken()}` };
}
function storeLoggedUser(user) {
  sessionStorage.setItem(userKey, JSON.stringify(user));
}
function retrieveLoggedUser() {
  return JSON.parse(sessionStorage.getItem(userKey));
}
function deConnect() {
  sessionStorage.removeItem(userKey);
  eraseAccessToken();
}

/*AJAX functions utilities*/
function POST_REGISTER(data, successCallBack, errorCallBack) {
  $.ajax({
    url: apiAccountsURL + "/register",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(data),
    success: (data) => {
      successCallBack(data);
      storeLoggedUser(data);
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}
function POST_LOGIN(Email, Password, successCallBack, errorCallBack) {
  $.ajax({
    url: apiTokenURL,
    contentType: "application/json",
    type: "POST",
    data: JSON.stringify({ Email, Password }),
    success: (profil) => {
      storeAccessToken(profil.Access_token);

    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}

function GET_VERIFY(code, successCallBack, errorCallBack) {
  $.ajax({
    url: apiAccountsURL + "/verify?id=" + retrieveLoggedUser().Id + "&code=" + code,
    type: "GET" //,
    //contentType: 'application/json',
    //data: JSON.stringify(data),
    //success: (data) => { successCallBack(data) },
    //error: function (jqXHR) { errorCallBack(jqXHR.status) }
  });
}
function GET_UserInfo(userId, successCallBack, errorCallBack) {
  $.ajax({
    url: `${apiAccountsURL}/index` + "/" + userId,
    type: "GET",
    contentType: "text/plain",
    data: {},
    success: (profil) => {
      console.log(profil);
      storeLoggedUser(profil);
      successCallBack(profil);
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}
function modify_UserInfo(userInfo, successCallBack, errorCallBack) {
  $.ajax({
    url: `${apiAccountsURL}/modify` + "/" + userInfo.Id,
    type: "PUT",
    contentType: "application/json",
    headers: getBearerAuthorizationToken(),
    data: JSON.stringify(userInfo),
    success: () => {
      GET_UserInfo(userInfo.Id, successCallBack, error);
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}
function logout(userId, successCallBack, errorCallBack) {
  $.ajax({
    url: `${apiAccountsURL}/logout` + "/" + userId,
    type: "GET",
    data: {},
    headers: getBearerAuthorizationToken(),
    success: () => {
      deConnect();
      successCallBack();
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}
function GET_ID(id, successCallBack, errorCallBack) {
  $.ajax({
    url: apiImageURL + "/" + id,
    type: "GET",
    success: (data) => {
      successCallBack(data);
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}
function GET_ALL(successCallBack, errorCallBack, queryString = null) {
  let url = apiImageURL + (queryString ? queryString : "");
  $.ajax({
    url: url,
    type: "GET",
    success: (data, status, xhr) => {
      successCallBack(data, xhr.getResponseHeader("ETag"));
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}