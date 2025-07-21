<script lang="ts">
    import Page from '../../elements/Page.svelte';
    import Canvas from '../../elements/Canvas.svelte';
    import Tabs from '../../elements/Tabs.svelte';
    import Tab from '../../elements/Tab.svelte';

    import { CanvasGLScene } from '../../rendering/CanvasGLScene';
</script>

<Page title="Cellular Automatas">
    <Tabs>
        <Tab title="Conway's Game of Life">
            <Canvas scene={CanvasGLScene.provide()}></Canvas>
        </Tab>
    </Tabs>
</Page>