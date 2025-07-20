<script lang="ts">
    import Canvas from "../../elements/Canvas.svelte";
    import Page from "../../elements/Page.svelte";
    
    import Tabs from "../../elements/Tabs.svelte";
    import Tab from "../../elements/Tab.svelte";

    import { CatPendulum } from "../../rendering/scenes/CatPendulum";
</script>

<Page title="Frame Animations">
    <Tabs>
        <Tab title="Simple">
            <Canvas></Canvas>
        </Tab>
        <Tab title="Complex">
            <Canvas scene={CatPendulum.provide()}></Canvas>
        </Tab>
    </Tabs>
</Page>