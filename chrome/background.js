var defaultRgx = ["sessionid.*"].join('\n')
var regexpesarray = [];

function updateRegexpes(save) {
    chrome.storage.local.get("regstr", function (res) {
        var regstr = (res.regstr || defaultRgx);

        regexpesarray = regstr.split("\n")

        chrome.webRequest.onHeadersReceived.removeListener(onHeader)
        chrome.webRequest.onHeadersReceived.addListener(onHeader,
            {urls: ["http://*/*", "https://*/*"]},
            ["blocking", "responseHeaders", "extraHeaders"]
        );
    });
}

function onHeader(e) {
    for (var header of e.responseHeaders) {
        if (header.name.toLowerCase() === "set-cookie") {
            copyCookies(header.value)
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
            chrome.cookies.set({
                url: "http://localhost",
                name: name,
                value: value
            });
        }
    }
    console.log("CookieSync: " + cookiesStrings.length + " cookies copied to localhost");
}

function doesCookieNameMatch(name) {
    for (var regex of regexpesarray) {
        if (name.match(regex)) {
            return true;
        }
    }
    return false;
}
updateRegexpes();

var portFromCS;

function connected(p) {
    portFromCS = p;
    portFromCS.onMessage.addListener(function (m) {
        if (m.updateRegexpes) {
            chrome.storage.local.set({"regstr": m.updateRegexpes}, function (res) {
                updateRegexpes();
            });
        }
    });
}

chrome.runtime.onConnect.addListener(connected);

console.log("CookieSync: installed background script")
