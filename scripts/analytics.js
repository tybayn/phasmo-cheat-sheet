console.log("Cookies: " + navigator.cookieEnabled);
console.log("Browser Language: " + navigator.browserLanguage);
console.log("Language: " + navigator.language);
console.log("Platform: " + navigator.platform);
console.log("Connection Speed: " + navigator.connectionSpeed);
console.log("User Agent: " + navigator.userAgent);
console.log("Webdriver: " + navigator.webdriver);
data = $.get("https://ipinfo.io", function(response) {
    console.log("Location: " + response.city + ", " + response.region + ", " + response.country);
}, "jsonp");