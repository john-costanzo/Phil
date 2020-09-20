// Phil
// ------------------------------------------------------------------------
// Copyright 2017 Keiran King

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// (https://www.apache.org/licenses/LICENSE-2.0)

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ------------------------------------------------------------------------

const keyboard = {
    "d1":     49, "d2": 50, "d3": 51, "d4": 52, "d5": 53, "d6": 54, "d7": 55, "d8": 56, "d9": 57,
    "a":      65, "b": 66, "c": 67, "d": 68, "e": 69, "f": 70, "g": 71, "h": 72,
    "i":      73, "j": 74, "k": 75, "l": 76, "m": 77, "n": 78, "o": 79, "p": 80,
    "q":      81, "r": 82, "s": 83, "t": 84, "u": 85, "v": 86, "w": 87, "x": 88, "y": 89,
    "z":      90,
    "black":  190, ".": 190,
    "showSymmetricBlack":  188, ",": 188,
    "help": 191, "?": 191,
    "delete": 8,
    "enter":  13,
    "space":  32,
    "left":   37,
    "up":     38,
    "right":  39,
    "down":   40
};
const BLACK = ".";
const DASH = "-";
const BLANK = " ";
const ACROSS = "across";
const DOWN = "down";
const DEFAULT_SIZE = 15;
const DEFAULT_TITLE = "Untitled";
const DEFAULT_AUTHOR = "Anonymous";
const DEFAULT_CLUE = "(blank clue)";
const DEFAULT_NOTIFICATION_LIFETIME = 10; // in seconds

let history = [];
let isSymmetrical = true;
let useRegexPatterns = false;
let showOnlyRecommendations = false;
let grid = undefined;
let squares = undefined;
let isMutated = false;
let forced = null;
// createNewPuzzle();
let solveWorker = null;
let solveWorkerState = null;
let solveTimeout = null;
let solveWordlist = null;
let solvePending = [];
let updatesSinceLastSave = 0;
let clueProgressCounterId = "clue-progress";
let bsProgressCounterId = "bs-progress";
let bsMessage = " Black Squares";

//____________________
// C L A S S E S
class Crossword {
    constructor(rows = DEFAULT_SIZE, cols = DEFAULT_SIZE) {
	this.clues = {};
	this.title = DEFAULT_TITLE;
	this.author = DEFAULT_AUTHOR;
	this.rows = rows;
	this.cols = cols;
	this.fill = [];
	//
	for (let i = 0; i < this.rows; i++) {
	    this.fill.push("");
	    for (let j = 0; j < this.cols; j++) {
		this.fill[i] += BLANK;
	    }
	}
    }
}

class Grid {
    constructor(rows, cols) {
	document.getElementById("main").innerHTML = "";
	let table = document.createElement("TABLE");
	table.setAttribute("id", "grid");
	table.setAttribute("tabindex", "1");
	document.getElementById("main").appendChild(table);

	for (let i = 0; i < rows; i++) {
            let row = document.createElement("TR");
            row.setAttribute("data-row", i);
            document.getElementById("grid").appendChild(row);

	    for (let j = 0; j < cols; j++) {
		let col = document.createElement("TD");
		col.setAttribute("data-col", j);

		let label = document.createElement("DIV");
		label.setAttribute("class", "label");
		let labelContent = document.createTextNode("");

		let fill = document.createElement("DIV");
		fill.setAttribute("class", "fill");
		let fillContent = document.createTextNode(xw.fill[i][j]);

		label.appendChild(labelContent);
		fill.appendChild(fillContent);
		col.appendChild(label);
		col.appendChild(fill);
		row.appendChild(col);
            }
	}
	grid = document.getElementById("grid");
	squares = grid.querySelectorAll('td');
	for (const square of squares) {
	    square.addEventListener('click', mouseHandler);
	}
	grid.addEventListener('keydown', keyboardHandler);
    }

    update() {
	for (let i = 0; i < xw.rows; i++) {
	    for (let j = 0; j < xw.cols; j++) {
		const activeCell = grid.querySelector('[data-row="' + i + '"]').querySelector('[data-col="' + j + '"]');
		let fill = xw.fill[i][j];
		if (fill == BLANK && forced != null) {
		    fill = forced[i][j];
		    activeCell.classList.add("pencil");
		} else {
		    activeCell.classList.remove("pencil");
		}
		activeCell.lastChild.innerHTML = fill;
		if (fill == BLACK) {
		    activeCell.classList.add("black");
		} else {
		    activeCell.classList.remove("black");
		}
	    }
	}
    }
}

class Button {
    constructor(id) {
	this.id = id;
	this.dom = document.getElementById(id);
	this.tooltip = this.dom.getAttribute("data-tooltip");
	// this.type = type; // "normal", "toggle", "menu", "submenu"
	this.state = this.dom.className; // "normal", "on", "open", "disabled"
    }

    setState(state) {
	this.state = state;
	this.dom.className = (this.state == "normal") ? "" : this.state;
    }

    addEvent(e, func) {
	this.dom.addEventListener(e, func);
	if (this.state == "disabled") {
	    this.setState("normal");
	}
    }

    press() {
	// switch (this.type) {
	//   case "toggle":
	//   case "submenu":
	//     this.setState((this.state == "on") ? "normal" : "on");
	//     break;
	//   case "menu":
	//     this.setState((this.state == "open") ? "normal" : "open");
	//     break;
	//   default:
	//     break;
    }
}

