![alt text](icon96.png)
# CookieSync

This is a Firefox addon which copies cookies to localhost.

It's primary here for developers that have code running on their localhost which connects to other services and needs access to their cookies.
Typical usecase is a third-party login flow. In production the developers code wil run on the same domain as the other services and have access to the cookies they set.
But when code is running on localhost (during development), those cookies are not accessible in the browser.

This addon monitors incoming set-cookie headers and all cookies matching a user defined name regex will be copied to the http://localhost domain.

# Compatibility
- Firefox

# Plugin development notes

This is relevant when changes are needed to the plugin.

## Run from files
You can let firefox use the addon directly from the files in this folder, instead of via the XPI. 
Go to about:debugging#/runtime/this-firefox in a Firefox tab. Choose 'Load Temporary Add-on...' and select the manifest.json here.

## Debug 
An addon can log using console.log() statements. 
To get a view on these: Menu > Tools > Browser Tools > Browser Console.  Make sure that 'Show Content Messages' is checked in the top right settings popup menu.

## Packaging
Repackage the addon via :
zip -r -FS IMSlocal.zip *

