var Bell       = require('bell');
var CookieAuth = require('hapi-auth-cookie');
var Handlebars = require('handlebars');
var Hapi       = require('hapi');
var Path       = require('path');
var Vision     = require('vision');
var Pkg        = require('../package.json');

// Create a hapi server
var server = new Hapi.Server();

// Add an incoming connection to listen on
server.connection({
  host: 'localhost',
  port: 3000,
  router: {
    stripTrailingSlash: true,
  }
});

// Register plugins
server.register([
  Bell,
  CookieAuth,
  Vision,
], function(err) {
  if (err) { throw err; }

  // Register an authentication strategy named "session" which uses the "cookie" scheme.
  // The "cookie" authentication scheme is provided by the "hapi-auth-cookie" plugin.
  server.auth.strategy(
    'session',
    'cookie',
    {
      cookie: 'example',
      password: 'secret',
      isSecure: false, // For development only
      redirectTo: '/login',
      redirectOnTry: false,
      appendNext: 'redirect',
    }
  );

  // Register an authentication strategy named "github" which uses the "bell" scheme.
  // The "bell" authentication scheme is provided by the "bell" plugin.
  server.auth.strategy(
    'github',
    'bell',
    {
      provider: 'github',
      password: 'bell-secret',
      clientId: '___OAUTH_CLIENT_ID___',
      clientSecret: '___OAUTH_CLIENT_SECRET___',
      isSecure: false, // For development only
    }
  );

  // Configure template rendering.
  // The "views" method is provided by the "vision" plugin.
  server.views({
    engines: {
      html: Handlebars,
    },
    path: Path.join(__dirname, 'templates'),
    layout: 'layout',
  });

  // Register a route to show the "Home" page (no authentication required)
  server.route({
    method: 'GET',
    path: '/',
    config: {
      auth: {
        mode: 'try',
        strategy: 'session',
      }
    },
    handler: function(request, reply) {
      var context = {
        session: {},
      };

      if (request.auth.isAuthenticated) {
        context.session = request.auth.credentials;
      }

      reply.view('home', context);
    }
  });

  // Register a route to show the "Public" page (no authentication required)
  server.route({
    method: 'GET',
    path: '/public',
    config: {
      auth: {
        mode: 'try',
        strategy: 'session',
      }
    },
    handler: function(request, reply) {
      var context = {
        session: {},
      };

      if (request.auth.isAuthenticated) {
        context.session = request.auth.credentials;
      }

      reply.view('public', context);
    }
  });

  // Register a route to show the "Private" page (client must have a valid session).
  // If the client does not have a valid session it will be redirected to the "Login" page.
  server.route({
    method: 'GET',
    path: '/private',
    config: {
      auth: {
        mode: 'required',
        strategy: 'session',
      }
    },
    handler: function(request, reply) {
      var context = {
        session: request.auth.credentials,
      };

      reply.view('private', context);
    }
  });

  // Register a route to handle the OAuth dance.
  //
  // If the authentication mode is "required"
  //   The handler will only be called if authentication succeeds
  //   If authentication fails bell will return a 500 error
  //
  // If the authentication mode is "try"
  //   The handler will always be called and any error handling can be handled within
  server.route({
    method: ['GET', 'POST'], // Must handle both GET and POST
    path: '/login',          // The callback endpoint registered with the provider
    config: {
      auth: {
        mode: 'try',
        strategy: 'github',
      },
      handler: function(request, reply) {
        if (!request.auth.isAuthenticated) {
          return reply.view('error', { err: request.auth.error.message });
        }

        request.auth.session.set({ username: request.auth.credentials.profile.username });
        reply.redirect('/');
      }
    }
  });

  // Register a route to destroy any existing session and redirect the client to the home page.
  server.route({
    method: 'GET',
    path: '/logout',
    config: {
      auth: {
        mode: 'try',
        strategy: 'session',
      }
    },
    handler: function(request, reply) {
      request.auth.session.clear();
      reply.redirect('/');
    }
  });

  // Start listening for requests
  server.start(function() {
    console.log(Pkg.name + '@' + Pkg.version + ' is running at ' + server.info.uri);
  });
});