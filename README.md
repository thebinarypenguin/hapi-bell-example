# hapi-bell-example

[![Greenkeeper badge](https://badges.greenkeeper.io/thebinarypenguin/hapi-bell-example.svg)](https://greenkeeper.io/)

Example usage of the bell plugin for hapi.js

## Registering the App with GitHub

In order to get the necessary OAuth client credentials you must first register a
new "application" with GitHub.

To do this...

1. Login to GitHub
2. Go to https://github.com/settings/applications/new
3. Fill in **Application name**, **Homepage URL**, and **Application description** with whatever you want
4. Fill in **Authorization callback URL** with `http://localhost:3000/login`
5. Click **Register application**

Now copy the application's **Client ID** and **Client Secret** into
[src/server.js](https://github.com/thebinarypenguin/hapi-bell-example/blob/master/src/server.js)
