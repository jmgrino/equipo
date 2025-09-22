export function useFormatDate() {
  const monthName = [
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre',
  ]

  function formatMonth(date) {
    let month = ''
    let yearDate = ''
    let monthDate = ''
    let dayDate = ''

    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth() + 1

    if (date !== '') {
      const dateArray = date.split('-')
      yearDate = dateArray[0]
      monthDate = dateArray[1]
      dayDate = dateArray[2]
    }

    if (date === '') {
      month = 'Sin fecha asignada'
    } else {
      if (+yearDate === currentYear) {
        if (+monthDate === currentMonth) {
          month = 'Este mes'
        } else {
          month = monthName[monthDate - 1]
        }
      } else {
        month = yearDate + ' - ' + monthName[monthDate - 1]
      }
    }

    return month
  }

  return {
    formatMonth,
  }
}
