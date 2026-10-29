import { useQuery } from '@tanstack/react-query'
import { getTrending, getPopular, getTopRated, getNowPlaying, getUpcoming } from '../../api/tmdb'
import MovieCard from '../../components/MovieCard/MovieCard'
import HeroBanner from './HeroBanner'
import MovieRow from './MovieRow'
import './HomePage.css'

export default function HomePage() {
  const { data: trending = [] } = useQuery({
    queryKey: ['trending'],
    queryFn: () => getTrending('week'),
  })

  const { data: popular = [] } = useQuery({
    queryKey: ['popular'],
    queryFn: getPopular,
  })

  const { data: topRated = [] } = useQuery({
    queryKey: ['topRated'],
    queryFn: getTopRated,
  })

  const { data: nowPlaying = [] } = useQuery({
    queryKey: ['nowPlaying'],
    queryFn: getNowPlaying,
  })

  const { data: upcoming = [] } = useQuery({
    queryKey: ['upcoming'],
    queryFn: getUpcoming,
  })

  const hero = trending[0]

  return (
    <div className="homepage">
      {/* Hero */}
      {hero && <HeroBanner movie={hero} />}

      <div className="homepage__rows container">
        <MovieRow title="🔥 Trending This Week" movies={trending.slice(1, 13)} />
        <MovieRow title="▶️ Now Playing" movies={nowPlaying.slice(0, 12)} />
        <MovieRow title="⭐ Top Rated All Time" movies={topRated.slice(0, 12)} />
        <MovieRow title="🎬 Popular Right Now" movies={popular.slice(0, 12)} />
        <MovieRow title="📅 Coming Soon" movies={upcoming.slice(0, 12)} />
      </div>
    </div>
  )
}
