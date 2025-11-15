let data;
let nameVulcani;
let dataVulcani;
let allVulcani;
let realMinAltitudine;
let realMaxAltitudine;

let colRossoScuro = "#8a1c0eff";
let colSfondo = "#dac6a1";
let colMarroneScuro = "#3F261D";
let colGiallo = "#FFD700";

let typeColors = {
  "Stratovolcano": "#B04D3F",
  "Cone": "#735999ff",
  "Submarine Volcano": "#3788b0ff",
  "Shield Volcano": "#8C6A5B",
  "Caldera": "#e58a23ff",
  "Volcanic field": "#9B7D5D",
  "Crater System": "#59a252ff",
  "Maars / Tuff ring": "#505050ff",
  "Subglacial": "#a0d2e8ff",
  "Other / Unknown": "#767676ff",
  "default": "#767676ff"
};

let fontTitoli = 'Georgia';
let fontContenuti = 'Courier New';

//bottone per tornare alla pagina iniziale
let backButtonX = 40;
let backButtonY = 40;
let backButtonText = "Torna alla mappa";
let backButtonW;
let backButtonH;

//x la spiegazione sulla linea del tempo
let decodificaLastKnownEruption = {
  'D1': '1964 or later',
  'D2': '1900-1963',
  'D3': '1800-1899',
  'D4': '1700-1799',
  'D5': '1500-1699',
  'D6': '1-1499',
  'D7': 'B.C. (Holocene)'
};
//valori non numerici --> li metto fuori dalla linea del tempo
let altreDecodificheEruption = {
  'U': 'Undated, but probable Holocene eruption',
  'Q': 'Quaternary eruption(s) with the only known Holocene activity being hydrothermal',
  '?': 'Uncertain Holocene eruption'
};
let ordineCronoligicoTimeline = [
  'D7', 'D6', 'D5', 'D4', 'D3', 'D2', 'D1'
  ];

function preload() {
  data = loadTable('assets/Dataset_Volcanoes_ES3.csv', 'csv', 'header');
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  allVulcani = data.getRows();
  let elevations = allVulcani
    .map(row => parseFloat(row.getString('Elevation (m)')))
    .filter(e => !isNaN(e));

  realMinAltitudine = min(elevations);
  realMaxAltitudine = max(elevations);

  let params = getURLParams();
  nameVulcani = params.name; //x creare l'url ?name= per ogni singolo vulcano 

  //ciclo if per decodificare i nomi dei vulcani (che avendo degli spazi facevano impazzire la visualizzazione)
  if (nameVulcani) {
    let decodedName = decodeURIComponent(nameVulcani.replace(/\+/g, ' '));
    
    dataVulcani = allVulcani.find(row => 
      row.getString('Volcano Name').trim() === decodedName.trim()
      //funzione trim(); --> Removes whitespace from the start and end
      // of a String without changing the middle.
    );
  }

  textFont(fontTitoli);
  textSize(16);
  backButtonW = textWidth(backButtonText);
  backButtonH = textAscent() + textDescent();
  //funzione textAscent(); --> Calculates the ascent of the current font at its current size.
  // The ascent represents the distance, in pixels, of the tallest character above the baseline.
  //uguale per le discendenti 
}

function draw() {
  background(colSfondo);
  cursor(ARROW);
  drawBackButton(); //funzione per il bottone che permette di tornare alla pagina iniziale

  if (dataVulcani) {
    drawVulcanoTriangolo();
    drawInfobox();
    drawTimeline();
  }
}

