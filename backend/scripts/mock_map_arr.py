import json
from pathlib import Path
import numpy as np
from PIL import Image

#Arbitrary hotspot center coordinates
hotspots = [(35, 110), (80, 215), (55, 330), (95, 420), (40, 510), (75, 590)]
#Spread factors and peak intensities of each centre
spreads = [
    (10, 35, 0.85), (14, 50, 0.70), (16, 55, 0.95),
    (12, 40, 0.65), (15, 45, 0.80), (11, 30, 0.75),
]

#All coordinates on map
y, x = np.mgrid[0:131, 0:639]

#Add values of each hotspot to map
grid = 0
for (hot_y, hot_x), (spr_y, spr_x, intensity) in zip(hotspots, spreads):
    #eliptical distance from centre
    dist = ((y - hot_y) / spr_y)**2 + ((x - hot_x) / spr_x)**2 
    #Generate hotspot with exponential drop
    grid += intensity * np.exp(-dist / 2)

#Add random noise
noise = np.random.default_rng(0).normal(loc=0.0, scale=0.02, size=grid.shape)
grid = np.clip(grid + noise, 0.0, 1.0).astype(np.float32)

def createImage(grid:np.ndarray, save_as:str) -> None:
    '''Creates a PNG greyscale visualisation of the generated distribution'''
    img_arr = (grid * 255).astype(np.uint8)
    img = Image.fromarray(img_arr, mode='L')
    img.save(save_as)

#Save greyscale image visualization 
createImage(grid, './backend/data/mock/mock_map.png')

#Save numpy file
np.save('./backend/data/mock/probability.npy', grid)

#Save json of boundary values
bounds = {"left": 78.85, "right": 80.57, "top": 21.79, "bottom": 21.26}
with open('./backend/data/mock/bounds.json', 'w') as f:
    json.dump(bounds, f, indent=2)
