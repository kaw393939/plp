EVENT-DRIVEN PROGRAMMING WITH NODE.JS AND REDIS
===============================================

T. Budiman

tbudiman@gmail.com

@tbudiman


Bala

Prerequisite
------------

In order to follow this tutorial, the reader should read Introduction to Node.js and Introduction to Redis.
This tutorial, the source code and sample data are available at [IPtoCountry-Mapping] 

IP Identification
-----------------

In this tutorial we will write several application involving IP identification. We have a csv file containing the IP ranges for all cities in the world, with a few information about that city. The objective is to create a IP lookup, where the application should identify the city from a given IP Address. We'll create a simple web application which will identify the IP address of the request and then display the city information. In order to achieve this in a very fast way, we'll use redis as our database of IP addresses. Since this is a fairly simple and straightforward application, we'll also try to do this using the Test-Driven Development methodology, which requires us to create the unit tests first.


Installing node.js modules
--------------------------

We need several node.js modules to complete this tutorial. First, we'll create
a directory and enter it.

```sh
$ mkdir IPtoCountry-Mapping
$ cd IPtoCountry-Mapping
```

The csv module is needed to read a csv file.

```sh
$ npm install csv
```

The redis module is needed to access the redis database.
```sh
$ npm install hiredis redis
```

Mocha and should modules are needed to do unit testing. We'll install mocha globally, so other projects can use it too.

```sh
$ sudo npm install -g mocha
$ npm install should
```

And we'll use underscore.string module to help us with some string manipulation functions.

```sh
$ npm install underscore.string
```


References
----------
 1. [Node CSV]
 2. [Node Redis]
 3. [Mocha]

  [IPtoCountry-Mapping]: https://github.com/bb245/IPtoCountry-Mapping
  [Node CSV]: http://www.adaltas.com/projects/node-csv/
  [Node Redis]: https://github.com/mranney/node_redis
  [mocha]: http://visionmedia.github.io/mocha/
