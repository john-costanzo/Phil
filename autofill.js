// Base on an analysis of a Merriam Webster dictionary here is the relative
// distribution of letters within those words.
const autofillReportingInterval = 5000; // milliseconds

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

////////////////////////////////////////////////////////////////////////
class AutofillStats {
    constructor( ) {
	this.numberCandidatesTried = 0;
	this.stopwatch = new StopWatch();
    }
    incrementNumberCandidatesTried() { return( ++this.numberCandidatesTried ); }
    start() { this.stopwatch.Start(); }
    current() { return( this.stopwatch.Current() ); }
    reset() {
	this.numberCandidatesTried=0;
	this.stopwatch.Reset();
    }
    stop() { this.stopwatch.Stop(); }
}
////////////////////////////////////////////////////////////////////////

let autofillStats = new AutofillStats();

function scoreWord( word, freq ) {
    // For each letter in the WORD, sum the relative distribution as
    // given by FREQ. Add in a small bit of randomness to ensure we
    // don't start with the same words all the time.
    let score = 0;
    for (const x of word) {
	score += freq[ x.toLowerCase() ] + Math.floor( Math.random() * 10 );
    }
    // console.log( "scoreWord: word=" + word + "; score=" + score );
    return( score );
}


function collectAll( clues, dict, direction ) {
    // TODO: Remove dead code?
    // Collect all answers from CLUES into DICT, noting its DIRECTION.

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
    //    the word's clue number (as a number)
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
	    // console.log( "addEntry: xw[" + row + ", " + col + "]='" +
	    // 		 clueLabel + " " + direction + "' ==> " + word + " (" +
	    // 		 start + "," + end + ") " );
	}

	//console.log("addEntry: start=" + start + ", end=" + end + "; nmatches=" + nmatches );
	list[ parseInt(clueLabel) ] = { "word" : word,
					"clueNumber" : clueLabel,
					"direction" : direction,
					"row" : row,
					"col" : col,
					"start" : start,
					"end" : end,
					"nmatches" : nmatches
				      };
    }
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

function computeOptimizedList() {
    // Return an optimized list of answers to visit.

    function compareNmatches( a, b ) { return( a.nmatches < b.nmatches ? -1 : a.nmatches > b.nmatches ? +1 : 0 ); }

    function optimizeSortOrder( a, b ) {
	// Optimize the sort order of candidates. This will be the order we attempt to fill in the puzzle.
	// Sort by number of matches, ascending.
	// Within that, sort by the length of the answer, descending.

	function isLongerThan( a, b ) {
	    // Returns -1, 0, +1, depending on whether a.word is longer, same as or shorter than b.word.
	    const alen = a.word.length;
	    const blen = b.word.length;

	    let ret = 0
	    if( alen > blen ) {
		ret = -1;
	    } else {
		if( alen < blen ) {
		    ret = +1;
		}
	    }
	    return( ret );
	}

	let ret = 0;

	if( a.nmatches < b.nmatches ) {
	    ret = -1
	} else 	if( a.nmatches > b.nmatches ) {
	    ret = +1
	} else {
	    ret = isLongerThan( a, b );
	}
	return( ret );
    }

    let acrossList = [];
    let downList = [];
    collectEntries( acrossList, downList );
    console.log( "computeOptimizedList: After collectEntries()..." );
    let optimizedList = acrossList.concat( downList ).
	filter(entry => entry !== undefined).
	sort( optimizeSortOrder );
    printEntries( optimizedList, "*** Combined and Optimized " );
    return( optimizedList );
}


function AutofillException( message ) {
    // Create an object of type AutofillException
    this.message = message;
    this.name = 'AutofillException';
}

function setAutofillStatus( status ) {
    let afProgress = document.getElementById("af-progress-label");
    if( afProgress ) afProgress.innerHTML = status;
}

