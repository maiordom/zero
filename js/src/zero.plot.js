Zero = {};
Zero.Plot = function( node, config ) {
    var wOrig, hOrig, w, h, yScale, svg, colsBlock,
        charts = [], axis = {},
        margin = { left: 35, top: 100, right: 130, bottom: 150 };

    function init() {
        setParams( config.width, config.height );
        setScale();
        drawCtx();
        drawYAxis();
        drawXAxis();
        drawHelper();
        readSeries();
        charts[ charts.length - 1 ].on( "draw", onDrawLastCol );
    }

    function setParams( width, height ) {
        wOrig = width;
        hOrig = height;
        w = width  - ( margin.right + margin.left );
        h = height - ( margin.top   + margin.bottom );
    }

    function setScale() {
        yScale = d3.scale.linear().domain( [ config.min, config.max ] ).range( [ 0, h ] );
    }

    function xOffset( i ) {
        return 2 * ( 2 * i + 1 );
    }

    function drawCtx() {
        var plot = d3.select( node );
        svg = plot.append( "svg" ).attr({
            "class": "svg",
            width: config.width,
            height: config.height
        });
    }

    function drawYAxis() {
        axis.y = svg.append( "g" ).attr({
            "class": "axis y",
            transform: "translate(" + margin.left + "," + ( h + margin.top ) + ")"
        });

        axis.yPath = axis.y.append( "path" ).attr( "d", "M0,0 H" + w );

        var x;

        forEach( config.axisX.ticks, function( item, i ) {
            x = xOffset( i ) * 30 + xOffset( i );
            axis.y.append( "line" ).attr( { x1: x, y1: 0, x2: x, y2: 4 } );
            axis.y.append( "text" ).text( item ).attr( { x: x + 3, y: 17 } );
        });
    }

    function onDrawLastCol( nodes ) {
        var transform, coords = [], box;

        transform = "translate(" + ( margin.left + w ) + "," + margin.top + ")";

        axis.yHelpers = svg.append( "g" ).attr({
            class: "axis-helpers",
            transform: transform
        });

        nodes[ 0 ].reverse();

        console.log( nodes.node(0) );

        nodes.each( function( d, i ) {
            box = d3.select( this ).node().getBBox();
            box.y += 10;
            coords.push( box );
        });

        forEach( coords, function( item, i ) {
            if ( i > 0 ) {
                if ( coords [ i ].y - coords[ i - 1 ].y < 15 ) {
                    coords [ i ].y = coords[ i - 1 ].y + 15;
                }
            }
        });

        nodes.each( function( d, i ) {
            axis.yHelpers
                .append( "text" )
                .text( config.axisY.helpers[ i ] )
                .attr( { y: coords[ i ].y, x: 10 } );
        });

        console.log( )
    }

    function drawXAxis() {
        axis.x = svg.append( "g" ).attr({
            "class": "axis x",
            transform: "translate(" + ( margin.left - 1 )+ "," + margin.top + ")"
        });

        axis.xPath = axis.x.append( "path" ).attr( "d", "M0,0 V" + ( h + 1 ) );

        var value, y,
            size = config.axisY.tickSize,
            d = config.max / config.axisY.tickSize;

        iterate( 0, config.axisY.tickSize + 1, function( i ) {
            value = ( size - i ) * d / 1000;
            y = parseInt( yScale( i * d ) );
            axis.x.append( "line" ).attr( { x1: -4, y1: y, x2: 1, y2: y } );
            axis.x.append( "text" ).text( value ).attr( { "text-anchor": "end", x: -6, y: y + 4 } );
        });
    }

    function drawHelper() {
        colsBlock = svg.append( "g" ).attr({
            "class": "cols",
            transform: "translate(" + margin.left + "," + margin.top + ")"
        });
    }

    function readSeries() {
        forEach( config.series, function( item ) {
            switch ( item.type ) {
                case "col":  { drawCols( item.data ); } break;
                case "line": { drawLine( item.data ); } break;
            }
        });
    }

    function drawCols( data ) {
        var props, chartData, chart, index = -1, offset = 0;

        forEach( data, function( item, i ) {
            chartData = data[ i ].data;
            props = {
                h: h,
                w: w,
                yScale: yScale,
                title: data[ i ].title,
                colsBlock: colsBlock,
                data: chartData,
                locIndex: 0,
                index: ++index,
                offset: ++offset,
                time: getTimeByValue( chartData ),
                colors: config.colsColor
            };

            chart = Zero.Col( props );
            charts.push( chart );
        });
    }

    function drawLine( data ) {

    }

    function getTimeByValue( data ) {
        var max = 0;
        forEach( data, function( item, i ) {
            max += yScale( item );
        });

        return function( value ) {
            return 600 * value / max;
        }
    }

    init();

    return {

    };
};