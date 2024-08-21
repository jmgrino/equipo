<script setup>
  import IconEye from '@/components/icons/IconEye.vue'
  import IconPlus from '@/components/icons/IconPlus.vue'
  import IconMinus from '@/components/icons/IconMinus.vue'
  import UserBadge from '@/components/UserBadge.vue'

  const props = defineProps({
    ride: {
      type: Object,
      required: true,
    },
    dates: {
      type: Object,
      required: true,
    },
    currentShortname: {
      type: String,
      default: '???',
    },
  })

  const emit = defineEmits(['viewRideEvent', 'addShortname', 'removeShortname'])

  const fDate = date => {
    let fDate = ''
    if (date === '') {
      fDate = '???'
    } else {
      const dateYear = date.substr(0, 4)
      const dateMonth = date.substr(5, 2)
      const dateDay = date.substr(8, 2)
      fDate = dateDay + '/' + dateMonth + '/' + dateYear
    }
    return fDate
  }

  function addShortname(index, date) {
    emit('addShortname', index, date)
  }
  function removeShortname(index, date) {
    emit('removeShortname', index, date)
  }
</script>

<template>
  <div class="text-16px p-2 border-b ride-layout border-color-std">
    <p class="row-start-1 col-start-1 col-end-4 font-semibold">{{ ride.name }}</p>
    <div class="row-start-2 col-start-1 dates-container">
      <template
        v-for="(date, index) in dates"
        :key="date.date"
      >
        <p class="">{{ fDate(date.date) }}</p>
        <p class="">{{ date.days }}</p>
        <div>
          <UserBadge
            v-for="shortName in date.shortNames"
            :shortName="shortName"
            :currentShortname="currentShortname"
          />
          <IconMinus
            v-if="date.userIncluded"
            class="icon"
            size="2.0rem"
            title="Apuntarme a la ruta"
            @click="removeShortname(index, date)"
          />
          <IconPlus
            v-else
            class="icon"
            size="2.0rem"
            title="Apuntarme a la ruta"
            @click="addShortname(index, date)"
          />
        </div>
      </template>
    </div>
    <div class="button-container">
      <IconEye
        class="icon"
        size="2.4rem"
        title="Ver"
        @click="emit('viewRideEvent', ride.id)"
      />
    </div>
  </div>
</template>

<style scoped>
  .ride-layout {
    display: grid;
    grid-template-columns: 1fr min-content;
    grid-template-rows: auto auto;
    column-gap: 4px;
  }

  .dates-container {
    display: grid;
    grid-template-columns: 9rem 2rem 1fr;
    column-gap: 4px;
  }

  .button-container {
    grid-row: 1 / -1;
    grid-column: 4 / 5;
    align-self: center;
    display: flex;
    column-gap: 8px;
  }

  .icon {
    cursor: pointer;
    display: inline-block;
  }

  .icon:hover {
    color: var(--color-std-high);
  }
</style>