function updateAutofillElapsedTime( autofillStats, reschedule=false) {
    // Update the elapsed time that autofill() has been running based on
    // the values NUMBERCANDIDATESTRIED and STOPWATCH.
    // If RESCHEDULE is true, schedule another call to this function.
    // If RESCHEDULE is false, do not schedule another call to this function and
    // cancel the most recent pending call.

    const current = autofillStats.current();
    const numberCandidatesTried = autofillStats.numberCandidatesTried;

    const stopwatch = autofillStats.stopwatch;

    if( current ) {
	setAutofillStatus( numberCandidatesTried.toLocaleString() + " candidates tried in " +
			   stopwatch.elapsedTime() +
			   " (" + Math.round( numberCandidatesTried/(current/1000) ) + "/s.)" );
	if( reschedule ) {
	    updateAutofillElapsedTime.mostRecentCall =
		window.setTimeout( updateAutofillElapsedTime.bind( null, autofillStats, true ),
				   autofillReportingInterval );
	} else {
	    if( updateAutofillElapsedTime.mostRecentCall !== undefined ) {
		window.clearTimeout( updateAutofillElapsedTime.mostRecentCall );
	    }
	}
    }
}

function toggleAutoFill( force ) {
    // Start autofilling the puzzle of requested to toggle on;
    // else stop autofilling.
    // If FORCE (a boolean) is given, then use that value instead of toggling.

    if( force === undefined ) {
	autofilling = !autofilling;
    } else {
	autofilling = force;
    }

    // Update UI button
    let autofillButton = document.getElementById("toggle-auto-fill");
    autofillButton.classList.toggle("button-on");
    buttonState = autofillButton.getAttribute("data-state");
    console.log("toggleAutoFill: buttonState=" + buttonState)
    autofillButton.setAttribute("data-state", autofilling ? "on" : "off");
    if( !autofilling ) {
	autofillButton.setAttribute("data-tooltip", "Toggle auto-fill on");
	updateAutofillElapsedTime( autofillStats, false ),
	autofillStats.reset();
	console.log( "toggleAutoFill: toggling off..." );
    } else {
	autofillButton.setAttribute("data-tooltip", "Toggle auto-fill off");
	console.log( "toggleAutoFill: toggling on..." );

	let optimizedList = computeOptimizedList();
	// console.log( "toggleAutoFill: optimizedList.length=" + optimizedList.length );
	const zeroAnswersList = optimizedList.filter(entry => entry.nmatches==0);

	if( zeroAnswersList.length > 0 ) {
	    const noAnswersString = zeroAnswersList.reduce( ( accumulator, currentValue ) =>
		accumulator + "\n✘" + currentValue.clueNumber.padStart(5) + " " + currentValue.direction + " \"" + currentValue.word + "\""
		, "" );
	    alert( "Using the current dictionary, there are no possible matches for these entries:\n" + noAnswersString );
	    autofillStats.reset();
	    updateAutofillElapsedTime( autofillStats, false );
	    toggleAutoFill( false );
	    return;
	}
	writeFile('xw');

	setAutofillStatus( "" );
	autofillStats.start();
	updateAutofillElapsedTime( autofillStats, false );
	window.setTimeout( updateAutofillElapsedTime.bind( null, autofillStats, true ),
			   autofillReportingInterval );

	autofillJS( optimizedList, 0, autofillStats, 0 );
    }
    updateUI();
}

function logWithLevel( tag, level, message ) {
    // Log a message, prefixed by TAG, then a colon.
    // Display LEVEL blanks and then the MESSAGE.
    const pad = 0; // (25 - tag.length) * 2;
    console.log(tag + ": " + " ".repeat(Math.max(1,pad+(level*2))) + message );
}

function printEntries( list, dir ) {
    // Print entries in LIST, preceded by their direction, DIR.
    console.log( "printEntries: " + dir + "List:" );
    for( let e in list ) {
	let entry = list[ e ];
	if( entry !== undefined ) {
	    const cluenum = entry.clueNumber === undefined ? "" : (entry.clueNumber + " " + entry.direction);
	    console.log( "\t" + e + ":  " + cluenum + " '" + entry.word +
			 "' (" + entry.row + "," + entry.col + ")  " +
			 entry.start + "..." + entry.end + "; nmatches=" + entry.nmatches );
	}
    }
}

// Ideally, we'd like to use a function to fill in a piece of the
// puzzle, then recursively call the function to fill in progressively
// smaller pieces of the puzzle. If recursive calls were to fail to
// fill in portions, we could try alternatives and the stack could
// manage all this state.

// The problem is that JavaScript has a single threaded
// run-to-completion model where we are unable to process events (e.g.
// a request to halt autofilling) while this long-running process
// occurs.

