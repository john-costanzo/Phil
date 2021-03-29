// Phil
// ------------------------------------------------------------------------
// Copyright 2017 Keiran King

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// ( https://www.apache.org/licenses/LICENSE-2.0 )

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
// ------------------------------------------------------------------------

var traceWordListSuggestions = false;
var traceWordListSuggestionsVerbose = false;
let maxGridSize = 21;

openDefaultWordlist( "WL-MirriamWebster9thCollegiate-SP.txt" )
//openDefaultWordlist( "https://raw.githubusercontent.com/keiranking/Phil/master/WL-SP.txt" );

//____________________
// F U N C T I O N S

function addToWordlist( newWords ) {
    for ( i = 0; i < newWords.length; i++ ) {
	const word = newWords[i].trim().toUpperCase();
	if ( word.length < wordlist.length ) { // Make sure we don't access outside the wordlist array
	    wordlist[word.length].push( word );
	}
    }
}

function sortWordlist() {
    for ( let i = 3; i < wordlist.length; i++ ) {
	wordlist[i].sort();
    }
}

function isObject( obj ) {
    // source: https://github.com/jashkenas/underscore/blob/master/underscore.js#L1320
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

function cloneObject( src ) {
    let target = {};
    for ( let prop in src ) {
	if ( src.hasOwnProperty( prop ) ) {
	    // if the value is a nested object, recursively copy all it's properties
	    if ( isObject( src[prop] ) ) {
		target[prop] = cloneObject( src[prop] );
	    } else {
		target[prop] = src[prop];
	    }
	}
    }
    return target;
}

function openWordlist() {
    document.getElementById( "open-wordlist-input" ).click();
}

function intializeWordlist( n ) {
    // Initial the wordlist structure to contain N+1 arrays
    wordlist = []
    for( i=0; i<=n; i++ ) {
	wordlist.push( [] );
    }
}

function openWordlistFile( e ) {
    intializeWordlist( maxGridSize );
    const file = e.target.files[0];
    if ( !file ) {
	return;
    }
    let reader = new FileReader();
    reader.onload = function( e ) {
	const words = e.target.result.split( /\s/g );
	addToWordlist( words );
	sortWordlist();
	removeWordlistDuplicates();
	invalidateSolverWordlist();
    };
    reader.readAsText( file );
}

function openDefaultWordlist( url ) {
    intializeWordlist( maxGridSize );
    let textFile = new XMLHttpRequest();
    textFile.open( "GET", url, true );
    textFile.onreadystatechange = function() {
	if ( textFile.readyState === 4 && textFile.status === 200 ) {  // Makes sure the document is ready to parse, and it's found the file.
	    const words = textFile.responseText.split( /\s/g );
	    addToWordlist( words );
	    sortWordlist();
	    console.log( "Loaded words up to length " + wordlist.length + " from the default wordlist." )
	}
    }
    textFile.send( null );
}

function removeWordlistDuplicates() {
    for ( let i = 3; i < wordlist.length; i++ ) {
	if ( wordlist[i].length >= 2 ) {
	    for ( let j = wordlist[i].length - 1; j >0; j-- ) {
		if ( wordlist[i][j] == wordlist[i][j - 1] ) {
		    wordlist[i].splice( j, 1 );
		}
	    }
	}
    }
}


function regexReplacer( match, p1, offset, string ) {
    // MATCH is the matched substring
    // P1 is the nth string found by a parenthesized capture group
    // OFFSET is the offset of the matched substring within the whole string being examined.
    //     ( For example, if the whole string was 'abcd', and the matched substring was 'bc', then this argument will be 1. )
    // STRING: The whole string being examined.
    let r = document.getElementById( "regex"+match ).value;
    if( r == "" ) {
	r = DASH;
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

function matchFromWordlist( word ) {
    const l = word.length;
    const actualLettersInWord = word.replace( /-/g, "" ).length;
    const wordContainsDigit = ( word.search( /\d/ ) >= 0 );
    let soe = document.getElementById( "suggest-on-empty" ).checked;
    if( soe && actualLettersInWord == 0 ) {
	return( wordlist[ l ] );
    }

    if( ( actualLettersInWord >= 1 && actualLettersInWord < l ) || wordContainsDigit ) { // Only search if word isn't completely blank or filled... or contains a digit
	if( useRegexPatterns ) word = replaceRegex( word );
	word = word.split( DASH ).join( "\\w" );
	const pattern = new RegExp( word );
	let matches = [];
	for ( let i = 0; i < wordlist[l].length; i++ ) {
	    if ( wordlist[l][i].search( pattern ) > -1 ) {
		matches.push( wordlist[l][i] );
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

    //if( traceWordListSuggestions ) console.log( "wordIsHarmonious( word=" + word + ", pos1=" + pos1 + ", words="+words + ", pos2=" + pos2 + " )" );
    if( words === undefined ) return( false );
    letter = word.substring( pos1, pos1+1 ).toUpperCase();
    //if( traceWordListSuggestions ) console.log( "letter = '" + letter + "'" );
    if( cache.has( letter ) ) {
	//if( traceWordListSuggestions ) console.log( "word '" + word + "' is harmonious ( cached )" );
	return( true );
    } else {
	for( i = 0; i < words.length; i++ ) {
	    //if( traceWordListSuggestionsVerbose ) console.log( "wordIsHarmonious: checking " + word + " vs. " + words[i] + " on letter '" + words[ i ].substring( pos2, pos2+1 ).toLowerCase() + "'" );
	    if( letter == words[ i ].substring( pos2, pos2+1 ) ) {
		cache.add( letter );
		//if( traceWordListSuggestions ) console.log( "word '" + word + "' is harmonious" );
		return( true );
	    }
	}
	//if( traceWordListSuggestions ) console.log( "word '" + word + "' is NOT harmonious" );
	return( false );
    }
}

function openWindowInBackground( url, target="", left, top, width=500, height=500 ) {
    // Open a new window, pointing to URL with TARGET.
    // Position it offset from the LEFT, TOP with WIDth and HEIGHT.
    makePopunder( url, target, width, height, left, top );
    // w = window.open( url, target, "width=" + width + ", height=" + height + ", left=" + left + ", top=" + top );
    // w.blur();
    // w.opener.focus();
    // window.focus();
}

var displayDefinitionDeferredTimer;  // This will hold a single timer for the deferred display of a definition.

function displayDefinitionDeferred( li ) {
    // Research the definition of LI element if research-clues is checked.
    if( document.getElementById( "research-clues" ).checked ) {
	var leftOffset = 400;
	var topOffset = 0;
	var hincr = 50;
	var vincr = 250;

	const word = li.innerHTML.toLowerCase();
	console.log( "displayDefinitionDeferred: '" + word + "'..." );
	openWindowInBackground( "http://crosswordtracker.com/answer/"+ word + "/?search_redirect=True", "crossword-tracker", 1, 1, 500, 1000 );

	// if( document.getElementById( "extra-research-clues" ).checked ) {
	//     openWindowInBackground( "https://www.merriam-webster.com/dictionary/" + word, "merriam-webster", leftOffset, topOffset, 500 );

	//     leftOffset += hincr;
	//     topOffset += vincr;
	//     openWindowInBackground( "https://translate.google.com/?source=osdd#auto|auto|" + word, "google-translate", leftOffset, topOffset );

	//     leftOffset += hincr;
	//     topOffset += vincr;
	//     openWindowInBackground( "https://www.google.com/search?q=define+" + word, "google-define", leftOffset, topOffset );
	// }
	li.focus();
	console.log( "displayDefinitionDeferred: '" + word + "'...finished" );
    }
}

function displayDefinition( e ) {
    // Research the definition of the word that is currently highlighted at some time in the future.

    console.log("displayDefinition!" + e );
    let deferalTime = 500;  // Time in future, measured in milliseconds
    clearTimeout( displayDefinitionDeferredTimer );
    const li = e.currentTarget;
    displayDefinitionDeferredTimer = setTimeout( displayDefinitionDeferred, deferalTime, li );
}

function researchCluesChecked( ) {
    // Called when the research-clues checkbox has been clicked.
    // If this was done to enable research, make the extra-research-clues checkbox active.
    // If not, make it inactive.
    // let rc = document.getElementById( "research-clues" );
    // let ex = document.getElementById( "extra-research-clues" );
    // let exLabel = document.getElementById( "extra-research-clues-label" );

    // if( rc.checked ) {
    // 	ex.disabled = false;
    // 	exLabel.classList.remove( "disabled-label" );
    // } else {
    // 	ex.disabled = true;
    // 	ex.checked = false;
    // 	exLabel.classList.add( "disabled-label" );
    // }
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

    //if( traceWordListSuggestions ) console.log( "primaryMatches=" + primaryMatches );
    //if( traceWordListSuggestions ) console.log( "secondaryMatches=" + secondaryMatches );
    //if( traceWordListSuggestions ) console.log( "primaryPos=" + primaryPos + ", current=" + current );

    let matchesDisplayed = 0;
    let runnersUp = [];  // The list of suggestions we'll make if we are asked to showOnlyRecommendations and there are none

    for( let p in primaryMatches ) {
	//if( traceWordListSuggestions ) console.log( "\t\t[" + p + "]=" + primaryMatches[p] );
	let primary = primaryMatches[p];
	if( primary !== undefined ) {
	    let li = document.createElement( "LI" );
	    li.innerHTML = primary.toLowerCase();
	    li.className = "";
	    li.addEventListener( 'click', displayDefinition );
	    li.addEventListener( 'dblclick', fillGridWithMatch );
	    let nHarmonious = 0;
	    let harmoniousAtIntersection = false;

	    // HARMONIOUSNESS_CHECK:
	    for( let s in secondaryMatches ) {
		let index = parseInt( s, 10 );
		let cache = new Set();

		// At this point, if secondaryMatches[index] is undefined, that means that the word is complete
		// and we ought to consider that the word is harmonious.
		if( secondaryMatches[index] == undefined ) {
		    nHarmonious++;
		} else {
		    let secondaryWord = secondaryMatches[index][0];
		    let secondaryStart = secondaryMatches[index][1];
		    let secondaryEnd = secondaryMatches[index][2];
		    //if( traceWordListSuggestions ) console.log( "checking secondaryMatches='"+ secondaryWord +"' [" + secondaryStart + "," + secondaryEnd + "]; index=" + index );
		    if( !wordIsHarmonious( primary, index, secondaryWord, current-secondaryStart, cache ) ) {
			//if( traceWordListSuggestions ) console.log( "failed HARMONIOUSNESS_CHECK" )
		    } else {
			nHarmonious++;
			if( index == primaryPos ) {
			    //if( traceWordListSuggestions ) console.log( "Setting harmoniousAtIntersection to true" );
			    harmoniousAtIntersection = true;
			}
		    }
		}
	    }
	    //if( traceWordListSuggestions ) console.log( "nHarmonious=" + nHarmonious + "; secondaryMatches.length=" + secondaryMatches.length );
	    if( nHarmonious == secondaryMatches.length ) {
		li.setAttribute( "class", "moderately-recommended" );
	    } else {
		if( harmoniousAtIntersection ) {
		    li.setAttribute( "class", "recommended" );
		}
	    }
	    if( !showOnlyRecommendations || ( nHarmonious == secondaryMatches.length ) ) {
		matchList.appendChild( li );
		matchesDisplayed++;
	    } else {
		runnersUp.push( li );
	    }
	}
    }

    if( !matchesDisplayed ) {  // We haven't display any matches so display them all
	runnersUp.forEach( 
	    function( li ) {
		matchList.appendChild( li )
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
    //if( traceWordListSuggestions ) console.log( "extractLetters returning [" + setContents + "]" );
    return( set );
}

function promoteSuggestions( candidates, class1, pos, set, class2 ) {
    // For each element in an array of CANDIDATES that is in the class CLASS1,
    // determine the letter at position POS. If that letter appears in SET, add the class CLASS2.
    //if( traceWordListSuggestions ) console.log( "promoteSuggestions: candidates=" + candidates + ", class1=" + class1 + ", pos=" + pos + ", class2=" + class2 );
    let descendents = candidates.getElementsByTagName( 'li' );
    for ( let i = 0; i < descendents.length; ++i ) {
	let li = descendents[ i ];
	let letter = li.textContent[ pos ];
	let hasClass1 = li.classList.contains( class1 );
	let letterInSet = set.has( letter );
	if( hasClass1 && set.has( letter ) ) {
	    //if( traceWordListSuggestions ) console.log( "promoteSuggestions: promoting \"" + li.textContent + "\"" );
	    li.setAttribute( "class", class2 );
	}
    }
}

function updateMatchesUI() {
    // 1. Mark suggested words with the "recommended" class when the word forms a valid word
    //    both across and down for words that intersect at the current square.
    // 2. Mark suggested words with the "highly-recommended" class when the word forms a valid word
    //    both across and down for *all* words that intersect the word.

    //  For example, with the following board and the cursor at the asterisk ( which is blank ):
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
    // Fill in suggestions for the first row ( A--- ) and the second column ( -X-- ).
    //
    // Suggested words for the first row ( A--- ) that match the cross character in the list of suggested words
    // for the second column ( -X-- ) are annotated with the class name "recommended".
    //
    // Suggested words for the first row ( A--- ) that match the cross character in the list of suggested words
    // for *all* intersecting columns ( -X--, --Y- ) are annotated with the class name "highly-recommended".
    //
    // Likewise for the other direction:
    //
    // Suggested words for the first column ( -X-- ) that match the cross character in the list of suggested words
    // for the first row ( A--- ) are annotated with the class name "recommended".
    //
    // Suggested words for the first column ( -X-- ) that match the cross character in the list of suggested words
    // for *all* intersecting rows ( A---, BX--, C-Y- and D--- ) are annotated with the class name "highly-recommended".
    //
    // Only consider words that are neither completely empty nor completely full.
    //
    // If showOnlyRecommendations is true, then show only highly-recommended matches. Unless there aren't any, then show all.

    console.log( "updateMatchesUI: entering" );
    let acrossMatchList = document.getElementById( "across-matches" );
    let downMatchList = document.getElementById( "down-matches" );
    acrossMatchList.innerHTML = "";
    downMatchList.innerHTML = "";
    //if( traceWordListSuggestions ) console.log( "showOnlyRecommendations=" + showOnlyRecommendations );
    let downWords = [];
    let acrossWords = [];

    //if( traceWordListSuggestions ) console.log( "updateMatchesUI: working on ACROSS direction" );
    //if( traceWordListSuggestions ) console.log( "updateMatchesUI: current.acrossStartIndex=" + current.acrossStartIndex + " current.acrossEndIndex=" + current.acrossEndIndex );
    for( let i = current.acrossStartIndex; i< current.acrossEndIndex; i++ ) {
	let wordInfo = getWordAndIndicesAt( current.row, i, DOWN, false );
	//if( traceWordListSuggestions ) { console.log( "word = " + wordInfo[0] + " [" + wordInfo[1] + ", " + wordInfo[2] + "]" ); }
	downWords.push( wordInfo );
	//if( traceWordListSuggestions ) console.log( "updateMatchesUI: pushing \"" + wordInfo[0] + "\"" );
    }

    //if( traceWordListSuggestions ) console.log( "updateMatchesUI: working on DOWN direction" );
    //if( traceWordListSuggestions ) console.log( "updateMatchesUI: current.downStartIndex=" + current.downStartIndex + " current.downEndIndex=" + current.downEndIndex );
    for( let i = current.downStartIndex; i< current.downEndIndex; i++ ) {
	let wordInfo = getWordAndIndicesAt( i, current.col, ACROSS, false );
	//if( traceWordListSuggestions ) { console.log( "word = " + wordInfo[0] + " [" + wordInfo[1] + ", " + wordInfo[2] + "]" ); }
	acrossWords.push( wordInfo );
	//if( traceWordListSuggestions ) console.log( "updateMatchesUI: pushing \"" + wordInfo[0] + "\"" );
    }

    let acrossMatches = [];
    let downMatches = [];

    for( let w of acrossWords ) {
	const actualLettersInWord = w[0].replace( /-/g, "" ).length;
	if( actualLettersInWord == w[0].length ) {
	    //if( traceWordListSuggestions ) console.log( "pushing <undefined> onto acrossMatches" );
	    acrossMatches.push( undefined );
	} else {
	    var words = matchFromWordlist( w[0] );
	    //if( traceWordListSuggestions ) console.log( "pushing " + words + " onto acrossMatches" );
	    acrossMatches.push( [words, w[1], w[2]] );
	}
    }

    for( let w of downWords ) {
	const actualLettersInWord = w[0].replace( /-/g, "" ).length;
	if( actualLettersInWord == w[0].length )  {
	    //if( traceWordListSuggestions ) console.log( "pushing <undefined> onto downMatches" );
	    downMatches.push( undefined );
	} else {
	    var words = matchFromWordlist( w[0] );
	    //if( traceWordListSuggestions ) console.log( "pushing " + words + " onto downMatches" );
	    downMatches.push( [words, w[1], w[2]] );
	}
    }
    let hpos = current.col - current.acrossStartIndex;
    let vpos = current.row - current.downStartIndex;

    //if( traceWordListSuggestions ) console.log( "Checking acrossMatches..." );
    checkHarmoniousness( document, matchFromWordlist( current.acrossWord ) , downMatches, hpos, current.row, acrossMatchList );
    //if( traceWordListSuggestions ) console.log( "Checking downMatches..." );
    checkHarmoniousness( document, matchFromWordlist( current.downWord ) , acrossMatches, vpos, current.col, downMatchList );

    // At this point, acrossMatchList and downMatchList contain HTML of suggestions. They are annotated with one of:
    //    "moderately-recommended" class ( if all letters of the word are harmonious with orthogonal words )
    //    "recommended" class ( if the single letter at the orthogonal intersection matches, but not all words )
    //    no class ( otherwise )
    // But some of these "moderately-recommended" entries may actually be harmonious with all "moderately-recommended" words.
    // Examine all "moderately-recommended" entries and mark them "highly-recommended" if they are harmonious
    //if( traceWordListSuggestions ) console.log( "look at acrossMatchList and downMatchList..." );
    let am = document.getElementById( "across-matches" ).querySelectorAll( ".moderately-recommended" );
    let dm = document.getElementById( "down-matches" ).querySelectorAll( ".moderately-recommended" );
    //if( traceWordListSuggestions ) console.log( "across-matches=" + am );
    //if( traceWordListSuggestions ) console.log( "down-matches=" + dm );
    let acrossModeratelyRecommendedLetters = extractLetters( am, hpos );
    let downModeratelyRecommendedLetters = extractLetters( dm, vpos );
    promoteSuggestions( document.getElementById( "across-matches" ), "moderately-recommended", hpos, downModeratelyRecommendedLetters, "highly-recommended" );
    promoteSuggestions( document.getElementById( "down-matches" ), "moderately-recommended", vpos, acrossModeratelyRecommendedLetters, "highly-recommended" );
    console.log( "updateMatchesUI: exiting" );
}

function fillGridWithMatch( e ) {
    const li = e.currentTarget;
    const fill = li.innerHTML.toUpperCase();
    const dir = ( li.parentNode.id == "across-matches" ) ? ACROSS : DOWN;

    clearTimeout( displayDefinitionDeferredTimer );
    saveStateForUndo( fill );
    emptyRedoState();

    if ( dir == ACROSS ) {
	xw.fill[current.row] = xw.fill[current.row].slice( 0, current.acrossStartIndex ) + fill + xw.fill[current.row].slice( current.acrossEndIndex );
	for ( let i = current.acrossStartIndex; i < current.acrossEndIndex; i++ ) {
	    const square = grid.querySelector( '[data-row="' + current.row + '"]' ).querySelector( '[data-col="' + i + '"]' );
	    square.lastChild.innerHTML = fill[i - current.acrossStartIndex];
	}
    } else {
	for ( let j = current.downStartIndex; j < current.downEndIndex; j++ ) {
	    xw.fill[j] = xw.fill[j].slice( 0, current.col ) + fill[j - current.downStartIndex] + xw.fill[j].slice( current.col + 1 );
	    const square = grid.querySelector( '[data-row="' + j + '"]' ).querySelector( '[data-col="' + current.col + '"]' );
	    square.lastChild.innerHTML = fill[j - current.downStartIndex];
	}
    }
    isMutated = true;
    console.log( "Filled '" + li.innerHTML + "' going " + dir );
    // updateActiveWords();
    // updateMatchesUI();
    updateUI();
    grid.focus();
}
