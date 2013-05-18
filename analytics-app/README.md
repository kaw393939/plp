# Analytics in Angular - Express - MongoDB Application

This application showcase the Analytics module works in an Angular - Express - MongoDB - based
application. This application used the [Angular Socket.io Seed](https://github.com/btford/angular-socket-io-seed)
as the basis for original template.

## Running the app

Runs like a typical express app:

    $ node app.js

## Running tests

Coming soon!

Code style guide: use jshint

```sh
$ jshint [filename.js]
```

## Directory Layout

    app.js              --> app config
    package.json        --> for npm
    lib/                --> libraries
      transientAnalytics.js     --> short-term transient analytics data in Redis
      persistentAnaltics.js     --> long-term time-series analytics data in MongoDB
    models/             --> Mongoose models
      total.js          --> Total analytics object
      totalMinute.js    --> Time-series analytics object
    public/             --> all of the files to be used in on the client side
      css/              --> css files
        app.css         --> default stylesheet
      img/              --> image files
      js/               --> javascript files
        app.js          --> declare top-level app module
        controllers.js  --> application controllers
        directives.js   --> custom angular directives
        filters.js      --> custom angular filters
        services.js     --> custom angular services
        lib/            --> angular and 3rd party JavaScript libraries
          angular/
            angular.js            --> the latest angular js
            angular.min.js        --> the latest minified angular js
            angular-*.js          --> angular add-on modules
            version.txt           --> version number
    routes/
      index.js          --> route for serving HTML pages and partials
      api.js            --> route for serving API
      socket.js         --> route for socket.io connections
    views/
      index.jade        --> main page for app
      layout.jade       --> doctype, title, head boilerplate
      partials/         --> angular view partials (partial jade templates)
        partial1.jade
        partial2.jade
        total.jade
        dashboard.jade