class Menu { // in dev
    constructor(id, buttons) {
	this.id = id;
	this.buttons = buttons;

	let div = document.createElement("DIV");
	div.setAttribute("id", this.id);
	for (var button in buttons) {
	    div.appendChild(button);
	}
	document.getElementById("toolbar").appendChild(div);
    }
}

class Toolbar {
    constructor(id) {
	this.id = id;
	this.buttons = { // rewrite this programmatically
	    "newPuzzle": new Button("new-grid"),
	    "openPuzzle": new Button("open-JSON"),
	    "exportJSON": new Button("export-JSON"),
	    "exportPUZ": new Button("export-PUZ"),
	    "exportPDF": new Button("print-puzzle"),
	    "exportNYT": new Button("print-NYT-submission"),
	    "export": new Button("export"),
	    "quickLayout": new Button("quick-layout"),
	    "freezeLayout": new Button("toggle-freeze-layout"),
	    "clearFill": new Button("clear-fill"),
	    "toggleSymmetry": new Button("toggle-symmetry"),
	    "toggleRecommendation": new Button("toggle-recommend"),
	    "undo": new Button("undo"),
	    "openWordlist": new Button("open-wordlist"),
	    "autoFill": new Button("auto-fill")
	}
    }
}

class Notification {
    constructor(message, lifetime = undefined, kind = undefined ) {
	this.message = message;
	this.id = String(randomNumber(1,10000));
	this.kind = (kind == undefined) ? "notification" : kind;
	this.isDisplayed = false;
	this.lifetime = lifetime;
	this.post();
    }

    post() {
	if( !this.isDisplayed ) {
	    let div = document.createElement("DIV");
	    div.setAttribute("id", this.id);
	    div.setAttribute("class", this.kind);
	    div.innerHTML = this.message;
	    div.addEventListener('click', this.dismiss);
	    document.getElementById("help-panel").appendChild(div);
	    this.isDisplayed = true;
	    if( this.lifetime ) {
		this.dismiss( this.lifetime );
	    }
	} else {
	    console.log( "not reposting since this.isDisplayed=" + this.isDisplayed );
	}
    }

    update(message) {
	document.getElementById(this.id).innerHTML = message;
    }

    dismiss(seconds = 0) {
	let div = document.getElementById(this.id);

	// We need to pass the instance into the function so it can have access to members
	// See https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/setTimeout
	let instance = this;
	// seconds = (seconds === true) ? 10 : seconds;
	setTimeout(function() {
	    div.remove();
	    instance.isDisplayed = false;
	}, seconds * 1000);
    }
}

class Interface {
    constructor(rows, cols) {
	this.grid = new Grid(rows, cols);
	this.sidebar;
	this.toolbar = new Toolbar("toolbar");

	this.isSymmetrical = true;
	this.showOnlyRecommendations = false;
	this.is = true;
	this.row = 0;
	this.col = 0;
	this.acrossWord = '';
	this.downWord = '';
	this.acrossStartIndex = 0;
	this.acrossEndIndex = cols;
	this.downStartIndex = 0;
	this.downEndIndex = rows;
	this.direction = ACROSS;

	console.log("Grid UI created.")
    }

    toggleDirection() {
	this.direction = (this.direction == ACROSS) ? DOWN : ACROSS;
    }

    update() {
	updateInfoUI();
	updateLabelsAndClues();
	updateActiveWords();
	updateGridHighlights();
	updateSidebarHighlights();
	updateCluesUI();
    }
}

let shortcutsNotification = new Notification(document.getElementById("shortcuts").innerHTML, 120);
let suggestionStylingNotification = new Notification(document.getElementById("suggestion-styling").innerHTML, 120, "suggestion-styling");

let xw = new Crossword( 21, 21 ); // model
let current = new Interface(xw.rows, xw.cols); // view-controller
let undoStack = [];
let redoStack = [];
current.update();

// Ignore undo in many of the major UI elements

// Identifiers of DOM elements that ought to be immune from processing undo().
var undoImmuneIds = [ 'regex1', 'regex2',  'regex3',  'regex4',  'regex5',
		      'regex6', 'regex7',  'regex8',  'regex9',  'autoSaveCount' ];
undoImmuneIds.forEach(
    function(id) {
	document.getElementById(id).addEventListener('input', (ev) => {
	    const field = document.getElementById(id);
	    const currentValue = field.value;
	    document.execCommand('undo');   // undo this change
	    field.value = currentValue;  // ... but immediately reset the value
	});
    }
);
// Ok. This is a hack. But it seems to work.

//____________________
// F U N C T I O N S

function createNewPuzzle(rows, cols) {
    xw["clues"] = {};
    xw["title"] = DEFAULT_TITLE;
    xw["author"] = DEFAULT_AUTHOR;
    xw["rows"] = rows || DEFAULT_SIZE;
    xw["cols"] = cols || xw.rows;
    xw["fill"] = [];
    for (let i = 0; i < xw.rows; i++) {
	xw.fill.push("");
	for (let j = 0; j < xw.cols; j++) {
	    xw.fill[i] += BLANK;
	}
    }
    updateInfoUI();
    document.getElementById("main").innerHTML = "";
    createGrid(xw.rows, xw.cols);

    isSymmetrical = true;
    showOnlyRecommendations = false;
    current = {
	"row":        0,
	"col":        0,
	"acrossWord": '',
	"downWord":   '',
	"acrossStartIndex":0,
	"acrossEndIndex":  cols,
	"downStartIndex":  0,
	"downEndIndex":    rows,
	"direction":  ACROSS
    };

    grid = document.getElementById("grid");
    squares = grid.querySelectorAll('td');

    updateActiveWords();
    updateGridHighlights();
    updateSidebarHighlights();
    updateCluesUI();

    for (const square of squares) {
	square.addEventListener('click', mouseHandler);
    }
    grid.addEventListener('keydown', keyboardHandler);
    console.log("New puzzle created.")
}

