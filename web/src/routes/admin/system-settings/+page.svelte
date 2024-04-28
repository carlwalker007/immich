<script lang="ts">
  import AdminSettings from '$lib/components/admin-page/settings/admin-settings.svelte';
  import FFmpegSettings from '$lib/components/admin-page/settings/ffmpeg/ffmpeg-settings.svelte';
  import JobSettings from '$lib/components/admin-page/settings/job-settings/job-settings.svelte';
  import LibrarySettings from '$lib/components/admin-page/settings/library-settings/library-settings.svelte';
  import LoggingSettings from '$lib/components/admin-page/settings/logging-settings/logging-settings.svelte';
  import MachineLearningSettings from '$lib/components/admin-page/settings/machine-learning-settings/machine-learning-settings.svelte';
  import MapSettings from '$lib/components/admin-page/settings/map-settings/map-settings.svelte';
  import NewVersionCheckSettings from '$lib/components/admin-page/settings/new-version-check-settings/new-version-check-settings.svelte';
  import OAuthSettings from '$lib/components/admin-page/settings/oauth/oauth-settings.svelte';
  import PasswordLoginSettings from '$lib/components/admin-page/settings/password-login/password-login-settings.svelte';
  import ServerSettings from '$lib/components/admin-page/settings/server/server-settings.svelte';
  import SettingAccordion from '$lib/components/shared-components/settings/setting-accordion.svelte';
  import StorageTemplateSettings from '$lib/components/admin-page/settings/storage-template/storage-template-settings.svelte';
  import ThemeSettings from '$lib/components/admin-page/settings/theme/theme-settings.svelte';
  import ImageSettings from '$lib/components/admin-page/settings/image/image-settings.svelte';
  import TrashSettings from '$lib/components/admin-page/settings/trash-settings/trash-settings.svelte';
  import UserSettings from '$lib/components/admin-page/settings/user-settings/user-settings.svelte';
  import LinkButton from '$lib/components/elements/buttons/link-button.svelte';
  import Icon from '$lib/components/elements/icon.svelte';
  import UserPageLayout from '$lib/components/layouts/user-page-layout.svelte';
  import { downloadManager } from '$lib/stores/download';
  import { featureFlags } from '$lib/stores/server-config.store';
  import { copyToClipboard } from '$lib/utils';
  import { downloadBlob } from '$lib/utils/asset-utils';
  import { mdiAlert, mdiContentCopy, mdiDownload, mdiUpload } from '@mdi/js';
  import type { PageData } from './$types';
  import SettingAccordionState from '$lib/components/shared-components/settings/setting-accordion-state.svelte';
  import { QueryParameter } from '$lib/constants';
  import type { SystemConfigDto } from '@immich/sdk';

  export let data: PageData;

  let config = data.configs;
  let handleSave: (update: Partial<SystemConfigDto>) => Promise<void>;

  type Settings =
    | typeof JobSettings
    | typeof LibrarySettings
    | typeof LoggingSettings
    | typeof MachineLearningSettings
    | typeof MapSettings
    | typeof OAuthSettings
    | typeof PasswordLoginSettings
    | typeof ServerSettings
    | typeof StorageTemplateSettings
    | typeof ThemeSettings
    | typeof ImageSettings
    | typeof TrashSettings
    | typeof NewVersionCheckSettings
    | typeof FFmpegSettings
    | typeof UserSettings;

  const downloadConfig = () => {
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const downloadKey = 'immich-config.json';
    downloadManager.add(downloadKey, blob.size);
    downloadManager.update(downloadKey, blob.size);
    downloadBlob(blob, downloadKey);
    setTimeout(() => downloadManager.clear(downloadKey), 5000);
  };

  let inputElement: HTMLInputElement;
  const uploadConfig = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) {
      return;
    }
    const reader = async () => {
      const text = await file.text();
      const newConfig = JSON.parse(text);
      await handleSave(newConfig);
    };
    reader().catch((error) => console.error('Error handling JSON config upload', error));
  };

  const settings: Array<{
    item: Settings;
    title: string;
    subtitle: string;
    key: string;
  }> = [
    {
      item: ImageSettings,
      title: '图像设置',
      subtitle: '管理生成图像的质量和分辨率',
      key: 'image',
    },
    {
      item: JobSettings,
      title: '任务设置',
      subtitle: '管理任务并发',
      key: 'job',
    },
    {
      item: LibrarySettings,
      title: '外部库',
      subtitle: '管理外部库设置',
      key: 'external-library',
    },
    {
      item: LoggingSettings,
      title: '日志记录',
      subtitle: '管理日志设置',
      key: 'logging',
    },
    {
      item: MachineLearningSettings,
      title: '机器学习设置',
      subtitle: '管理机器学习功能和设置',
      key: 'machine-learning',
    },
    {
      item: MapSettings,
      title: '地图和GPS设置',
      subtitle: '管理与地图相关的功能和设置',
      key: 'location',
    },
    {
      item: OAuthSettings,
      title: 'OAuth 认证',
      subtitle: '管理使用 OAuth 登录的设置',
      key: 'oauth',
    },
    {
      item: PasswordLoginSettings,
      title: '密码认证',
      subtitle: '管理使用密码登录的设置',
      key: 'password',
    },
    {
      item: ServerSettings,
      title: '服务器设置',
      subtitle: '管理服务器设置',
      key: 'server',
    },
    {
      item: StorageTemplateSettings,
      title: '存储模板',
      subtitle: '管理上传资产的文件夹结构和文件名',
      key: 'storage-template',
    },
    {
      item: ThemeSettings,
      title: '主题设置',
      subtitle: '管理 Immich 网页界面的定制',
      key: 'theme',
    },
    {
      item: TrashSettings,
      title: '回收站设置',
      subtitle: '管理回收站设置',
      key: 'trash',
    },
    {
      item: UserSettings,
      title: '用户设置',
      subtitle: '管理用户设置',
      key: 'user-settings',
    },
    {
      item: NewVersionCheckSettings,
      title: '版本检查',
      subtitle: '启用/禁用新版本通知',
      key: 'version-check',
    },
    {
      item: FFmpegSettings,
      title: '视频转码设置',
      subtitle: '管理视频文件的分辨率和编码信息',
      key: 'video-transcoding',
    },
  ];
