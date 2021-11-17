// jsdom does not implement Blob.text()

export function readBlobText(blob: Blob) {
  return new Promise<string>((res, rej) => {
    const fr = new FileReader()
    fr.onerror = rej
    fr.onabort = rej
    fr.onload = () => {
      res(String(fr.result))
    }
    fr.readAsText(blob)
  })
}
