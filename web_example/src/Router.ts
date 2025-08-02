import HomeRoute from "./routes/Home.svelte";
import NotFoundRoute from "./routes/NotFound.svelte";

import ThesisRoute from "./routes/Thesis.svelte";
import AboutRoute from "./routes/About.svelte";

import ExamplesRoute from "./routes/examples/Examples.svelte";
import ExamplePage from "./routes/examples/ExamplePage.svelte";

import { CanvasScene } from "./rendering/CanvasScene.ts";

import { SimpleFunctional } from "./rendering/scenes/SimpleFunctional.ts";
import { SimpleInterpolation } from "./rendering/scenes/SimpleInterpolation.ts";
import { SimpleSequence } from "./rendering/scenes/SimpleSequence.ts";
import { ComplexSequence } from "./rendering/scenes/ComplexSequence.ts";
import { SimpleFrameAnimation } from "./rendering/scenes/SimpleFrameAnimation.ts";
import { CatPendulum } from "./rendering/scenes/CatPendulum.ts";
import { GameOfLife } from "./rendering/scenes/GameOfLife.ts";
import { Boids } from "./rendering/scenes/Boids.ts";

declare const __IS_LOCAL__: boolean;
console.log(`Running in ${__IS_LOCAL__ ? "local" : "production"} mode.`);
export const IS_LOCAL = __IS_LOCAL__;
export const BASE_URL = (typeof __IS_LOCAL__ !== "undefined" && __IS_LOCAL__) ? "" : "/emergent-animations";

const Callbacks: Array<(route: IRoute | null) => void> = [];

export interface IRoute {
    component: typeof HomeRoute | null;
    title: string;
    href: string;
    props?: Record<string, unknown>;
}

interface ExampleCategory {
    title: string;
    href: string;
    examples?: {
        name: string;
        scene: ReturnType<typeof CanvasScene.provide>;
    }[];
}

const Examples: ExampleCategory[] = [
    { title: "Functional Animations", href: "/examples/functional-animations",
        examples: [
            { name: "Simple functional"   , scene: SimpleFunctional.provide() },
            { name: "Simple interpolation", scene: SimpleInterpolation.provide() },
            { name: "Simple sequence"     , scene: SimpleSequence.provide() },
            { name: "Complex sequence"    , scene: ComplexSequence.provide() },
        ]
    },
    { title: "Frame Animations", href: "/examples/frame-animations",
        examples: [
            { name: "Simple animation" , scene: SimpleFrameAnimation.provide() },
            { name: "Complex animation", scene: CatPendulum.provide() },
        ]
    },
    { title: "Rule Based Animations", href: "/examples/rule-based-animations",
        examples: [
            { name: "Game of Life", scene: GameOfLife.provide() },
            { name: "Boids"       , scene: Boids.provide() },
        ]
    },
];

const RouteArray = [
    { href: "/"        , component: HomeRoute, title: "Home" },
    { href: "/404"     , component: NotFoundRoute, title: "404" },
    
    { href: "/thesis"  , component: ThesisRoute, title: "Thesis" },
    { href: "/about"   , component: AboutRoute, title: "About" },
    
    { href: "/examples", component: ExamplesRoute, title: "Examples" },
    
    ...Examples.map(category => ({
        href: category.href,
        title: category.title,
        component: ExamplePage,
        props: {
            title: category.title,
            pages: category.examples || [],
        },
    })),
];

export const Routes: Record<string, IRoute> = RouteArray.reduce(
    (collection: Record<string, IRoute>, route) => {
        collection[route.href] = route;
        return collection;
    },
    {},
);

let CurrentRoute: IRoute | null =
Routes[globalThis.location.pathname.replace(BASE_URL, "")] ?? Routes["/404"];

export function Navigate(path: string) {
    globalThis.history.pushState({}, "", BASE_URL + path);
    CurrentRoute = Routes[path] ?? Routes["/404"];
    Callbacks.forEach((callback) => callback(CurrentRoute));
}

export function getCurrentRoute(): IRoute | null {
    return CurrentRoute;
}

export function onRouteChange(callback: (route: IRoute | null) => void) {
    Callbacks.push(callback);
}

globalThis.addEventListener("popstate", () => {
    const path = globalThis.location.pathname.replace(BASE_URL, "");
    CurrentRoute = Routes[path] ?? Routes["/404"];
    Callbacks.forEach((callback) => callback(CurrentRoute));
});