</script>

<input bind:this={inputElement} type="file" accept=".json" style="display: none" on:change={uploadConfig} />

<div class="h-svh flex flex-col overflow-hidden">
  {#if $featureFlags.configFile}
    <div class="flex flex-row items-center gap-2 bg-gray-100 p-3 dark:bg-gray-800">
      <Icon path={mdiAlert} class="text-yellow-400" size={18} />
      <h2 class="text-md text-immich-primary dark:text-immich-dark-primary">
        Config is currently set by a config file
      </h2>
    </div>
  {/if}

  <UserPageLayout title={data.meta.title} admin>
    <div class="flex justify-end gap-2" slot="buttons">
      <LinkButton on:click={() => copyToClipboard(JSON.stringify(config, null, 2))}>
        <div class="flex place-items-center gap-2 text-sm">
          <Icon path={mdiContentCopy} size="18" />
          复制到剪贴板
        </div>
      </LinkButton>
      <LinkButton on:click={() => downloadConfig()}>
        <div class="flex place-items-center gap-2 text-sm">
          <Icon path={mdiDownload} size="18" />
          导出为 JSON
        </div>
      </LinkButton>
      <LinkButton on:click={() => inputElement?.click()}>
        <div class="flex place-items-center gap-2 text-sm">
          <Icon path={mdiUpload} size="18" />
          从 JSON 导入
        </div>
      </LinkButton>
    </div>

    <AdminSettings bind:config let:handleReset bind:handleSave let:savedConfig let:defaultConfig>
      <section id="setting-content" class="flex place-content-center sm:mx-4">
        <section class="w-full pb-28 sm:w-5/6 md:w-[850px]">
          <SettingAccordionState queryParam={QueryParameter.IS_OPEN}>
            {#each settings as { item, title, subtitle, key }}
              <SettingAccordion {title} {subtitle} {key}>
                <svelte:component
                  this={item}
                  on:save={({ detail }) => handleSave(detail)}
                  on:reset={({ detail }) => handleReset(detail)}
                  disabled={$featureFlags.configFile}
                  {defaultConfig}
                  {config}
                  {savedConfig}
                />
              </SettingAccordion>
            {/each}
          </SettingAccordionState>
        </section>
      </section>
    </AdminSettings>
  </UserPageLayout>
</div>
