// NAC Modules — p5.js Web App
// Converted from NACModules_01.pde (Processing)
// Original: P_2_3_6_02 from Generative Gestaltung
// https://www.generative-gestaltung.de
//
// Licensed under the Apache License, Version 2.0

const TILE_SIZE = 50;
const MODULE_KEYS = ['1','2','3','4','5','6','7','8','9','E','Q','T','W','Y','U'];

// SVG source text: svgData[key][index] = string (full SVG text)
let svgData = {};
// Cached HTMLImageElement per (key, index, cssColor): imgCache[cacheKey] = Image
let imgCache = {};

let gridResolutionX, gridResolutionY;
let tiles = [];        // tiles[x][y] = module key char or '0'
let tileColors = [];   // tileColors[x][y] = p5 color

let activeModuleSet = '1';
let activeTileColor;
let randomMode = false;
let drawGrid = true;
let debugMode = false;

let isLoaded = false;
let loadProgress = 0;
const TOTAL_FILES = MODULE_KEYS.length * 16; // 240


// ---------------------------------------------------------------------------
// p5.js lifecycle
// ---------------------------------------------------------------------------

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  cursor(CROSS);
  activeTileColor = color('#000000'); // black default
  initGrid();
  loadSVGFiles();
}

async function loadSVGFiles() {
  let promises = [];
  for (let key of MODULE_KEYS) {
    svgData[key] = new Array(16);
    for (let i = 0; i < 16; i++) {
      let k = key, idx = i;
      promises.push(
        fetch('data/' + k + '_' + nf(idx, 2) + '.svg')
          .then(r => r.text())
          .then(text => {
            svgData[k][idx] = text;
            loadProgress++;
          })
      );
    }
  }
  await Promise.all(promises);
  isLoaded = true;
}

function draw() {
  background(0, 0, 100); // white in HSB

  if (!isLoaded) {
    drawLoadingScreen();
    return;
  }

  if (drawGrid)  drawGridLines();
  drawModules();
  drawHUD();
}


// ---------------------------------------------------------------------------
// Grid helpers
// ---------------------------------------------------------------------------

function initGrid() {
  gridResolutionX = round(width  / TILE_SIZE) + 2;
  gridResolutionY = round(height / TILE_SIZE) + 2;
  tiles      = [];
  tileColors = [];
  for (let x = 0; x < gridResolutionX; x++) {
    tiles[x]      = [];
    tileColors[x] = [];
    for (let y = 0; y < gridResolutionY; y++) {
      tiles[x][y]      = '0';
      tileColors[x][y] = color(0, 0, 100); // white placeholder
    }
  }
}

function setTile() {
  let gx = constrain(floor(mouseX / TILE_SIZE) + 1, 1, gridResolutionX - 2);
  let gy = constrain(floor(mouseY / TILE_SIZE) + 1, 1, gridResolutionY - 2);
  tiles[gx][gy]      = randomMode
    ? MODULE_KEYS[floor(random(MODULE_KEYS.length))]
    : activeModuleSet;
  tileColors[gx][gy] = activeTileColor;
}

function unsetTile() {
  let gx = constrain(floor(mouseX / TILE_SIZE) + 1, 1, gridResolutionX - 2);
  let gy = constrain(floor(mouseY / TILE_SIZE) + 1, 1, gridResolutionY - 2);
  tiles[gx][gy] = '0';
}


// ---------------------------------------------------------------------------
// Drawing
// ---------------------------------------------------------------------------

function drawGridLines() {
  stroke(0, 0, 0);
  strokeWeight(0.15);
  noFill();
  rectMode(CENTER);
  for (let gy = 0; gy < gridResolutionY; gy++) {
    for (let gx = 0; gx < gridResolutionX; gx++) {
      rect(
        TILE_SIZE * gx - TILE_SIZE / 2,
        TILE_SIZE * gy - TILE_SIZE / 2,
        TILE_SIZE, TILE_SIZE
      );
    }
  }
}

function drawModules() {
  for (let gy = 1; gy < gridResolutionY - 1; gy++) {
    for (let gx = 1; gx < gridResolutionX - 1; gx++) {
      let currentTile = tiles[gx][gy];
      if (currentTile === '0') continue;

      // Build 4-bit neighbour string: north-west-south-east
      let bin =
        (tiles[gx    ][gy - 1] !== '0' ? '1' : '0') +
        (tiles[gx - 1][gy    ] !== '0' ? '1' : '0') +
        (tiles[gx    ][gy + 1] !== '0' ? '1' : '0') +
        (tiles[gx + 1][gy    ] !== '0' ? '1' : '0');
      let idx = parseInt(bin, 2); // 0-15

      // Pixel centre of this cell (matching shapeMode(CENTER) in original)
      let posX = TILE_SIZE * gx - TILE_SIZE / 2;
      let posY = TILE_SIZE * gy - TILE_SIZE / 2;

      let col    = tileColors[gx][gy];
      let fillCSS = colorToCSS(col);
      let img    = getSVGImage(currentTile, idx, fillCSS);

      if (img.complete && img.naturalWidth > 0) {
        drawingContext.drawImage(
          img,
          posX - TILE_SIZE / 2,
          posY - TILE_SIZE / 2,
          TILE_SIZE, TILE_SIZE
        );
      }

      if (debugMode) {
        push();
        fill(0, 0, 40);
        noStroke();
        textAlign(CENTER, CENTER);
        textSize(9);
        text(currentTile + '\n' + idx + '\n' + bin, posX, posY);
        pop();
      }
    }
  }
}

