// P_2_3_6_02.pde
// 
// Generative Gestaltung, ISBN: 978-3-87439-759-9
// First Edition, Hermann Schmidt, Mainz, 2009
// Hartmut Bohnacker, Benedikt Gross, Julia Laub, Claudius Lazzeroni
// Copyright 2009 Hartmut Bohnacker, Benedikt Gross, Julia Laub, Claudius Lazzeroni
//
// http://www.generative-gestaltung.de
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * draw tool. draws a specific module according to 
 * its east, south, west and north neighbours.
 * with switchable tileset 
 * 
 * MOUSE
 * drag left           : draw new module
 * drag right          : delete a module
 * 
 * KEYS
 * 1-0                 : switch tileset
 * y,x,c,v,b           : switch colors
 * del, backspace      : clear screen
 * r                   : random tiles
 * s                   : save png
 * p                   : save pdf
 * g                   : toogle. show grid
 * d                   : toogle. show module values
 */

import processing.pdf.*;
import java.util.Calendar;

boolean savePDF = false;

float tileSize = 50;
int gridResolutionX, gridResolutionY;
boolean drawGrid = true;
char[][] tiles;

color[][] tileColors;
color activeTileColor;

boolean randomMode = false;

PShape[] modules1;
PShape[] modules2;
PShape[] modules3;
PShape[] modules4;
PShape[] modules5;
PShape[] modules6;
PShape[] modules7;
PShape[] modules8;
PShape[] modules9;
PShape[] modulesE;
PShape[] modulesQ;
PShape[] modulesT;
PShape[] modulesW;
PShape[] modulesY;
PShape[] modulesU;

char[] modules  = {
  '1', '2', '3', '4', '5', '6', '7', '8', '9', 'E', 'Q','T','W','Y','U'};
char activeModulsSet = '1';

PFont font;
boolean debugMode = false;


void setup() {
  // use full screen size 
  size(displayWidth, displayHeight);
  //size(600,600);
  smooth();
  colorMode(HSB,360,100,100);
  cursor(CROSS);
  font = createFont("sans-serif",9);
  textFont(font,9);
  textAlign(CENTER,CENTER);

  gridResolutionX = round(width/tileSize)+2;
  gridResolutionY = round(height/tileSize)+2;
  tiles = new char[gridResolutionX][gridResolutionY];
  tileColors = new color[gridResolutionX][gridResolutionY];
  initTiles();


  // load svg modules
  modules1 = new PShape[16];
  modules2 = new PShape[16];
  modules3 = new PShape[16]; 
  modules4 = new PShape[16]; 
  modules5 = new PShape[16];  
  modules6 = new PShape[16];  
  modules7 = new PShape[16];  
  modules8 = new PShape[16];  
  modules9 = new PShape[16];  
  modulesE = new PShape[16];  
  modulesQ = new PShape[16];  
  modulesT = new PShape[16];  
  modulesW = new PShape[16];  
  modulesY = new PShape[16];
  modulesU = new PShape[16];

  for (int i=0; i< modules1.length; i++) { 
    modules1[i] = loadShape("1_"+nf(i,2)+".svg");
    modules2[i] = loadShape("2_"+nf(i,2)+".svg");
    modules3[i] = loadShape("3_"+nf(i,2)+".svg");
    modules4[i] = loadShape("4_"+nf(i,2)+".svg");
    modules5[i] = loadShape("5_"+nf(i,2)+".svg");
    modules6[i] = loadShape("6_"+nf(i,2)+".svg");
    modules7[i] = loadShape("7_"+nf(i,2)+".svg");
    modules8[i] = loadShape("8_"+nf(i,2)+".svg");
    modules9[i] = loadShape("9_"+nf(i,2)+".svg");
    modulesE[i] = loadShape("E_"+nf(i,2)+".svg");
    modulesQ[i] = loadShape("Q_"+nf(i,2)+".svg");
    modulesT[i] = loadShape("T_"+nf(i,2)+".svg");
    modulesW[i] = loadShape("W_"+nf(i,2)+".svg");
    modulesY[i] = loadShape("Y_"+nf(i,2)+".svg");
    modulesU[i] = loadShape("U_"+nf(i,2)+".svg");

      //disable Style
    modules1[i].disableStyle();
    modules2[i].disableStyle();
    modules3[i].disableStyle();
    modules4[i].disableStyle();
    modules5[i].disableStyle();
    modules6[i].disableStyle();
    modules7[i].disableStyle();
    modules8[i].disableStyle();
    modules9[i].disableStyle();
    modulesE[i].disableStyle();
    modulesQ[i].disableStyle();
    modulesT[i].disableStyle();
    modulesW[i].disableStyle();
    modulesY[i].disableStyle();
    modulesU[i].disableStyle();


  }
}