// Instead, we implement two functions: one that iteratively evaluates
// puzzle entries and a second that evaluates candidate answers for
// each of these entries. These functions are not called directly but
// are schedule via the event dispatcher, which allows these calls to
// be intermingled with other events.

// We iterate through each of the entries, trying each candidate
// answer in turn and then move on to the next entry. If we fail to
// find any suitable candidates for an entry, we back up and
// try a different candidate for the previous entry. All of this state
// needs to be managed via data structures:

// ENTRIES: a (sorted) list of Objects containing these fields:
//          {word, clueNumber, direction, row, col, start, end, nmatches}
// should be:
//          {word, clueNumber, direction, row, col, start, end, nmatches, candidates, currentCandidate}
//
// CANDIDATES: a (sorted) list of candidate answers for a given entry
//

function autofillJS( entries, clueNumber, autofillStats, level ) {
    // Autofill the puzzle using ENTRIES as the order list of answers, starting at clue CLUENUMBER. Update AUTOFILLSTATS as we go along.
    // Print messages with LEVEL leading spaces.
    //
    // Algorithm:
    //    0) If CLUENUMBER exceeds the length of ENTRIES, return true. (We are done!)
    //    1) From ENTRIES, retrieve the entry for CLUENUMBER.
    //    2) Obtain the entry's candidate fill words and rank them in ascending order of letter frequency.
    //    3) Iterate through the entry's ranked candidate fill words:
    //        3a) If there are no candidates, set the 'success' field for this entry to 'false' and return.
    //        3b) Else call tryCandidates().


    // For example, suppose we have
    //   entries of: [ {"word": "IDE-", ...., "candidates": [ "IDEA", "IDEE", ..., "IDES"] },
    //                 {"word": "OW-", ....,  "candidates": [ "OWE",  "OWI",  ..., "OWS"] } ]
    //   and we have tried "IDEA" for entries[0] but that forced entries[1] to have no matches.
    //
    //   We would then set entries[0].success=false and call autofillJS(entries, 0, 0) again.
    //   The next time autofillJS() is run, we see that its success is false. We remove the
    //   word we added (?) and call tryCandidates() with the next candidate (e.g., "IDEE").
    //

    const numEntries = entries.length-1;
    // logWithLevel("autofillJS", level, "   attempting to fill, starting at clue number " + clueNumber + " of " + numEntries);

    if( !autofilling ) {
	logWithLevel("autofillJS", level, "autofilling is false; returning false!" );
	console.log( "bailing out of first one" );
	return;
    }

    if( clueNumber < 0 ) {  // We've failed
	logWithLevel( "autofillJS", level, "Failure!!!" );
	toggleAutoFill( false );
	reportOnDuplicateAnswers();
	return;
    }

    if( clueNumber >= entries.length ) {  // We've filled all entries!
	logWithLevel( "autofillJS", level, "Success!!!" );
	toggleAutoFill( false );
	reportOnDuplicateAnswers();
	return;
    }

    if( clueNumber < entries.length-1 ) {
	const success = entries[ clueNumber+1 ].success;
	// If success == false, we have already tried the next clueNumber and it failed.
	// Try the next candidate for this entry.
	if( success !== undefined && !success ) {
	    const nextCandidate = entries[ clueNumber ].currentCandidate+1;
	    window.setTimeout( tryCandidates.bind( null, entries, clueNumber, nextCandidate, autofillStats, level  ), 0 );
	    return;
	}
    }

    let word = entries[ clueNumber ].word;
    const col = entries[ clueNumber ].col;
    const row = entries[ clueNumber ].row;
    const direction = entries[ clueNumber ].direction;

    //logWithLevel( "autofillJS", level, "   word='" + word + "' row=" + row + " col=" + col + " " + direction );
    const wordInfo = getWordAndIndicesAt( row, col, direction, false );
    if( wordInfo === undefined ) {
	console.log( "autofillJS: cannot getWordAndIndicesAt(" + row + "," + col + "," + direction + ")");
    } else {
	word = wordInfo[ 0 ];
    }

    const candidates = matchFromWordlist( word, true, true );
    if( candidates.length == 0 ) {
	//logWithLevel( "autofillJS", level, "No candidates for '" + word + "'");
	// mark this entry's success as false, undo the parent's entry and 'return' to parent
	entries[ clueNumber ].success = false;
	entries[ clueNumber ].candidates = [];

	if( clueNumber > 0 ) {
	    const parentClueNumber = clueNumber-1;
	    const parentCol = entries[ parentClueNumber ].col;
	    const parentRow = entries[ parentClueNumber ].row;
	    const parentDirection = entries[ parentClueNumber ].direction;
	    const parentStart = entries[ parentClueNumber ].start;
	    const parentEnd = entries[ parentClueNumber ].end;

	    const previousWord = entries[ parentClueNumber ].previousWord;
	    //logWithLevel( "autofillJS", level, "replacing previous parent word '" + previousWord + "'" );
	    fillGridWithMatchAux( previousWord, parentDirection, parentRow, parentCol, parentStart, parentEnd );
	} else {
	    //logWithLevel( "autofillJS", level, "ERROR! clueNumber==" + clueNumber );
	}

	// We can never simply return; we must *always* call some function until we are done!!!
	// DON'T BREAK THE CHAIN!
	entries[ clueNumber ].currentCandidate = 0;
	window.setTimeout( autofillJS.bind( null, entries, clueNumber-1, autofillStats, level-1 ), 0 );
	return;
    }

    let rankedCandidatesDict = {}
    for( const candidate of candidates ) {
	let s = scoreWord( candidate, letter_frequency );
	rankedCandidatesDict[ candidate ] = s;
    }

    // Create items array that has a two-element list of the word and score.
    var items = Object.keys( rankedCandidatesDict ).map( function(key) {
	return [key, rankedCandidatesDict[key]];
    } );

    // Sort the array based on the second element (i.e., score)
    items.sort( function( first, second ) {
	return second[1] - first[1];
    });

    // Finally, create an array of candidate words, ordered by score.
    var rankedCandidatesList = Object.keys(items).map(function(key) {
	return items[ key ][ 0 ];
    });

    entries[clueNumber].candidates = rankedCandidatesList;

    window.setTimeout( tryCandidates.bind( null, entries, clueNumber, 0, autofillStats, level ), 0 );
}

