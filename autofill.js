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
    console.log( "scoreWord: word=" + word + "; score=" + score );
    return( score );
}


function collectAll( clues, dict, direction ) {
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

	console.log( "toggleAutoFill: acrossDict:" );
	for( const [k,v] of Object.entries( acrossDict ) ) {
	    let m = "answer '" +  k + "' == " + v;
	    console.log( m );
	}

	console.log( "toggleAutoFill: downDict:" );
	for( const [k,v] of Object.entries( downDict ) ) {
	    let m = "answer '" +  k + "' == " + v;
	    console.log( m );
	}
	autofillJS( acrossDict, downDict, '1a', 1 );
    }
    updateUI();
}

function logWithLevel( tag, level, message ) {
    // Log a message, prefixed by TAG, then a colon.
    // Display LEVEL blanks and then the MESSAGE.
    console.log(tag + ": " + " ".repeat(level) + message );
}

function autofillJS( acrossDict, downDict, clue, level ) {
    // Autofill the puzzle starting at clue CLUENUM.
    // Print messages with LEVEL leading spaces
    logWithLevel("autofillJS", level, "attempting to fill, starting at clue number " + clue );
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
