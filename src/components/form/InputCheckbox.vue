<script setup>
  import { computed } from 'vue'

  const props = defineProps({
    label: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    checked: {
      type: Boolean,
      default: false,
      // Parent -> :checked="true"
    },
  })

  const emit = defineEmits(['inputChanged'])

  const model = defineModel()

  const computedStyle = computed(() => {
    let computedStyle = ''
    if (props.width != '') {
      computedStyle = `width: ${props.width};`
    }
    return computedStyle
  })

  function valueChanged() {
    emit('inputChanged', model.value)
  }
</script>

<template>
  <!-- <div class="input-container"> -->
  <label
    >{{ label }}
    <input
      type="checkbox"
      v-model="model"
      :id="name"
      :checked="checked"
      @change="valueChanged"
    />
    <span class="checkmark"></span>
  </label>
  <!-- </div> -->
</template>

<style scoped>
  label {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
  }

  input {
    appearance: none;
    height: 0;
    width: 0;
  }

  .checkmark {
    height: 30px;
    width: 30px;
    outline: 1px solid var(--color-std);
    position: relative;
  }

  label:hover .checkmark {
    /* background-color: #eee; */
    outline: 1px solid var(--color-std-high);
  }

  /* .zcustom {
    cursor: pointer;
  }
  .zcustom:hover .zcheckmark {
    background-color: #ccc;
  } */

  .checkmark:after {
    display: none;
    content: '';
    position: absolute;
  }

  input:checked ~ .checkmark::after {
    display: block;
  }

  .zcustom input:checked ~ .zcheckmark {
    background-color: blue;
  }

  .checkmark::after {
    width: 9px;
    height: 18px;
    border: solid var(--color-std-high);
    border-width: 0 3px 3px 0;
    transform: rotate(50deg);
    left: 10px;
    top: 4px;
  }

  input input-old {
    appearance: none;
    /* border: 1px solid var(--color-std); */
    outline: 1px solid var(--color-std);
    height: 20px;
    width: 20px;
    margin: 5px 0 5px 0;
  }

  input-old:checked {
    background-color: green;
    /* appearance: none; */
    /* outline: none; */
    /* outline: 1px solid var(--color-std-high); */
  }
</style>
