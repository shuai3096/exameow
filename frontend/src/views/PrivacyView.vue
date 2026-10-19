<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18nStore } from '@/stores/i18n'
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const i18n = useI18nStore()
</script>

<template>
  <div class="max-w-3xl mx-auto pb-10">
    <div class="flex items-center gap-2 mb-6">
      <button class="btn-icon" @click="router.back()">
        <ArrowLeftIcon class="w-5 h-5" />
      </button>
      <h1 class="text-display-sm">{{ i18n.t('privacyTitle') }}</h1>
    </div>

    <div v-if="i18n.locale === 'zh'" class="space-y-5 text-body-md" style="color: rgb(var(--md-on-surface))">
      <p class="text-body-sm" style="color: rgb(var(--md-on-surface-variant))">生效日期:2026 年 7 月 25 日</p>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">1. 概述</h2>
        <p>Exameow(「本应用」)是一款 AI 出题与在线考试工具。本政策说明我们在你使用网页版、桌面端和移动端应用时如何处理数据。我们遵循数据最小化原则:绝大多数数据只保存在你自己的设备上。</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">2. 存储在你设备上的数据</h2>
        <p>以下内容仅保存在你设备的浏览器 localStorage / sessionStorage 或应用沙盒中,<strong>不会上传到我们的服务器</strong>:</p>
        <ul class="list-disc pl-5 space-y-1">
          <li>题库、练习进度与错题记录</li>
          <li>AI 算力配置(API 地址与密钥;桌面端/自托管版经 AES-256-GCM 加密存储)</li>
          <li>你发起与参与的考试记录、交卷后的成绩与解析</li>
          <li>主题、语言等界面偏好及 Cookie 提示的确认状态</li>
        </ul>
        <p>你可以随时通过清除浏览器数据或卸载应用删除以上内容。</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">3. 考试中转数据(Cloudflare D1)</h2>
        <p>当你使用「发起考试 / 参加考试」功能时,以下数据会临时存储在我们的 Cloudflare D1 数据库中:</p>
        <ul class="list-disc pl-5 space-y-1">
          <li>教师发布的考试标题、试题内容(含答案)、考试时间与时长设置</li>
          <li>学生填写的姓名、作答内容、得分与交卷时间</li>
        </ul>
        <p>上述数据<strong>最多保留 7 天</strong>,到期由定时任务自动删除;教师也可以随时在「我的 → 我发起的考试」中主动删除,删除后学生立即无法进入,全部成绩一并清除。学生取题阶段服务器不会下发答案与解析。</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">4. AI 请求</h2>
        <p>出题、搜题、AI 判分等功能会将你提供的学习材料或题目内容发送给 AI 服务商处理。使用 Cloudflare 免费算力时由 Cloudflare Workers AI 处理;使用自定义配置时,内容直接发送给你自己配置的服务商,我们不经过也不留存这些内容。请避免上传含个人隐私或敏感信息的材料。</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">5. Cookie 与追踪</h2>
        <p>我们不使用任何用于广告或追踪的 Cookie,不接入第三方分析或广告服务,不进行跨站追踪。网页仅使用严格必要的本地存储(见第 2 节)。</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">6. 数据共享</h2>
        <p>除以下情形外,我们不与任何第三方共享你的数据:</p>
        <ul class="list-disc pl-5 space-y-1">
          <li>Cloudflare, Inc.(作为基础设施与 Workers AI 处理方)</li>
          <li>你自己配置的 AI 服务商(仅在你主动使用相关功能时)</li>
          <li>法律法规要求的情形</li>
        </ul>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">7. 你的权利</h2>
        <p>无论您身处何地(包括欧盟/欧洲经济区、加州等),您都可以:通过清除浏览器数据删除全部本地数据;要求删除考试中转数据(教师可自行删除,学生可联系发起考试的教师删除);就数据处理问题通过 GitHub Issues 与我们联系。</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">8. 政策变更与联系</h2>
        <p>本政策如有更新,会在本页面公布并更新生效日期。如有疑问,请通过 GitHub 仓库 Issues 联系我们。</p>
      </section>

      <p class="text-center text-body-sm">
        <a class="underline" style="color: rgb(var(--md-primary))" href="#/terms">{{ i18n.t('termsTitle') }}</a>
      </p>
    </div>

    <div v-else class="space-y-5 text-body-md" style="color: rgb(var(--md-on-surface))">
      <p class="text-body-sm" style="color: rgb(var(--md-on-surface-variant))">Effective date: July 25, 2026</p>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">1. Overview</h2>
        <p>Exameow ("the App") is an AI-powered exam generator and online exam tool. This policy explains how we handle data when you use the web, desktop, and mobile versions. We follow data-minimization principles: the vast majority of your data stays on your own device.</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">2. Data Stored on Your Device</h2>
        <p>The following is stored only in your device's localStorage / sessionStorage or app sandbox and is <strong>never uploaded to our servers</strong>:</p>
        <ul class="list-disc pl-5 space-y-1">
          <li>Question banks, practice progress, and wrong-question records</li>
          <li>AI configuration (endpoint and API key; AES-256-GCM encrypted on desktop/self-hosted builds)</li>
          <li>Records of exams you launched or joined, including post-submission scores and analyses</li>
          <li>UI preferences (theme, language) and cookie-notice acknowledgment</li>
        </ul>
        <p>You can delete all of the above at any time by clearing your browser data or uninstalling the app.</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">3. Exam Relay Data (Cloudflare D1)</h2>
        <p>When you use the "Launch Exam / Join Exam" feature, the following is temporarily stored in our Cloudflare D1 database:</p>
        <ul class="list-disc pl-5 space-y-1">
          <li>Exam title, question content (including answers), schedule and duration set by the teacher</li>
          <li>Student names, answers, scores, and submission times</li>
        </ul>
        <p>This data is retained for <strong>at most 7 days</strong> and then automatically deleted by a scheduled task. Teachers can also delete an exam at any time via "Mine → My Launched Exams"; deletion immediately blocks access and removes all results. Answers and analyses are never sent to students before submission.</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">4. AI Requests</h2>
        <p>Features such as question generation, search, and AI grading send the study materials or question content you provide to an AI provider. With the Cloudflare free tier, content is processed by Cloudflare Workers AI; with a custom configuration, content goes directly to your own provider — we never relay or retain it. Please avoid uploading materials containing personal or sensitive information.</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">5. Cookies & Tracking</h2>
        <p>We do not use advertising or tracking cookies, third-party analytics, or cross-site tracking. The web app only uses strictly-necessary local storage (see Section 2).</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">6. Data Sharing</h2>
        <p>We do not share your data with third parties except:</p>
        <ul class="list-disc pl-5 space-y-1">
          <li>Cloudflare, Inc. (infrastructure and Workers AI processor)</li>
          <li>Your own configured AI provider (only when you actively use AI features)</li>
          <li>Where required by law</li>
        </ul>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">7. Your Rights</h2>
        <p>Wherever you are located (including the EU/EEA and California), you may: delete all local data by clearing browser data; request deletion of exam relay data (teachers can delete exams themselves; students may ask the teacher who launched the exam); contact us via GitHub Issues regarding any data processing question.</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">8. Changes & Contact</h2>
        <p>If this policy changes, we will post the update on this page with a new effective date. For questions, contact us via GitHub Issues.</p>
      </section>

      <p class="text-center text-body-sm">
        <a class="underline" style="color: rgb(var(--md-primary))" href="#/terms">{{ i18n.t('termsTitle') }}</a>
      </p>
    </div>
  </div>
</template>
