<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">
      Smart Tag Suggestions
      <span v-if="loading" class="text-xs text-gray-500 ml-2">(Analyzing...)</span>
    </label>

    <!-- Tag Suggestions -->
    <div v-if="suggestions.length > 0" class="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <p class="text-sm text-blue-900 font-medium mb-2">
        💡 Suggested tags based on your content:
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="suggestion in suggestions"
          :key="suggestion.tag"
          @click="addTag(suggestion.tag)"
          :disabled="selectedTags.includes(suggestion.tag)"
          :class="[
            'px-3 py-1 text-sm rounded-full transition-colors',
            selectedTags.includes(suggestion.tag)
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer'
          ]"
          :title="suggestion.reason"
        >
          #{{ suggestion.tag }}
          <span class="ml-1 text-xs">
            {{ Math.round(suggestion.confidence * 100) }}%
          </span>
        </button>
      </div>
      <p class="text-xs text-blue-700 mt-2">
        Click to add tags. Confidence score shows relevance.
      </p>
    </div>

    <!-- Selected Tags -->
    <div class="flex flex-wrap gap-2">
      <Badge
        v-for="(tag, index) in selectedTags"
        :key="index"
        variant="primary"
        class="flex items-center"
      >
        #{{ tag }}
        <button
          type="button"
          @click="removeTag(index)"
          class="ml-2 text-white hover:text-gray-200"
        >
          ×
        </button>
      </Badge>
    </div>

    <!-- Manual Tag Input -->
    <div class="mt-2">
      <Input
        v-model="manualTag"
        placeholder="Add custom tags (press Enter)"
        @keydown.enter.prevent="addManualTag"
      />
      <p class="text-xs text-gray-500 mt-1">
        Press Enter to add custom tags
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  title: string
  description?: string
  categories: string[]
  type: string
  modelValue: string[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const loading = ref(false)
const suggestions = ref<any[]>([])
const manualTag = ref('')

const selectedTags = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

// Watch for changes and fetch suggestions
watch(
  () => [props.title, props.description, props.categories, props.type],
  async () => {
    if (props.title && props.categories.length > 0) {
      await fetchSuggestions()
    }
  },
  { immediate: false }
)

async function fetchSuggestions() {
  if (!props.title || props.categories.length === 0) {
    return
  }

  try {
    loading.value = true
    const response = await $fetch('/api/ai/suggest-tags', {
      method: 'POST',
      body: {
        title: props.title,
        description: props.description,
        categories: props.categories,
        type: props.type,
      },
    })
    suggestions.value = response.data
  } catch (error) {
    console.error('Failed to fetch tag suggestions:', error)
  } finally {
    loading.value = false
  }
}

function addTag(tag: string) {
  if (!selectedTags.value.includes(tag)) {
    selectedTags.value = [...selectedTags.value, tag]
  }
}

function removeTag(index: number) {
  selectedTags.value = selectedTags.value.filter((_, i) => i !== index)
}

function addManualTag() {
  const tag = manualTag.value.trim().toLowerCase()
  if (tag && !selectedTags.value.includes(tag)) {
    selectedTags.value = [...selectedTags.value, tag]
    manualTag.value = ''
  }
}

// Expose method to trigger suggestions
defineExpose({
  fetchSuggestions,
})
</script>
