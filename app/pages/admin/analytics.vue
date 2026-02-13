<template>
  <div class="py-8 px-4">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p class="mt-2 text-gray-600">Platform insights and statistics</p>
        </div>

        <!-- Export Dropdown -->
        <div class="relative">
          <Button @click="showExportMenu = !showExportMenu">
            Export Data ▾
          </Button>

          <div
            v-if="showExportMenu"
            class="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-10"
          >
            <button
              @click="exportData('users')"
              class="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Export Users
            </button>
            <button
              @click="exportData('content')"
              class="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Export Content
            </button>
            <button
              @click="exportData('audit')"
              class="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Export Audit Logs
            </button>
          </div>
        </div>
      </div>

      <Alert v-if="error" type="error" class="mb-6">{{ error }}</Alert>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
        <p class="mt-4 text-gray-600">Loading analytics...</p>
      </div>

      <!-- Analytics Content -->
      <div v-else-if="analytics">
        <!-- Overview Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Users</p>
                <p class="text-2xl font-bold text-gray-900">{{ analytics.users.total }}</p>
                <p class="text-xs text-green-600">+{{ analytics.users.new30Days }} this month</p>
              </div>
            </div>
          </Card>

          <Card>
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-purple-100 rounded-lg p-3">
                <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Content</p>
                <p class="text-2xl font-bold text-gray-900">{{ analytics.content.total }}</p>
                <p class="text-xs text-gray-600">{{ analytics.content.published }} published</p>
              </div>
            </div>
          </Card>

          <Card>
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Total Views</p>
                <p class="text-2xl font-bold text-gray-900">{{ formatNumber(analytics.engagement.totalViews) }}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                <svg class="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-4">
                <p class="text-sm font-medium text-gray-500">Pending Review</p>
                <p class="text-2xl font-bold text-gray-900">{{ analytics.content.pending }}</p>
              </div>
            </div>
          </Card>
        </div>

        <!-- Charts Row 1 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- User Growth Chart -->
          <Card>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">User Growth (Last 30 Days)</h3>
            <div class="h-64">
              <ClientOnly>
                <v-chart :option="userGrowthChart" autoresize />
              </ClientOnly>
            </div>
          </Card>

          <!-- Content Upload Chart -->
          <Card>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Content Uploads (Last 30 Days)</h3>
            <div class="h-64">
              <ClientOnly>
                <v-chart :option="contentGrowthChart" autoresize />
              </ClientOnly>
            </div>
          </Card>
        </div>

        <!-- Charts Row 2 -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <!-- Users by Type -->
          <Card>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Users by Type</h3>
            <div class="h-64">
              <ClientOnly>
                <v-chart :option="usersByTypeChart" autoresize />
              </ClientOnly>
            </div>
          </Card>

          <!-- Content by Type -->
          <Card>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Content by Type</h3>
            <div class="h-64">
              <ClientOnly>
                <v-chart :option="contentByTypeChart" autoresize />
              </ClientOnly>
            </div>
          </Card>

          <!-- Content by Category -->
          <Card>
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Top Categories</h3>
            <div class="h-64">
              <ClientOnly>
                <v-chart :option="contentByCategoryChart" autoresize />
              </ClientOnly>
            </div>
          </Card>
        </div>

        <!-- Top Content Table -->
        <Card>
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Top Content (Most Viewed)</h3>

          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Artist
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Views
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="item in analytics.engagement.topContent" :key="item.id">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ item.title }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <Badge size="sm">{{ item.type }}</Badge>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ getArtistName(item.user) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatNumber(item.viewCount) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <NuxtLink
                      :to="`/content/${item.slug}`"
                      class="text-primary-600 hover:text-primary-900"
                    >
                      View
                    </NuxtLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'

// Register ECharts components
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin'
})

const { hasPermission } = usePermissions()

// Check permission
if (!hasPermission('analytics.view')) {
  navigateTo('/dashboard')
}

const loading = ref(true)
const error = ref('')
const analytics = ref<any>(null)
const showExportMenu = ref(false)

// Chart options
const userGrowthChart = computed(() => ({
  tooltip: {
    trigger: 'axis',
  },
  xAxis: {
    type: 'category',
    data: analytics.value?.users.growth.map((d: any) =>
      new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: 'New Users',
      type: 'line',
      smooth: true,
      data: analytics.value?.users.growth.map((d: any) => Number(d.count)) || [],
      itemStyle: { color: '#3b82f6' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0.05)' },
          ],
        },
      },
    },
  ],
}))

const contentGrowthChart = computed(() => ({
  tooltip: {
    trigger: 'axis',
  },
  xAxis: {
    type: 'category',
    data: analytics.value?.content.growth.map((d: any) =>
      new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    ) || [],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: 'New Content',
      type: 'line',
      smooth: true,
      data: analytics.value?.content.growth.map((d: any) => Number(d.count)) || [],
      itemStyle: { color: '#8b5cf6' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(139, 92, 246, 0.3)' },
            { offset: 1, color: 'rgba(139, 92, 246, 0.05)' },
          ],
        },
      },
    },
  ],
}))

const usersByTypeChart = computed(() => ({
  tooltip: {
    trigger: 'item',
  },
  series: [
    {
      type: 'pie',
      radius: '70%',
      data: analytics.value?.users.byType.map((d: any) => ({
        name: d.userType,
        value: d._count,
      })) || [],
      label: {
        formatter: '{b}: {c}',
      },
    },
  ],
}))

const contentByTypeChart = computed(() => ({
  tooltip: {
    trigger: 'item',
  },
  series: [
    {
      type: 'pie',
      radius: '70%',
      data: analytics.value?.content.byType.map((d: any) => ({
        name: d.type,
        value: d._count,
      })) || [],
      label: {
        formatter: '{b}: {c}',
      },
    },
  ],
}))

const contentByCategoryChart = computed(() => {
  const categories = analytics.value?.content.byCategory || {}
  const sortedCategories = Object.entries(categories)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 10)

  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    xAxis: {
      type: 'category',
      data: sortedCategories.map(([name]) => name.replace('_', ' ')),
      axisLabel: {
        interval: 0,
        rotate: 45,
      },
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        type: 'bar',
        data: sortedCategories.map(([, value]) => value),
        itemStyle: { color: '#10b981' },
      },
    ],
  }
})

async function fetchAnalytics() {
  try {
    loading.value = true
    error.value = ''

    const response = await $fetch('/api/analytics/dashboard')
    analytics.value = response.data
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to load analytics'
  } finally {
    loading.value = false
  }
}

function exportData(type: string) {
  window.open(`/api/analytics/export?type=${type}`, '_blank')
  showExportMenu.value = false
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

function getArtistName(user: any): string {
  return user.artistProfile?.stageName || `${user.firstName} ${user.lastName}`.trim()
}

// Close export menu when clicking outside
onMounted(() => {
  fetchAnalytics()

  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (!target.closest('.relative')) {
      showExportMenu.value = false
    }
  })
})
</script>