function mouseHandler(e) {
    const previousCell = grid.querySelector('[data-row="' + current.row + '"]').querySelector('[data-col="' + current.col + '"]');
    previousCell.classList.remove("active");
    const activeCell = e.currentTarget;
    if (activeCell == previousCell) {
	current.direction = (current.direction == ACROSS) ? DOWN : ACROSS;
    }
    current.row = Number(activeCell.parentNode.dataset.row);
    current.col = Number(activeCell.dataset.col);
    console.log("mouseHandler: [" + current.row + "," + current.col + "]");
    activeCell.classList.add("active");

    isMutated = false;
    updateUI();
}

// Determine whether the single square at (I, J) is blocked to the North, East, South or West.
function cellBlocked1( i, j ) {
    let blocked = new Object();
    blocked.north = blocked.east = blocked.south = blocked.south = false;

    if( i-1 < 0 ) {
	blocked.north = true;
    } else {
	blocked.north = ( xw.fill[i-1][j] == BLACK );
    }
    if( i+1 >= xw.rows ) {
	blocked.south = true;
    } else {
	blocked.south = ( xw.fill[i+1][j] == BLACK );
    }

    if( j-1 < 0 ) {
	blocked.west = true;
    } else {
	blocked.west = ( xw.fill[i][j-1] == BLACK );
    }
    if( j+1 >= xw.cols ) {
	blocked.east = true;
    } else {
	blocked.east = ( xw.fill[i][j+1] == BLACK );
    }

    // console.log( "cellBlocked1: square[" + i + ", " + j + "] = " + blocked.north + blocked.south + blocked.east + blocked.west );

    return( blocked );
}

// Determine whether the the square is immediately blocked by OR
// if it is part of a run of 2 squares that include (I, J) that is blocked to the North, East, South or West.
function cellBlocked2( i, j ) {
    if( xw.fill[i][j] == BLACK ) {
	console.log( i + ", " + j + " is BLACK; returning null" );
	return( null );
    }

    let blocked1 = cellBlocked1( i, j ); // are we immediately blocked on any side?
    if( (blocked1.north && blocked1.south) || (blocked1.east && blocked1.west ) ) {
	return( true );
    }

    let blocked2 = new Object();
    blocked2.north = blocked2.east = blocked2.south = blocked2.south = false;

    if( i-2 < 0 ) {
	blocked2.north = true;
    } else {
	blocked2.north = ( xw.fill[i-2][j] == BLACK );
    }
    if( i+2 >= xw.rows ) {
	blocked2.south = true;
    } else {
	blocked2.south = ( xw.fill[i+2][j] == BLACK );
    }

    if( j-2 < 0 ) {
	blocked2.west = true;
    } else {
	blocked2.west = ( xw.fill[i][j-2] == BLACK );
    }
    if( j+2 >= xw.cols ) {
	blocked2.east = true;
    } else {
	blocked2.east = ( xw.fill[i][j+2] == BLACK );
    }

    // console.log( "cellBlocked2: square[" + i + ", " + j + "] = " + blocked2.north + blocked2.south + blocked2.east + blocked2.west );

    if(
	((blocked1.north && blocked2.south) ||
	 (blocked2.north && blocked1.south) ||
	 (blocked1.east && blocked2.west ) ||
	 (blocked2.east && blocked1.west ) )
    ) {
	return( blocked2 );
    } else {
	return( null );
    }
}

// Visit the entire grid, checking for legality.
// If any squares are illegal, mark them with the attribute "illegal-square".
//
// An illegal square would be one where it is blocked by either its
// (East and West) or (North and South) neighbors.
//
// Another way a square is illegal is if it is part of a two-square run (that is blocked on either end).
//
// In this context, "blocked" means either by a black square or off the grid.
function checkGridLegality() {
    let illegalSquare = "illegal-square";
    for (let i = 0; i < xw.rows; i++) {
	for (let j = 0; j < xw.cols; j++) {
	    let cell = grid.querySelector('[data-row="' + i + '"]').querySelector('[data-col="' + j + '"]');
	    if( xw.fill[i][j] == BLACK ) {
		cell.classList.remove(illegalSquare);
	    } else {
		if ( cellBlocked2( i, j ) ) {
		    cell.classList.add(illegalSquare);
		} else {
		    cell.classList.remove(illegalSquare);
		}
	    }
	}
    }
}

function adjustProgress( progressBarName, n, msg ) {
    // Adjust PROGRESSBARNAME to N%, updating with a prefix of MSG
    var e = document.getElementById( progressBarName );
    e.value = n;

    var elabel = document.getElementById( progressBarName + "-label" );
    elabel.innerHTML = msg;
}

function adjustClueProgress() {
    let completedClues = 0;
    let totalClues = Object.keys(xw.clues).length;

    for( const [key, value] of Object.entries( xw.clues ) ) {
	if( value != DEFAULT_CLUE ) completedClues++;
    }

    let pct = completedClues / totalClues;
    let msg = completedClues + " of " + totalClues + " completed clues";

    adjustProgress( clueProgressCounterId, pct*100, msg );
}

