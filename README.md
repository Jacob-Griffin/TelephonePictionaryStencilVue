# Blow Your Face Off 2.0

This is an updated version of the online "telephone pictionary" app [blowyourfaceoff.com](https://blowyourfaceoff.com), using more modern tooling. The goal is to get away from php and the heartbeat model for syncing game state between players.

At it's core, this version is built on Vue.js in Vite, but in order to capture some older work, it also uses a Stencil.js component library. All this is wrapped up not so neatly into a turborepo with pnpm.

## Running

Prerequisites: pnpm (`npm i -g pnpm`, if you need it)

After cloning the repo, run `pnpm install` at the project root, then `turbo dev`

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
The app has a home menu that links to a working sample of a single round's gameplay
