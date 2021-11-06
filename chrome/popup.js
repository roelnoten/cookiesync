// content-script.js
var defaultRgx =  ["sessionid.*"].join('\n')
var myPort = chrome.runtime.connect({name:"port-from-cs"});
myPort.onMessage.addListener(function(m) {
    document.querySelector("#warning").innerText=m.message
});
chrome.storage.local.get("regstr", function(res) {
    regstr = (res.regstr || defaultRgx);
    document.querySelector(".regextextarea").value=regstr;
});
window.onload= function()
{
    txarea = document.querySelector(".regextextarea");
    txarea.onkeyup = txarea.onchange = function(){
        regstr = txarea.value.trim()
        myPort.postMessage({updateRegexpes: regstr});
    }
}