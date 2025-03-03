var defaultHost = ".*\\.mycompany\\.com";
var defaultNames = ["sessionid.*"].join('\n');

var host;
var namesArray = [];

async function updateRegexpes() {
    const [regexNames, regexHost] = await Promise.all([
        chrome.storage.local.get("regexNames"),
        chrome.storage.local.get("regexHost")
    ]);
    namesArray = (regexNames.regexNames || defaultNames).split("\n");
    host = regexHost.regexHost || defaultHost;
}

chrome.runtime.onConnect.addListener(port => {
    console.log("CookieSync: onConnect");
    port.onMessage.addListener(async (m) => {
        console.log("CookieSync: onMessage");
        if (m.updateHost) {
            await chrome.storage.local.set({"regexHost": m.updateHost});
            updateRegexpes();
        }
        if (m.updateRegexNames) {
            await chrome.storage.local.set({"regexNames": m.updateRegexNames});
            updateRegexpes();
        }
    });
});

chrome.cookies.onChanged.addListener((changeInfo) => {
    console.log("CookieSync: onChanged");
    const cookie = changeInfo.cookie;
    if (doesCookieHostMatch(cookie.domain) && doesCookieNameMatch(cookie.name)) {
        chrome.cookies.set({
            url: "http://localhost",
            name: cookie.name,
            value: cookie.value,
            domain: "localhost",
            path: cookie.path,
            secure: cookie.secure,
            httpOnly: cookie.httpOnly,
            sameSite: cookie.sameSite
        });
    }
});

function doesCookieHostMatch(cookiehost) {
    return new RegExp(host).test(cookiehost);
}

function doesCookieNameMatch(name) {
    return namesArray.some(regex => new RegExp(regex).test(name));
}

updateRegexpes();

console.log("CookieSync: installed service worker");
