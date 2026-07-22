import os
from PIL import Image

app_dir = 'app'
os.makedirs(f'{app_dir}/assets', exist_ok=True)

SOURCE_CANDIDATES = [
    'public/icons/icon-1024.png',
    'public/icons/icon-512.png',
]

source = next((p for p in SOURCE_CANDIDATES if os.path.exists(p)), None)
if not source:
    raise SystemExit('ERROR: No source icon found in public/icons/')

img = Image.open(source).convert('RGBA')
if img.size != (1024, 1024):
    img = img.resize((1024, 1024), Image.LANCZOS)
img.save(f'{app_dir}/assets/icon.png', 'PNG')

print(f'Used {source} -> {app_dir}/assets/icon.png ({img.size[0]}x{img.size[1]})')
