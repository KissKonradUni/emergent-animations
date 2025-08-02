<script lang="ts">
    import Canvas from "../../elements/Canvas.svelte";
    import Page from "../../elements/Page.svelte";
    
    import Tabs from "../../elements/Tabs.svelte";
    import Tab from "../../elements/Tab.svelte";
	import { CanvasScene } from "../../rendering/CanvasScene";

    interface ExamplePageProps {
        title: string;
        pages: {
            name: string;
            scene: ReturnType<typeof CanvasScene.provide>;
        }[];
    }

    const props: ExamplePageProps = $props();
</script>

<Page title={props.title}>
    <Tabs>
        {#each props.pages as page}
            <Tab title={page.name}>
                <Canvas scene={page.scene} />
            </Tab>
        {/each}
    </Tabs>
</Page>