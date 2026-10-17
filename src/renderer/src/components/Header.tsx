import { Burger } from '@mantine/core'
import type { WindowAction } from '@shared/ipc'
import { IconMinus, IconSquare, IconX } from '@tabler/icons-react'
import { GameSearch } from './GameSearch'
import classes from './Header.module.css'
import Logo from './Logo'

interface HeaderProps {
  opened: boolean
  toggle: () => void
}

const WINDOW_CONTROLS: { action: WindowAction; label: string; icon: React.JSX.Element }[] = [
  { action: 'minimize', label: 'Minimize', icon: <IconMinus size={16} stroke={1.5} /> },
  { action: 'maximize', label: 'Maximize', icon: <IconSquare size={13} stroke={1.5} /> },
  { action: 'close', label: 'Close', icon: <IconX size={17} stroke={1.5} /> }
]

const Header = ({ opened, toggle }: HeaderProps): React.JSX.Element => {
  return (
    <div className={classes.bar}>
      <Burger
        opened={opened}
        onClick={toggle}
        hiddenFrom="sm"
        size="sm"
        className={`${classes.noDrag} ${classes.burger}`}
        aria-label="Toggle navigation"
      />

      <div className={classes.brand}>
        <Logo />
      </div>

      {/* Empty middle: part of the drag handle. Search lives on Explore (Ctrl/Cmd+K opens the palette). */}
      <div className={classes.center} />

      <div className={classes.controls}>
        {WINDOW_CONTROLS.map(({ action, label, icon }) => (
          <button
            key={action}
            type="button"
            aria-label={label}
            className={action === 'close' ? `${classes.control} ${classes.close}` : classes.control}
            onClick={() => void window.api.windowControl(action)}
          >
            {icon}
          </button>
        ))}
      </div>

      <GameSearch />
    </div>
  )
}

export default Header