void draw() {
  if (savePDF) beginRecord(PDF, timestamp()+".pdf");

  smooth();
  colorMode(HSB, 360, 100, 100, 100);
  textFont(font,10);
  textAlign(CENTER,CENTER);
  
  background(360);
  
  if (mousePressed && (mouseButton == LEFT)) setTile();
  if (mousePressed && (mouseButton == RIGHT)) unsetTile();

  if (drawGrid) drawGrid();
  drawModuls();

  if (savePDF) {
    savePDF = false;
    endRecord();
  }
}



void initTiles() {
  for (int gridY=0; gridY< gridResolutionY; gridY++) {
    for (int gridX=0; gridX< gridResolutionX; gridX++) {  
      tiles[gridX][gridY] = '0';
      tileColors[gridX][gridY] = color(random(255),0,random(255));
    }
  }
}

void setTile() {
  // convert mouse position to grid coordinates
  int gridX = floor((float)mouseX/tileSize) + 1;
  gridX = constrain(gridX, 1, gridResolutionX-2);
  int gridY = floor((float)mouseY/tileSize) + 1;
  gridY = constrain(gridY, 1, gridResolutionY-2);
  tiles[gridX][gridY] = activeModulsSet;
  tileColors[gridX][gridY] = activeTileColor;
}

void unsetTile() {
  int gridX = floor((float)mouseX/tileSize) + 1;
  gridX = constrain(gridX, 1, gridResolutionX-2);
  int gridY = floor((float)mouseY/tileSize) + 1;
  gridY = constrain(gridY, 1, gridResolutionY-2);
  tiles[gridX][gridY] = '0';
}


void drawGrid() {
  rectMode(CENTER);
  for (int gridY=0; gridY< gridResolutionY; gridY++) {
    for (int gridX=0; gridX< gridResolutionX; gridX++) {  
      float posX = tileSize*gridX - tileSize/2;
      float posY = tileSize*gridY - tileSize/2;
      strokeWeight(0.15);
      fill(360);
      if (debugMode) {
        if (tiles[gridX][gridY] == '1') fill(220);
      }
     stroke(0);
     noFill();
     rect(posX, posY, tileSize, tileSize);
    }
  }
}