function drawVulcanoTriangolo() {
  let margin = 80;
  let asseX = margin * 2;
  let asseTopY = margin;
  let asseBottomY = height - margin;

  let triangoloBaseY = asseBottomY;
  let triangoloBaseWidth = 100;
  let triangoloBaseX2 = asseX + 40;
  let triangoloBaseY2 = triangoloBaseX2 + triangoloBaseWidth;
  let triangoloVerticeX = triangoloBaseX2 + triangoloBaseWidth / 2;

  let elev = parseFloat(dataVulcani.getString('Elevation (m)'));
  let triangoloVerticeY = map(elev, realMinAltitudine, realMaxAltitudine, asseBottomY, asseTopY); 
  //vertice cambia in base alla mappatura dell'altitudine sul livello del mare

  let typeCat = dataVulcani.getString('TypeCategory');
  let col = typeColors[typeCat] || typeColors['default']; //triangolo colorato come nella pagina della 
  //visualizzazione d'insieme in base alla categoria 
  fill(col);
  noStroke();
  triangle(triangoloBaseX2, triangoloBaseY, triangoloBaseY2, triangoloBaseY, triangoloVerticeX, triangoloVerticeY);

  stroke(colMarroneScuro);
  strokeWeight(2);
  line(asseX, asseTopY, asseX, asseBottomY);

  fill(colMarroneScuro);
  noStroke();
  textStyle(BOLD);
  textFont(fontContenuti);
  textSize(12);
  textAlign(RIGHT, CENTER);
  text(nf(realMaxAltitudine, 0, 0) + " m", asseX - 10, asseTopY); //nf(); --> Converts a Number into
  // a String with a given number of digits.
  text(nf(realMinAltitudine, 0, 0) + " m", asseX - 10, asseBottomY);

  let valoreElevTondo = 1000; //valori con numeri tondi da segnare sulla linea y dell'altitudine
  let range = realMaxAltitudine - realMinAltitudine;
  if (range > 8000) valoreElevTondo = 2000;
  if (range < 2000) valoreElevTondo = 500;
  let primoValore = ceil(realMinAltitudine / valoreElevTondo) * valoreElevTondo;
  //funzione ceil(); --> Calculates the closest integer valore that is greater than or equal to a number.
  // For example, calling ceil(9.03) and ceil(9.97) both return the valore 10.

  for (let elevValore = primoValore; elevValore < realMaxAltitudine; elevValore += valoreElevTondo) {
    if (elevValore !== realMinAltitudine && elevValore !== realMaxAltitudine) {
      //mappo l'altitudine lungo la linea dell'asse
      let valoreY = map(elevValore, realMinAltitudine, realMaxAltitudine, asseBottomY, asseTopY); 
      text(nf(elevValore, 0, 0) + " m", asseX - 10, valoreY);
    }
  }

  if (!isNaN(elev)) {
    fill(colRossoScuro);
    noStroke();
    textStyle(BOLD);
    textAlign(LEFT, CENTER);
    let distanzaDalVertice = 10;
    text(nf(elev, 0, 0) + " m", triangoloVerticeX + distanzaDalVertice, triangoloVerticeY);

  }
}

function drawInfobox() {
  push();
  let margin = 80;
  let boxX = margin * 2 + 200;
  let boxY = margin;
  let boxWidth = width - boxX - margin;
  let boxHeight = height - margin * 2;

  fill(colSfondo);
  stroke(colMarroneScuro);
  strokeWeight(2);
  rect(boxX, boxY, boxWidth, boxHeight, 10);

  let textX = boxX + 30;
  let currentY = boxY + 40;

  fill(colRossoScuro);
  noStroke();
  textFont(fontTitoli);
  textSize(32);
  textStyle(BOLD);
  textAlign(LEFT, TOP);
  text(dataVulcani.getString('Volcano Name'), textX, currentY, boxWidth - 60);
  currentY += 80;

  textFont(fontContenuti);
  textSize(16);

  currentY = drawInfoEValore("Paese:", dataVulcani.getString('Country'), textX, currentY);
  currentY = drawInfoEValore("Categoria:", dataVulcani.getString('TypeCategory'), textX, currentY);
  currentY = drawInfoEValore("Tipologia:", dataVulcani.getString('Type'), textX, currentY);
  currentY = drawInfoEValore("Stato:", dataVulcani.getString('Status'), textX, currentY);
  push();
  textStyle(BOLD);
  fill(colRossoScuro);
  currentY= text("Ultima eruzione conosciuta:", textX, currentY); //più in basso 
  // vicino alla linea del tempo
  pop();
  pop();
}

