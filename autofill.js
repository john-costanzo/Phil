// Base on an analysis of a Merriam Webster dictionary here is the relative
// distribution of letters within those words.
const letter_frequency = {
    a: 46,
    b: 9,
    c: 24,
    d: 18,
    e: 59,
    f: 7,
    g: 14,
    h: 14,
    i: 48,
    j: 1,
    k: 5,
    l: 32,
    m: 16,
    n: 38,
    o: 38,
    p: 16,
    q: 1,
    r: 38,
    s: 35,
    t: 37,
    u: 18,
    v: 5,
    w: 4,
    x: 1,
    y: 11,
    z: 2
}

function scoreWord( word, freq ) {
    // For each letter in the WORD, sum the relative distribution as given by FREQ.
    let score = 0;
    for (const x of word) {
	score += freq[ x.toLowerCase() ];
    }
    // console.log( "scoreWord: word=" + word + "; score=" + score );
    return( score );
}


function collectAll( clues, dict, direction ) {
    // Collect all answers from CLUES into DICT, noting its DIRECTION.
    // TODO: for each clue, need to also include the down clues.

    for( let i=0; i < clues.length; i++ ) {
	let ans = clues[i].answer;
	let lab = clues[i].label + direction;
	if( ans in dict ) {
	    let arr = dict[ lab ];
	    arr.push( ans );
	} else
	    dict[ lab ] = [ ans ];
    }
}


function startOfHorizontalWord( row, col ) {
    // Determine if the grid entry starting at ROW, COL this is the start of a horizontal word.
    let atStart = false;

}

function collectEntries() {
    // Return a dictionary of entries currently in the puzzle.
    //
    // Each entry is keyed by its address (e.g., "1a", "34d", etc.).
    //
    // The value of each entry consists of a list:
    //   the word (containing zero or more wildcards)
    //   whether the word is across or down
    //   row grid coordinate for the start of the word
    //   column grid coordinate for the start of the word
    //   start position within the row (for across) or column (down)
    //   end position within the row (for across) or column (down)
    //   a list of addresses of all the cross-wise entries for this entry
    //
    // So, for example, if we have the grid:
    //
    // 	+-------------------+
    //  | 1T | 2H | 3E |  - |
    // 	+-------------------+
    //  | 4- |  - |  - |  - |
    // 	+-------------------+
    //  | 5- |  - |  - |  - |
    // 	+-------------------+
    //
    // the function would return a dictionary with these entries:
    //    "1a": [ "THE-", "across", 0, 0, 0, 4, [ "1d", "2d", "3d" ] ]
    //    "1d": [ "T--",  "down",   0, 0, 0, 3, [ "4a", "5a" ] ]
    //    "2d": [ "H--",  "down",   0, 1, 0, 3, [ ] ]
    //    "3d": [ "E--",  "down",   0, 2, 0, 3, [ ] ]
    //

    console.log("collectEntries: xw.rows=" + xw.rows + "  xw.cols=" + xw.cols);
    const grid = document.getElementById("grid");

    for (let i = 0; i < xw.rows; i++) {
	for (let j = 0; j < xw.cols; j++) {
	    let isAcross = false;
	    let isDown = false;
	    if (xw.fill[i][j] != BLACK) {
		isDown = (i == 0 && i < xw.rows && xw.fill[i + 1][j] != BLACK) || ( (i > 0 ) && (xw.fill[i - 1][j] == BLACK)  && (i < xw.rows-2) && (xw.fill[i + 1][j] != BLACK) );
		isAcross = (j == 0 && j < xw.cols && xw.fill[i][j+1] != BLACK) || ( (j > 0 ) && (xw.fill[i][j - 1] == BLACK) && (j < xw.cols-2) && (xw.fill[i][j + 1] != BLACK) );
	    }
	    let currentCell = grid.querySelector('[data-row="' + i + '"]').querySelector('[data-col="' + j + '"]');
	    const dir = isAcross ? ACROSS : DOWN;
	    const wordInfo = getWordAndIndicesAt( i, j, dir, false );
	    const word = wordInfo[ 0 ];
	    const start = wordInfo[ 1 ];
	    const end = wordInfo[ 2 ];
	    const clueLabel = currentCell.firstChild.innerHTML;
	    if( currentCell.firstChild.innerHTML != '' ) {
		console.log( "collectEntries: xw[" + i + ", " + j + "]='" +
			     clueLabel  + dir + "' ==> " + word + " (" +
			     start + "," + end + ") " );
	    }
	}
    }
    console.log("exiting collectEntries()");
}


