from http.server import BaseHTTPRequestHandler, HTTPServer
from io import BytesIO
import os
from urllib.parse import parse_qs, urlsplit

from PIL import Image, ImageStat
from rembg import new_session, remove


HOST = "127.0.0.1"
PORT = 8765
MAX_IMAGE_BYTES = 10 * 1024 * 1024
MODEL_NAME = os.environ.get("REMBG_MODEL", "u2netp")
SESSION = None


class BackgroundRemovalHandler(BaseHTTPRequestHandler):
    server_version = "PixelFaunaBackgroundService/1.0"

    def send_json_error(self, status: int, message: str) -> None:
        body = ('{"error":"' + message + '"}').encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self) -> None:
        if self.path != "/health":
            self.send_json_error(404, "Not found")
            return

        body = b'{"status":"ready"}'
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_POST(self) -> None:
        request = urlsplit(self.path)
        if request.path not in {"/remove-background", "/pixelate"}:
            self.send_json_error(404, "Not found")
            return

        resolution = None
        color_count = None
        if request.path == "/pixelate":
            options = parse_qs(request.query)
            try:
                resolution = int(options.get("resolution", [""])[0])
                color_count = int(options.get("colors", [""])[0])
            except ValueError:
                self.send_json_error(400, "Invalid pixel-art settings")
                return
            if not 16 <= resolution <= 48 or not 4 <= color_count <= 16:
                self.send_json_error(400, "Pixel resolution or color count is out of range")
                return

        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.send_json_error(400, "Invalid content length")
            return

        if content_length < 1 or content_length > MAX_IMAGE_BYTES:
            self.send_json_error(413, "Image must be smaller than 10 MB")
            return

        image_bytes = self.rfile.read(content_length)
        if len(image_bytes) != content_length:
            self.send_json_error(400, "Incomplete image upload")
            return

        try:
            if request.path == "/pixelate":
                png_bytes = pixelate_image(image_bytes, resolution, color_count)
            else:
                removed_image = remove(image_bytes, session=SESSION)
                if isinstance(removed_image, Image.Image):
                    image = removed_image
                else:
                    image = Image.open(BytesIO(removed_image))
                output = BytesIO()
                image.convert("RGBA").save(output, format="PNG")
                png_bytes = output.getvalue()
            if not png_bytes.startswith(b"\x89PNG\r\n\x1a\n"):
                raise ValueError("Image processor did not produce a PNG")
        except Exception:
            self.send_json_error(422, "Could not process this image")
            return

        self.send_response(200)
        self.send_header("Content-Type", "image/png")
        self.send_header("Content-Length", str(len(png_bytes)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(png_bytes)

    def log_message(self, format_string: str, *args: object) -> None:
        print("[pixel-fauna] " + format_string % args)


def main() -> None:
    global SESSION

    print(f"Loading rembg model '{MODEL_NAME}' (first startup may download model weights)...", flush=True)
    SESSION = new_session(MODEL_NAME)
    server = HTTPServer((HOST, PORT), BackgroundRemovalHandler)
    print(f"Background-removal service ready at http://{HOST}:{PORT}", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping background-removal service.", flush=True)
    finally:
        server.server_close()


def pixelate_image(image_bytes: bytes, resolution: int, color_count: int) -> bytes:
    with Image.open(BytesIO(image_bytes)) as source:
        rgba = source.convert("RGBA")

    visible_alpha = rgba.getchannel("A").point(lambda value: 255 if value >= 40 else 0)
    bounds = visible_alpha.getbbox()
    if bounds is None:
        raise ValueError("Image has no visible subject")

    subject = rgba.crop(bounds)
    subject_width, subject_height = subject.size
    padding = max(1, round(resolution * 0.05))
    content_limit = max(1, resolution - 2 * padding)
    scale = content_limit / max(subject_width, subject_height)
    target_width = max(1, round(subject_width * scale))
    target_height = max(1, round(subject_height * scale))

    resized = subject.resize((target_width, target_height), Image.Resampling.LANCZOS)
    alpha = resized.getchannel("A")
    opaque_mask = alpha.point(lambda value: 255 if value >= 128 else 0)
    if opaque_mask.getbbox() is None:
        opaque_mask = alpha.point(lambda value: 255 if value >= 40 else 0)
    if opaque_mask.getbbox() is None:
        raise ValueError("Image has no opaque subject after resizing")
    rgb = resized.convert("RGB")
    average_color = tuple(round(value) for value in ImageStat.Stat(rgb, mask=opaque_mask).mean)
    neutral_background = Image.new("RGB", resized.size, average_color)
    palette_source = Image.composite(rgb, neutral_background, opaque_mask)

    quantized = palette_source.quantize(
        colors=color_count,
        method=Image.Quantize.MEDIANCUT,
        dither=Image.Dither.FLOYDSTEINBERG,
    ).convert("RGB")
    quantized.putalpha(alpha.point(lambda value: 255 if value >= 96 else 0))

    output_image = Image.new(
        "RGBA",
        (target_width + padding * 2, target_height + padding * 2),
        (0, 0, 0, 0),
    )
    output_image.alpha_composite(quantized, (padding, padding))

    output = BytesIO()
    output_image.save(output, format="PNG", optimize=True)
    return output.getvalue()


if __name__ == "__main__":
    main()
