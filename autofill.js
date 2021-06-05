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

function addEntry( row, col, direction, list ) {
    // Add values of the entry to the LIST, a list consisting of:
    //    the word's address (i.e., clue number) as a number
    //    the word (containing zero or more wildcards)
    //    row grid coordinate for the start of the word
    //    column grid coordinate for the start of the word
    //    start position within the row (for across) or column (down)
    //    end position within the row (for across) or column (down)

    let otherDirection = direction == ACROSS ? DOWN : ACROSS;
    let currentCell = grid.querySelector('[data-row="' + row + '"]').querySelector('[data-col="' + col + '"]');
    const wordInfo = getWordAndIndicesAt( row, col, direction, false );
    const word = wordInfo[ 0 ];
    if( !wordIsComplete(word) ) {
	const start = wordInfo[ 1 ];
	const end = wordInfo[ 2 ];
	const clueLabel = currentCell.firstChild.innerHTML;
	const nmatches = matchFromWordlist(word, true).length;
	if( clueLabel != '' ) {
	    console.log( "addEntry: xw[" + row + ", " + col + "]='" +
			 clueLabel + " " + direction + "' ==> " + word + " (" +
			 start + "," + end + ") " );
	}

	console.log("addEntry: start=" + start + ", end=" + end + "; nmatches=" + nmatches );
	list[ parseInt(clueLabel) ] = [ word, row, col, start, end, nmatches ];
    }
    //TODO: remove following two lines
    else
	console.log( "addEntry: '" + word + "' is " + (wordIsComplete(word)? "" : "NOT") + " complete; not adding" );
}

function collectEntries( acrossList, downList ) {
    // Update two lists: each has entries currently in the puzzle.
    // The first list is for across entries; the second for down entries.
    //
    // Each entry appears in its respective array at its address (i.e., its numbered square).
    //
    // The value of each entry consists of a list whose elements are:
    //   the word (containing zero or more wildcards)
    //   row grid coordinate for the start of the word
    //   column grid coordinate for the start of the word
    //   start position within the row (for across) or column (down)
    //   end position within the row (for across) or column (down)
    //   a list of addresses of all the cross-wise entries for this entry
    //
    // So, for example, if we have the grid:
    //
    // 	+---------------------------------------+
    //  | 1T | 2H | 3E | 4- |XXXX| 5A | 6- | 7- |
    // 	+---------------------------------------+
    //  | 8- |  - |  - |  - |  - |  R |  - |  - |
    // 	+---------------------------------------+
    //  | 9- |  - |  - |  - |  - |  - |  - |  - |
    // 	+---------------------------------------+
    //
    // (where XXXX repsents a black square)
    //
    //
    // The function would return two lists.
    // The across list would have these entries:
    //     acrossList[1] = [ "THE-",      0, 0, 0, 4, [ 1, 2, 3 ] ]
    //     acrossList[5] = [ "A--",       0, 5, 5, 7, [ 8, 9 ] ]
    //     acrossList[8] = [ "-----R--",  1, 0, 0, 7, [ 1, 2, 3, 4, 5, 6, 7 ] ]
    //     acrossList[9] = [ "--------",  2, 0, 0, 7, [ 1, 2, 3, 4, 5, 6, 7 ] ]
    //
    //     downList[1]   = [ "T--",       0, 0, 0, 3, [ 1, 8, 9 ] ]
    //     downList[2]   = [ "H--",       0, 1, 0, 3, [ 1, 8, 9 ] ]
    //     downList[3]   = [ "E--",       0, 2, 0, 3, [ 1, 8, 9 ] ]
    //     downList[4]   = [ "---",       0, 3, 0, 3, [ 1, 8, 9 ] ]
    //     downList[5]   = [ "AR-",       0, 5, 0, 3, [ 5, 8, 9 ] ]
    //     downList[6]   = [ "---",       0, 6, 0, 3, [ 5, 8, 9 ] ]
    //     downList[7]   = [ "---",       0, 7, 0, 3, [ 5, 8, 9 ] ]
    //

    console.log("collectEntries: xw.rows=" + xw.rows + "  xw.cols=" + xw.cols);

    for (let i = 0; i < xw.rows; i++) {
	for (let j = 0; j < xw.cols; j++) {
	    let isAcross = false;
	    let isDown = false;
	    if (xw.fill[i][j] != BLACK) {
		isDown = isStartOfDownWord(i,j);
		isAcross = isStartOfAcrossWord(i,j);
		if( isDown ) addEntry( i, j, DOWN, downList );
		if( isAcross ) addEntry( i, j, ACROSS, acrossList );
	    }
	}
    }
    console.log("exiting collectEntries()");
}

