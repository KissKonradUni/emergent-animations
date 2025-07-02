import { AsyncInit } from "./async.ts";
import { FloatingNavigator } from "./elements/navigation.ts";

export class App implements AsyncInit {
    private navigator: FloatingNavigator | null = null;

    public async init(): Promise<void> {
        console.log("🌟 App initialized");

        this.navigator = new FloatingNavigator();
        await this.navigator.init();

        return;
    }

    public async destroy(): Promise<void> {
        console.log("🗑️ App destroyed");

        if (this.navigator) {
            await this.navigator.destroy();
            this.navigator = null;
        }

        return;
    }

}