import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Container,
  createTheme,
  Paper,
  rem,
  Select,
  type CSSVariablesResolver,
  type MantineThemeOverride
} from '@mantine/core'

/*
 * "Overclock" (DESIGN.md): Fortnite's loud italic display type and bounce on Valorant's sharp,
 * square geometry. Deep navy ground, chamfered square panels, skewed controls, orange #ED541B as
 * the single accent (always a gradient), Barlow Condensed italic caps for display. Game art
 * supplies colour.
 */

/** Primary action fill: bright orange into deep ember. White label sits on the darker half (4.6-6.3:1). */
export const ACCENT_GRADIENT = 'linear-gradient(135deg, #F0662A 0%, #D2421A 52%, #B32F0C 100%)'
const ACCENT_GRADIENT_HOVER = 'linear-gradient(135deg, #FF7A3D 0%, #DE4B1F 52%, #BE3410 100%)'

const CONTAINER_SIZES: Record<string, string> = {
  xxs: rem('200px'),
  xs: rem('300px'),
  sm: rem('400px'),
  md: rem('500px'),
  lg: rem('600px'),
  xl: rem('1400px'),
  xxl: rem('1600px')
}

export const mantineTheme: MantineThemeOverride = createTheme({
  fontFamily: 'Poppins, system-ui, sans-serif',
  fontFamilyMonospace: "'Martian Mono', ui-monospace, Consolas, monospace",
  headings: {
    fontFamily: "'Barlow Condensed', Barlow, system-ui, sans-serif",
    fontWeight: '900',
    sizes: {
      h1: { fontSize: rem(56), lineHeight: '0.9' },
      h2: { fontSize: rem(34), lineHeight: '0.95' },
      h3: { fontSize: rem(24), lineHeight: '1' }
    }
  },
  fontSizes: {
    xs: rem('12px'),
    sm: rem('14px'),
    md: rem('15px'),
    lg: rem('17px'),
    xl: rem('20px')
  },
  spacing: {
    xs: rem('8px'),
    sm: rem('12px'),
    md: rem('16px'),
    lg: rem('24px'),
    xl: rem('32px')
  },
  // Shape lock (DESIGN.md): surfaces are square and get their character from chamfer cuts
  // (`.cig-cut`), not rounding. 2px on small controls, 4px max for menus and tooltips.
  radius: { xs: rem('0px'), sm: rem('2px'), md: rem('2px'), lg: rem('3px'), xl: rem('4px') },
  defaultRadius: 'xs',
  shadows: {
    xs: '0 1px 2px rgba(4, 7, 16, 0.4)',
    sm: '0 4px 12px -4px rgba(4, 7, 16, 0.5)',
    md: '0 12px 32px -12px rgba(4, 7, 16, 0.65)',
    lg: '0 24px 56px -18px rgba(4, 7, 16, 0.75)',
    xl: '0 24px 56px -18px rgba(4, 7, 16, 0.75)'
  },
  black: '#0C111D',
  white: '#FFFFFF',
  // Filled orange gets navy ink: white on #ED541B is only 3.6:1, ink is 5.3:1.
  autoContrast: true,
  luminanceThreshold: 0.2,
  colors: {
    // Navy, lightest to darkest. Mantine reads [0] as text, [2] as dimmed, [4] as
    // borders, [6] as surfaces, [7] as the body.
    dark: [
      '#EEF1F7',
      '#C9D0DF',
      '#A9B2C7',
      '#8590A8',
      '#26314B',
      '#1E2840',
      '#161E31',
      '#0F1524',
      '#0C111D',
      '#070A12'
    ],
    orange: [
      '#FFEEE4',
      '#FFDDCF',
      '#F9BAA1',
      '#F4946F',
      '#EF7445',
      '#EE6734',
      '#ED541B',
      '#D3450E',
      '#BC3B09',
      '#A53002'
    ]
  },
  primaryColor: 'orange',
  primaryShade: 6,
  components: {
    Container: Container.extend({
      vars: (_, { size, fluid }) => ({
        root: {
          '--container-size': fluid
            ? '100%'
            : size !== undefined && size in CONTAINER_SIZES
              ? CONTAINER_SIZES[size]
              : rem(size)
        }
      })
    }),
    Paper: Paper.extend({ defaultProps: { p: 'md', radius: 'md', withBorder: true } }),
    Card: Card.extend({ defaultProps: { p: 'lg', radius: 'md', withBorder: true } }),
    Button: Button.extend({
      defaultProps: { radius: 'xs' },
      // Filled primary buttons take the accent gradient with a white label.
      vars: (_theme, props) =>
        (props.variant ?? 'filled') === 'filled' && (props.color ?? 'orange') === 'orange'
          ? {
              root: {
                '--button-bg': ACCENT_GRADIENT,
                '--button-hover': ACCENT_GRADIENT_HOVER,
                '--button-color': '#FFFFFF',
                '--button-bd': 'none'
              }
            }
          : { root: {} }
    }),
    ActionIcon: ActionIcon.extend({ defaultProps: { variant: 'default', radius: 'xs' } }),
    Badge: Badge.extend({ defaultProps: { radius: 'xs' } }),
    Select: Select.extend({ defaultProps: { checkIconPosition: 'right' } })
  }
})

/**
 * Dark only (the app forces the dark scheme). Tokens on top of Mantine's own variables. Components read `--cig-*`; Mantine's
 * body/text/border variables point at the same values so stock components fit.
 */
export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {
    '--cig-accent-fill': '#ED541B',
    '--cig-accent-gradient': ACCENT_GRADIENT,
    '--cig-display': "'Barlow Condensed', Barlow, system-ui, sans-serif",
    '--cig-cut': '14px',
    '--cig-cut-sm': '8px',
    '--cig-skew': '-8deg',
    '--cig-pop': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    '--cig-ease': 'cubic-bezier(0.65, 0, 0.35, 1)'
  },
  dark: {
    '--cig-shell': '#0C111D',
    '--cig-ground': '#0F1524',
    '--cig-panel': '#161E31',
    '--cig-plate': 'rgba(22, 30, 49, 0.82)',
    '--cig-raised': '#1E2840',
    '--cig-seam': '#26314B',
    '--cig-seam-strong': '#34415F',
    '--cig-silk': '#EEF1F7',
    '--cig-silk-2': '#A9B2C7',
    '--cig-silk-3': '#8590A8',
    '--cig-copper': '#E0A96D',
    '--cig-accent': '#FF7A45',
    '--cig-accent-wash': 'rgba(237, 84, 27, 0.16)',
    '--cig-edge': 'rgba(255, 255, 255, 0.06)',
    '--cig-hairline': 'rgba(255, 255, 255, 0.08)',
    '--cig-hairline-strong': 'rgba(255, 255, 255, 0.16)',
    '--cig-ambient-opacity': '0.55',
    '--mantine-color-body': '#0F1524',
    '--mantine-color-text': '#EEF1F7',
    '--mantine-color-dimmed': '#A9B2C7',
    '--mantine-color-default': '#161E31',
    '--mantine-color-default-hover': '#1E2840',
    '--mantine-color-default-border': '#26314B'
  },
  light: {}
})
