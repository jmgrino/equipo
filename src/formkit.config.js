/// <reference path='./formkit-themes.d.ts' />
import { es } from '@formkit/i18n'
import { generateClasses } from '@formkit/themes'
import csClasses from './formkit.classes'

const config = {
  locales: { es },
  locale: 'es',
  theme: 'genesis',
  config: {
    classes: generateClasses(csClasses),
  },
}

export default config
