<script setup>
  const props = defineProps({
    label: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    accept: {
      type: String,
      required: false,
    },
  })

  const emit = defineEmits(['onChange'])

  function getFile(e) {
    emit('onChange', e)
  }
</script>

<template>
  <div class="input-container">
    <input
      type="file"
      :name="name"
      :id="name"
      class="uploadFile"
      :accept="accept"
      @change="getFile"
    />
    <label
      :for="name"
      class="btn"
      >{{ label }}</label
    >
  </div>
</template>

<style scoped>
  .uploadFile {
    display: none;
  }
  .btn,
  .btn:link,
  .btn:visited {
    display: inline-block;
    cursor: pointer;
    text-align: center;
    align-items: center;
    border-style: solid;
    border-width: 2px 2px 2px 2px;
    border-radius: 10px;
    box-shadow: 0px 17px 5px -15px rgba(0, 0, 0, 0.26);
    fill: #ffffff;
    color: #ffffff;
    border-color: var(--color-std-high);
    background-color: var(--color-std-high);
    font-size: 1.8rem;
    font-weight: 400;
    line-height: 1.5;
    min-width: 100px;
    padding: 4px 16px 5px 16px;
  }

  .btn:hover,
  .btn:active {
    color: var(--color-std-high);
    background-color: var(--color-std-background);
    border-color: var(--color-std-high);
  }
</style>
