// From https://stackoverflow.com/questions/43798404/how-to-create-a-popunder-code-or-how-it-works
function makePopunder( pUrl, pName, pWidth, pHeight, pPosX, pPosY ) {
    var _parent = ( top != self && typeof ( top["document"]["location"].toString()) === "string") ? top : self;
    var mypopunder = null;
    var pName = pName || ( Math["floor"](( Math["random"]() * 1000 ) + 1 ) );
    var pWidth = pWidth || window["innerWidth"];
    var pHeight = pHeight || window["innerHeight"];
    var pPosX = pPosX || window["screenX"];
    var pPosY = pPosY || window["screenY"];
    //console.log( "makePopunder: pWidth, pHeight, pPosX, pPosY=" + pWidth + " " + pHeight + " " + pPosX + " " + pPosY );
    var pWait = 3600;
    pWait = ( pWait * 1000 );
    var pCap = 50000;
    var todayPops = 0;
    var cookie = "_.mypopunder";
    var browser = function () {
        var n = navigator["userAgent"]["toLowerCase"]();
        var b = {
	    webkit: /webkit/ ["test"]( n ),
	    mozilla: (/mozilla/ ["test"]( n )) && (!/( compatible|webkit )/ ["test"]( n )),
	    chrome: /chrome/ ["test"]( n ),
	    msie: (/msie/ ["test"]( n )) && (!/opera/ ["test"]( n )),
	    firefox: /firefox/ ["test"]( n ),
	    safari: (/safari/ ["test"]( n ) && !(/chrome/ ["test"]( n ))),
	    opera: /opera/ ["test"]( n )
        };
        b["version"] = ( b["safari"]) ? ( n["match"](/.+(?:ri )[\\/: ]([\\d.]+)/) || [])[1] : ( n["match"](/.+(?:ox|me|ra|ie )[\\/: ]([\\d.]+)/) || [])[1];
        return b;
    }();

    function isCapped() {
	return false; // This application never wants to cap the number of pop unders
        try {
	    todayPops = Math["floor"]( document["cookie"]["split"]( cookie + "Cap=")[1]["split"](";")[0]);
        } catch ( err ) {};
        let todayCap = ( pCap <= todayPops );
	let noCookie =  ( document["cookie"]["indexOf"]( cookie + "=") !== -1 );
	return( todayCap || noCookie );
    };

    function doPopunder( pUrl, pName, pWidth, pHeight, pPosX, pPosY ) {
        if ( isCapped()) {
	    return;
        };
        var sOptions = "toolbar=no,scrollbars=yes,location=yes,statusbar=yes,menubar=no,resizable=1,width=" + pWidth.toString() + ",height=" + pHeight.toString() + ",screenX=" + pPosX + ",screenY=" + pPosY + ",left=" + pPosX + ",top=" + pPosY; // screen[XY] is incorrect!
	//              document["onclick"] = function ( e ) {
	// if ( isCapped() || window["pop_clicked"] == 1 || pop_isRightButtonClicked( e )) {
        //     //return;
	// };
	window["pop_clicked"] = 1;
	console.log( "doPopunder: about to open a window to '" + pUrl + "'" );
	console.log( "doPopunder: sOptions ='" + sOptions + "'" );
	mypopunder = _parent["window"]["open"]( pUrl, pName, sOptions );
	if ( mypopunder ) {
            var now = new Date();
            document["cookie"] = cookie + "=1;expires=" + new Date( now["setTime"]( now["getTime"]() + pWait ))["toGMTString"]() + ";path=/";
            now = new Date();
            document["cookie"] = cookie + "Cap=" + ( todayPops + 1 ) + ";expires=" + new Date( now["setTime"]( now["getTime"]() + ( 84600 * 1000 )))["toGMTString"]() + ";path=/";
            pop2under();
	};
	//              };
    };

    function pop2under() {
        try {
	    mypopunder["blur"]();
	    mypopunder["opener"]["window"]["focus"]();
	    window["self"]["window"]["blur"]();
	    window["focus"]();
	    if ( browser["firefox"]) {
                openCloseWindow();
	    };
	    if ( browser["webkit"]) {
                openCloseTab();
	    };
        } catch ( e ) {};
    };

    function openCloseWindow() {
	//console.log( "openCloseWindow: about to open a blank window" );
        var ghost = window["open"]("about:blank");
        ghost["focus"]();
        ghost["close"]();
    };

    function openCloseTab() {
        // var ghost = document["createElement"]("a");
        // ghost["href"] = "about:blank";
        // ghost["target"] = "PopHelper";
        // document["getElementsByTagName"]("body")[0]["appendChild"]( ghost );
        // ghost["parentNode"]["removeChild"]( ghost );
        // var clk = document["createEvent"]("MouseEvents");
        // clk["initMouseEvent"]("click", true, true, window, 0, 0, 0, 0, 0, true, false, false, true, 0, null );
        // ghost["dispatchEvent"]( clk );
	// console.log( "openCloseTab: about to open a blank tab" );
        let w=window["open"]("about:blank", "PopHelper");
        w["close"]();
    };

    function pop_isRightButtonClicked( e ) {
        var rightclick = false;
        e = e || window["event"];
        if ( e["which"]) {
	    rightclick = ( e["which"] == 3 );
        } else {
	    if ( e["button"]) {
                rightclick = ( e["button"] == 2 );
	    };
        };
        return rightclick;
    };
    if ( isCapped()) {
        return;
    } else {
        doPopunder( pUrl, pName, pWidth, pHeight, pPosX, pPosY );
    };
}
