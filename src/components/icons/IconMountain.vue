<script setup>
  import { reactive } from 'vue'
  import ReshotIconStd from './ReshotIconStd.vue'

  const props = defineProps({
    size: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: false,
    },
    top: {
      type: String,
      default: 0,
    },
  })

  const params = reactive({
    xml_space: 'preserve',
    width: '655.359',
    height: '655.359',
    style: `
      shape-rendering: geometricPrecision;
      text-rendering: geometricPrecision;
      image-rendering: optimizeQuality;
      fill-rule: evenodd;
      clip-rule: evenodd;
    `,
    viewBox: '0 0 6.827 6.827',
  })
</script>

<template>
  <ReshotIconStd
    :size="props.size"
    :title="props.title"
    :top="props.top"
    :params="params"
  >
    <g id="Layer_x0020_1">
      <path
        class="fil0"
        style="fill: #a4a4a5"
        d="M.942 5.29h2.21L2.047 3.155l-.523 1.01.105-.098.136.138.152-.165.127.162.263-.276.213.144-.473-.915z"
      />
      <path
        class="fil1"
        style="fill: #cfcfd0"
        d="m2.52 4.07-.473-.915-.523 1.01.105-.098.136.138.152-.165.127.162.263-.276z"
      />
      <path
        class="fil2"
        style="fill: #919191"
        d="M2.047 5.29h1.105L2.047 3.155l.473.915-.213-.144-.26.273z"
      />
      <path
        class="fil3"
        style="fill: #bfbfbf"
        d="m2.52 4.07-.473-.915v1.044l.26-.273z"
      />
      <path
        class="fil0"
        style="fill: #a4a4a5"
        d="M2.32 5.29h3.653L4.146 2.24l-.976 1.63.33-.31.202.205.226-.246.189.242.39-.41.51.343-.87-1.454z"
      />
      <path
        class="fil1"
        style="fill: #cfcfd0"
        d="m5.017 3.693-.87-1.454-.977 1.63.33-.31.202.205.226-.246.189.242.39-.41z"
      />
      <path
        class="fil2"
        style="fill: #919191"
        d="M4.146 5.29h1.827L4.146 2.24l.871 1.454-.51-.344-.36.38z"
      />
      <path
        class="fil3"
        style="fill: #bfbfbf"
        d="m5.017 3.693-.87-1.454v1.49l.36-.38z"
      />
    </g>
    <path
      style="fill: none"
      d="M0 0h6.827v6.827H0z"
    />
  </ReshotIconStd>
</template>

<style scoped></style>
