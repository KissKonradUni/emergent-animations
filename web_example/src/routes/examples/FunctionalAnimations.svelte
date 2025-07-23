<script lang="ts">
    import Page from '../../elements/Page.svelte';
    import Canvas from '../../elements/Canvas.svelte';
    import Tabs from '../../elements/Tabs.svelte';
    import Tab from '../../elements/Tab.svelte';

    import { SimpleFunctional } from '../../rendering/scenes/SimpleFunctional';
</script>

<Page title="Functional Animations">
    <Tabs>
        <Tab title="Simple example">
            <Canvas scene={SimpleFunctional.provide()}></Canvas>
        </Tab>
    </Tabs>
</Page>