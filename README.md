# Blow Your Face Off 2.0

This is an updated version of the online "telephone pictionary" app [blowyourfaceoff.com](https://blowyourfaceoff.com), using more modern tooling. The goal is to get away from php and the heartbeat model for syncing game state between players. I instead opted for firebase real-time database subscription.

This project started as a Vue+Vite app backed by some stencil.js webcomponents to capture some older work. In order to make future migrations easier, I'm moving the more reusable bits out into a typescript utils package.

## Running

#### Prerequisites:

- Node JS
- pnpm (`npm i -g pnpm`, if you need it)
- A firebase config object
- An Algolia index named 'blow_your_face_off_index'

<hr>

1. After cloning the repo, run `pnpm install` at the project root
2. In /apps/tp-app, create a firebase.secrets.js and export your firebase config object
   - This is just to keep my own keys private, and to support github action publishing.
3. In /apps/tp-app, create a copy of algolia.secrets.template.js call algolia.secrets.js, and sub in your api key and app name 
4. Run `pnpm build`, then `pnpm dev` at the root.

The game will then be hosted at localhost:5150, and available to your local network at the same port (vite will tell you the address)

## Structure

```
root (turbo)
    /apps
        /tp-app   (vue + vite)
    /packages
        /byfo-components (stencil.js)
        /byfo-theme (css + typescript)
        /byfo-utils (typescript)
```

All other folders are boilerplate and project setup for the turborepo

## Current State

The app is pretty much what I would consider "Minimum shippable", plus a lot of easy wins, but still has a few minor issues to take care of. Demo/Test builds are available at https://beta.byfo.net
