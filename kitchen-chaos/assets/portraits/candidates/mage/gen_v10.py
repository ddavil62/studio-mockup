"""
Mage portrait v10: rembg + mask dilation.
rembg for semantic character/background separation (preserves white clothing),
then dilate mask by 3px to prevent edge clipping.
"""
import sys, os
os.environ["PYTHONIOENCODING"] = "utf-8"
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

import requests, base64, io
from pathlib import Path
from PIL import Image, ImageFilter
from rembg import remove, new_session

SD_URL = "http://192.168.219.100:7860"
MIMI_512 = Path(r"C:\antigravity\studio-mockup\kitchen-chaos\assets\portraits\portrait_mimi.png")
OUTPUT_DIR = Path(r"C:\antigravity\kitchen-chaos\assets\portraits\candidates\mage")
LORA_TAG = "<lora:DarkFantasy-PixelSprite-000008:0.6>"

def prepare_init_image():
    img = Image.open(MIMI_512).convert("RGBA")
    bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
    bg.paste(img, mask=img.split()[3])
    bg = bg.convert("RGB")
    buf = io.BytesIO()
    bg.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode()

def process_image(b64_data, out_path):
    """
    1. rembg to get alpha mask (semantic separation)
    2. Dilate mask by 3px to recover clipped edges
    3. Apply dilated mask to original SD output
    """
    img_bytes = base64.b64decode(b64_data)
    original = Image.open(io.BytesIO(img_bytes)).convert("RGBA")

    # Get rembg result to extract its alpha channel as mask
    rembg_result = remove(img_bytes)
    rembg_img = Image.open(io.BytesIO(rembg_result)).convert("RGBA")
    mask = rembg_img.split()[3]  # alpha channel = character mask

    # Dilate mask by 3px to recover clipped edges
    # MaxFilter expands white (opaque) areas
    dilated = mask.filter(ImageFilter.MaxFilter(7))  # 7 = 3px radius

    # Apply dilated mask to ORIGINAL image (not rembg output)
    # This preserves original colors/details while using rembg's intelligence
    result = original.copy()
    result.putalpha(dilated)

    result.save(out_path, "PNG")
    fsize = out_path.stat().st_size
    print(f"  Saved: {out_path.name} ({fsize/1024:.1f}KB)")

STYLE_PREFIX = (
    f"masterpiece, best quality, {LORA_TAG}, pixel art, "
    "1girl, chibi, "
    "close-up portrait, head and shoulders, bust portrait, "
    "character filling frame, "
    "facing viewer, "
)
STYLE_SUFFIX = (
    ", solid white background, simple white background, "
    "pixel art style, flat color, limited color palette, "
    "bold black outline, no gradient, cel shading, "
    "cute, clean pixel edges"
)

CANDIDATES = [
    {"name": "mage_candidate_01",
     "prompt": STYLE_PREFIX + "long straight purple hair flowing past shoulders, small round glasses, small purple flower hairpin left side, medium purple dress, calm neutral expression, gentle eyes" + STYLE_SUFFIX},
    {"name": "mage_candidate_02",
     "prompt": STYLE_PREFIX + "long straight purple hair, small round glasses, small purple flower hairpin left side, medium purple outfit, warm gentle smile, happy bright eyes, cheerful" + STYLE_SUFFIX},
    {"name": "mage_candidate_03",
     "prompt": STYLE_PREFIX + "purple hair in low ponytail, square glasses, no hairpin, purple lab coat, focused concentration expression, serious eyes" + STYLE_SUFFIX},
    {"name": "mage_candidate_04",
     "prompt": STYLE_PREFIX + "long straight purple hair, small round glasses, small purple flower hairpin left side, light purple outfit, surprised expression, wide round eyes, small open mouth" + STYLE_SUFFIX},
    {"name": "mage_candidate_05",
     "prompt": STYLE_PREFIX + "purple hair in low ponytail, round glasses, small purple flower hairpin right side, dark deep purple outfit, serious determined expression, slight frown" + STYLE_SUFFIX},
    {"name": "mage_candidate_06",
     "prompt": STYLE_PREFIX + "purple hair half-up half-down style, square glasses, small purple flower hairpin left side, medium purple sophisticated outfit, calm composed elegant expression" + STYLE_SUFFIX},
    {"name": "mage_candidate_07",
     "prompt": STYLE_PREFIX + "purple hair half-up style, small round glasses, no hairpin, light pastel purple outfit, warm friendly smile, soft gentle eyes" + STYLE_SUFFIX},
    {"name": "mage_candidate_08",
     "prompt": STYLE_PREFIX + "purple hair in elegant updo bun, square glasses, small purple flower hairpin right side, dark purple formal coat, serious authoritative expression" + STYLE_SUFFIX},
    {"name": "mage_candidate_09",
     "prompt": STYLE_PREFIX + "long straight purple hair flowing down, no glasses, no hairpin, dark deep purple outfit, quiet serious expression, soft gentle eyes, mysterious" + STYLE_SUFFIX},
    {"name": "mage_candidate_10",
     "prompt": STYLE_PREFIX + "purple hair in neat updo, small round glasses, small purple flower hairpin left side, medium purple formal outfit, calm composed dignified expression" + STYLE_SUFFIX},
]

NEGATIVE = (
    "lowres, bad anatomy, bad hands, text, error, missing fingers, extra digit, "
    "fewer digits, cropped, worst quality, low quality, normal quality, jpeg artifacts, "
    "signature, watermark, full body, legs, feet, below waist, "
    "realistic, 3d render, blurry, deformed, extra limbs, ugly, poorly drawn, "
    "muscular, masculine, small character, far away, zoomed out, wide shot, "
    "multiple characters, smooth shading, anti-aliasing"
)

def main():
    print("Preparing 512x512 Mimi as init image...")
    init_b64 = prepare_init_image()
    print("Ready.")

    results = []
    for i, cand in enumerate(CANDIDATES):
        num = i + 1
        print(f"\n=== Candidate {num:02d}/10 ===")

        payload = {
            "init_images": [init_b64],
            "prompt": cand["prompt"],
            "negative_prompt": NEGATIVE,
            "denoising_strength": 0.72,
            "steps": 30,
            "cfg_scale": 8,
            "width": 512,
            "height": 512,
            "sampler_name": "DPM++ 2M Karras",
            "seed": -1,
        }

        try:
            r = requests.post(f"{SD_URL}/sdapi/v1/img2img", json=payload, timeout=180)
            r.raise_for_status()
            data = r.json()
            if data.get("images"):
                out_path = OUTPUT_DIR / f"{cand['name']}.png"
                process_image(data["images"][0], out_path)
                results.append(str(out_path))
            else:
                print("  WARN: no image")
        except Exception as e:
            print(f"  ERR: {e}")

    print(f"\n=== Done: {len(results)}/10 ===")

if __name__ == "__main__":
    main()
