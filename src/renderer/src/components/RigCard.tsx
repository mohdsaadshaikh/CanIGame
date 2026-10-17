import { Button } from '@mantine/core'
import { useHardware } from '@renderer/hooks/useHardware'
import { cleanPartName, nominalMemory, primaryGpu } from '@renderer/utils/hardware'
import { IconCpu } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import classes from './RigCard.module.css'

/** Bill-of-materials summary of the detected rig, pinned to the foot of the sidebar. */
export function RigCard(): React.JSX.Element {
  const navigate = useNavigate()
  const { hardware, scanning, scan } = useHardware()
  const gpu = hardware ? primaryGpu(hardware.gpu) : undefined

  return (
    <section className={classes.rig} aria-label="Your rig">
      <div className={classes.header}>
        <span className={classes.tile} aria-hidden="true">
          <IconCpu size={22} stroke={1.75} />
        </span>
        <div>
          <div className={classes.title}>Your rig</div>
          <div className={classes.sub}>{hardware ? hardware.system.model : 'Not scanned yet'}</div>
        </div>
      </div>

      {hardware ? (
        <div className={classes.bom}>
          <span className={classes.ref}>U1</span>
          <span className={classes.part}>{cleanPartName(hardware.cpu.brand)}</span>
          {gpu && (
            <>
              <span className={classes.ref}>PCIE1</span>
              <span className={classes.part}>{cleanPartName(gpu.model)}</span>
            </>
          )}
          <span className={classes.ref}>DIMM</span>
          <span className={classes.part}>{nominalMemory(hardware.memory.total)} memory</span>
        </div>
      ) : (
        <div className={classes.empty}>Scan once to compare every game against your hardware.</div>
      )}

      {hardware ? (
        <Button fullWidth size="xs" variant="default" onClick={() => navigate('/pc')}>
          Full specs
        </Button>
      ) : (
        <Button fullWidth size="xs" loading={scanning} onClick={() => void scan()}>
          Scan my PC
        </Button>
      )}
    </section>
  )
}
