import qrcode
img = qrcode.make('http://resume.raffaeleturra.com/')
type(img)  # qrcode.image.pil.PilImage
img.save("packages/content/media/qrcode.png")