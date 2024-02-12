/// <reference lib="webworker" />
/* eslint-disable no-restricted-globals */

// This service worker can be customized!
// See https://developers.google.com/web/tools/workbox/modules
// for the list of available Workbox modules, or add any other
// code you'd like.
// You can also remove this file if you'd prefer not to use a
// service worker, and the Workbox build step will be skipped.

import { clientsClaim } from "workbox-core";
import { ExpirationPlugin } from "workbox-expiration";
import { precacheAndRoute, createHandlerBoundToURL } from "workbox-precaching";
import { registerRoute } from "workbox-routing";
import { NetworkFirst, NetworkOnly, StaleWhileRevalidate } from "workbox-strategies";
import {BackgroundSyncPlugin} from 'workbox-background-sync';

const bgSyncPlugin = new BackgroundSyncPlugin('recipeQueue', {
  maxRetentionTime: 24 * 60, // Retry for max of 24 Hours
  onSync: async ({ queue }) => {
    let entry;
    while (entry = await queue.shiftRequest()) {
      try {
        // Try to replay the request.
        await fetch(entry.request);
      } catch (error) {
        // If replay fails, put the request back in the queue.
        await queue.unshiftRequest(entry);
        break;
      }
    }
    self.clients.matchAll().then(all => all.forEach(client => {
      client.postMessage({
        type: 'RECIPE_SYNC_COMPLETED',
      });
    }));
  },
});

declare const self: ServiceWorkerGlobalScope;

clientsClaim();

// Precache all of the assets generated by your build process.
// Their URLs are injected into the manifest variable below.
// This variable must be present somewhere in your service worker file,
// even if you decide not to use precaching. See https://cra.link/PWA
precacheAndRoute(self.__WB_MANIFEST);

// Set up App Shell-style routing, so that all navigation requests
// are fulfilled with your index.html shell. Learn more at
// https://developers.google.com/web/fundamentals/architecture/app-shell
const fileExtensionRegexp = new RegExp("/[^/?]+\\.[^/]+$");
registerRoute(
  // Return false to exempt requests from being fulfilled by index.html.
  ({ request, url }: { request: Request; url: URL }) => {
    // If this isn't a navigation, skip.
    if (request.mode !== "navigate") {
      return false;
    }

    // If this is a URL that starts with /_, skip.
    if (url.pathname.startsWith("/_")) {
      return false;
    }

    // If this looks like a URL for a resource, because it contains
    // a file extension, skip.
    if (url.pathname.match(fileExtensionRegexp)) {
      return false;
    }

    // Return true to signal that we want to use the handler.
    return true;
  },
  createHandlerBoundToURL(process.env.PUBLIC_URL + "/index.html")
);

// Disable caching for specific URLs
// registerRoute(
//   ({ url }) => url.pathname.startsWith('/'),
//   new NetworkOnly()
// );

registerRoute(
  ({ url }) => url.pathname.startsWith('/recipes/'),
  new NetworkFirst({
    cacheName: "recipes",
    plugins: [
      new ExpirationPlugin({ maxEntries: 50 }),
    ],
  }),
  'GET'
);

registerRoute(
  // Add in any other file extensions or routing criteria as needed.
  ({ url }) => url.pathname.startsWith('/users/me'),
  // Customize this strategy as needed, e.g., by changing to CacheFirst.
  new NetworkFirst({
    cacheName: "me",
    plugins: [
      new ExpirationPlugin({ maxEntries: 1 }),
    ],
  })
);

registerRoute(
  // Add in any other file extensions or routing criteria as needed.
  ({ url }) => url.pathname.startsWith('/recipes/liked'),
  // Customize this strategy as needed, e.g., by changing to CacheFirst.
  new NetworkFirst({
    cacheName: "likedRecipes",
    plugins: [
      new ExpirationPlugin({ maxEntries: 2 }),
    ],
  })
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/recipes'), // Adjust this regex based on your API endpoint
  new NetworkOnly({
    plugins: [bgSyncPlugin],
  }),
  'POST'
);


// An example runtime caching route for requests that aren't handled by the
// precache, in this case same-origin .png requests like those from in public/
registerRoute(
  // Add in any other file extensions or routing criteria as needed.
  ({ url }) =>
    url.origin === self.location.origin && url.pathname.endsWith(".png"),
  // Customize this strategy as needed, e.g., by changing to CacheFirst.
  new StaleWhileRevalidate({
    cacheName: "images",
    plugins: [
      // Ensure that once this runtime cache reaches a maximum size the
      // least-recently used images are removed.
      new ExpirationPlugin({ maxEntries: 50 }),
    ],
  })
);

// This allows the web app to trigger skipWaiting via
// registration.waiting.postMessage({type: 'SKIP_WAITING'})
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Any other custom service worker logic can go here.

self.addEventListener("push", function (event) {
  console.log("[Service Worker] Push Received.");

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((windowClients) => {
      let appIsInForeground = false;

      for (let i = 0; i < windowClients.length; i++) {
        const windowClient = windowClients[i];
        if (windowClient.visibilityState === "visible") {
          appIsInForeground = true;
          // Envoyer un message au client
          windowClient.postMessage({
            message: "Push notification reçue",
            // Autres données si nécessaire
          });
          break;
        }
      }

      // Ici, affichez la notification si l'app n'est pas au premier plan
      // if (!appIsInForeground) {
        const json = event.data?.json();
        const title = json.title || "Untitled";
        const icon = json.icon || "logo192.png";
        const notificationOptions = {
          body: json.body,
          icon, // Chemin vers une icône
          // Vous pouvez ajouter d'autres options comme badge, actions, etc.
        };
        // Affichage de la notification
        return self.registration.showNotification(title, notificationOptions);
      // }
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});
