<script lang="ts">
  import { Colorspace, ImageFormat, type SystemConfigDto } from '@immich/sdk';
  import { isEqual } from 'lodash-es';
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  import type { SettingsEventType } from '../admin-settings';
  import SettingSelect from '$lib/components/shared-components/settings/setting-select.svelte';

  import SettingSwitch from '$lib/components/shared-components/settings/setting-switch.svelte';
  import SettingButtonsRow from '$lib/components/shared-components/settings/setting-buttons-row.svelte';
  import SettingInputField, {
    SettingInputFieldType,
  } from '$lib/components/shared-components/settings/setting-input-field.svelte';

  export let savedConfig: SystemConfigDto;
  export let defaultConfig: SystemConfigDto;
  export let config: SystemConfigDto; // this is the config that is being edited
  export let disabled = false;

  const dispatch = createEventDispatcher<SettingsEventType>();
</script>

<div>
  <div in:fade={{ duration: 500 }}>
    <form autocomplete="off" on:submit|preventDefault>
      <div class="ml-4 mt-4 flex flex-col gap-4">
        <SettingSelect
          label="缩略图格式"
          desc="WebP 生成的文件比 JPEG 更小，但编码速度较慢。"
          bind:value={config.image.thumbnailFormat}
          options={[
            { value: ImageFormat.Jpeg, text: 'JPEG' },
            { value: ImageFormat.Webp, text: 'WebP' },
          ]}
          name="format"
          isEdited={config.image.thumbnailFormat !== savedConfig.image.thumbnailFormat}
          {disabled}
        />

        <SettingSelect
          label="缩略图分辨率"
          desc="用于查看一组照片（主时间轴、相册视图等）。更高的分辨率可以保留更多细节，但编码时间更长，文件大小更大，可能会降低应用程序的响应速度。"
          number
          bind:value={config.image.thumbnailSize}
          options={[
            { value: 1080, text: '1080p' },
            { value: 720, text: '720p' },
            { value: 480, text: '480p' },
            { value: 250, text: '250p' },
            { value: 200, text: '200p' },
          ]}
          name="resolution"
          isEdited={config.image.thumbnailSize !== savedConfig.image.thumbnailSize}
          {disabled}
        />

        <SettingSelect
          label="预览格式"
          desc="WebP 生成的文件比 JPEG 更小，但编码速度较慢。"
          bind:value={config.image.previewFormat}
          options={[
            { value: ImageFormat.Jpeg, text: 'JPEG' },
            { value: ImageFormat.Webp, text: 'WebP' },
          ]}
          name="format"
          isEdited={config.image.previewFormat !== savedConfig.image.previewFormat}
          {disabled}
        />

        <SettingSelect
          label="预览分辨率"
          desc="用于查看单个照片和机器学习时。更高的分辨率可以保留更多细节，但编码时间更长，文件大小更大，可能会降低应用程序的响应速度。"
          number
          bind:value={config.image.previewSize}
          options={[
            { value: 2160, text: '4K' },
            { value: 1440, text: '1440p' },
            { value: 1080, text: '1080p' },
            { value: 720, text: '720p' },
          ]}
          name="resolution"
          isEdited={config.image.previewSize !== savedConfig.image.previewSize}
          {disabled}
        />

        <SettingInputField
          inputType={SettingInputFieldType.NUMBER}
          label="质量"
          desc="图像质量从1到100。质量越高，文件越大。"
          bind:value={config.image.quality}
          isEdited={config.image.quality !== savedConfig.image.quality}
          {disabled}
        />

        <SettingSwitch
          id="prefer-wide-gamut"
          title="优先选择广色域"
          subtitle="使用Display P3来生成缩略图。这样可以更好地保留具有广色域的图像的鲜艳度，但在旧设备和旧浏览器版本上，图像可能会显示不同。sRGB 图像保持为 sRGB，以避免颜色偏移。"
          checked={config.image.colorspace === Colorspace.P3}
          on:toggle={(e) => (config.image.colorspace = e.detail ? Colorspace.P3 : Colorspace.Srgb)}
          isEdited={config.image.colorspace !== savedConfig.image.colorspace}
          {disabled}
        />

        <SettingSwitch
          id="prefer-embedded"
          title="优先嵌入式预览"
          subtitle="当可用时，将 RAW 照片的嵌入式预览用作图像处理的输入。这可能会为某些图像产生更准确的颜色，但预览的质量取决于相机，并且图像可能具有更多压缩缺陷。"
          checked={config.image.extractEmbedded}
          on:toggle={() => (config.image.extractEmbedded = !config.image.extractEmbedded)}
          isEdited={config.image.extractEmbedded !== savedConfig.image.extractEmbedded}
          {disabled}
        />
      </div>

      <div class="ml-4">
        <SettingButtonsRow
          on:reset={({ detail }) => dispatch('reset', { ...detail, configKeys: ['image'] })}
          on:save={() => dispatch('save', { image: config.image })}
          showResetToDefault={!isEqual(savedConfig.image, defaultConfig.image)}
          {disabled}
        />
      </div>
    </form>
  </div>
</div>
