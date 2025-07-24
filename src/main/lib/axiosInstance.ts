import axios from 'axios'

const apiKey = import.meta.env.MAIN_VITE_RAWG_API_KEY
const baseURL = 'https://api.rawg.io/api'

const axiosInstance = axios.create({
  baseURL,
  params: {
    key: apiKey
  },
  timeout: 10000
})

export default axiosInstance
