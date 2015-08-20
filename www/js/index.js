// define the api endpoints
var API_NEW_FILE_ENDPOINT = "https://api.open.glasgow.gov.uk/Files/Organisation/{0}/Dataset/{1}";
var API_NEW_FILE_VERSION_ENDPOINT = "https://api.open.glasgow.gov.uk/Files/Organisation/{0}/Dataset/{1}/File/{2}";



// get the json file dependencies
var pathToJsonNewFileRequestBodyExternal = './js/testexternal.js';
var pathToJsonNewFileRequestBody = './js/test.js';
var pathToFile = 'www/js/test.csv';

var app = {
  // auth details
  auth:null,
  token:null,
  // Application Constructor
  initialize: function() {
      
      this.bindEvents();
  },
  // Bind Event Listeners
  //
  // Bind any events that are required on startup. Common events are:
  // 'load', 'deviceready', 'offline', and 'online'.
  bindEvents: function() {

      document.addEventListener('deviceready', this.onDeviceReady, false);

  },
  // deviceready Event Handler
  //
  // The scope of 'this' is the event. In order to call the 'receivedEvent'
  // function, we must explicitly call 'app.receivedEvent(...);'
  onDeviceReady: function() {
    app.start();
  },
  // start function
  // Hook up the buttons for kicking of platform interactions.
  //
  //
  start: function () {

    postExternalFile.addEventListener('click', this.postExternalFile, false);
    postExternalFileVersion.addEventListener('click', this.postExternalFileVersion, false);
    postFile.addEventListener('click', this.postFile, false);
    postFileVersion.addEventListener('click', this.postFileVersion, false);
  },
  // Post an external json file to the platform
  postExternalFile: function() {

    // if not auth'd then we need to get a token
    if (!app.auth) {
      app.doAuth(app.postExternalFile);
      return;
    }

    // get the json metadata to post
    console.log('started postExternalFile');
    $.getJSON([pathToJsonNewFileRequestBodyExternal], function(json) {
      console.log('loaded: ' + JSON.stringify(json));
      app.makeRequest(app.token, null, json, app.requestComplete);
    });
  },
  // Post an external json file with a new version to the platform
  postExternalFileVersion: function() {

    // if not auth'd then we need to get a token
    if (!app.auth) {
      app.doAuth(app.postExternalFileVersion);
      return;
    }

    // get the json metadata to post
    console.log('started postExternalFileVersion');
    $.getJSON([pathToJsonNewFileRequestBodyExternal], function(json) {
      console.log('loaded: ' + JSON.stringify(json));
      app.makeRequest(app.token, config.FileId, json, app.requestComplete);
    });

  },
  // Post a file and metadata to the platform
  postFile: function() {

    // if not auth'd then we need to get a token
    if (!app.auth) {
      app.doAuth(app.postFile);
      return;
    }

    // get the json metadata to post
    console.log('started postFile');
    $.getJSON([pathToJsonNewFileRequestBody], function(json) {
      console.log('loaded: ' + JSON.stringify(json));

        // We need to use the MS optimised version as cordova.file.applicationDirectory doesn't seem to be supported
        // and so we need to get a reference to the file in a different way.

      console.log('device.platform:' + device.platform)
      if (device.platform == 'WinCE' || device.platform == 'Win32NT') {
          // get the file to be posted
          app.makeRequestWithFileMS(app.token, null, json, pathToFile, app.requestComplete);
      } else {
          // get the file to be posted
          app.makeRequestWithFile(app.token, null, json, pathToFile, app.requestComplete);
      }
    });

  },
  // Post a file and new metadata version to the platform
  postFileVersion: function() {

    // if not auth'd then we need to get a token
    if (!app.auth) {
      app.doAuth(app.postFileVersion);
      return;
    }

    // get the json metadata to post
    console.log('started postFile');
    $.getJSON([pathToJsonNewFileRequestBody], function(json) {
      console.log('loaded: ' + JSON.stringify(json));

        // We need to use the MS optimised version as cordova.file.applicationDirectory doesn't seem to be supported
        // and so we need to get a reference to the file in a different way.

      if (device.platform == 'WinCE' || device.platform == 'Win32NT') {
          // get the file to be posted
          app.makeRequestWithFileMS(app.token, config.FileId, json, pathToFile, app.requestComplete);
      } else {
          // get the file to be posted
          app.makeRequestWithFile(app.token, config.FileId, json, pathToFile, app.requestComplete);
      }
    });

  },
  // redirects to get an authentication token
  doAuth: function(origin) {
    console.log('Performing Authentication.');
    var AuthenticationContext = Microsoft.ADAL.AuthenticationContext;
    console.log('Performing Authentication for ' + config.Authbase + config.TenantId);

    // create a context to acquire a token
    AuthenticationContext.createAsync(config.Authbase + config.TenantId)
      .then(function(context) {
        console.log('Authentication context created for : ' + context.authority);

        // now get a token
        context.acquireTokenAsync(config.ResourceId, config.ClientId, config.RedirectUrl)
          .then(function(authResult) {

            // get the result and store it
            console.log('Got token :' + JSON.stringify(authResult));
            app.auth = authResult;
            app.token = authResult.accessToken;

            // now continue with the original request
            origin();

          }, function(err) {
            console.log('Failed to get token :' + err);
          });

      }, app.error);
  },
  makeRequest: function(token, fileId, json, requestComplete) {
    var uri;

    if (fileId == null) {
      uri = API_NEW_FILE_ENDPOINT.format(config.OrgId, config.DatasetId);
      console.log('Creating a new external file : ' + uri);
    } else {

      uri = API_NEW_FILE_VERSION_ENDPOINT.format(config.OrgId, config.DatasetId, fileId);
      console.log('Creating a new external file version : ' + uri);
    }

    // now make the request
    $.ajax({
        url: uri + '?subscription-key=' + config.SubscriptionKey,
        type: 'POST',
        dataType: 'json',
        contentType: 'application/json',
        headers: {
          'Authorization': 'Bearer ' + app.token
        },
        data: JSON.stringify(json),
        success: function(response){

          console.log('Successful ' + JSON.stringify(response));
          requestComplete(null, response.RequestId)
        },
        error: function(response) {
          response = JSON.parse(response.responseText);
          console.log("Error: ", response);
        }
      }
    );
  },
  makeRequestWithFile: function(token, fileId, json, file, requestComplete) {
    var uri;

    if (fileId == null) {
      uri = API_NEW_FILE_ENDPOINT.format(config.OrgId, config.DatasetId);
      console.log('Creating a new external file : ' + uri);
    } else {

      uri = API_NEW_FILE_VERSION_ENDPOINT.format(config.OrgId, config.DatasetId, fileId);
      console.log('Creating a new external file version : ' + uri);
    }

    // get a reference to the file
    window.resolveLocalFileSystemURL(resolveApplicationPath(pathToFile),

      // resolveLocalFileSystemURL success
      function(fileEntry){
        console.log('got ref to file');

        fileEntry.file(
          function(file){

            app.sendFile(uri, token, fileId, json, file, requestComplete);
          }
        );
      },

      // resolveLocalFileSystemURL fail
      function(err){
        console.log('Error: ' + err.code);
      }
    );
  },
  makeRequestWithFileMS: function (token, fileId, json, file, requestComplete) {
      var uri;

      if (fileId == null) {
          uri = API_NEW_FILE_ENDPOINT.format(config.OrgId, config.DatasetId);
          console.log('Creating a new external file : ' + uri);
      } else {

          uri = API_NEW_FILE_VERSION_ENDPOINT.format(config.OrgId, config.DatasetId, fileId);
          console.log('Creating a new external file version : ' + uri);
      }

      // We need to use this as issue getting the file via the installed app directory using cordova.file
      // Please suggest a pure Cordova alternative.
      var localFolder = Windows.ApplicationModel.Package.current.installedLocation;
      localFolder.getFileAsync(pathToWindowsPath(pathToFile)).done(function (tfile) {
          var file = MSApp.createFileFromStorageFile(tfile);
          app.sendFile(uri, token, fileId, json, file, requestComplete);

      },
      function (e) {
          console.log('Error loading file to upload.')
      });
  },
    sendFile: function(uri, token, fileId, json, file, requestComplete){
      var reader = new FileReader();

      reader.onloadend = function (evt) {

        // get the results into a view for posting
        var arrayBufferView = new Uint8Array(evt.target.result);

        // get as a file blog for posting
        var blob = new Blob([arrayBufferView]);

        var data = new FormData();
        data.append('body', JSON.stringify(json));
        data.append('content', blob);

        // now make the request
        $.ajax({
            url: uri + '?subscription-key=' + config.SubscriptionKey,
            type: 'POST',
            contentType: false,
            processData: false,
            cache: false,
            headers: {
              'Authorization': 'Bearer ' + app.token
            },
            data: data,
            success: function (response) {

              console.log('Successful ' + JSON.stringify(response));
              requestComplete(null, response.RequestId)
            },
            error: function (response) {
              response = JSON.parse(response.responseText);
              console.log("Error: ", response);
            }
          }
        );
      }

      reader.readAsArrayBuffer(file);
    }
  ,
  requestComplete: function(err, id) {

    if (err == null) {
      console.log("Request Identifier is " + id);
      $('#riq').html('RequestId = ' + id);
    } else {
      console.log('There was an error making the request :' + JSON.stringify(err))
      $('#riq').html('There was an error making the request :' + JSON.stringify(err));
    }

  }
};

// Translates forward slashes to escaped backslashes for windows
function pathToWindowsPath(path) {
  return path.replace('/', '\\');
}

// This prepends the appropriate path depending on whether it is iOS or Android
function resolveApplicationPath(path) {
  if (device.platform == 'iOS') return cordova.file.applicationDirectory + path;
  if (device.platform == 'Android') return 'file:///android_asset/' + path;

  // todo - can we do this with windows phone as well?

  return path;
}

app.initialize();