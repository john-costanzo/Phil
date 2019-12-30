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

var traceWordListSuggestions = false;
var traceWordListSuggestionsVerbose = false;
let noFurtherUndo = "No further undo information available";
let noFurtherRedo = "No further redo information available";

let wordlist = [
    [], [], [], [], [],
    [], [], [], [], [],
    [], [], [], [], [], []
];

openDefaultWordlist("https://raw.githubusercontent.com/keiranking/Phil/master/WL-SP.txt");

//____________________
// F U N C T I O N S

function addToWordlist(newWords) {
    for (i = 0; i < newWords.length; i++) {
	const word = newWords[i].trim().toUpperCase();
	if (word.length < wordlist.length) { // Make sure we don't access outside the wordlist array
	    wordlist[word.length].push(word);
	}
    }
}

function sortWordlist() {
    for (let i = 3; i < wordlist.length; i++) {
	wordlist[i].sort();
    }
}

function isObject(obj) {
    // source: https://github.com/jashkenas/underscore/blob/master/underscore.js#L1320
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

function cloneObject(src) {
    let target = {};
    for (let prop in src) {
	if (src.hasOwnProperty(prop)) {
	    // if the value is a nested object, recursively copy all it's properties
	    if (isObject(src[prop])) {
		target[prop] = cloneObject(src[prop]);
	    } else {
		target[prop] = src[prop];
	    }
	}
    }
    return target;
}

function openWordlist() {
    document.getElementById("open-wordlist-input").click();
}

function openWordlistFile(e) {
    wordlist = [
	[], [], [], [], [],
	[], [], [], [], [],
	[], [], [], [], [], []
    ];

    const file = e.target.files[0];
    if (!file) {
	return;
    }
    let reader = new FileReader();
    reader.onload = function(e) {
	const words = e.target.result.split(/\s/g);
	addToWordlist(words);
	sortWordlist();
	removeWordlistDuplicates();
	invalidateSolverWordlist();
    };
    reader.readAsText(file);
}

function openDefaultWordlist(url) {
    let textFile = new XMLHttpRequest();
    textFile.open("GET", url, true);
    textFile.onreadystatechange = function() {
	if (textFile.readyState === 4 && textFile.status === 200) {  // Makes sure the document is ready to parse, and it's found the file.
	    const words = textFile.responseText.split(/\s/g);
	    addToWordlist(words);
	    sortWordlist();
	    console.log("Loaded " + wordlist.length + " words from the default wordlist.")
	}
    }
    textFile.send(null);
}

function removeWordlistDuplicates() {
    for (let i = 3; i < wordlist.length; i++) {
	if (wordlist[i].length >= 2) {
	    for (let j = wordlist[i].length - 1; j >0; j--) {
		if (wordlist[i][j] == wordlist[i][j - 1]) {
		    wordlist[i].splice(j, 1);
		}
	    }
	}
    }
}


function regexReplacer( match, p1, offset, string ) {
    // MATCH is the matched substring
    // P1 is the nth string found by a parenthesized capture group
    // OFFSET is the offset of the matched substring within the whole string being examined.
    //     (For example, if the whole string was 'abcd', and the matched substring was 'bc', then this argument will be 1.)
    // STRING: The whole string being examined.
    let r = document.getElementById("regex"+match).value;
    if( r == "" ) {
	r = "-";
    } else {
	r = "(" + r + ")";
    }
    // console.log( "regexReplacer: working on regex" + match + " returing '" + r + "'" );
    return r;
}

function replaceRegex( word ) {
    // Replace digits in WORD with the corresponding regular expression pattern.
    // Return the ammended word.

    let newWord = word.replace( /\d/g, regexReplacer ).toUpperCase();
    // console.log( "newWord='" + newWord + "'" );
    return( newWord );
}

function matchFromWordlist(word) {
    const l = word.length;
    const actualLettersInWord = word.replace(/-/g, "").length;
    if (actualLettersInWord >= 1 && actualLettersInWord < l) { // Only search if word isn't completely blank or filled
	if( useRegexPatterns ) word = replaceRegex( word );
	word = word.split(DASH).join("\\w");
	const pattern = new RegExp(word);
	let matches = [];
	for (let i = 0; i < wordlist[l].length; i++) {
	    if (wordlist[l][i].search(pattern) > -1) {
		matches.push(wordlist[l][i]);
	    }
	}
	return matches;
    } else {
	return [];
    }
}

function wordIsHarmonious( word, pos1, words, pos2, cache ) {
    // Determines whether the letter in WORD at POS1 appears in
    // at least one word in WORDS at letter position POS2.
    // CACHE is a set of previously determined harmonious letters for the letter at POS1 in WORD.

    if( traceWordListSuggestions ) console.log( "wordIsHarmonious(word=" + word + ", pos1=" + pos1 + ", words="+words + ", pos2=" + pos2 + ")");
    if( words === undefined ) return( false );
    letter = word.substring( pos1, pos1+1 ).toLowerCase();
    if( traceWordListSuggestions ) console.log( "letter = '" + letter + "'" );
    if( cache.has(letter) ) {
	if( traceWordListSuggestions ) console.log( "word '" + word + "' is harmonious (cached)" );
	return( true );
    } else {
	for( i = 0; i < words.length; i++ ) {
	    if( traceWordListSuggestionsVerbose ) console.log( "wordIsHarmonious: checking " + word + " vs. " + words[i] + " on letter '" + words[ i ].substring( pos2, pos2+1 ).toLowerCase() + "'" );
	    if( letter == words[ i ].substring( pos2, pos2+1 ).toLowerCase() ) {
		cache.add( letter );
		if( traceWordListSuggestions ) console.log( "word '" + word + "' is harmonious" );
		return( true );
	    }
	}
	if( traceWordListSuggestions ) console.log( "word '" + word + "' is NOT harmonious" );
	return( false );
    }
}

function checkHarmoniousness( document, primaryMatches, secondaryMatches, primaryPos, current, matchList ) {
    // PRIMARYMATCHES contains an array suggestions that match the puzzle in one direction.
    // SECONDARYMATCHES contains suggestions that match the puzzle in the other direction.
    // SECONDARYMATCHES is an array of array of array of word,start,end. It contains a group of candidates
    // corresponding to each letter in the primary word.
    //
    // For the given DOCUMENT, add clues for PRIMARYMATCHES considering their relation to SECONDARYMATCHES
    // given that we are looking at character position PRIMARYPOS of the primary word and CURRENT-start for the secondary word.
    // Add the clues to MATCHLIST.
    
    // Annotate those clues as "recommended" if they are harmonious with at least one otherWayMatch.
    // Annotate those clues as "moderately-recommended" if they are harmonious with *all* secondaryMatches.

    // If showOnlyRecommendations, then only add moderately-recommended clues. Unless there aren't any,
    // in which case add them all.

    if( traceWordListSuggestions ) console.log( "primaryMatches=" + primaryMatches);
    if( traceWordListSuggestions ) console.log( "secondaryMatches=" + secondaryMatches);
    if( traceWordListSuggestions ) console.log( "primaryPos=" + primaryPos + ", current=" + current );

    let matchesDisplayed = 0;
    let runnersUp = [];  // The list of suggestions we'll make if we are asked to showOnlyRecommendations and there are none

    for( let p in primaryMatches ) {
	if( traceWordListSuggestions ) console.log( "\t\t[" + p + "]=" + primaryMatches[p] );
	let primary = primaryMatches[p];
	if( primary !== undefined ) {
	    let li = document.createElement("LI");
	    li.innerHTML = primary.toLowerCase();
	    li.className = "";
	    // li.addEventListener('click', printScore);
	    // li.addEventListener('mouseover', displayDefintion);   // perhaps one day...
	    li.addEventListener('dblclick', fillGridWithMatch);
	    let nHarmonious = 0;
	    let harmoniousAtIntersection = false;

	    // HARMONIOUSNESS_CHECK:
	    for( let s in secondaryMatches ) {
		let index = parseInt(s, 10);
		let cache = new Set();

		// At this point, if secondaryMatches[index] is undefined, that means that the word is complete
		// and we ought to consider that the word is harmonious.
		if( secondaryMatches[index] == undefined ) {
		    nHarmonious++;
		} else {
		    let secondaryWord = secondaryMatches[index][0];
		    let secondaryStart = secondaryMatches[index][1];
		    let secondaryEnd = secondaryMatches[index][2];
		    if( traceWordListSuggestions ) console.log( "checking secondaryMatches='"+ secondaryWord +"' [" + secondaryStart + "," + secondaryEnd + "]; index=" + index );
		    if( !wordIsHarmonious( primary, index, secondaryWord, current-secondaryStart, cache ) ) {
			if( traceWordListSuggestions ) console.log( "failed HARMONIOUSNESS_CHECK")
		    } else {
			nHarmonious++;
			if( index == primaryPos ) {
			    if( traceWordListSuggestions ) console.log( "Setting harmoniousAtIntersection to true" );
			    harmoniousAtIntersection = true;
			}
		    }
		}
	    }
	    if( traceWordListSuggestions ) console.log( "nHarmonious=" + nHarmonious + "; secondaryMatches.length=" + secondaryMatches.length );
	    if( nHarmonious == secondaryMatches.length ) {
		li.setAttribute("class", "moderately-recommended");
	    } else {
		if( harmoniousAtIntersection ) {
		    li.setAttribute("class", "recommended");
		}
	    }
	    if( !showOnlyRecommendations || ( nHarmonious == secondaryMatches.length )) {
		matchList.appendChild(li);
		matchesDisplayed++;
	    } else {
		runnersUp.push( li );
	    }
	}
    }

    if( !matchesDisplayed ) {  // We haven't display any matches so display them all
	runnersUp.forEach(
	    function(li) {
		matchList.appendChild(li)
	    }
	);
    }
}

function extractLetters( arr, pos ) {
    // From an array of elements, ARR, return the set of letters that appear at position POS.
    let set = new Set();
    for( const elt of arr ) {
	let text = elt.textContent;
	set.add( text[ pos ] );
    }
    let setContents = "";
    let sep = "";
    for( s of set.values() ) { setContents +=  sep + s; sep = ", ";  }
    if( traceWordListSuggestions ) console.log( "extractLetters returning [" + setContents + "]" );
    return( set );
}

function promoteSuggestions( candidates, class1, pos, set, class2 ) {
    // For each element in an array of CANDIDATES that is in the class CLASS1,
    // determine the letter at position POS. If that letter appears in SET, add the class CLASS2.
    if( traceWordListSuggestions ) console.log( "promoteSuggestions: candidates=" + candidates + ", class1=" + class1 + ", pos=" + pos + ", class2=" + class2 );
    let descendents = candidates.getElementsByTagName( 'li' );
    for (let i = 0; i < descendents.length; ++i ) {
	let li = descendents[ i ];
	let letter = li.textContent[ pos ];
	let hasClass1 = li.classList.contains( class1 );
	let letterInSet = set.has( letter );
	if( hasClass1 && set.has( letter ) ) {
	    if( traceWordListSuggestions ) console.log( "promoteSuggestions: promoting \"" + li.textContent + "\"" );
	    li.setAttribute("class", class2);
	}
    }
}

function updateMatchesUI() {
    // 1. Mark suggested words with the "recommended" class when the word forms a valid word
    //    both across and down for words that intersect at the current square.
    // 2. Mark suggested words with the "highly-recommended" class when the word forms a valid word
    //    both across and down for *all* words that intersect the word.

    //  For example, with the following board and the cursor at the asterisk (which is blank):
    //
    //       +---+---+---+---+
    //       | A | * |   |   |
    //       +---+---+---+---+
    //       | B | X |   |   |
    //       +---+---+---+---+
    //       | C |   | Y |   |
    //       +---+---+---+---+
    //       | D |   |   |   |
    //       +---+---+---+---+
    //
    // Fill in suggestions for the first row (A---) and the second column (-X--).
    //
    // Suggested words for the first row (A---) that match the cross character in the list of suggested words
    // for the second column (-X--) are annotated with the class name "recommended".
    //
    // Suggested words for the first row (A---) that match the cross character in the list of suggested words
    // for *all* intersecting columns (-X--, --Y-) are annotated with the class name "highly-recommended".
    //
    // Likewise for the other direction:
    //
    // Suggested words for the first column (-X--) that match the cross character in the list of suggested words
    // for the first row (A---) are annotated with the class name "recommended".
    //
    // Suggested words for the first column (-X--) that match the cross character in the list of suggested words
    // for *all* intersecting rows (A---, BX--, C-Y- and D---) are annotated with the class name "highly-recommended".
    //
    // Only consider words that are neither completely empty nor completely full.
    //
    // If showOnlyRecommendations is true, then show only highly-recommended matches. Unless there aren't any, then show all.

    console.log( "updateMatchesUI: entering" );
    let acrossMatchList = document.getElementById("across-matches");
    let downMatchList = document.getElementById("down-matches");
    acrossMatchList.innerHTML = "";
    downMatchList.innerHTML = "";
    if( traceWordListSuggestions ) console.log( "showOnlyRecommendations=" + showOnlyRecommendations );
    let downWords = [];
    let acrossWords = [];

    if( traceWordListSuggestions ) console.log( "updateMatchesUI: working on ACROSS direction" );
    if( traceWordListSuggestions ) console.log( "updateMatchesUI: current.acrossStartIndex=" + current.acrossStartIndex + " current.acrossEndIndex=" + current.acrossEndIndex );
    for( let i = current.acrossStartIndex; i< current.acrossEndIndex; i++ ) {
	let wordInfo = getWordAndIndicesAt(current.row, i, DOWN, false);
	if( traceWordListSuggestions ) { console.log( "word = " + wordInfo[0] + " [" + wordInfo[1] + ", " + wordInfo[2] + "]" ); }
	downWords.push( wordInfo );
	if( traceWordListSuggestions ) console.log( "updateMatchesUI: pushing \"" + wordInfo[0] + "\"" );
    }

    if( traceWordListSuggestions ) console.log( "updateMatchesUI: working on DOWN direction" );
    if( traceWordListSuggestions ) console.log( "updateMatchesUI: current.downStartIndex=" + current.downStartIndex + " current.downEndIndex=" + current.downEndIndex );
    for( let i = current.downStartIndex; i< current.downEndIndex; i++ ) {
	let wordInfo = getWordAndIndicesAt(i, current.col, ACROSS, false);
	if( traceWordListSuggestions ) { console.log( "word = " + wordInfo[0] + " [" + wordInfo[1] + ", " + wordInfo[2] + "]" ); }
	acrossWords.push( wordInfo );
	if( traceWordListSuggestions ) console.log( "updateMatchesUI: pushing \"" + wordInfo[0] + "\"" );
    }

    let acrossMatches = [];
    let downMatches = [];

    for( let w of acrossWords ) {
	const actualLettersInWord = w[0].replace(/-/g, "").length;
	if( actualLettersInWord == w[0].length ) {
	    if( traceWordListSuggestions ) console.log( "pushing <undefined> onto acrossMatches" );
	    acrossMatches.push( undefined );
	} else {
	    var words = matchFromWordlist( w[0] );
	    if( traceWordListSuggestions ) console.log( "pushing " + words + " onto acrossMatches" );
	    acrossMatches.push( [words, w[1], w[2]] );
	}
    }

    for( let w of downWords ) {
	const actualLettersInWord = w[0].replace(/-/g, "").length;
	if( actualLettersInWord == w[0].length )  {
	    if( traceWordListSuggestions ) console.log( "pushing <undefined> onto downMatches" );
	    downMatches.push( undefined );
	} else {
	    var words = matchFromWordlist( w[0] );
	    if( traceWordListSuggestions ) console.log( "pushing " + words + " onto downMatches" );
	    downMatches.push( [words, w[1], w[2]] );
	}
    }
    let hpos = current.col - current.acrossStartIndex;
    let vpos = current.row - current.downStartIndex;

    if( traceWordListSuggestions ) console.log("Checking acrossMatches...");
    checkHarmoniousness( document, matchFromWordlist( current.acrossWord ) , downMatches, hpos, current.row, acrossMatchList );
    if( traceWordListSuggestions ) console.log("Checking downMatches...");
    checkHarmoniousness( document, matchFromWordlist( current.downWord ) , acrossMatches, vpos, current.col, downMatchList );

    // At this point, acrossMatchList and downMatchList contain HTML of suggestions. They are annotated with one of:
    //    "moderately-recommended" class (if all letters of the word are harmonious with orthogonal words)
    //    "recommended" class (if the single letter at the orthogonal intersection matches, but not all words)
    //    no class (otherwise)
    // But some of these "moderately-recommended" entries may actually be harmonious with all "moderately-recommended" words.
    // Examine all "moderately-recommended" entries and mark them "highly-recommended" if they are harmonious
    if( traceWordListSuggestions ) console.log( "look at acrossMatchList and downMatchList..." );
    let am = document.getElementById("across-matches").querySelectorAll(".moderately-recommended");
    let dm = document.getElementById("down-matches").querySelectorAll(".moderately-recommended");
    if( traceWordListSuggestions ) console.log( "across-matches=" + am );
    if( traceWordListSuggestions ) console.log( "down-matches=" + dm );
    let acrossModeratelyRecommendedLetters = extractLetters( am, hpos );
    let downModeratelyRecommendedLetters = extractLetters( dm, vpos );
    promoteSuggestions( document.getElementById("across-matches"), "moderately-recommended", hpos, downModeratelyRecommendedLetters, "highly-recommended" );
    promoteSuggestions( document.getElementById("down-matches"), "moderately-recommended", vpos, acrossModeratelyRecommendedLetters, "highly-recommended" );
    console.log( "updateMatchesUI: exiting" );
}

function setUndoButton( state, tooltip ) {
    // Set Undo button's state to STATE
    console.log( "setUndoButton: setting state = " + state + ", tooltip=\"" + tooltip + "\"" );
    let undoButton = document.getElementById("undo");

    if( undoButton.getAttribute( "data-state" ) != state ) {
	console.log( "setUndoButton: toggling button-on" );
	undoButton.classList.toggle("button-on");
    }

    undoButton.setAttribute( "data-state",  state );
    undoButton.setAttribute( "data-tooltip", tooltip );
}

function setRedoButton( state, tooltip ) {
    // Set Redo button's state to STATE
    console.log( "setRedoButton: setting state = " + state + ", tooltip=\"" + tooltip + "\"" );
    let redoButton = document.getElementById("redo");

    if( redoButton.getAttribute( "data-state" ) != state ) {
	console.log( "setRedoButton: toggling button-on" );
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

	grid.focus();
    }
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

	grid.focus();
    }
}