function toggleAutoFill() {
    // Start autofilling the puzzle of requested to toggle on;
    // else stop autofilling.

    autoFilling = !autoFilling;

    // Update UI button
    let autoFillButton = document.getElementById("toggle-auto-fill");
    autoFillButton.classList.toggle("button-on");
    buttonState = autoFillButton.getAttribute("data-state");
    console.log("toggleAutoFill: buttonState=" + buttonState)
    autoFillButton.setAttribute("data-state", (buttonState == "on") ? "off" : "on");
    if( buttonState == "on" ) {
	autoFillButton.setAttribute("data-tooltip", "Toggle auto-fill on");
	console.log( "toggleAutoFill: toggling off..." );
    } else {
	autoFillButton.setAttribute("data-tooltip", "Toggle auto-fill off");
	console.log( "toggleAutoFill: toggling on..." );

	const [acrossClues, downClues] = generatePDFClues();
	let acrossDict = {};
	let downDict = {};

	collectAll( acrossClues, acrossDict, 'a' );
	collectAll( downClues, downDict, 'd' );

	// console.log( "toggleAutoFill: acrossDict:" );
	// for( const [k,v] of Object.entries( acrossDict ) ) {
	//     let m = "answer '" +  k + "' == " + v;
	//     console.log( m );
	// }

	// console.log( "toggleAutoFill: downDict:" );
	// for( const [k,v] of Object.entries( downDict ) ) {
	//     let m = "answer '" +  k + "' == " + v;
	//     console.log( m );
	// }

	autofillJS( acrossDict, downDict, '1a', 1 );
    }
    updateUI();
}

function logWithLevel( tag, level, message ) {
    // Log a message, prefixed by TAG, then a colon.
    // Display LEVEL blanks and then the MESSAGE.
    console.log(tag + ": " + " ".repeat(level) + message );
}

function autofillJS( entries, clue, level ) {
    // Autofill the puzzle starting at clue CLUE.
    // Print messages with LEVEL leading spaces.
    //
    // Algorithm:
    //    1) From ENTRIES, retrieve the entry for CLUE.
    //    2) If this entry's word has no wildcards, return true.
    //    3) Obtain the entry's candidate fill words and rank them according to letter frequency.
    //    4) If there are no candidates, return false.
    //    5) Iterate through the entry's ranked candidate fill words:
    //        5a) Place a candidate into the grid for this entry.
    //        5b) Iteratively call this function (recursively) with each cross-wise address that is
    //            greater than the current. For example if the current entry is 53d and
    //            the cross-wise addresses are 53a, 58a and 59a, call only on the latter two.
    //        5c) If the function returns false, replace the fill word with the next candidate
    //            and continue to step 5a.
    //        5d) If *all* cross-wise entries return true, return true.
    logWithLevel("autofillJS", level, "attempting to fill, starting at clue number " + clue );
    collectEntries();

    const word = acrossDict[ clue ];
    const candidates = matchFromWordlist( word[0], true );
    let rankedCandidatesDict = {}
    for (const candidate of candidates) {
	let s = scoreWord( candidate, letter_frequency );
	rankedCandidatesDict[ candidate ] = s;
    }

    // Create items array that has a two-element list of the word and score.
    var items = Object.keys(rankedCandidatesDict).map(function(key) {
	return [key, rankedCandidatesDict[key]];
    });

    // Sort the array based on the second element (i.e., score)
    items.sort(function(first, second) {
	return second[1] - first[1];
    });

    // Finally, create an array of candidate words, ordered by score.
    var rankedCandidatesList = Object.keys(items).map(function(key) {
	return items[ key ][ 0 ];
    });

    for( const candidate of rankedCandidatesList ) {
	logWithLevel("autofillJS", level, "evaluating candidate = " + candidate );
    }
    toggleAutoFill(); // TODO: shouldn't this be a bit smarter to forcefully toggle it off?
}
