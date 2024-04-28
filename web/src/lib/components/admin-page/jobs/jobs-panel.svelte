<script lang="ts">
  import {
    notificationController,
    NotificationType,
  } from '$lib/components/shared-components/notification/notification';
  import { featureFlags } from '$lib/stores/server-config.store';
  import { getJobName } from '$lib/utils';
  import { handleError } from '$lib/utils/handle-error';
  import { JobCommand, JobName, sendJobCommand, type AllJobStatusResponseDto, type JobCommandDto } from '@immich/sdk';
  import {
    mdiFaceRecognition,
    mdiFileJpgBox,
    mdiFileXmlBox,
    mdiFolderMove,
    mdiImageSearch,
    mdiLibraryShelves,
    mdiTable,
    mdiTagFaces,
    mdiVideo,
  } from '@mdi/js';
  import type { ComponentType } from 'svelte';
  import ConfirmDialogue from '../../shared-components/confirm-dialogue.svelte';
  import JobTile from './job-tile.svelte';
  import StorageMigrationDescription from './storage-migration-description.svelte';

  export let jobs: AllJobStatusResponseDto;

  interface JobDetails {
    title: string;
    subtitle?: string;
    allText?: string;
    missingText?: string;
    disabled?: boolean;
    icon: string;
    allowForceCommand?: boolean;
    component?: ComponentType;
    handleCommand?: (jobId: JobName, jobCommand: JobCommandDto) => Promise<void>;
  }

  let confirmJob: JobName | null = null;

  const handleConfirmCommand = async (jobId: JobName, dto: JobCommandDto) => {
    if (dto.force) {
      confirmJob = jobId;
      return;
    }

    await handleCommand(jobId, dto);
  };

  const onConfirm = async () => {
    if (!confirmJob) {
      return;
    }
    await handleCommand(confirmJob, { command: JobCommand.Start, force: true });
    confirmJob = null;
  };

  $: jobDetails = <Partial<Record<JobName, JobDetails>>>{
    [JobName.ThumbnailGeneration]: {
      icon: mdiFileJpgBox,
      title: getJobName(JobName.ThumbnailGeneration),
      subtitle: '为每个资产生成大、小和模糊的缩略图，以及每个人的缩略图',
    },
    [JobName.MetadataExtraction]: {
      icon: mdiTable,
      title: getJobName(JobName.MetadataExtraction),
      subtitle: '从每个资产中提取元数据信息，例如 GPS 和分辨率',
    },
    [JobName.Library]: {
      icon: mdiLibraryShelves,
      title: getJobName(JobName.Library),
      subtitle: '执行库任务',
      allText: '全部',
      missingText: '刷新',
    },
    [JobName.Sidecar]: {
      title: getJobName(JobName.Sidecar),
      icon: mdiFileXmlBox,
      subtitle: '发现或同步来自文件系统的辅助元数据',
      allText: '同步',
      missingText: '发现',
      disabled: !$featureFlags.sidecar,
    },
    [JobName.SmartSearch]: {
      icon: mdiImageSearch,
      title: getJobName(JobName.SmartSearch),
      subtitle: '对资产运行机器学习，以支持智能搜索',
      disabled: !$featureFlags.smartSearch,
    },
    [JobName.FaceDetection]: {
      icon: mdiFaceRecognition,
      title: getJobName(JobName.FaceDetection),
      subtitle:
        '使用机器学习检测资产中的人脸。对于视频，仅考虑缩略图。 "全部"（重新）处理所有资产。 "缺失" 将未处理的资产加入队列。在完成人脸检测后，检测到的人脸将被排队进行面部识别，并将它们分组到现有或新的人物中。',
      handleCommand: handleConfirmCommand,
      disabled: !$featureFlags.facialRecognition,
    },
    [JobName.FacialRecognition]: {
      icon: mdiTagFaces,
      title: getJobName(JobName.FacialRecognition),
      subtitle:
        '将检测到的人脸分组到人物中。此步骤在人脸检测完成后运行。 "全部"（重新）对所有人脸进行聚类。 "缺失" 将未分配人物的人脸加入队列。',
      handleCommand: handleConfirmCommand,
      disabled: !$featureFlags.facialRecognition,
    },
    [JobName.VideoConversion]: {
      icon: mdiVideo,
      title: getJobName(JobName.VideoConversion),
      subtitle: '为了更广泛地兼容浏览器和设备，对视频进行转码',
    },
    [JobName.StorageTemplateMigration]: {
      icon: mdiFolderMove,
      title: getJobName(JobName.StorageTemplateMigration),
      allowForceCommand: false,
      component: StorageMigrationDescription,
    },
    [JobName.Migration]: {
      icon: mdiFolderMove,
      title: getJobName(JobName.Migration),
      subtitle: '将资产和人脸的缩略图迁移到最新的文件夹结构',
      allowForceCommand: false,
    },
  };
  $: jobList = Object.entries(jobDetails) as [JobName, JobDetails][];

  async function handleCommand(jobId: JobName, jobCommand: JobCommandDto) {
    const title = jobDetails[jobId]?.title;

    try {
      jobs[jobId] = await sendJobCommand({ id: jobId, jobCommandDto: jobCommand });

      switch (jobCommand.command) {
        case JobCommand.Empty: {
          notificationController.show({
            message: `Cleared jobs for: ${title}`,
            type: NotificationType.Info,
          });
          break;
        }
      }
    } catch (error) {
      handleError(error, `Command '${jobCommand.command}' failed for job: ${title}`);
    }
  }
</script>

{#if confirmJob}
  <ConfirmDialogue
    id="reprocess-faces-modal"
    prompt="Are you sure you want to reprocess all faces? This will also clear named people."
    {onConfirm}
    onClose={() => (confirmJob = null)}
  />
{/if}

<div class="flex flex-col gap-7">
  {#each jobList as [jobName, { title, subtitle, disabled, allText, missingText, allowForceCommand, icon, component, handleCommand: handleCommandOverride }]}
    {@const { jobCounts, queueStatus } = jobs[jobName]}
    <JobTile
      {icon}
      {title}
      {disabled}
      {subtitle}
      allText={allText || '全部'}
      missingText={missingText || '缺失'}
      {allowForceCommand}
      {jobCounts}
      {queueStatus}
      on:command={({ detail }) => (handleCommandOverride || handleCommand)(jobName, detail)}
    >
      {#if component}
        <svelte:component this={component} slot="description" />
      {/if}
    </JobTile>
  {/each}
</div>