function saveStateForUndo( label ) {
    // Take a snapshot of the current state and push it onto the (global) undoStack
    let undoContext = {};
    undoContext.xw = cloneObject( xw );
    undoContext.current = cloneObject( current );
    undoContext.label = label;
    undoStack.push( undoContext );
    setUndoButton( "on", "Undo latest grid change for \"" + label + "\"" );
}    

function saveStateForRedo( label ) {
    // Take a snapshot of the current state and push it onto the (global) redoStack
    let redoContext = {};
    redoContext.xw = cloneObject( xw );
    redoContext.current = cloneObject( current );
    redoContext.label = label;
    redoStack.push( redoContext );
    setRedoButton( "on", "Redo latest grid change for \"" + label + "\"" );
}    

function emptyRedoState(  ) {
    // Empty the (global) redoStack and set an appropriate tooltip.
    redoStack = [];
    setRedoButton( "off", noFurtherRedo );
}    

function fillGridWithMatch(e) {
    const li = e.currentTarget;
    const fill = li.innerHTML.toUpperCase();
    const dir = (li.parentNode.id == "across-matches") ? ACROSS : DOWN;

    saveStateForUndo( fill );
    emptyRedoState();
    
    if (dir == ACROSS) {
	xw.fill[current.row] = xw.fill[current.row].slice(0, current.acrossStartIndex) + fill + xw.fill[current.row].slice(current.acrossEndIndex);
	for (let i = current.acrossStartIndex; i < current.acrossEndIndex; i++) {
	    const square = grid.querySelector('[data-row="' + current.row + '"]').querySelector('[data-col="' + i + '"]');
	    square.lastChild.innerHTML = fill[i - current.acrossStartIndex];
	}
    } else {
	for (let j = current.downStartIndex; j < current.downEndIndex; j++) {
	    xw.fill[j] = xw.fill[j].slice(0, current.col) + fill[j - current.downStartIndex] + xw.fill[j].slice(current.col + 1);
	    const square = grid.querySelector('[data-row="' + j + '"]').querySelector('[data-col="' + current.col + '"]');
	    square.lastChild.innerHTML = fill[j - current.downStartIndex];
	}
    }
    isMutated = true;
    console.log("Filled '" + li.innerHTML + "' going " + dir);
    // updateActiveWords();
    // updateMatchesUI();
    updateUI();
    grid.focus();
}
