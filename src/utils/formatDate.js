export const formattedDate = dateString => {
  const date = new Date(dateString)

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    timeZoneName: 'short'
  }

  return new Intl.DateTimeFormat('en-GB', options).format(date)
}

export const formatDateToYYYYMMDD = inputDate => {
  const date = new Date(inputDate)

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}
