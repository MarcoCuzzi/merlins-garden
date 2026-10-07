// Script client per le animazioni ASCII
export default String.raw`
if (!window.__asciiAnimLoaded) {
  window.__asciiAnimLoaded = true

  const FPS_MIN = 1
  const FPS_MAX = 30
  const FPS_DEFAULT = 4
  const MAX_FRAMES = 100

  document.addEventListener("nav", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    document.querySelectorAll("pre code").forEach((code) => {
      const text = code.innerText || ""

      // Parola di controllo: la prima riga deve essere "animation"
      const firstLine = text.trim().split("\n")[0].trim()
      if (firstLine !== "animation") return

      const [head, ...raw] = text.split("<frame>")
      const frames = raw
        .map((f) => f.replace(/^\n+|\n+$/g, ""))
        .slice(0, MAX_FRAMES)
      if (frames.length === 0) return

      const settings = {}
      head.split("\n").forEach((line) => {
        const [k, v] = line.split(":")
        if (k && v) settings[k.trim()] = v.trim()
      })

      // fps: numero valido, tenuto tra FPS_MIN e FPS_MAX
      let fps = Number(settings.fps)
      if (!Number.isFinite(fps)) fps = FPS_DEFAULT
      fps = Math.min(FPS_MAX, Math.max(FPS_MIN, fps))

      const out = document.createElement("pre")
      out.className = "ascii-anim"
      out.textContent = frames[0]
      code.closest("pre").replaceWith(out)

      // Se l'utente preferisce meno movimento: resta il primo frame, fermo
      if (reduceMotion || frames.length < 2) return

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