/** Return a cached HTMLImageElement for the SVG coloured with fillCSS. */
function getSVGImage(moduleKey, index, fillCSS) {
  let cacheKey = moduleKey + '_' + index + '_' + fillCSS;
  if (imgCache[cacheKey]) return imgCache[cacheKey];

  let svgText = svgData[moduleKey][index];

  // Inject fill colour so all paths inherit it.
  // Some SVGs wrap paths in a plain <g>; others have paths directly under <svg>.
  if (svgText.includes('<g>')) {
    // Replace the first bare <g> with a coloured one
    svgText = svgText.replace('<g>', '<g fill="' + fillCSS + '">');
  } else {
    // Inject fill onto the root <svg> element so direct-child paths inherit it
    svgText = svgText.replace(/<svg /, '<svg fill="' + fillCSS + '" ');
  }

  let img = new Image();
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText);
  imgCache[cacheKey] = img;
  return img;
}

/** Convert a p5 color to an CSS rgb() string (works in any colorMode). */
function colorToCSS(col) {
  return 'rgb(' + round(red(col)) + ',' + round(green(col)) + ',' + round(blue(col)) + ')';
}


// ---------------------------------------------------------------------------
// Loading screen
// ---------------------------------------------------------------------------

function drawLoadingScreen() {
  push();
  colorMode(RGB, 255);
  let pct = TOTAL_FILES > 0 ? loadProgress / TOTAL_FILES : 0;
  let barW = width * 0.4;
  let barH = 12;
  let bx = (width - barW) / 2;
  let by = height / 2 - barH / 2;

  fill(220);
  noStroke();
  rect(bx, by, barW, barH, 6);

  fill(132, 218, 222); // teal
  rect(bx, by, barW * pct, barH, 6);

  fill(60);
  textAlign(CENTER, CENTER);
  textSize(14);
  text('Loading modules… ' + loadProgress + ' / ' + TOTAL_FILES, width / 2, by - 24);
  pop();
}


// ---------------------------------------------------------------------------
// HUD overlay
// ---------------------------------------------------------------------------

function drawHUD() {
  push();
  colorMode(RGB, 255);

  // Semi-transparent bar at the bottom
  noStroke();
  fill(255, 255, 255, 210);
  rectMode(CORNER);
  rect(0, height - 44, width, 44);

  // Colour swatch for active colour
  let r = round(red(activeTileColor));
  let g = round(green(activeTileColor));
  let b = round(blue(activeTileColor));
  fill(r, g, b);
  rect(8, height - 36, 20, 28);
  stroke(80);
  strokeWeight(1);
  noFill();
  rect(8, height - 36, 20, 28);

  // Text legend
  noStroke();
  fill(50);
  textSize(11);
  textAlign(LEFT, CENTER);

  let line1 =
    'Tileset: ' + activeModuleSet +
    '   |   1-9 / E Q T W Y U : switch tileset' +
    '   |   c : black   x : teal   z : pink' +
    '   |   r : random [' + (randomMode ? 'ON' : 'off') + ']';
  let line2 =
    'g : grid [' + (drawGrid ? 'ON' : 'off') + ']' +
    '   |   d : debug [' + (debugMode ? 'ON' : 'off') + ']' +
    '   |   s : save SVG' +
    '   |   Backspace / Delete : clear' +
    '   |   Left-drag : draw   Right-drag : erase';

  text(line1, 36, height - 30);
  text(line2, 36, height - 14);
  pop();
}


// ---------------------------------------------------------------------------
// Event handlers
// ---------------------------------------------------------------------------

function keyReleased() {
  if (key === 's' || key === 'S') saveSVG();
  if (keyCode === DELETE || keyCode === BACKSPACE) initGrid();
  if (key === 'g' || key === 'G') drawGrid   = !drawGrid;
  if (key === 'd' || key === 'D') debugMode  = !debugMode;
  if (key === 'r' || key === 'R') randomMode = !randomMode;

  // Tileset selection: 1-9
  if (key >= '1' && key <= '9') activeModuleSet = key;
  // Tileset selection: letter keys
  if (key === 'e' || key === 'E') activeModuleSet = 'E';
  if (key === 'q' || key === 'Q') activeModuleSet = 'Q';
  if (key === 't' || key === 'T') activeModuleSet = 'T';
  if (key === 'w' || key === 'W') activeModuleSet = 'W';
  if (key === 'y' || key === 'Y') activeModuleSet = 'Y';
  if (key === 'u' || key === 'U') activeModuleSet = 'U';

  // Colour shortcuts
  if (key === 'c' || key === 'C') activeTileColor = color('#000000');
  if (key === 'x' || key === 'X') activeTileColor = color('#84DADE');
  if (key === 'z' || key === 'Z') activeTileColor = color('#ff006e');

  // Suppress browser shortcuts (e.g. backspace navigation)
  return false;
}

