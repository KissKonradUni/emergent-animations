import { App } from "./app.ts";

(async () => {
    const app = new App();
    await app.init(); 
})();