function updateBlackSquareProgress() {
    let stats = countBlackSquares();
    let pct = Math.round( stats[ 1 ] * 100 );
    let msg = stats[ 0 ] + bsMessage + " (" + pct + "%)";

    var elabel = document.getElementById( bsProgressCounterId + "-label" );
    elabel.innerHTML = msg;
}

function countBlackSquares() {
    // Return an array with the number of black squares in the grid and the percentage of total squares that are black
    let blackSquares = 0;
    for (let i = 0; i < xw.rows; i++) {
	for (let j = 0; j < xw.cols; j++) {
	    if (xw.fill[i][j] == BLACK) blackSquares++;
	}
    }
    return( [ blackSquares, blackSquares / (xw.rows*xw.cols) ] );
}

function keyboardHandler(e) {
    isMutated = false;
    let activeCell = grid.querySelector('[data-row="' + current.row + '"]').querySelector('[data-col="' + current.col + '"]');
    const symRow = xw.rows - 1 - current.row;
    const symCol = xw.cols - 1 - current.col;
    if ( e.which == keyboard.help ) {
	toggleUsageAssistance();
	return;
    }

    if ( (e.ctrlKey || e.metaKey) && e.which === keyboard.z ) {
	undo();
	return;
    }

    if ((e.which >= keyboard.a && e.which <= keyboard.z) || (e.which >= keyboard.d1 && e.which <= keyboard.d9) || e.which == keyboard.space) {
	let key = String.fromCharCode(e.which);
	saveStateForUndo( "typing a  " + key );
	let oldContent = xw.fill[current.row][current.col];
	xw.fill[current.row] = xw.fill[current.row].slice(0, current.col) + key + xw.fill[current.row].slice(current.col + 1);
	if (oldContent == BLACK) {
	    if (isSymmetrical) {
		xw.fill[symRow] = xw.fill[symRow].slice(0, symCol) + BLANK + xw.fill[symRow].slice(symCol + 1);
	    }
	}
	// move the cursor
	e = new Event('keydown');
	if (current.direction == ACROSS) {
	    e.which = keyboard.right;
	} else {
	    e.which = keyboard.down;
	}
	isMutated = true;
    }
    if (e.which == keyboard.showSymmetricBlack) {
	//alert( "currently at [" + current.row + ", " + current.col + "]  sym at [" + symRow + ", " + symCol + "]" );
	const symCell = grid.querySelector('[data-row="' + symRow + '"]').querySelector('[data-col="' + symCol + '"]');

	const maxTime = 2500;
	const stepTime = 500;
	const highlightSym = "highlight-symmetric";
	const lowlightSym = "lowlight-symmetric";

	// Make the symmetric cell "blink"
	for( var i = 0; i < maxTime; i+=stepTime ) {
	    setTimeout(function() { symCell.classList.remove(lowlightSym); symCell.classList.add(highlightSym); }, i );
	    setTimeout(function() { symCell.classList.remove(highlightSym); symCell.classList.add(lowlightSym); }, i+(stepTime/2) );
	}

	// Make the symmetric cell active
	activeCell.classList.remove("active");
	current.row = symRow;
	current.col = symCol;
	symCell.classList.add("active");

	// Then clear the symmetric cell
	setTimeout(function() { symCell.classList.remove(highlightSym); symCell.classList.remove(lowlightSym); }, maxTime );
	isMutated = false;
    }

    if (e.which == keyboard.black) {
	let freezeButton = document.getElementById("toggle-freeze-layout");
	let freezeButtonState = freezeButton.getAttribute("data-state");
	if( freezeButtonState == "off" ) {
	    saveStateForUndo( "toggling black/nonblack" );
	    if (xw.fill[current.row][current.col] == BLACK) { // if already black...
		e = new Event('keydown');
		e.which = keyboard.delete; // make it a white square
	    } else {
		xw.fill[current.row] = xw.fill[current.row].slice(0, current.col) + BLACK + xw.fill[current.row].slice(current.col + 1);
		if (isSymmetrical) {
		    xw.fill[symRow] = xw.fill[symRow].slice(0, symCol) + BLACK + xw.fill[symRow].slice(symCol + 1);
		}
	    }
	    isMutated = true;
	    updateBlackSquareProgress();
	}
    }

    if (e.which == keyboard.enter) {
	current.direction = (current.direction == ACROSS) ? DOWN : ACROSS;
    }
    if (e.which == keyboard.delete) {
	e.preventDefault();
	let oldContent = xw.fill[current.row][current.col];
	saveStateForUndo( "deleting a  " + oldContent );
	xw.fill[current.row] = xw.fill[current.row].slice(0, current.col) + BLANK + xw.fill[current.row].slice(current.col + 1);
	if (oldContent == BLACK) {
            if (isSymmetrical) {
		xw.fill[symRow] = xw.fill[symRow].slice(0, symCol) + BLANK + xw.fill[symRow].slice(symCol + 1);
            }
	    updateBlackSquareProgress();
	} else { // move the cursor
            e = new Event('keydown');
            if (current.direction == ACROSS) {
		e.which = keyboard.left;
            } else {
		e.which = keyboard.up;
            }
	}
	isMutated = true;
    }
    if (e.which >= keyboard.left && e.which <= keyboard.down) {
	e.preventDefault();
	const previousCell = grid.querySelector('[data-row="' + current.row + '"]').querySelector('[data-col="' + current.col + '"]');
	previousCell.classList.remove("active");
	let content = xw.fill[current.row][current.col];
	switch (e.which) {
        case keyboard.left:
            if (current.direction == ACROSS || content == BLACK) {
		current.col -= (current.col == 0) ? 0 : 1;
            }
            current.direction = ACROSS;
            break;
        case keyboard.up:
            if (current.direction == DOWN || content == BLACK) {
		current.row -= (current.row == 0) ? 0 : 1;
            }
            current.direction = DOWN;
            break;
        case keyboard.right:
            if (current.direction == ACROSS || content == BLACK) {
		current.col += (current.col == xw.cols - 1) ? 0 : 1;
            }
            current.direction = ACROSS;
            break;
        case keyboard.down:
            if (current.direction == DOWN || content == BLACK) {
		current.row += (current.row == xw.rows - 1) ? 0 : 1;
            }
            current.direction = DOWN;
            break;
	}
	console.log("keyboardHandler: [" + current.row + "," + current.col + "]");
	activeCell = grid.querySelector('[data-row="' + current.row + '"]').querySelector('[data-col="' + current.col + '"]');
	activeCell.classList.add("active");
    }
    updateUI();
}

