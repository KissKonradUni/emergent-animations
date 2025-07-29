<script lang="ts">
    import Page from '../../elements/Page.svelte';
    import Canvas from '../../elements/Canvas.svelte';
    import Tabs from '../../elements/Tabs.svelte';
    import Tab from '../../elements/Tab.svelte';

    import { SimpleFunctional } from '../../rendering/scenes/SimpleFunctional';
    import { SimpleInterpolation } from '../../rendering/scenes/SimpleInterpolation';
    import { SimpleSequence } from '../../rendering/scenes/SimpleSequence';
    import { ComplexSequence } from '../../rendering/scenes/ComplexSequence';
</script>

<Page title="Functional Animations">
    <Tabs>
        <Tab title="Simple functional">
            <Canvas scene={SimpleFunctional.provide()}></Canvas>
        </Tab>
        <Tab title="Simple interpolation">
            <Canvas scene={SimpleInterpolation.provide()}></Canvas>
        </Tab>
        <Tab title="Simple sequence">
            <Canvas scene={SimpleSequence.provide()}></Canvas>
        </Tab>
        <Tab title="Complex sequence">
            <Canvas scene={ComplexSequence.provide()}></Canvas>
        </Tab>
    </Tabs>
</Page>