function addCrossWords( list, direction ) {
    // For each defined entry in LIST, append to the entry a list of all words
    // that cross this entry assuming the entries run in DIRECTION.
    let result = [];

    for( entry of list ) {
	if( entry !== undefined ) {
	    const word = entry[0];
	    const row = entry[1];
	    const col = entry[2];
	    const start = entry[3];
	    const end = entry[4];
	    const nmatches = entry[5];
	    let crossWordClues = [ ];
	    console.log( "addCrossWords: " + " '" + word + "' (" + row + "," + col + ")  " + start + "..." + end + "; nmatches=" + nmatches );

	    if( direction == ACROSS ) {
		for( let j = start; j < end; j++ ) {
		    for( let i = row; i >= 0; i-- ) {
			if( i == 0 || xw.fill[i][j] == BLACK ) {
			    if( xw.fill[i][j] == BLACK ) i++; // adjust for the black cell
			    let cell = grid.querySelector('[data-row="' + i + '"]').querySelector('[data-col="' + j + '"]');
			    let clue = cell.firstChild.innerHTML;
			    console.log( "addCrossWords:     (" + i + "," + j + ") found one at " + i + "; clue=" + clue);
			    crossWordClues.push( parseInt( clue ) );
			    break;
			}

		    }
		}
	    }
	    else {
		for( let i = start; i < end; i++ ) {
		    for( let j = col; j >= 0; j-- ) {
			if( j == 0 || xw.fill[i][j] == BLACK ) {
			    if( xw.fill[i][j] == BLACK ) j++; // adjust for the black cell
			    let cell = grid.querySelector('[data-row="' + i + '"]').querySelector('[data-col="' + j + '"]');
			    let clue = cell.firstChild.innerHTML;
			    console.log( "addCrossWords:     (" + i + "," + j + ") found one at " + j + "; clue=" + clue);
			    crossWordClues.push( parseInt( clue ) );
			    break;
			}
		    }
		}
	    }
	    result.push( [ word, row, col, start, end, nmatches, crossWordClues ] );
	}
    }
    return( result );
}

function toggleAutoFill( force ) {
    // Start autofilling the puzzle of requested to toggle on;
    // else stop autofilling.
    // If FORCE (a boolean) is given, then use that value instead of toggling.

    if( force === undefined ) {
	autoFilling = !autoFilling;
    } else {
	autoFilling = force;
    }

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

function printEntries( list, dir ) {
    // Print entries in LIST, preceded by their direction, DIR.
    console.log( "printEntries: " + dir + "List:" );
    for( let e in list ) {
	let entry = list[ e ];
	if( entry !== undefined ) {
	    const word = entry[0];
	    const row = entry[1];
	    const col = entry[2];
	    const start = entry[3];
	    const end = entry[4];
	    const nmatches = entry[5];
	    const crosswordClues = (entry[ 6 ] === undefined ? "<none>" : " [" + entry[ 6 ].join(",") + "]" );
	    console.log( "\t" + e + " '" + word + "' (" + row + "," + col + ")  " + start + "..." + end + "; nmatches=" + nmatches + " crosswordClues=" + crosswordClues );
	}
    }
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
    let acrossList = [];
    let downList = [];
    collectEntries( acrossList, downList );
    console.log( "autofillJS: After collectEntries()..." );
    printEntries( acrossList, ACROSS );
    printEntries( downList, DOWN );

    acrossList = addCrossWords( acrossList, ACROSS );
    downList = addCrossWords( downList, DOWN );
    console.log( "autofillJS: After collectEntries() and addCrossWords()..." );
    printEntries( acrossList, ACROSS );
    printEntries( downList, DOWN );

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
    toggleAutoFill( false );
}

let autoFilling = false;
