import axios from '../lib/axiosInstance'

export const getAllGames = async (): Promise<any> => {
  const response = await axios.get('/games')

  return response.data
}
