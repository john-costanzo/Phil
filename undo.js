// Phil
// ------------------------------------------------------------------------

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// (https://www.apache.org/licenses/LICENSE-2.0)

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ------------------------------------------------------------------------

let noFurtherUndo = "No further undo information available";
let noFurtherRedo = "No further redo information available";

function setUndoButton( state, tooltip ) {
    // Set Undo button's state to STATE
    let undoButton = document.getElementById("undo");

    if( undoButton.getAttribute( "data-state" ) != state ) {
	undoButton.classList.toggle("button-on");
    }

    undoButton.setAttribute( "data-state",  state );
    undoButton.setAttribute( "data-tooltip", tooltip );
}

function setRedoButton( state, tooltip ) {
    // Set Redo button's state to STATE
    let redoButton = document.getElementById("redo");

    if( redoButton.getAttribute( "data-state" ) != state ) {
	redoButton.classList.toggle("button-on");
    }

    redoButton.setAttribute( "data-state",  state );
    redoButton.setAttribute( "data-tooltip", tooltip );
}

function undo() {
    // Undo the latest action

    if( undoStack.length > 0 ) {
	console.log("undo: undoing puzzle to before last grid change...");
	const previousCell = grid.querySelector('[data-row="' + current.row + '"]').querySelector('[data-col="' + current.col + '"]');
	previousCell.classList.remove("active");

	let undoContext = undoStack.pop();
	saveStateForRedo( undoContext.label );
	if( xw.rows != undoContext.xw.rows || xw.cols != undoContext.xw.cols ) { // puzzle has changed size; reconstruct it
	    createNewPuzzle( undoContext.xw.rows, undoContext.xw.cols );
	}
	xw = undoContext.xw;
	current = undoContext.current;

	if( undoStack.length <= 0 ) {
	    setUndoButton( "off", noFurtherUndo );
	} else {
	    let undoContext = undoStack[ undoStack.length-1 ];
	    setUndoButton( "on", "Undo latest grid change for \"" + undoContext.label + "\"");
	}

	isMutated = true;
	// updateActiveWords();
	// updateMatchesUI();
	updateUI();
	const currentCell = grid.querySelector('[data-row="' + current.row + '"]').querySelector('[data-col="' + current.col + '"]');
	currentCell.classList.add("active");

	// Scroll to where the clue boxes had been
	let am = document.getElementById( "across-matches" );
	let dm = document.getElementById( "down-matches" );
	am.scrollTop = undoContext.acrossMatchesScrollTop;
	dm.scrollTop = undoContext.downMatchesScrollTop;

	grid.focus();
    }
    adjustClueProgress();
    updateBlackSquareProgress();
    logUndoStatus();
}

function redo() {
    // Redo the latest undo action

    if( redoStack.length > 0 ) {
	console.log("redo: redoing puzzle to before last undo...");
	const previousCell = grid.querySelector('[data-row="' + current.row + '"]').querySelector('[data-col="' + current.col + '"]');
	previousCell.classList.remove("active");

	let redoContext = redoStack.pop();
	saveStateForUndo( redoContext.label );
	xw = redoContext.xw;
	current = redoContext.current;

	if( redoStack.length <= 0 ) {
	    setRedoButton( "off", noFurtherRedo );
	} else {
	    let redoContext = redoStack[ redoStack.length-1 ];
	    setRedoButton( "on", "Redo latest grid change for \"" + redoContext.label + "\"");
	}

	isMutated = true;
	// updateActiveWords();
	// updateMatchesUI();
	updateUI();
	const currentCell = grid.querySelector('[data-row="' + current.row + '"]').querySelector('[data-col="' + current.col + '"]');
	currentCell.classList.add("active");

	// Scroll to where the clue boxes had been
	let am = document.getElementById( "across-matches" );
	let dm = document.getElementById( "down-matches" );
	am.scrollTop = redoContext.acrossMatchesScrollTop;
	dm.scrollTop = redoContext.downMatchesScrollTop;

	grid.focus();
    }
    adjustClueProgress();
    updateBlackSquareProgress();
    logUndoStatus();
}

function logUndoStatus() {
    console.log( "saveStateForUndo: undoStack has " + undoStack.length + " entr" + (undoStack.length==1 ? "y" : "ies") +
		 "; redoStack has " + redoStack.length + " entr" + (redoStack.length==1 ? "y" : "ies") + "." );
}

function saveStateForUndo( label ) {
    // Take a snapshot of the current state and push it onto the (global) undoStack
    let undoContext = {};
    undoContext.xw = cloneObject( xw );
    undoContext.current = cloneObject( current );
    undoContext.label = label;

    // Save scroll position of clue boxes
    let am = document.getElementById( "across-matches" );
    let dm = document.getElementById( "down-matches" );

    undoContext.acrossMatchesScrollTop = am.scrollTop;
    undoContext.downMatchesScrollTop = dm.scrollTop;

    undoStack.push( undoContext );
    setUndoButton( "on", "Undo latest grid change for \"" + label + "\"" );
    logUndoStatus();
}

function saveStateForRedo( label ) {
    // Take a snapshot of the current state and push it onto the (global) redoStack
    let redoContext = {};
    redoContext.xw = cloneObject( xw );
    redoContext.current = cloneObject( current );
    redoContext.label = label;

    // Save scroll position of clue boxes
    let am = document.getElementById( "across-matches" );
    let dm = document.getElementById( "down-matches" );
    redoContext.acrossMatchesScrollTop = am.scrollTop;
    redoContext.downMatchesScrollTop = dm.scrollTop;

    redoStack.push( redoContext );
    setRedoButton( "on", "Redo latest grid change for \"" + label + "\"" );
}

function emptyRedoState(  ) {
    // Empty the (global) redoStack and set an appropriate tooltip.
    redoStack = [];
    setRedoButton( "off", noFurtherRedo );
}
