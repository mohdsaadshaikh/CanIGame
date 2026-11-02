import { NAV_SECTIONS, links } from '@renderer/constants'
import { useGames } from '@renderer/hooks/useGames'
import { useRecentGames, type RecentGame } from '@renderer/hooks/useRecentGames'
import type { GamesQuery } from '@shared/ipc'
import { Link, NavLink } from 'react-router-dom'
import { RigCard } from './RigCard'
import classes from './Sidebar.module.css'
import { SteamImage } from './SteamImage'

const SIDEBAR_GAMES = 5
// Same query as Home's top sellers, so both share one cached request.
const POPULAR_QUERY: GamesQuery = { list: 'topsellers' }

const Sidebar = (): React.JSX.Element => {
  const { recent } = useRecentGames()
  const popular = useGames(POPULAR_QUERY)

  // Always show games: what the user opened, or what's popular until they open some.
  const showingRecent = recent.length > 0
  const games: RecentGame[] = showingRecent
    ? recent
    : popular.games.slice(0, SIDEBAR_GAMES).map((game) => ({
        id: game.id,
        name: game.name,
        art: game.art,
        genre: game.tags[0] ?? ''
      }))

  return (
    <div className={classes.root}>
      <nav className={classes.nav} aria-label="Main">
        {NAV_SECTIONS.map((section) => (
          <div key={section.id}>
            <div className={classes.groupLabel}>{section.label}</div>
            <div className={classes.list}>
              {links
                .filter((link) => link.section === section.id)
                .map((link) => (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    end={link.to === '/'}
                    className={({ isActive }) =>
                      isActive ? `${classes.link} ${classes.active}` : classes.link
                    }
                  >
                    {({ isActive }) => {
                      const Icon = isActive ? link.icon.filled : link.icon.outline
                      return (
                        <>
                          <span className={classes.icon}>
                            <Icon size={18} stroke={2} />
                          </span>
                          {link.label}
                        </>
                      )
                    }}
                  </NavLink>
                ))}
            </div>
          </div>
        ))}

        {games.length > 0 && (
          <div>
            <div className={classes.groupLabel}>
              {showingRecent ? 'Recently viewed' : 'Top sellers'}
            </div>
            <div className={classes.games}>
              {games.map((game) => (
                <Link key={game.id} to={`/game/${game.id}`} className={classes.game}>
                  <SteamImage
                    art={game.art}
                    kind="portrait"
                    className={classes.thumb}
                    loading="lazy"
                  />
                  <span className={classes.gameText}>
                    <span className={classes.gameName}>{game.name}</span>
                    {game.genre && <span className={classes.gameGenre}>{game.genre}</span>}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      <RigCard />
    </div>
  )
}

export default Sidebar
