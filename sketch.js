let data;
let fotoMappa;

let outerMargin = 40;

let colRossoScuro = "#8a1c0eff";
let colSfondo = "#dac6a1";
let colMarroneScuro = "#3F261D";
let colGiallo = "#FFD700";

let typeColors = { //col per ogni tipologia di vulcano
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

let allTypeCategories = []; //array type

let fontTitoli = 'Georgia';
let fontContenuti = 'Courier New';

//scale altitudine mappa
let minAltitudine = 0;
let maxAltitudine = 7000;

//scale valori reali altitudine legenda
let realMinAltitudine, realMaxAltitudine;

let hovered = null;

function preload() {
    data = loadTable("assets/Dataset_Volcanoes_ES3.csv", "csv", "header");
    fotoMappa = loadImage("assets/mappa_mondo.png")
}

function setup() {
    createCanvas(windowWidth, windowHeight);

    // console.log(data.getRowCount());
    // console.log("Colonne:", data.columns);

    let uniqueTypes = new Set();
    let allAltitudine = [];

    for(let i = 0; i < data.getRowCount(); i++) {
        //type
        let typeCat = data.getString(i, "TypeCategory");
        if (typeCat && typeCat.trim() !== "") {
            uniqueTypes.add(typeCat);
        }

        //altitudine "elevation"
        let altStr = data.getString(i, "Elevation (m)");
        if (altStr && altStr.trim() !== "") {
            let elev = float(altStr);
            if (!isNaN(elev)) {
                allAltitudine.push(elev);
            }
        }
    }
    allTypeCategories = Array.from(uniqueTypes).sort();

    realMinAltitudine = min(allAltitudine);
    realMaxAltitudine = max(allAltitudine);

    textFont(fontContenuti);
}

function draw() {
    background(colSfondo);
    hovered = null; 
    
    let minHoverDist = Infinity;

    //mappa
    let mapXStart = 380;
    let mapYStart = outerMargin + 120;
    let mapWidth = width - mapXStart - outerMargin;
    let mapHeight = height - mapYStart - outerMargin;

    //cartina geografica
    image(fotoMappa, mapXStart + 30, mapYStart - 41, mapWidth, mapHeight);

    for (let rowNumber = 0; rowNumber < data.getRowCount(); rowNumber++) {
        let latStr = data.getString(rowNumber, "Latitude");
        let lonStr = data.getString(rowNumber, "Longitude");

        if (!latStr || !lonStr || latStr.trim() === "" || lonStr.trim() === "") {
            continue;
        }
        let lat = float(latStr);
        let lon = float(lonStr);
        if (isNaN(lat) || isNaN(lon)) {
            continue;
        }

        let name = data.getString(rowNumber, "Volcano Name");
        let country = data.getString(rowNumber, "Country");
        let typeCat = data.getString(rowNumber, "TypeCategory");
        let status = data.getString(rowNumber, "Status");
        let elev = float(data.getString(rowNumber, "Elevation (m)"));

        let x = map(lon, -180, 180, mapXStart, mapXStart + mapWidth);
        let y = map(lat, 90, -90, mapYStart, mapYStart + mapHeight);

        let size;
        if (isNaN(elev) || elev < 0) {
            size = 6;
        }
        else {
            size = map(pow(elev, 0.5), pow(minAltitudine, 0.5), pow(maxAltitudine, 0.5), 6, 30);
        }

        let col = color(typeColors[typeCat] || typeColors["default"]);

        let d = dist(mouseX, mouseY, x, y);
        if (d < size / 2 + 5 && d < minHoverDist) {
            minHoverDist = d;
            hovered = {
                x: x, y: y, name: name, country: country, elev: elev,
                size: size, col: col, status: status
            };
        } else {
            drawVolcanoGlyph(x, y, size, col, status, false);
        }
    }

    drawTitolo();
    drawLegenda();

    if (hovered) {
        cursor("pointer");
        drawVolcanoGlyph(hovered.x, hovered.y, hovered.size, hovered.col, hovered.status, true);
        let tooltipcontenutoTooltip = [
            hovered.name,
            `${hovered.country}`,
            `Altitudine: ${hovered.elev} m`,
            `Stato: ${hovered.status}`
        ];
        drawTooltip(hovered.x, hovered.y, tooltipcontenutoTooltip);
    } else {
        cursor("default");
    }
}

function drawVolcanoGlyph(x, y, size, col, status, isHovered) {
    push();
    fill(col);
    noStroke();

    if (isHovered) {
        strokeWeight(3);
        stroke(colGiallo);
        fill(red(col) + 20, green(col) + 20, blue(col) + 20, 200);
    }

    let halfSize = size / 2;
    triangle(
        x, y - halfSize * 0.8,
        x - halfSize, y + halfSize * 0.8,
        x + halfSize, y + halfSize * 0.8
    );
    pop();
}

function drawTooltip(px, py, contenutoTooltip) {
    push();
    textFont(fontContenuti);
    textStyle(BOLD);
    textSize(12);
    textAlign(LEFT, TOP);

    let padding = 10;
    let lineHeight = 16;
    let w = 0;
    for (let line of contenutoTooltip) {
        w = max(w, textWidth(line));
    }
    w += padding * 2;
    let h = contenutoTooltip.length * lineHeight + padding * 2 - (lineHeight - textSize());

    let x = px + 15;
    let y = py - h / 2;

    if (x + w > width - outerMargin) x = px - w - 15;
    if (y < outerMargin) y = outerMargin;
    if (y + h > height - outerMargin) y = height - outerMargin - h;

    let c = color(colSfondo);
    c.setAlpha(230); //trasparenza del tooltipp
    fill(c);

    stroke(colMarroneScuro);
    strokeWeight(1.5);
    rect(x, y, w, h, 4);

    fill(colMarroneScuro);
    noStroke();
    for (let i = 0; i < contenutoTooltip.length; i++) {
        text(contenutoTooltip[i], x + padding, y + padding + i * lineHeight);
    }
    pop();
}


function drawTitolo() {
    push();
    let titoloBoxX = outerMargin;
    let titoloBoxY = outerMargin;
    let titoloBoxW = width - outerMargin * 2;
    let titoloBoxH = 100;

    let c = color(colSfondo);
    fill(c);

    stroke(colRossoScuro);
    strokeWeight(3);
    rect(titoloBoxX, titoloBoxY, titoloBoxW, titoloBoxH, 8);

    textAlign(CENTER, CENTER);
    textFont(fontTitoli);
    textSize(36);
    textStyle(BOLD);
    fill(colMarroneScuro);
    noStroke();
    text("Volcanoes of the World", width / 2, titoloBoxY + titoloBoxH / 2 - 15);

    textFont(fontContenuti);
    textSize(16);
    fill(colRossoScuro);
    text("Visualizzazione d'insieme", width / 2, titoloBoxY + titoloBoxH / 2 + 20);
    pop();
}


function drawLegenda() {
    push();

    let legendaX = outerMargin;
    let legendaY = outerMargin + 130;
    let itemHeight = 22;
    let sectionSpacing = 40;
    let currentY = legendaY;

    let legendaBoxWidth = 320;
    let halfTypeCount = ceil(allTypeCategories.length / 2);
    let legendaBoxHeight = (sectionSpacing * 2) + 105 + (halfTypeCount * itemHeight);

    fill(colSfondo);
    stroke(colRossoScuro);
    strokeWeight(3);
    rect(legendaX, currentY - 15, legendaBoxWidth, legendaBoxHeight, 8);
    currentY += 10;

    //altitudine
    fill(colMarroneScuro);
    noStroke();
    textFont(fontTitoli);
    textSize(16);
    textStyle(BOLD);
    textAlign(LEFT);
    text("Altitudine sul livello del mare (m)", legendaX + 15, currentY);
    currentY += 25;
    textFont(fontContenuti);

    let sizeSamples = [realMinAltitudine, 1000, 3000, realMaxAltitudine];
    let currentX = legendaX + 30;
    let baselineY = currentY + 45; //linea di base su cui poggiano i triangoli
    let labelY = baselineY + 15; //posizione label 

    for (let elev of sizeSamples) {
        let size;

        if (isNaN(elev) || elev < 0) {
            size = 5;
        } else {
            size = map(pow(elev, 0.5), pow(minAltitudine, 0.5), pow(maxAltitudine, 0.5), 5, 40);
        }
        //glifo allineato alla linea di base
        let glyphY = baselineY - (size / 2 * 0.8);

        drawVolcanoGlyph(currentX, glyphY, size, color(colRossoScuro), "other", false);

        //label
        fill(colMarroneScuro);
        noStroke();
        textSize(10);
        textStyle(BOLD);
        textAlign(CENTER);
        let label = nf(elev, 0, 0);
        text(label, currentX, labelY);

        //ogni volta che si disegna un glifo ci si sposta di 45
        currentX += size + 45;
    }
    currentY = labelY + sectionSpacing; //ogni volta che si aggiunge una sezione della legenda si ricalcola 
    //la distanza 

    fill(colMarroneScuro);
    noStroke();
    textFont(fontTitoli);
    textSize(16);
    textStyle(BOLD);
    textAlign(LEFT);
    text("Categoria di vulcano", legendaX + 15, currentY);
    currentY += 25;
    textFont(fontContenuti);

    let numTypes = allTypeCategories.length;
    let half = ceil(numTypes / 2);
    let col1X = legendaX + 15;
    let col2X = legendaX + (legendaBoxWidth / 2);
    let startColorY = currentY;

    for (let i = 0; i < numTypes; i++) {
        let typeCat = allTypeCategories[i];
        let x, y;

        if (i < half) {
            x = col1X;
            y = startColorY + i * itemHeight;
        } else {
            x = col2X;
            y = startColorY + (i - half) * itemHeight;
        }

        let col = color(typeColors[typeCat] || typeColors["default"]);
        fill(col); noStroke();
        rect(x, y, 16, 16);

        fill(colMarroneScuro);
        textSize(11);
        textStyle(BOLD);
        textAlign(LEFT, TOP);
        text(typeCat, x + 22, y + 2);
    }

    pop();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function mousePressed() {
    //se il mouse è sopra a un vulcano la variabile 'hovered' non è più null
    if (hovered) {
        let volcanoName = hovered.name;
        
        //funzione per evitare errori dovuti agli spazi (i nomi dei vulcani)
        let encodedName = encodeURIComponent(volcanoName);
        let newURL = 'detail.html?name=' + encodedName;
        
        window.location.href = newURL;
    }
}

