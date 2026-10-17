import classes from './SectionHeader.module.css'

interface SectionHeaderProps {
  id?: string
  title: string
  /** One line under the title saying what the section holds. */
  meta?: string
  actions?: React.ReactNode
}

/** One header shape for every Home section: caps title, a line of context, actions right. */
export function SectionHeader({ id, title, meta, actions }: SectionHeaderProps): React.JSX.Element {
  return (
    <div className={classes.header}>
      <div className={classes.text}>
        <h2 id={id} className={classes.title}>
          {title}
        </h2>
        {meta && <div className={classes.meta}>{meta}</div>}
      </div>
      {actions && <div className={classes.actions}>{actions}</div>}
    </div>
  )
}
