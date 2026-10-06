import { loadQuartzConfig, loadQuartzLayout } from "./quartz/plugins/loader/config-loader"
import { AsciiAnim } from "./quartz/components" // Aggiunto per le animazioni ASCII

const config = await loadQuartzConfig()
export default config

export const layout = await loadQuartzLayout({
  defaults: {                                 // Aggiunto per le animazioni ASCII
    afterBody: [AsciiAnim()],
  },
})