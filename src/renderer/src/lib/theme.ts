import { Card, Container, createTheme, Paper, rem, Select } from '@mantine/core'
import type { MantineThemeOverride } from '@mantine/core'

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
  fontSizes: {
    xs: rem('12px'),
    sm: rem('14px'),
    md: rem('16px'),
    lg: rem('18px'),
    xl: rem('20px'),
    '2xl': rem('24px'),
    '3xl': rem('30px'),
    '4xl': rem('36px'),
    '5xl': rem('48px')
  },
  spacing: {
    '3xs': rem('4px'),
    '2xs': rem('8px'),
    xs: rem('10px'),
    sm: rem('12px'),
    md: rem('16px'),
    lg: rem('20px'),
    xl: rem('24px'),
    '2xl': rem('28px'),
    '3xl': rem('32px')
  },
  colors: {
    // greenMint: [
    //   '#edfdf3',
    //   '#daf8e5',
    //   '#aff1c7',
    //   '#82eba7',
    //   '#5fe58c',
    //   '#4ae27b',
    //   '#3ee071',
    //   '#31c760',
    //   '#27b154',
    //   '#16a34a'
    // ]
    //     [
    //   "#ffeee4",
    //   "#ffddcf",
    //   "#f9baa1",
    //   "#f4946f",
    //   "#ef7445",
    //   "#ee6734",
    //   "#ed541b",
    //   "#d3450e",
    //   "#bc3b09",
    //   "#a53002"
    // ]
    greenMint: [
      '#e1fff5',
      '#cbffec',
      '#9affd8',
      '#64ffc3',
      '#3affb1',
      '#21ffa6',
      '#00ff9c',
      '#00e38a',
      '#00ca79',
      '#00af66'
    ]
  },
  primaryColor: 'greenMint',
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
    Paper: Paper.extend({
      defaultProps: {
        p: 'md',
        shadow: 'xl',
        radius: 'md',
        withBorder: true
      }
    }),

    Card: Card.extend({
      defaultProps: {
        p: 'xl',
        shadow: 'xl',
        radius: 'var(--mantine-radius-default)',
        withBorder: true
      }
    }),
    Select: Select.extend({
      defaultProps: {
        checkIconPosition: 'right'
      }
    })
  },
  other: {
    style: 'mantine'
  }
})

export const customSizes = {
  '2xl': rem('48px'),
  '3xl': rem('56px'),
  '4xl': rem('64px'),
  '5xl': rem('80px')
}
