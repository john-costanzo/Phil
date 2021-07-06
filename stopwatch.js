// Stopwatch implementation
// See https://stackoverflow.com/questions/1210701/compute-elapsed-time/1210726
// and https://stackoverflow.com/questions/9763441/milliseconds-to-time-in-javascript/9763769

function Test() {
    var s1 = new StopWatch();
    s1.Start();
    // Do something.
    for( let i=0; i<100000; i++ )
	for( let j=0; j<100000; j++ ) {
	    let k=Math.sin( i*j ) + Math.cos( i*j );
	}
    s1.Stop();
    alert( s1.elapsedTime() );
    alert( s1.elapsedSeconds() );
}

/**
 * Convert (milli)seconds to time string (hh:mm:ss[:mss]).
 *
 * @param Boolean isSec  whether the number is interpreted as seconds
 *
 * @return String
 */
Number.prototype.toTime = function(isSec) {
    var ms = isSec ? this * 1e3 : this,
        lm = ~(4 * !!isSec),  /* limit fraction */
        fmt = new Date(ms).toISOString().slice(11, lm);

    if (ms >= 8.64e7) {  /* >= 24 hours */
        var parts = fmt.split(/:(?=\d{2}:)/);
        parts[0] -= -24 * (ms / 8.64e7 | 0);
        return parts.join(':');
    }

    return fmt;
};

////////////////////////////////////////////////////////////////////////
// Create a stopwatch "class."
StopWatch = function() {
    this.StartMilliseconds = 0;
    this.ElapsedMilliseconds = 0;
}

StopWatch.prototype.Start = function() {
    this.StartMilliseconds = new Date().getTime();
    this.ElapsedMilliseconds = 0;
}

StopWatch.prototype.Current = function() {
    if( this.ElapsedMilliseconds ) // the timer has been stopped; use this value
	return( this.ElapsedMilliseconds );
    else
	return( new Date().getTime() - this.StartMilliseconds );
}

StopWatch.prototype.Stop = function() {
    this.ElapsedMilliseconds = new Date().getTime() - this.StartMilliseconds;
}

StopWatch.prototype.Reset = function() {
    this.Start();
    this.ElapsedMilliseconds = 0;
}

StopWatch.prototype.elapsedTime = function() {
    return( this.Current().toTime() );
}
////////////////////////////////////////////////////////////////////////