//scrivo una funzione per --> informazione (colonna del dataset) uguale al valore associato
function drawInfoEValore(info, valore, x, y) {
  let infoWidth = 160;
  textAlign(LEFT, TOP);
  textStyle(BOLD);
  fill(colMarroneScuro);
  text(info, x, y);

  textStyle(BOLDITALIC);
  text(valore, x + infoWidth, y, width - (x + infoWidth) - 100);
  let textH = textAscent() + textDescent();
  if (textWidth(valore) > (width - (x + infoWidth) - 100)) {
    textH *= 2;
  }
  return y + textH + 20;
}

function drawTimeline() {
  let margin = 80;
  let boxX = margin * 2 + 200;
  let boxWidth = width - boxX - margin;
  let bordoEsternoTimeline = 80

  let timelineX_Inizio = boxX + bordoEsternoTimeline;
  let timelineX_Fine = boxX + boxWidth - bordoEsternoTimeline;
  let timelineY = height - margin - 100;

  let dimensionePallino = 10;
  let dimensionePallino_Selezionato = 25; //voglio un pallino rosso più grande 
  //per segnare sulla timeline l'anno corrispondente per lo specifico vulcano

  stroke(colMarroneScuro);
  strokeWeight(2);
  line(timelineX_Inizio, timelineY, timelineX_Fine, timelineY);

  let ultimeEruzioni = dataVulcani.getString('Last Known Eruption');

  let numDots = ordineCronoligicoTimeline.length;
  for (let i = 0; i < numDots; i++) {
    let x = map(i, 0, numDots - 1, timelineX_Inizio, timelineX_Fine);
    let ultimaEruzione = ordineCronoligicoTimeline[i];

    if (ultimaEruzione === ultimeEruzioni) {
      fill(colRossoScuro); //pallino rosso per il valore corrispondente
      noStroke();
      ellipse(x, timelineY, dimensionePallino_Selezionato, dimensionePallino_Selezionato);
    } else {
      fill(colMarroneScuro); //pallini marroni per tutti gli altri valori della timeline
      noStroke();
      ellipse(x, timelineY, dimensionePallino, dimensionePallino);
    }

    fill(colMarroneScuro);
    noStroke();
    textFont(fontContenuti);
    textSize(10);
    textAlign(CENTER, TOP);
    text(decodificaLastKnownEruption[ultimaEruzione], x, timelineY + 15);
  }
  //testo in basso se nel dataset sono presenti i valori U Q o ? perchè
  //la spiegazione è testuale e non ha senso metterla nella linea del tempo 
  if (altreDecodificheEruption[ultimeEruzioni]) {
    fill(colMarroneScuro);
    noStroke();
    textFont(fontContenuti);
    textStyle(BOLD);
    textSize(12);
    textAlign(LEFT, TOP);
    text(altreDecodificheEruption[ultimeEruzioni], timelineX_Inizio, timelineY + 50, timelineX_Fine - timelineX_Inizio);
  }
}

function isMouseOverBackButton() {
  return mouseX > backButtonX &&
    mouseX < backButtonX + backButtonW &&
    mouseY > backButtonY &&
    mouseY < backButtonY + backButtonH;
}

function drawBackButton() {
  let isHover = isMouseOverBackButton();

  if (isHover) {
    fill(colRossoScuro); //cambia colore con l'hover del mouse 
    cursor(HAND);
  } else {
    fill(colMarroneScuro); 
  }
  noStroke();
  textFont(fontTitoli);
  textSize(16);
  textStyle(BOLDITALIC);
  textAlign(LEFT, TOP);
  text(backButtonText, backButtonX, backButtonY);
}

function mousePressed() {
  if (isMouseOverBackButton()) {
    window.location.href = "index.html";
  }
}