function updateUI() {
    if (isMutated) {
	// autoFill(true);  // quick fill
	checkGridLegality();

	let ascVal = document.getElementById('autoSaveCount').value;
	let asc = Number( ascVal );
	if( isNaN( asc ) ) {
	    alert("autoSaveCount should be a number... not \"" + ascVal + "\"" );
	} else {
	    updatesSinceLastSave++;
	    if( asc > 0 && updatesSinceLastSave >= asc ) {
		console.log("updateUI: processed " + updatesSinceLastSave + " updates... autoSaving!");
		writeFile('xw');
		updatesSinceLastSave=0;
	    }
	}
    }
    updateGridUI();
    updateLabelsAndClues();
    updateActiveWords();
    updateGridHighlights();
    updateSidebarHighlights();
    updateMatchesUI();
    updateCluesUI();
    updateInfoUI();
}

function updateGridUI() {
    for (let i = 0; i < xw.rows; i++) {
	for (let j = 0; j < xw.cols; j++) {
	    const activeCell = grid.querySelector('[data-row="' + i + '"]').querySelector('[data-col="' + j + '"]');
	    let fill = xw.fill[i][j];
	    if (fill == BLANK && forced != null) {
		fill = forced[i][j];
		activeCell.classList.add("pencil");
	    } else {
		activeCell.classList.remove("pencil");
	    }
	    activeCell.lastChild.innerHTML = fill;
	    if (fill == BLACK) {
		activeCell.classList.add("black");
	    } else {
		activeCell.classList.remove("black");
	    }
	}
    }
}

function updateCluesUI() {
    let acrossClueNumber = document.getElementById("across-clue-number");
    let downClueNumber = document.getElementById("down-clue-number");
    let acrossClueText = document.getElementById("across-clue-text");
    let downClueText = document.getElementById("down-clue-text");
    // const currentCell = grid.querySelector('[data-row="' + current.row + '"]').querySelector('[data-col="' + current.col + '"]');

    // If the current cell is black, empty interface and get out
    if (xw.fill[current.row][current.col] == BLACK) {
	acrossClueNumber.innerHTML = "";
	downClueNumber.innerHTML = "";
	acrossClueText.innerHTML = "";
	downClueText.innerHTML = "";
	return;
    }
    // Otherwise, assign values
    const acrossCell = grid.querySelector('[data-row="' + current.row + '"]').querySelector('[data-col="' + current.acrossStartIndex + '"]');
    const downCell = grid.querySelector('[data-row="' + current.downStartIndex + '"]').querySelector('[data-col="' + current.col + '"]');
    acrossClueNumber.innerHTML = acrossCell.firstChild.innerHTML + "a.";
    downClueNumber.innerHTML = downCell.firstChild.innerHTML + "d.";
    acrossClueText.innerHTML = xw.clues[[current.row, current.acrossStartIndex, ACROSS]];
    downClueText.innerHTML = xw.clues[[current.downStartIndex, current.col, DOWN]];
}

function updateInfoUI() {
    document.getElementById("puzzle-title").innerHTML = xw.title;
    document.getElementById("puzzle-author").innerHTML = xw.author;
}

function createGrid(rows, cols) {
    console.log( "createGrid: about to create a grid that is " + rows + "x" + cols );
    let table = document.createElement("TABLE");
    table.setAttribute("id", "grid");
    table.setAttribute("tabindex", "1");
    // table.setAttribute("tabindex", "0");
    document.getElementById("main").appendChild(table);

    for (let i = 0; i < rows; i++) {
    	let row = document.createElement("TR");
    	row.setAttribute("data-row", i);
    	document.getElementById("grid").appendChild(row);

	for (let j = 0; j < cols; j++) {
	    let col = document.createElement("TD");
            col.setAttribute("data-col", j);

            let label = document.createElement("DIV");
            label.setAttribute("class", "label");
            let labelContent = document.createTextNode("");

            let fill = document.createElement("DIV");
            fill.setAttribute("class", "fill");
            let fillContent = document.createTextNode(xw.fill[i][j]);

    	    // let t = document.createTextNode("[" + i + "," + j + "]");
            label.appendChild(labelContent);
            fill.appendChild(fillContent);
            col.appendChild(label);
            col.appendChild(fill);
            row.appendChild(col);
	}
    }
    updateLabelsAndClues();
}

