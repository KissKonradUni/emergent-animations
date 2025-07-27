import { defineConfig } from "vite";
import deno from "@deno/vite-plugin";
import { svelte } from "@sveltejs/vite-plugin-svelte";

// https://vite.dev/config/
export default defineConfig(({ command }) => {
    const isLocal = command === "serve";
    return {
        plugins: [
            deno(),
            svelte(),
            /* // Seems like no longer needed?
            {
                name: "full-reload-on-change",
                handleHotUpdate({ file, server }) {
                    if (file.endsWith("src/rendering/CanvasWrapper.ts")) {
                        console.log("Reloading page due to CanvasWrapper.ts change...");
                        server.ws.send({
                            type: "full-reload",
                            path: "*",
                        });
                    }
                },
            },
            */
            {
                name: "filepath-macro",
                transform(code, id) {
                    if (id.endsWith(".ts") || id.endsWith(".js")) {
                        const path = id.split("/web_example/")[1];
                        const hackRegexp = new RegExp(/export class ([A-Za-z_][A-Za-z0-9_]*) extends CanvasScene \{/, 'g');
                        const match = hackRegexp.exec(code);
                        if (match) {
                            console.log(`[filepath-macro] Patching file path in ${path}`);
                            const className = match[1];
                            code = code.replace(
                                `export class ${className} extends CanvasScene {`,
                                `export class ${className} extends CanvasScene {
                                    getFileInfo() {
                                        return '${path}';
                                    }`,
                            );
                        }
                    }
                    return code;
                },
            },
        ],
        base: isLocal ? "/" : "/emergent-animations/",
        define: {
            __IS_LOCAL__: JSON.stringify(isLocal),
        },
    };
});
