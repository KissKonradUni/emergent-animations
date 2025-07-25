<script lang="ts">
    import Page from '../../elements/Page.svelte';
    import Canvas from '../../elements/Canvas.svelte';
    import Tabs from '../../elements/Tabs.svelte';
    import Tab from '../../elements/Tab.svelte';

    import { GameOfLife } from '../../rendering/scenes/GameOfLife';
</script>

<Page title="Cellular Automatas">
    <Tabs>
        <Tab title="Conway's Game of Life">
            <Canvas scene={GameOfLife.provide()}></Canvas>
        </Tab>
    </Tabs>
</Page>