function updateLabelsAndClues() {
    console.log("updateLabelsAndClues: xw.rows=" + xw.rows + "  xw.cols=" + xw.cols);
    let count = 1;
    for (let i = 0; i < xw.rows; i++) {
	for (let j = 0; j < xw.cols; j++) {
	    let isAcross = false;
	    let isDown = false;
	    if (xw.fill[i][j] != BLACK) {
		isDown = (i == 0 && i < xw.rows && xw.fill[i + 1][j] != BLACK) || ( (i > 0 ) && (xw.fill[i - 1][j] == BLACK)  && (i < xw.rows-2) && (xw.fill[i + 1][j] != BLACK) );
		isAcross = (j == 0 && j < xw.cols && xw.fill[i][j+1] != BLACK) || ( (j > 0 ) && (xw.fill[i][j - 1] == BLACK) && (j < xw.cols-2) && (xw.fill[i][j + 1] != BLACK) );
	    }
	    const grid = document.getElementById("grid");
	    let currentCell = grid.querySelector('[data-row="' + i + '"]').querySelector('[data-col="' + j + '"]');
	    if (isAcross || isDown) {
		currentCell.firstChild.innerHTML = count; // Set square's label to the count
		count++;
	    } else {
		currentCell.firstChild.innerHTML = "";
	    }

	    if (isAcross) {
		xw.clues[[i, j, ACROSS]] = xw.clues[[i, j, ACROSS]] || DEFAULT_CLUE;
	    } else {
		delete xw.clues[[i, j, ACROSS]];
	    }
	    if (isDown) {
		xw.clues[[i, j, DOWN]] = xw.clues[[i, j, DOWN]] || DEFAULT_CLUE;
	    } else {
		delete xw.clues[[i, j, DOWN]];
	    }
	}
    }
    console.log("exiting updateLabelsAndClues()");
}

function updateActiveWords() {
    if (xw.fill[current.row][current.col] == BLACK) {
	current.acrossWord = '';
	current.downWord = '';
	current.acrossStartIndex = null;
	current.acrossEndIndex = null;
	current.downStartIndex = null;
	current.downEndIndex = null;
    } else {
	current.acrossWord = getWordAt(current.row, current.col, ACROSS, true);
	current.downWord = getWordAt(current.row, current.col, DOWN, true);
    }
    document.getElementById("across-word").innerHTML = current.acrossWord;
    document.getElementById("down-word").innerHTML = current.downWord;
    // console.log("Across:", current.acrossWord, "Down:", current.downWord);
    // console.log(current.acrossWord.split(DASH).join("*"));
}

function getWordAt(row, col, direction, setCurrentWordIndices) {
    let text = "";
    let [start, end] = [0, 0];
    if (direction == ACROSS) {
	text = xw.fill[row];
    } else {
	for (let i = 0; i < xw.rows; i++) {
	    text += xw.fill[i][col];
	}
    }
    text = text.split(BLANK).join(DASH);
    [start, end] = getWordIndices(text, (direction == ACROSS) ? col : row);
    // Set global word indices if needed
    if (setCurrentWordIndices) {
	if (direction == ACROSS) {
	    [current.acrossStartIndex, current.acrossEndIndex] = [start, end];
	} else {
	    [current.downStartIndex, current.downEndIndex] = [start, end];
	}
    }
    return text.slice(start, end);
}

function getWordIndices(text, position) {
    let start = text.slice(0, position).lastIndexOf(BLACK);
    start = (start == -1) ? 0 : start + 1;
    let rows = xw["rows"];
    let end = text.slice(position, rows).indexOf(BLACK);
    end = (end == -1) ? rows : Number(position) + end;
    return [start, end];
}

function getWordAndIndicesAt(row, col, direction, setCurrentWordIndices) {
    // Given a ROW, COL, DIRECTION, return an array containing
    // the word at that position, along with its start and end.
    // If SETCURRENTWORDINDICES, then update current with the start/end indices.
    let text = "";
    let [start, end] = [0, 0];
    if (direction == ACROSS) {
	text = xw.fill[row];
    } else {
	for (let i = 0; i < xw.rows; i++) {
	    text += xw.fill[i][col];
	}
    }
    text = text.split(BLANK).join(DASH);
    [start, end] = getWordIndices(text, (direction == ACROSS) ? col : row);
    // Set global word indices if needed
    if (setCurrentWordIndices) {
	if (direction == ACROSS) {
	    [current.acrossStartIndex, current.acrossEndIndex] = [start, end];
	} else {
	    [current.downStartIndex, current.downEndIndex] = [start, end];
	}
    }
    return( [ text.slice(start, end), start, end ] );
}

function updateGridHighlights() {
    // Clear the grid of any highlights

    // console.log( "updateGridHighlights: [" + current.row + "," + current.col + "] (aSI, aEI)=" +
    // 		 current.acrossStartIndex + "," + current.acrossEndIndex + " (dSI, dEI)=" +
    // 		 current.downStartIndex + "," + current.downEndIndex );
    for (let i = 0; i < xw.rows; i++) {
	for (let j = 0; j < xw.cols; j++) {
	    const square = grid.querySelector('[data-row="' + i + '"]').querySelector('[data-col="' + j + '"]');
	    square.classList.remove("highlight", "lowlight");
	}
    }
    // Highlight across squares
    for (let j = current.acrossStartIndex; j < current.acrossEndIndex; j++) {
	const square = grid.querySelector('[data-row="' + current.row + '"]').querySelector('[data-col="' + j + '"]');
	if (j != current.col) {
	    square.classList.add((current.direction == ACROSS) ? "highlight" : "lowlight");
	}
    }
    // Highlight down squares
    for (let i = current.downStartIndex; i < current.downEndIndex; i++) {
	const square = grid.querySelector('[data-row="' + i + '"]').querySelector('[data-col="' + current.col + '"]');
	if (i != current.row) {
	    square.classList.add((current.direction == DOWN) ? "highlight" : "lowlight");
	}
    }
}

