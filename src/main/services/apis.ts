import axios from '../lib/axiosInstance'
import { GameResponse } from '../../types/games'

export const getAllGames = async (): Promise<GameResponse> => {
  const response = await axios.get('/games')

  return response.data
}