void drawModuls() {
  if(randomMode)activeModulsSet = modules[int(random(modules.length))];
  shapeMode(CENTER);
  for (int gridY=1; gridY< gridResolutionY-1; gridY++) {  
    for (int gridX=1; gridX< gridResolutionX-1; gridX++) { 
      // use only active tiles
      char currentTile = tiles[gridX][gridY];
      if (currentTile != '0') {
        String binaryResult = "";
        // check the four neighbours. is it active (not '0')? 
        // create a binary result out of it, eg. 1011
        // binaryResult = north + west + south + east;
        // north
        if (tiles[gridX][gridY-1] != '0') binaryResult = "1";
        else binaryResult = "0";
        // west
        if (tiles[gridX-1][gridY] != '0') binaryResult += "1";
        else binaryResult += "0";  
        // south
        if (tiles[gridX][gridY+1] != '0') binaryResult += "1";
        else binaryResult += "0";
        // east
        if (tiles[gridX+1][gridY] != '0') binaryResult += "1";
        else binaryResult += "0";

        // convert the binary string to a decimal value from 0-15
        int decimalResult = unbinary(binaryResult);
        float posX = tileSize*gridX - tileSize/2;
        float posY = tileSize*gridY - tileSize/2;
      
        fill(tileColors[gridX][gridY]);
        noStroke();
        
      
        // decimalResult is the also the index for the shape array
        switch(currentTile) {
        case '1': 
          shape(modules1[decimalResult],posX, posY, tileSize, tileSize);
          break;
        case '2': 
          shape(modules2[decimalResult],posX, posY, tileSize, tileSize);
          break;
        case '3': 
          shape(modules3[decimalResult],posX, posY, tileSize, tileSize);
          break;
        case '4': 
          shape(modules4[decimalResult],posX, posY, tileSize, tileSize);
          break;
        case '5': 
          shape(modules5[decimalResult],posX, posY, tileSize, tileSize);
          break;
        case '6': 
          shape(modules6[decimalResult],posX, posY, tileSize, tileSize);
          break;
        case '7': 
          shape(modules7[decimalResult],posX, posY, tileSize, tileSize);
          break;
        case '8': 
          shape(modules8[decimalResult],posX, posY, tileSize, tileSize);
          break;
        case '9': 
          shape(modules9[decimalResult],posX, posY, tileSize, tileSize);
          break;
        case 'E': 
          shape(modulesE[decimalResult],posX, posY, tileSize, tileSize);
          break;
        case 'Q': 
          shape(modulesQ[decimalResult],posX, posY, tileSize, tileSize);
          break;
        case 'T': 
          shape(modulesT[decimalResult],posX, posY, tileSize, tileSize);
          break;
        case 'W': 
          shape(modulesW[decimalResult],posX, posY, tileSize, tileSize);
          break;
        case 'Y': 
          shape(modulesY[decimalResult],posX, posY, tileSize, tileSize);
          break;
        case 'U': 
          shape(modulesU[decimalResult],posX, posY, tileSize, tileSize);
          break;
        }

        if (debugMode) {
          fill(150);
          text(currentTile+"\n"+decimalResult+"\n"+binaryResult,posX, posY);
        }
      }
    }
  }
}


void keyReleased() {
  if (key == 's' || key == 'S') saveFrame(timestamp()+"_##.png");
  if (key == 'p' || key == 'P') savePDF = true;
  if (key == DELETE || key == BACKSPACE) initTiles();
  if (key == 'g' || key == 'G') drawGrid = !drawGrid;
  if (key == 'd' || key == 'D') debugMode = !debugMode;
  if (key == 'r' || key == 'R') randomMode = !randomMode;
  if (key == '1') activeModulsSet = '1';
  if (key == '2') activeModulsSet = '2';
  if (key == '3') activeModulsSet = '3';
  if (key == '4') activeModulsSet = '4';
  if (key == '5') activeModulsSet = '5';
  if (key == '6') activeModulsSet = '6';
  if (key == '7') activeModulsSet = '7';
  if (key == '8') activeModulsSet = '8';
  if (key == '9') activeModulsSet = '9';
  if (key == 'e' || key == 'E') activeModulsSet = 'E';
  if (key == 'q' || key == 'Q') activeModulsSet = 'Q';
  if (key == 't' || key == 'T') activeModulsSet = 'T';
  if (key == 'w' || key == 'W') activeModulsSet = 'W';
  if (key == 'y' || key == 'Y') activeModulsSet = 'Y';
  if (key == 'u' || key == 'U') activeModulsSet = 'U';

  if (key == 'x' || key == 'X') activeTileColor = color(#84DADE);
  if (key == 'z' || key == 'Z') activeTileColor = color(#ff006e);
}


// timestamp
String timestamp() {
  Calendar now = Calendar.getInstance();
  return String.format("%1$ty%1$tm%1$td_%1$tH%1$tM%1$tS", now);
}
