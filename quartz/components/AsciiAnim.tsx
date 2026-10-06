import { QuartzComponent, QuartzComponentConstructor } from "./types"

const AsciiAnim: QuartzComponent = () => null

AsciiAnim.afterDOMLoaded = String.raw`
document.addEventListener("nav", () => {
  document.querySelectorAll(".transclude pre code").forEach((code) => {
    const text = code.textContent || ""
    if (!text.includes("<frame>")) return

    const [head, ...frames] = text
      .split(/^<frame>$/m)
      .map((p) => p.replace(/^\n+|\n+$/g, ""))

    const settings = {}
    head.split("\n").forEach((line) => {
      const [k, v] = line.split(":")
      if (k && v) settings[k.trim()] = v.trim()
    })
    const fps = Number(settings.fps) || 4

    const out = document.createElement("pre")
    out.className = "ascii-anim"
    out.textContent = frames[0]
    code.closest("pre").replaceWith(out)

    let i = 0
    const id = setInterval(() => {
      i = (i + 1) % frames.length
      out.textContent = frames[i]
    }, 1000 / fps)
    window.addCleanup(() => clearInterval(id))
  })
})
`

export default (() => AsciiAnim) satisfies QuartzComponentConstructor