function updateSidebarHighlights() {
    let acrossHeading = document.getElementById("across-heading");
    let downHeading = document.getElementById("down-heading");
    const currentCell = grid.querySelector('[data-row="' + current.row + '"]').querySelector('[data-col="' + current.col + '"]');

    acrossHeading.classList.remove("highlight");
    downHeading.classList.remove("highlight");

    if (!currentCell.classList.contains("black")) {
	if (current.direction == ACROSS) {
	    acrossHeading.classList.add("highlight");
	} else {
	    downHeading.classList.add("highlight");
	}
    }
}

function setClues() {
    let acrossClue = document.getElementById("across-clue-text").innerHTML;
    let downClue = document.getElementById("down-clue-text").innerHTML;
    saveStateForUndo( "set clue to " + acrossClue + "/" + downClue );
    xw.clues[[current.row, current.acrossStartIndex, ACROSS]] = acrossClue;
    xw.clues[[current.downStartIndex, current.col, DOWN]] = downClue;
    //console.log("Stored clue:", xw.clues[[current.row, current.acrossStartIndex, ACROSS]], "at [" + current.row + "," + current.acrossStartIndex + "]");
    //console.log("Stored clue:", xw.clues[[current.downStartIndex, current.col, DOWN]], "at [" + current.downStartIndex + "," + current.col + "]");
    isMutated = true;
    updateUI();
    adjustClueProgress();
}

function setTitle() {
    xw.title = document.getElementById("puzzle-title").innerHTML;
}

function setAuthor() {
    xw.author = document.getElementById("puzzle-author").innerHTML;
}

function suppressEnterKey(e) {
    if (e.which == keyboard.enter) {
	e.preventDefault();
	// console.log("Enter key behavior suppressed.");
    }
}

function generatePattern( size=15 ) {
    saveStateForUndo( "generate a " + size + "x" + size + " layout" );
    if( patterns[ size ] ) {
	console.log("Generating a " + size + "x" + size + " layout...");
	let title = xw.title;
	let author = xw.author;
	createNewPuzzle( size, size );
	xw.title = title;
	xw.author = author;
	const patternsForThisSize = patterns[ size ];
	const pattern = patternsForThisSize[randomNumber(0, patternsForThisSize.length)]; // select random pattern
	if (!isSymmetrical) { // patterns are encoded as only one half of the grid...
	    toggleSymmetry();   // so symmetry needs to be on to populate correctly
	}
	for (let i = 0; i < pattern.length; i++) {
	    const row = pattern[i][0];
	    const col = pattern[i][1];
	    const symRow = xw.rows - 1 - row;
	    const symCol = xw.cols - 1 - col;
	    xw.fill[row] = xw.fill[row].slice(0, col) + BLACK + xw.fill[row].slice(col + 1);
	    xw.fill[symRow] = xw.fill[symRow].slice(0, symCol) + BLACK + xw.fill[symRow].slice(symCol + 1);
	}
	isMutated = true;
	updateUI();
	updateBlackSquareProgress();
	console.log("Generated layout.")
    } else {
	const errorMessage = "No patterns for a " + size + "x" + size + " layout...";
	console.log( errorMessage );
	let error = new Notification( errorMessage, 10 );
    }
}

function toggleUseRegexPatterns() {
    useRegexPatterns = !useRegexPatterns;
    // Update UI button
    let reButton = document.getElementById("use-regex-patterns");
    reButton.classList.toggle("button-on");
    buttonState = reButton.getAttribute("data-state");
    reButton.setAttribute("data-state", (buttonState == "on") ? "off" : "on");
    reButton.setAttribute("data-tooltip", "Turn " + buttonState + " regular expression pattern matching");
    if( useRegexPatterns ) {
	document.getElementsByClassName("regex-pattern-table")[0].style.visibility = "visible";
    } else {
	document.getElementsByClassName("regex-pattern-table")[0].style.visibility = "hidden";
    }
}


function toggleFreezeLayout() {
    // Update UI button
    let freezeButton = document.getElementById("toggle-freeze-layout");
    freezeButton.classList.toggle("button-on");
    let freezeButtonState = freezeButton.getAttribute("data-state");
    freezeButton.setAttribute("data-state", (freezeButtonState == "on") ? "off" : "on");
    freezeButton.setAttribute("data-tooltip", "Turn " + freezeButtonState + " freeze layout");
}

function toggleSymmetry() {
    isSymmetrical = !isSymmetrical;
    // Update UI button
    let symButton = document.getElementById("toggle-symmetry");
    symButton.classList.toggle("button-on");
    let symButtonState = symButton.getAttribute("data-state");
    symButton.setAttribute("data-state", (symButtonState == "on") ? "off" : "on");
    symButton.setAttribute("data-tooltip", "Turn " + symButtonState + " symmetry");
}

