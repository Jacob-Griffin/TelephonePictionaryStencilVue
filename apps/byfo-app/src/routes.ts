import { lazy } from 'solid-js';
import type { RouteDefinition } from '@solidjs/router';

import Home from './pages/home';

export const routes: RouteDefinition[] = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/game/:gameid',
    component: lazy(() => import('./pages/game')),
  },
  {
    path: '/lobby/:gameid',
    component: lazy(() => import('./pages/lobby')),
  },
  {
    path: '**',
    component: lazy(() => import('./errors/404')),
  },
];
