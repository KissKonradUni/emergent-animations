import HomeRoute from './routes/Home.svelte';
import ThesisRoute from './routes/Thesis.svelte';
import ExamplesRoute from './routes/Examples.svelte';
import AboutRoute from './routes/About.svelte';

import NotFoundRoute from './routes/NotFound.svelte';

const Callbacks: Array<(route: Route | null) => void> = [];

export interface Route {
    component: typeof HomeRoute | null;
    title: string;
    href: string;
}

const RouteArray = [
    { href: '/'        , component: HomeRoute,     title: 'Home'    },
    { href: '/thesis'  , component: ThesisRoute,   title: 'Thesis'  },
    { href: '/examples', component: ExamplesRoute, title: 'Examples'},
    { href: '/about'   , component: AboutRoute,    title: 'About'   },
    { href: '/404'     , component: NotFoundRoute, title: '404'     },
];

export const Routes: Record<string, Route> = RouteArray.reduce((collection: Record<string, Route>, route) => {
    collection[route.href] = route;
    return collection;
}, {});

let CurrentRoute: Route | null = Routes[globalThis.location.pathname] ?? Routes['/404'];

export function Navigate(path: string) {
    globalThis.history.pushState({}, '', path);   
    CurrentRoute = Routes[path] ?? Routes['/404'];
    Callbacks.forEach(callback => callback(CurrentRoute));
}

export function getCurrentRoute(): Route | null {
    return CurrentRoute;
}

export function onRouteChange(callback: (route: Route | null) => void) {
    Callbacks.push(callback);
}