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
      <h1 class="text-display-sm">{{ i18n.t('termsTitle') }}</h1>
    </div>

    <div v-if="i18n.locale === 'zh'" class="space-y-5 text-body-md" style="color: rgb(var(--md-on-surface))">
      <p class="text-body-sm" style="color: rgb(var(--md-on-surface-variant))">生效日期:2026 年 7 月 25 日</p>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">1. 协议接受</h2>
        <p>欢迎使用 Exameow(「本服务」)。访问或使用本服务即表示你同意本协议与<a class="underline" style="color: rgb(var(--md-primary))" href="#/privacy">《隐私政策》</a>。如不同意,请停止使用。</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">2. 服务说明</h2>
        <p>本服务是一款开源的 AI 出题与在线考试工具,包含网页版、桌面端、移动端及自托管版本。在线考试功能通过 Cloudflare 中转服务提供,考试数据最多保留 7 天后自动删除。</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">3. 合理使用</h2>
        <p>你同意不会利用本服务:</p>
        <ul class="list-disc pl-5 space-y-1">
          <li>存储、发布或分发任何违法违规、侵权、淫秽、暴力、歧视性或含他人隐私的内容</li>
          <li>对服务进行逆向攻击、扫描探测、拒绝服务攻击或超额自动化调用</li>
          <li>干扰其他用户正常使用,或滥用免费 AI 算力与存储资源</li>
          <li>用于任何违反所在国家/地区法律法规的用途</li>
        </ul>
        <p>违反上述条款的,我们有权在不事先通知的情况下删除相关内容并限制访问。</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">4. 用户内容与责任</h2>
        <p>你发布的考试内容(含题目、答案)与学生提交的数据由<strong>发布者(教师)全权负责</strong>。教师应确保对发布内容拥有合法权利,并妥善保管含管理令牌的成绩链接;因链接泄露导致的成绩外泄,责任由教师自行承担。学生应如实作答,教师应对考试结果的使用自行判断。</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">5. AI 生成内容</h2>
        <p>AI 生成的题目、解析与评判<strong>不保证准确、完整或适用</strong>,可能存在错误。请在重要场景使用前人工核对。因信赖 AI 生成内容造成的任何后果,由使用者自行承担。</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">6. 服务可用性与免责</h2>
        <p>本服务按「现状」提供,为免费公共服务,不承诺可用性、连续性或数据持久性。在法律允许的最大范围内,项目作者与运营方不对任何直接、间接、附带或后果性损失(包括但不限于数据丢失、利润损失、考试事故)承担责任。</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">7. 服务变更与终止</h2>
        <p>我们可能随时修改、暂停或终止部分或全部服务(包括但不限于调整免费额度、下线演示站),恕不另行通知。本协议如有更新,会在本页面公布并更新生效日期,继续使用即视为接受。</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">8. 联系我们</h2>
        <p>如对本协议有疑问,或需要举报违规内容,请通过 GitHub 仓库 Issues 与我们联系,核实后我们将及时处理。</p>
      </section>
    </div>

    <div v-else class="space-y-5 text-body-md" style="color: rgb(var(--md-on-surface))">
      <p class="text-body-sm" style="color: rgb(var(--md-on-surface-variant))">Effective date: July 25, 2026</p>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">1. Acceptance</h2>
        <p>Welcome to Exameow (the "Service"). By accessing or using the Service you agree to these Terms and our <a class="underline" style="color: rgb(var(--md-primary))" href="#/privacy">Privacy Policy</a>. If you do not agree, please stop using the Service.</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">2. The Service</h2>
        <p>The Service is an open-source AI exam generator and online exam tool, available as web, desktop, mobile, and self-hosted versions. Online exams are relayed through Cloudflare; exam data is retained for at most 7 days and then automatically deleted.</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">3. Acceptable Use</h2>
        <p>You agree not to use the Service to:</p>
        <ul class="list-disc pl-5 space-y-1">
          <li>Store, publish, or distribute unlawful, infringing, obscene, violent, discriminatory, or privacy-invading content</li>
          <li>Attack, probe, scan, or overload the Service, or make excessive automated requests</li>
          <li>Interfere with other users or abuse free AI and storage resources</li>
          <li>Violate any applicable law or regulation</li>
        </ul>
        <p>We may remove content and restrict access without prior notice upon violation.</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">4. User Content & Responsibility</h2>
        <p>Exam content (questions and answers) published by teachers and data submitted by students are the <strong>sole responsibility of the publisher</strong>. Teachers must hold lawful rights to published content and keep results links (which contain admin tokens) confidential; leakage resulting from mishandled links is the teacher's own responsibility.</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">5. AI-Generated Content</h2>
        <p>AI-generated questions, analyses, and grading are <strong>not guaranteed to be accurate, complete, or fit for any purpose</strong> and may contain errors. Review them before use in important scenarios. You bear all consequences of relying on AI-generated content.</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">6. Availability & Disclaimer</h2>
        <p>The Service is provided "as is" as a free public service, with no guarantee of availability, continuity, or data persistence. To the maximum extent permitted by law, the authors and operators accept no liability for any direct, indirect, incidental, or consequential damages (including data loss, lost profits, or exam incidents).</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">7. Changes & Termination</h2>
        <p>We may modify, suspend, or terminate any part of the Service at any time without notice (including free quotas or the demo site). Updates to these Terms will be posted on this page with a new effective date; continued use constitutes acceptance.</p>
      </section>

      <section class="card-outlined p-5 space-y-2">
        <h2 class="text-title-sm">8. Contact</h2>
        <p>For questions about these Terms or to report abusive content, contact us via GitHub Issues and we will handle it promptly.</p>
      </section>
    </div>
  </div>
</template>
