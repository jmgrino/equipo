<script setup>
  import { ref, computed, nextTick, useTemplateRef, onMounted } from 'vue'
  import IconEye from '@/components/icons/IconEye.vue'
  import IconPlus from '@/components/icons/IconPlus.vue'
  import IconMinus from '@/components/icons/IconMinus.vue'
  import IconList from '@/components/icons/IconList.vue'
  import IconMountain from '@/components/icons/IconMountain.vue'
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
    userAdmin: {
      type: Boolean,
      required: true,
    },
    usersList: {
      type: Object,
      required: true,
    },
  })

  const datesRef = useTemplateRef('datesRef')

  onMounted(() => console.log(datesRef.value))

  // dateRef.value.style.color = 'red'
  console.log(datesRef.value)

  const emit = defineEmits(['viewRideEvent', 'addShortname', 'removeShortname'])

  const renderUserList = ref(false)

  const refreshLocalDates = ref(0)

  let localUsersList = ref([])

  localUsersList = deepCopy(props.usersList).filter(user => user.admin !== true)

  const localDates = computed(() => {
    refreshLocalDates
    const localDates = deepCopy(props.dates)
    localDates.forEach(date => {
      date.usersList = deepCopy(localUsersList)
      date.usersList.forEach((user, userIndex) => {
        if (date.users) {
          if (date.users.includes(user.id)) {
            date.usersList[userIndex].checked = true
          }
        }
      })
    })
    return localDates
  })

  function addUsersList() {
    if (renderUserList.value === false) {
      refreshLocalDates.value++
      forceRender()
    } else {
      renderUserList.value = false
    }
  }

  const fDate = date => {
    let fDate = ''
    if (date === '') {
      fDate = '???' + String.fromCharCode(160).repeat(5)
    } else {
      const dateYear = date.substr(2, 2)
      const dateMonth = date.substr(5, 2)
      const dateDay = date.substr(8, 2)
      fDate = dateDay + '/' + dateMonth + '/' + dateYear
    }
    return fDate
  }

  const fDay = date => {
    const weekday = ['D', 'L', 'M', 'W', 'J', 'V', 'S']

    let fDay = ''
    if (date === '') {
      fDay = '?'
    } else {
      const d = new Date(date)
      fDay = weekday[d.getDay()]
    }
    return fDay
  }

  function addShortname(date, user = null) {
    emit('addShortname', date, user)
  }

  function removeShortname(date, user = null) {
    emit('removeShortname', date, user)
  }

  function addUserToList(date, user) {
    if (user.checked) {
      removeShortname(date, user)
    } else {
      addShortname(date, user)
    }
    forceRender()
  }

  function deepCopy(object) {
    let newObject
    try {
      newObject = structuredClone(object)
    } catch (error) {
      newObject = JSON.parse(JSON.stringify(object))
    }
    return newObject
  }

  const forceRender = async () => {
    renderUserList.value = false
    await nextTick()
    renderUserList.value = true
  }
</script>

<template>
  <div class="ride-layout text-16px p-2 border-b border-color-std">
    <div class="row-start-1 col-start-1">
      <span class="font-semibold mr-2">{{ ride.name }}</span>
      <IconMountain
        v-if="ride.type === 'BTT'"
        class="icon"
        size="3.0rem"
        title="MTB"
        top="-8px"
      />
    </div>
    <div class="row-start-2 col-start-1 dates-container">
      <template
        v-for="(date, index) in localDates"
        :key="date.date"
        ref="datesRef"
      >
        <p :class="{ canceled: date.canceled === true }">{{ fDay(date.date) }} {{ fDate(date.date) }} {{ date.days }}&nbsp;</p>
        <!-- <p :class="{ canceled: date.canceled === true }">
          {{ fDay(date.date) }}
        </p>
        <p :class="{ canceled: date.canceled === true }">
          {{ fDate(date.date) }}
        </p>
        <p :class="{ canceled: date.canceled === true }">{{ date.days }}&nbsp;</p> -->

        <div class="flex items-center flex-wrap gap-x-1 gap-y-3">
          <UserBadge
            v-for="shortName in date.shortNames"
            :shortName="shortName"
            :currentShortname="currentShortname"
          />
          <IconMinus
            v-if="date.userIncluded && !userAdmin"
            class="icon"
            size="2.0rem"
            title="Desapuntarme de la ruta"
            @click="removeShortname(date)"
          />
          <IconPlus
            v-if="!date.userIncluded && !userAdmin"
            class="icon"
            size="2.0rem"
            title="Apuntarme a la ruta"
            @click="addShortname(date)"
          />
          <IconList
            v-if="userAdmin"
            class="icon"
            size="2.0rem"
            title="Lista de usuarios"
            @click="addUsersList(index, date)"
          />
          <template v-if="renderUserList">
            <div class="flex flex-wrap gap-3 items-center">
              <div
                v-for="user in date.usersList"
                key="user.id"
              >
                <input
                  class="text-cs-std mr-1"
                  type="checkbox"
                  :id="user.id"
                  :value="user.id"
                  :checked="user.checked"
                  @click="addUserToList(date, user)"
                />
                <label
                  :for="user.id"
                  class="text-cs-std sm:hidden"
                  >{{ user.name }}</label
                >
                <label
                  :for="user.id"
                  class="text-cs-std hidden sm:inline"
                  >{{ user.shortName }}</label
                >
              </div>
            </div>
          </template>
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

  .dates-grid {
    display: grid;
    grid-template-columns: 16px 1fr;
    column-gap: 8px;
  }

  .dates-container {
    /* display: flex;
    align-items: center;
    flex-flow: row wrap;
    column-gap: 4px;
    font-family: monospace; */
    display: grid;
    grid-template-columns: minmax(10rem, max-content) 1fr;
    column-gap: 4px;
  }

  .button-container {
    grid-row: 1 / -1;
    grid-column: 2 / 3;
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

  .canceled {
    text-decoration: line-through;
  }
</style>
