<script setup>
  const props = defineProps({
    isLoading: {
      type: Boolean,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
  })
</script>

<template>
  <div :class="{ loader: true, fadeout: !isLoading }">
    <span class="line">
      {{ message }}
    </span>
  </div>
</template>

<style scoped>
  .loader {
    background-color: #fdfdfd;
    bottom: 0;
    color: white;
    color: var(--color-std-text);
    display: block;
    font-size: 32px;
    left: 0;
    overflow: hidden;
    padding-top: 40vh;
    position: fixed;
    right: 0;
    text-align: center;
    top: 0;
  }

  .fadeout {
    animation: fadeout 2s forwards;
  }

  @keyframes fadeout {
    to {
      opacity: 0;
      visibility: hidden;
    }
  }

  .line {
    position: relative;
  }
  
  .line::after {
    content: '';
    position: absolute;
    top: 25px;
    left: 0;
    width: 275px;
    height: 20px;
    border-bottom: 4px solid #5a7687;
    transform-origin: left center;
    animation: moving 3s linear infinite;
  }

  @keyframes moving {
    from {
      transform: scaleX(0);
    }

    to {
      transform: scaleX(100%);
    }
  }
</style>
