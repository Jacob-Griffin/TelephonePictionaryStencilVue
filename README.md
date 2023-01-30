# Blow Your Face Off 2.0

This is an updated version of the online "telephone pictionary" app [blowyourfaceoff.com](https://blowyourfaceoff.com), using more modern tooling. The goal is to get away from php and the heartbeat model for syncing game state between players.

At it's core, this version is built on Svelte.js in Vite, but in order to capture some older work, it also uses a Stencil.js component library. All this is wrapped up not so neatly into a turborepo with pnpm.

## Running

After cloning the repo, run `pnpm install` at the project root, then `turbo dev`. 
If it's giving you problems about typescript notation in the svelte project, run `turbo build` first, then try `turbo dev` again

## Structure

```
root (turbo)
    /apps
        /tp-app   (svelte + vite)
    /packages
        /byfo-components (stencil.js)
```
All other folders are boilerplate and project setup for the turborepo

## Current State
The app loads right into one the input tools, determined by the round prop on `<tp-input-zone>`. Only the canvas is styled using *some* tailwind. Event model for canvas actions and grabbing the submitted input are in place.