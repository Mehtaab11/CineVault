import axios from 'axios'
import { TMDB_API_KEY, TMDB_BASE_URL } from '../config'

const tmdb = axios.create({
  baseURL: TMDB_BASE_URL,
  params: { api_key: TMDB_API_KEY, language: 'en-US' },
})

export const getTrending = (timeWindow = 'week') =>
  tmdb.get(`/trending/movie/${timeWindow}`).then(r => r.data.results)

export const getPopular = () =>
  tmdb.get('/movie/popular').then(r => r.data.results)

export const getTopRated = () =>
  tmdb.get('/movie/top_rated').then(r => r.data.results)

export const getNowPlaying = () =>
  tmdb.get('/movie/now_playing').then(r => r.data.results)

export const getUpcoming = () =>
  tmdb.get('/movie/upcoming').then(r => r.data.results)

export const getMovieDetails = (movieId) =>
  tmdb.get(`/movie/${movieId}`, {
    params: { append_to_response: 'credits,videos,similar,recommendations' },
  }).then(r => r.data)

export const searchMovies = (query, page = 1) =>
  tmdb.get('/search/movie', { params: { query, page } }).then(r => r.data)

export const getGenres = () =>
  tmdb.get('/genre/movie/list').then(r => r.data.genres)

export const discoverMovies = (params = {}) =>
  tmdb.get('/discover/movie', { params }).then(r => r.data)
