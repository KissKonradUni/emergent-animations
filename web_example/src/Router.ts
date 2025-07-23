import HomeRoute from './routes/Home.svelte';
import NotFoundRoute from './routes/NotFound.svelte';

import ThesisRoute from './routes/Thesis.svelte';
import AboutRoute from './routes/About.svelte';

import ExamplesRoute from './routes/examples/Examples.svelte';
import FunctionalAnimations from './routes/examples/FunctionalAnimations.svelte';
import FrameAnimations from './routes/examples/FrameAnimations.svelte';
import CellularAutomatas from './routes/examples/CellularAutomatas.svelte';

const Callbacks: Array<(route: IRoute | null) => void> = [];

export interface IRoute {
    component: typeof HomeRoute | null;
    title: string;
    href: string;
}

const RouteArray = [
    { href: '/'        , component: HomeRoute,     title: 'Home'    },
    { href: '/404'     , component: NotFoundRoute, title: '404'     },

    { href: '/thesis'  , component: ThesisRoute,   title: 'Thesis'  },
    { href: '/about'   , component: AboutRoute,    title: 'About'   },

    { href: '/examples', component: ExamplesRoute, title: 'Examples'},
    { href: '/examples/functional-animations', component: FunctionalAnimations, title: 'Functional Animations' },
    { href: '/examples/frame-animations', component: FrameAnimations, title: 'Frame Animations' },
    { href: '/examples/cellular-automatas', component: CellularAutomatas, title: 'Cellular Automatas' },
];

export const Routes: Record<string, IRoute> = RouteArray.reduce((collection: Record<string, IRoute>, route) => {
    collection[route.href] = route;
    return collection;
}, {});

let CurrentRoute: IRoute | null = Routes[globalThis.location.pathname] ?? Routes['/404'];

export function Navigate(path: string) {
    globalThis.history.pushState({}, '', path);   
    CurrentRoute = Routes[path] ?? Routes['/404'];
    Callbacks.forEach(callback => callback(CurrentRoute));
}

export function getCurrentRoute(): IRoute | null {
    return CurrentRoute;
}

export function onRouteChange(callback: (route: IRoute | null) => void) {
    Callbacks.push(callback);
}