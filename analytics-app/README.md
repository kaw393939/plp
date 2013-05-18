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

## Development Notes

 1. The current assumption is the analytics module would be embedded within the main application and using the same database
    configuration as the main application, but it should also be possible to run as a separate application from the main application
    and have a javascript library that would be injected to the html output of the main application similar to google analytics.
 2. Currently the real-time data is stored in redis database. Redis database is also used to generate real-time reports that's emitted
    to the dashboard through a socket.io's room connection. Differrent data types and their combinations are stored as redis counters,
    with the most detailed data combination consisted of the site, page, ip address and the time (in seconds). The data type includes
    data derived from user agent information such as the browser, version, operating system and platform.
 3. Longer termed data is stored in MongoDB using 2 data collections, totals and totalminutes, to represent the total accumulated
    data and the time-series in minute respectively. This data is updated from the redis database every 10 seconds (configurable).
 4. There's several methods of data display method in the code, using angular.js in the client-side:
     1. The ordinary socket.io connection from the seed template for displaying the clock in `view1`.
     2. A pub-sub pattern using socket.io's room for dashboard display, pushing the real-time data from redis database in `dashboard` page.
     3. Implementation of the GET (Read) part of REST API interface sending JSON time-series data from MongoDB, used in `total` page.
 5. TODO: the code to remove old data from redis, the ones that is no longer needed for displaying real-time data.
 6. TODO: somekind of benchmark tool, so we could determine the best database design to be used.
 7. TODO: a system to extend the types of data collected and a function to process the data and calculate things like new visitors
    or the user's usage pattern.
 8. TODO: more integration with tools such as `bower` and `grunt`.
 9. TODO: the UI
10. TODO: better architecture
