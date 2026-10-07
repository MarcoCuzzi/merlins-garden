// Script client per le animazioni ASCII: trova i blocchi con <frame> e li anima
export default String.raw`
if (!window.__asciiAnimLoaded) {
  window.__asciiAnimLoaded = true

  document.addEventListener("nav", () => {
    const blocks = document.querySelectorAll("pre code")

    blocks.forEach((code) => {
      const text = code.innerText || ""
      if (!text.includes("<frame>")) return

      const [head, ...raw] = text.split("<frame>")
      const frames = raw.map((f) => f.replace(/^\n+|\n+$/g, ""))

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
}
`