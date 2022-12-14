export function enPriceVnd(num) {
  if (num)
    return num.toLocaleString();
}

export const getToken = () => localStorage.getItem("token")

export const getHeaders = () => {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${getToken() || ''}`
  }
}

export const getCurrentDate = () => {
  let yourDate = new Date()
  const offset = yourDate.getTimezoneOffset()
  yourDate = new Date(yourDate.getTime() - (offset * 60 * 1000))
  return yourDate.toISOString().split('T')[0]
}

export const convertObjectToFormData = (object) => {

  const formData = new FormData()

  for (let key in object) {
    const field = object[key]

    if (Array.isArray(field)) {
      for (let index in field) {
        formData.append(`${key}[${index}]`, field[index])
      }
    } else if (typeof field === 'object' && field.constructor === Object) {
      for (let keyOfField in field) {
        const fieldOfField = field[keyOfField]

        for (let index in fieldOfField) {
          formData.append(`${key}.${keyOfField}[${index}]`, fieldOfField[index])
        }
      }
    } else {
      formData.append(key, field)
    }
  }

  return formData
}
