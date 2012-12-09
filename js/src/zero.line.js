Zero.Line = function( data, config ) {
    var timeInterval, line, path, lineData = [];

    function init() {
        setLine();
        createNodes();
        drawLine();
        bindEvents();
    }

    function setLine() {
        var xScale = d3.scale.linear().domain( [ 0, config.w ] ).range( [ 0, config.w ] ),
            yScale = d3.scale.linear().domain( [ config.min, config.max ] ).range( [ config.h, 0 ] );

        line = d3.svg.line()
            .x( function( d, i ) { return xScale( i * config.w / data.length ); } )
            .y( function( d, i ) { return yScale( getSum( d ) ); } );
    }

    function createNodes() {
        var blockTransform = "translate(" + ( config.margin.left + 1 ) + "," + config.margin.top + ")";

        var block = config.svg
            .append( "g" )
            .attr( { "class": "line", transform: blockTransform } );

        path = block.append( "path" ).attr( { "class": "line-path" } );
    }

    function getSum( data ) {
        var sum = 0;
        forEach( data, function( item, i ) {
            sum += item;
        });

        return sum;
    }

    function drawLine() {
        var i = 0;
        timeInterval = setInterval( function() {
            if ( i < data.length ) {
                lineData.push( data[ i++ ] );
                path.attr( "d", line( lineData ) );
            } else {
                clearInterval( timeInterval )
            }
        }, 600 / data.length );
    }

    function bindEvents() {
        path
            .on( "mouseover", onLineMouseOver )
            .on( "mouseout",  onLineMouseOut );
    }

    function onLineMouseOver() {

    }

    function onLineMouseOut() {

    }

    init();
};