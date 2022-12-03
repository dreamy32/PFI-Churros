const baseUrl = "http://localhost:5000"; // remplacer quand host sur glitch
const apiImageURL = `${baseUrl}/api/images`;
const apiAccountsURL = `${baseUrl}/accounts`;
const apiTokenURL = `${baseUrl}/token`;

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
function POST_LOGIN(data, successCallBack, errorCallBack) {
  $.ajax({
    url: `${apiTokenURL}`,
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
function POST_REGISTER(data, successCallBack, errorCallBack) {
  $.ajax({
    url: apiAccountsURL + "/register",
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(data),
    success: (data) => {
      successCallBack(data);
      StoreUserInfo(data);
    },
    error: function (jqXHR) {
      errorCallBack(jqXHR.status);
    },
  });
}

function StoreUserInfo(user) {
  sessionStorage.setItem("user", JSON.stringify(user));
}

function GetUserInfo() {
  return JSON.parse(sessionStorage.getItem("user"));
}

function GET_VERIFY(code,successCallBack, errorCallBack) {
  $.ajax({
    url: apiAccountsURL + "/verify?id=" + GetUserInfo().Id + "&code=" + code,
    type: "GET" //,
    //contentType: 'application/json',
    //data: JSON.stringify(data),
    //success: (data) => { successCallBack(data) },
    //error: function (jqXHR) { errorCallBack(jqXHR.status) }
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
