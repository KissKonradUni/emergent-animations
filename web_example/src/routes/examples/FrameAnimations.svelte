<script lang="ts">
    import Canvas from "../../elements/Canvas.svelte";
    import Page from "../../elements/Page.svelte";
    
    import Tabs from "../../elements/Tabs.svelte";
    import Tab from "../../elements/Tab.svelte";
</script>

<Page title="Frame Animations">
    <Tabs>
        <Tab title="Simple">
            <Canvas></Canvas>
        </Tab>
        <Tab title="Complex">
            <Canvas></Canvas>
        </Tab>
    </Tabs>
</Page>