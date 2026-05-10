#!/usr/bin/env python3
"""Détoure la mascotte : transforme le fond blanc en transparent (alpha 0)
   via flood-fill depuis les 4 coins + anti-aliasing des bordures."""
from PIL import Image, ImageFilter
import sys, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'images', 'mascotte.png')
BACKUP = os.path.join(ROOT, 'images', 'mascotte-with-bg.png')
DST = os.path.join(ROOT, 'images', 'mascotte.png')

# Sauvegarde l'original (s'il n'a pas déjà été sauvegardé)
if not os.path.exists(BACKUP):
    Image.open(SRC).save(BACKUP)
    print(f"✓ Backup → {BACKUP}")

img = Image.open(SRC).convert('RGBA')
w, h = img.size
print(f"Taille originale : {w}×{h}")

# Étape 1 : flood-fill depuis chaque coin pour trouver le fond
#   tolérance : 30 (un pixel est "fond blanc" si chaque canal > 240 - 30)
def is_bg(px, threshold=235):
    r, g, b, a = px
    return r >= threshold and g >= threshold and b >= threshold

# Récupère tous les pixels en mémoire (rapide)
pixels = list(img.getdata())

# BFS / flood-fill itératif depuis les 4 coins
visited = bytearray(w * h)  # 0 = non visité, 1 = visité
stack = [(0, 0), (w-1, 0), (0, h-1), (w-1, h-1)]
# +  on ajoute aussi tous les pixels du bord qui sont blancs (couvrir éventuelles franges)
for x in range(w):
    if is_bg(pixels[x]):
        stack.append((x, 0))
    if is_bg(pixels[(h-1)*w + x]):
        stack.append((x, h-1))
for y in range(h):
    if is_bg(pixels[y*w]):
        stack.append((0, y))
    if is_bg(pixels[y*w + w-1]):
        stack.append((w-1, y))

while stack:
    x, y = stack.pop()
    if x < 0 or y < 0 or x >= w or y >= h:
        continue
    idx = y*w + x
    if visited[idx]:
        continue
    if not is_bg(pixels[idx]):
        continue
    visited[idx] = 1
    stack.append((x+1, y))
    stack.append((x-1, y))
    stack.append((x, y+1))
    stack.append((x, y-1))

# Étape 2 : applique la transparence sur tous les pixels marqués
new_pixels = []
for i, px in enumerate(pixels):
    if visited[i]:
        new_pixels.append((255, 255, 255, 0))
    else:
        new_pixels.append(px)
img.putdata(new_pixels)

# Étape 3 : Anti-aliasing des bords — on extrait l'alpha, on flou très léger,
# et on remet, ce qui adoucit les escaliers
alpha = img.split()[3]
alpha = alpha.filter(ImageFilter.GaussianBlur(radius=0.7))
img.putalpha(alpha)

# Étape 4 : Crop autour du contenu non-transparent pour économiser de la place
bbox = img.getbbox()
if bbox:
    img = img.crop(bbox)
    print(f"Crop : {img.size}")

img.save(DST, 'PNG', optimize=True)
print(f"✓ Mascotte détourée sauvée → {DST}")
print(f"Taille finale : {os.path.getsize(DST) // 1024} KB")
