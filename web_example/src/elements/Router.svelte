<script lang="ts">
    import { getCurrentRoute, onRouteChange } from '../Router';

    let CurrentRoute = $state(getCurrentRoute());
    let CurrentComponent: typeof CurrentRoute.component | null = $derived(CurrentRoute?.component);
    let CurrentTitle: string = $derived(CurrentRoute?.title || '*');
    onRouteChange((route) => {
        CurrentRoute = route;
    });
</script>

<svelte:head>
    <title>Emergent Animations - {CurrentTitle}</title>
</svelte:head>

<CurrentComponent></CurrentComponent>