function toggleRecommend() {
    showOnlyRecommendations = !showOnlyRecommendations;
    // Update UI button
    let recButton = document.getElementById("toggle-recommend");
    recButton.classList.toggle("button-on");
    buttonState = recButton.getAttribute("data-state");
    console.log("buttonState=" + buttonState)
    recButton.setAttribute("data-state", (buttonState == "on") ? "off" : "on");
    if( buttonState == "off" ) {
	recButton.setAttribute("data-tooltip", "Show all suggestions");
    } else {
	recButton.setAttribute("data-tooltip", "Show only moderately- and highly-recommended suggestions");
    }
    updateUI();
}

function toggleUsageAssistance() {
    if( shortcutsNotification.isDisplayed ) {
	shortcutsNotification.dismiss();
    } else {
	shortcutsNotification.post();
	window.open( "doc/build/html/index.html", "HelpPage", "location=no,menubar=no,status=no" );
    }
    if( suggestionStylingNotification.isDisplayed ) {
	suggestionStylingNotification.dismiss();
    } else {
	suggestionStylingNotification.post();
    }
}

function clearFill() {
    saveStateForUndo( "clear the puzzle" );
    for (let i = 0; i < xw.rows; i++) {
	xw.fill[i] = xw.fill[i].replace(/\w/g, ' '); // replace letters with spaces
    }
    isMutated = true;
    updateUI();
}

function autoFill(isQuick = false) {
    console.log("Auto-filling...");
    forced = null;
    grid.classList.remove("sat", "unsat");
    if (!solveWorker) {
	solveWorker = new Worker('xw_worker.js');
	solveWorkerState = 'ready';
    }
    if (solveWorkerState != 'ready') {
	cancelSolveWorker();
    }
    solvePending = [isQuick];
    runSolvePending();
}

function runSolvePending() {
    if (solveWorkerState != 'ready' || solvePending.length == 0) return;
    let isQuick = solvePending[0];
    solvePending = [];
    solveTimeout = window.setTimeout(cancelSolveWorker, 30000);
    if (solveWordlist == null) {
	console.log('Rebuilding wordlist...');
	solveWordlist = '';
	for (let i = 3; i < wordlist.length; i++) {
	    solveWordlist += wordlist[i].join('\n') + '\n';
	}
    }
    //console.log(wordlist_str);
    let puz = xw.fill.join('\n') + '\n';
    solveWorker.postMessage(['run', solveWordlist, puz, isQuick]);
    solveWorkerState = 'running';
    solveWorker.onmessage = function(e) {
	switch (e.data[0]) {
	case 'sat':
            if (solveWorkerState == 'running') {
		if (isQuick) {
		    console.log("Autofill: Solution found.");
		    grid.classList.add("sat");
		} else {
		    xw.fill = e.data[1].split('\n');
		    xw.fill.pop();  // strip empty last line
		    updateGridUI();
		    grid.focus();
		}
            }
            break;
	case 'unsat':
            if (solveWorkerState == 'running') {
		if (isQuick) {
		    console.log("Autofill: No quick solution found.");
		    grid.classList.add("unsat");
		} else {
		    console.log('Autofill: No solution found.');
		    // TODO: indicate on UI
		}
            }
            break;
	case 'forced':
            if (solveWorkerState == 'running') {
		forced = e.data[1].split('\n');
		forced.pop;  // strip empty last line
		updateGridUI();
            }
            break;
	case 'done':
            console.log('Autofill: returning to ready, state was ', solveWorkerState);
            solveWorkerReady();
            break;
	case 'ack_cancel':
            console.log('Autofill: Cancel acknowledged.');
            solveWorkerReady();
            break;
	default:
            console.log('Autofill: Unexpected return,', e.data);
            break;
	}
    }
}

function solveWorkerReady() {
    if (solveTimeout) {
	window.clearTimeout(solveTimeout);
	solveTimeout = null;
    }
    solveWorkerState = 'ready';
    runSolvePending();
}

function cancelSolveWorker() {
    if (solveWorkerState == 'running') {
	solveWorker.postMessage(['cancel']);
	solveWorkerState = 'cancelwait';
	console.log("Autofill: Cancel sent.");  // TODO: indicate on UI
	window.clearTimeout(solveTimeout);
	solveTimeout = null;
    }
}

function invalidateSolverWordlist() {
    solveWordlist = null;
}

function showMenu(e) {
    let menus = document.querySelectorAll("#toolbar .menu");
    for (let i = 0; i < menus.length; i++) {
	menus[i].classList.add("hidden");
    }
    const id = e.target.getAttribute("id");
    let menu = document.getElementById(id + "-menu");
    if (menu) {
	menu.classList.remove("hidden");
    }
}

function hideMenu(e) {
    e.target.classList.add("hidden");
}

function setDefault(e) {
    let d = e.target.parentNode.querySelector(".default");
    d.classList.remove("default");
    e.target.classList.add("default");
    menuButton = document.getElementById(e.target.parentNode.getAttribute("id").replace("-menu", ""));
    menuButton.innerHTML = e.target.innerHTML;
}

function doDefault(e) {
    const id = e.target.parentNode.getAttribute("id");
    let menu = document.getElementById(id + "-menu");
    if (menu) {
	let d = menu.querySelector(".default");
	d.click();
    }
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * max) + min;
}

function randomLetter() {
    let alphabet = "AAAAAAAAABBCCDDDDEEEEEEEEEEEEFFGGGHHIIIIIIIIIJKLLLLMMNNNNNNOOOOOOOOPPQRRRRRRSSSSSSTTTTTTUUUUVVWWXYYZ";
    return alphabet[randomNumber(0, alphabet.length)];
}

// initialize the progress meter
updateBlackSquareProgress();

