var defaultHost = ".*\\.mycompany\\.com";
var defaultNames = ["sessionid.*"].join('\n')

var host;
var namesArray = [];

function updateRegexpes(save) {
    browser.storage.local.get("regexNames", function (res) {
        var regexNames = (res.regexNames || defaultNames);
        namesArray = regexNames.split("\n")
        register();
    });

    browser.storage.local.get("regexHost", function (res) {
        host = (res.regexHost || defaultHost);
        register();
    });
}

function register() {
    browser.webRequest.onHeadersReceived.removeListener(onHeader)
    browser.webRequest.onHeadersReceived.addListener(onHeader,
        {urls: ["http://*/*", "https://*/*"]},
        ["blocking", "responseHeaders"]
    );
}

function onHeader(e) {
    url = new URL(e.url);
    urlhostname = url.hostname;
    if (doesCookieHostMatch(urlhostname)) {
        for (var header of e.responseHeaders) {
            if (header.name.toLowerCase() === "set-cookie") {
                copyCookies(header.value)
            }
        }
    }
    return {responseHeaders: e.responseHeaders};
}

function copyCookies(headervalue) {
    var cookiesStrings = headervalue.split("\n");
    for (var cookieString of cookiesStrings) {
        var indexOfEquals = cookieString.indexOf("=");
        var indexOfSemiColon = cookieString.indexOf(";");
        var name = cookieString.substring(0, indexOfEquals);
        var value = cookieString.substring(indexOfEquals + 1, indexOfSemiColon);
        if (doesCookieNameMatch(name)) {
            browser.cookies.set({
                url: "http://localhost",
                name: name,
                value: value
            });
        }
    }
    console.log("CookieSync: " + cookiesStrings.length + " cookies copied to localhost");
}

function doesCookieNameMatch(name) {
    for (var regex of namesArray) {
        if (name.match(regex)) {
            return true;
        }
    }
    return false;
}

function doesCookieHostMatch(cookiehost) {
    return cookiehost.match(host);
}

updateRegexpes();

var portFromCS;

function connected(p) {
    portFromCS = p;
    portFromCS.onMessage.addListener(function (m) {
        if (m.updateHost) {
            browser.storage.local.set({"regexHost": m.updateHost}, function (res) {
                updateRegexpes();
            });
        }
        if (m.updateRegexNames) {
            browser.storage.local.set({"regexNames": m.updateRegexNames}, function (res) {
                updateRegexpes();
            });
        }
    });
}

browser.runtime.onConnect.addListener(connected);

console.log("CookieSync: installed background script")
