var express = require('express'),
    ipident = require('ipident');
var app = express();

ipident.autoLoad();

app.get('/', function(req, res) {
    var body = 'IP Address: ' + req.ip + "\n",
        start = process.hrtime();

    ipident.retrieveCityInfo(req.ip, function (data) {

        if (data) {
            var city_info, diff;

            city_info = "City: " + data.city + "\n";
            city_info += "Region Name: " + data.region_name + "\n";
            city_info += "Country: " + data.country_name + "\n";
            city_info += "Postal Code: " + data.postal_code + "\n";
            city_info += "Latitude: " + data.latitude + "\n";
            city_info += "Longitude: " + data.longitude + "\n";
            city_info += "Metro Code: " + data.metro_code + "\n";
            city_info += "Area Code: " + data.area_code + "\n";
            body += city_info;
            diff = process.hrtime(start);
            body += "\n\nIdentification process took " +
                (diff[0] * 1e9 + diff[1]).toString() +
                " nanoseconds\n";
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Length', body.length);
            res.end(body);
        } else {
            body += "No location identified for your IP Address.\n";
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Length', body.length);
            res.end(body);
        }
    });
});

app.get(/\/ipv4\/(\d+\.\d+\.\d+\.\d+)/, function(req, res) {
    var given_ip = req.params[0];
    var start = process.hrtime();
    var body = 'Lookup IP Address: ' + given_ip + "\n";
    ipident.retrieveCityInfo(given_ip, function (data) {

        if (data) {
            var city_info, diff;

            city_info = "City: " + data.city + "\n";
            city_info += "Region Name: " + data.region_name + "\n";
            city_info += "Country: " + data.country_name + "\n";
            city_info += "Postal Code: " + data.postal_code + "\n";
            city_info += "Latitude: " + data.latitude + "\n";
            city_info += "Longitude: " + data.longitude + "\n";
            city_info += "Metro Code: " + data.metro_code + "\n";
            city_info += "Area Code: " + data.area_code + "\n";
            body += city_info;
            diff = process.hrtime(start);
            body += "\n\nIdentification process took " +
                (diff[0] * 1e9 + diff[1]).toString() +
                " nanoseconds\n";
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Length', body.length);
            res.end(body);
        } else {
            body += "No location identified for your IP Address.\n";
            res.setHeader('Content-Type', 'text/plain');
            res.setHeader('Content-Length', body.length);
            res.end(body);
        }
    });

});

app.listen(3001);
console.log('Listening on port 3001');
