# Blow Your Face Off 2.0

This is an updated version of the online "telephone pictionary" app [blowyourfaceoff.com](https://blowyourfaceoff.com), using more modern tooling. The goal is to get away from php and the heartbeat model for syncing game state between players. I instead opted for firebase real-time database subscription.

At it's core, this version is built on Vue.js in Vite, but in order to capture some older work, it also uses a Stencil.js component library. All this is wrapped up not so neatly into a turborepo with pnpm.

## Running

#### Prerequisites: 
- Node JS
- pnpm (`npm i -g pnpm`, if you need it)
- A firebase config object

<hr>

1. After cloning the repo, run `pnpm install` at the project root
2. In /apps/tp-app, create a firebase.config.js and export your config object as default
    - There are template files for firebase config things 
3. Run `pnpm build`, then `pnpm dev` at the root. 

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
The app is pretty close to what I would consider "Minimum shippable" but still has glaring issues to take care of. Demo/Test builds are available at https://byfo.jacob-g.dev
