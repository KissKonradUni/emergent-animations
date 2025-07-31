<script lang="ts">
    import Page from '../../elements/Page.svelte';
    import Canvas from '../../elements/Canvas.svelte';
    import Tabs from '../../elements/Tabs.svelte';
    import Tab from '../../elements/Tab.svelte';

    import { GameOfLife } from '../../rendering/scenes/GameOfLife';
    import { Boids } from '../../rendering/scenes/Boids';
</script>

<Page title="Rule Based Animations">
    <Tabs>
        <Tab title="Conway's Game of Life">
            <Canvas scene={GameOfLife.provide()}></Canvas>
        </Tab>
        <Tab title="Boids">
            <Canvas scene={Boids.provide()}></Canvas>
        </Tab>            
    </Tabs>
</Page>