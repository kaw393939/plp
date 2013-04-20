var ip = "23.2.2.23";

var str = /^(\d+)\.(\d+)\.(\d+)\.(\d+)$/.exec(ip);
str.shift();

console.log(JSON.stringify(str));