function tryCandidates( entries, clueNumber, candidateNumber, autofillStats, level ) {
    // Consulting the list of ENTRIES, evaluate the entry at
    // CLUENUMBER, starting at its candidate answer CANDIDATENUMBER.
    // Report messages using LEVEL.
    const candidates = entries[ clueNumber ].candidates;

    //logWithLevel( "tryCandidates", level, "clueNumber = " + clueNumber );
    //logWithLevel( "tryCandidates", level, "candidateNumber = " + candidateNumber + " of " + candidates.length );

    if( candidateNumber >= candidates.length ) {
	// logWithLevel( "tryCandidates",
	// 	      level,
	// 	      "candidateNumber (" + candidateNumber +
	// 	      ") >= candidates.length (" + candidates.length +
	// 	      ")" );
	entries[ clueNumber ].success = false;  // we ran out of candidates!
	entries[ clueNumber ].currentCandidate = 0;
	window.setTimeout( autofillJS.bind( null, entries, clueNumber-1, autofillStats, level-1 ), 0 );
	return;
    }

    entries[ clueNumber ].currentCandidate = candidateNumber;

    const word = entries[ clueNumber ].word;
    const direction = entries[ clueNumber ].direction;
    const row = entries[ clueNumber ].row;
    const col = entries[ clueNumber ].col;
    const start = entries[ clueNumber ].start;
    const end = entries[ clueNumber ].end;
    const candidate = candidates[ candidateNumber ];

    if( autofilling ) {
	//logWithLevel("tryCandidates", level, "'" + word + "' evaluating candidate = '" + candidate + "'");

	autofillStats.incrementNumberCandidatesTried();
	// Actually fill in the grid with 'candidate'
	const wordInfo = getWordAndIndicesAt( row, col, direction, false );
	entries[ clueNumber ].previousWord = wordInfo[ 0 ];
	fillGridWithMatchAux( candidate, direction, row, col, start, end );

	// TODO: recalculate entries so we now have the current number
	// of candidates for each entry (since we may have recently
	// filled in the grid and reduced the number of candidates for
	// an entry). Try the next clue number

	window.setTimeout( autofillJS.bind( null, entries, clueNumber+1, autofillStats, level+1 ), 0 );
    }
    return;
}

let autofilling = false;
