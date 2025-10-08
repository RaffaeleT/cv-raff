import qrcode
img = qrcode.make('https://raffaelet.github.io/cv-raff')
type(img)  # qrcode.image.pil.PilImage
img.save("packages/content/media/qrcode.png")