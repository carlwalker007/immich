<script lang="ts">
  import UserPageLayout from '$lib/components/layouts/user-page-layout.svelte';
  import AddToAlbum from '$lib/components/photos-page/actions/add-to-album.svelte';
  import ArchiveAction from '$lib/components/photos-page/actions/archive-action.svelte';
  import ChangeDate from '$lib/components/photos-page/actions/change-date-action.svelte';
  import ChangeLocation from '$lib/components/photos-page/actions/change-location-action.svelte';
  import CreateSharedLink from '$lib/components/photos-page/actions/create-shared-link.svelte';
  import DeleteAssets from '$lib/components/photos-page/actions/delete-assets.svelte';
  import DownloadAction from '$lib/components/photos-page/actions/download-action.svelte';
  import FavoriteAction from '$lib/components/photos-page/actions/favorite-action.svelte';
  import SelectAllAssets from '$lib/components/photos-page/actions/select-all-assets.svelte';
  import AssetGrid from '$lib/components/photos-page/asset-grid.svelte';
  import AssetSelectContextMenu from '$lib/components/photos-page/asset-select-context-menu.svelte';
  import AssetSelectControlBar from '$lib/components/photos-page/asset-select-control-bar.svelte';
  import EmptyPlaceholder from '$lib/components/shared-components/empty-placeholder.svelte';
  import { AssetAction } from '$lib/constants';
  import { createAssetInteractionStore } from '$lib/stores/asset-interaction.store';
  import { AssetStore } from '$lib/stores/assets.store';
  import type { PageData } from './$types';
  import { mdiDotsVertical, mdiPlus } from '@mdi/js';

  export let data: PageData;

  const assetStore = new AssetStore({ isFavorite: true });
  const assetInteractionStore = createAssetInteractionStore();
  const { isMultiSelectState, selectedAssets } = assetInteractionStore;

  $: isAllArchive = [...$selectedAssets].every((asset) => asset.isArchived);
</script>

<!-- Multiselection mode app bar -->
{#if $isMultiSelectState}
  <AssetSelectControlBar assets={$selectedAssets} clearSelect={() => assetInteractionStore.clearMultiselect()}>
    <FavoriteAction removeFavorite onFavorite={(assetIds) => assetStore.removeAssets(assetIds)} />
    <CreateSharedLink />
    <SelectAllAssets {assetStore} {assetInteractionStore} />
    <AssetSelectContextMenu icon={mdiPlus} title="Add to...">
      <AddToAlbum />
      <AddToAlbum shared />
    </AssetSelectContextMenu>
    <AssetSelectContextMenu icon={mdiDotsVertical} title="Menu">
      <DownloadAction menuItem />
      <ChangeDate menuItem />
      <ChangeLocation menuItem />
      <ArchiveAction menuItem unarchive={isAllArchive} onArchive={(assetIds) => assetStore.removeAssets(assetIds)} />
      <DeleteAssets menuItem onAssetDelete={(assetIds) => assetStore.removeAssets(assetIds)} />
    </AssetSelectContextMenu>
  </AssetSelectControlBar>
{/if}

<UserPageLayout hideNavbar={$isMultiSelectState} title={data.meta.title} scrollbar={false}>
  <AssetGrid {assetStore} {assetInteractionStore} removeAction={AssetAction.UNFAVORITE}>
    <EmptyPlaceholder text="添加收藏功能，以快速找到你最喜欢的图片和视频" slot="empty" />
  </AssetGrid>
</UserPageLayout>