// Place/erase tile on initial click and while dragging
function mousePressed() {
  if (!isLoaded) return false;
  if (mouseButton && mouseButton.left)  setTile();
  if (mouseButton && mouseButton.right) unsetTile();
  return false; // prevent context menu & default browser behaviour
}

function mouseDragged() {
  if (!isLoaded) return false;
  if (mouseButton && mouseButton.left)  setTile();
  if (mouseButton && mouseButton.right) unsetTile();
  return false;
}

// Touch: treat single-finger touch as left-drag
function touchStarted() {
  setTile();
  return false;
}
function touchMoved() {
  setTile();
  return false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  let newX = round(width  / TILE_SIZE) + 2;
  let newY = round(height / TILE_SIZE) + 2;

  // Expand arrays preserving existing tile data
  let newTiles      = [];
  let newTileColors = [];
  for (let x = 0; x < newX; x++) {
    newTiles[x]      = [];
    newTileColors[x] = [];
    for (let y = 0; y < newY; y++) {
      newTiles[x][y]      = (tiles[x]      && tiles[x][y]      != null) ? tiles[x][y]      : '0';
      newTileColors[x][y] = (tileColors[x] && tileColors[x][y] != null) ? tileColors[x][y] : color(0, 0, 100);
    }
  }
  gridResolutionX = newX;
  gridResolutionY = newY;
  tiles      = newTiles;
  tileColors = newTileColors;
}


// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function saveSVG() {
  // Find bounding box of all placed tiles
  let minGX = gridResolutionX, maxGX = 0;
  let minGY = gridResolutionY, maxGY = 0;
  let hasTiles = false;
  for (let gx = 1; gx < gridResolutionX - 1; gx++) {
    for (let gy = 1; gy < gridResolutionY - 1; gy++) {
      if (tiles[gx][gy] !== '0') {
        if (gx < minGX) minGX = gx;
        if (gx > maxGX) maxGX = gx;
        if (gy < minGY) minGY = gy;
        if (gy > maxGY) maxGY = gy;
        hasTiles = true;
      }
    }
  }
  if (!hasTiles) return;

  // 1-tile padding around the drawing
  minGX = max(1, minGX - 1);
  minGY = max(1, minGY - 1);
  maxGX = min(gridResolutionX - 2, maxGX + 1);
  maxGY = min(gridResolutionY - 2, maxGY + 1);

  let svgW = (maxGX - minGX + 1) * TILE_SIZE;
  let svgH = (maxGY - minGY + 1) * TILE_SIZE;

  // Use canvas2svg to capture drawing calls as SVG — this guarantees
  // pixel-perfect output for ALL tilesets regardless of their SVG structure.
  let ctx = new C2S(svgW, svgH);

  // White background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, svgW, svgH);

  // Optional grid lines
  if (drawGrid) {
    ctx.save();
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 0.5;
    for (let gx = minGX; gx <= maxGX + 1; gx++) {
      let x = TILE_SIZE * (gx - minGX);
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, svgH); ctx.stroke();
    }
    for (let gy = minGY; gy <= maxGY + 1; gy++) {
      let y = TILE_SIZE * (gy - minGY);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(svgW, y); ctx.stroke();
    }
    ctx.restore();
  }

  // Draw each module tile using the same cached HTMLImageElement as the canvas
  for (let gx = 1; gx < gridResolutionX - 1; gx++) {
    for (let gy = 1; gy < gridResolutionY - 1; gy++) {
      let currentTile = tiles[gx][gy];
      if (currentTile === '0') continue;

      let bin =
        (tiles[gx    ][gy - 1] !== '0' ? '1' : '0') +
        (tiles[gx - 1][gy    ] !== '0' ? '1' : '0') +
        (tiles[gx    ][gy + 1] !== '0' ? '1' : '0') +
        (tiles[gx + 1][gy    ] !== '0' ? '1' : '0');
      let idx = parseInt(bin, 2);

      let fillCSS = colorToCSS(tileColors[gx][gy]);
      let img = getSVGImage(currentTile, idx, fillCSS);

      // Only draw if the image is already decoded (it should be — we drew it on canvas)
      if (img.complete && img.naturalWidth > 0) {
        let destX = TILE_SIZE * (gx - minGX);
        let destY = TILE_SIZE * (gy - minGY);
        ctx.drawImage(img, destX, destY, TILE_SIZE, TILE_SIZE);
      }
    }
  }

  let svgText = ctx.getSerializedSvg(true);
  let blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
  let url  = URL.createObjectURL(blob);
  let a    = document.createElement('a');
  a.href     = url;
  a.download = timestamp() + '.svg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function timestamp() {
  let d = new Date();
  return ('' + d.getFullYear()).slice(2) +
    nf(d.getMonth() + 1, 2) + nf(d.getDate(), 2) + '_' +
    nf(d.getHours(), 2) + nf(d.getMinutes(), 2) + nf(d.getSeconds(), 2);
}
