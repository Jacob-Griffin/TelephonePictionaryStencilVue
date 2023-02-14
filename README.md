# Blow Your Face Off 2.0

This is an updated version of the online "telephone pictionary" app [blowyourfaceoff.com](https://blowyourfaceoff.com), using more modern tooling. The goal is to get away from php and the heartbeat model for syncing game state between players.

At it's core, this version is built on Vue.js in Vite, but in order to capture some older work, it also uses a Stencil.js component library. All this is wrapped up not so neatly into a turborepo with pnpm.

## Running

Prerequisites: pnpm (`npm i -g pnpm`, if you need it)

After cloning the repo, run `pnpm install` at the project root, then `turbo dev`. 

The game will then be hosted at localhost:5173, and available to your local network at the same port (vite will tell you the address)

## Structure

```
root (turbo)
    /apps
        /tp-app   (vue + vite)
    /packages
        /byfo-components (stencil.js)
```
All other folders are boilerplate and project setup for the turborepo

## Current State
Vue: The app has a home menu that links to a fully functional lobby via host and join. The game page exists and has what should be complete functionality. The review page does not exist
Solid: The app has a home menu that is set up to display the appropriate modals for Join/Host/View game
    - The Solid version is canceled for now, due to stencil component typings not fitting right into solid