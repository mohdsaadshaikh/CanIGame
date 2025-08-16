import axios from '../lib/axiosInstance'
import { Game, GameResponse } from '../../types/games'

export const getAllGames = async (): Promise<GameResponse> => {
  const response = await axios.get('/games')

  return response.data
}

export const getGameById = async (id: string): Promise<Game> => {
  const response = await axios.get(`/games/${id}`)

  return response.data
}

export const getGameBySlug = async (slug: string): Promise<Game> => {
  const response = await axios.get(`/games/${slug}`)

  return response.data
}
