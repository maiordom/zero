Zero = {};
Zero.Plot = function( node, config ) {
    var wOrig, hOrig, w, h, yScale, svg, colsBlock,
        charts = {}, axis = {},
        margin = { left: 35, top: 100, right: 130, bottom: 150 };

    function init() {
        setParams( config.width, config.height );
        setScale();
        drawCtx();
        drawYAxis();
        drawXAxis();
        drawHelper();
        readSeries();
        charts.col[ charts.col.length - 1 ].on( "draw", drawLegends );
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
            x = xOffset( i ) * 35 + xOffset( i );
            axis.y.append( "line" ).attr( { x1: x, y1: 0, x2: x, y2: 4 } );
            axis.y.append( "text" ).text( item ).attr( { x: x + 3, y: 17 } );
        });
    }

    function drawLegends( nodes ) {
        var transform, coords = [], colItems = [], item;

        transform = "translate(" + ( margin.left + w + 10 ) + "," + margin.top + ")";
        axis.legends = svg.append( "g" ).attr( { "class": "legends", transform: transform } );

        nodes.each( function( d, i ) {
            item = axis.legends
                .append( "g" )
                .attr( { transform: "translate(0," + ( i * 15 ) + ")" } );

            item
                .append( "text" )
                .text( config.axisY.helpers[ i ] )
                .attr( { x: 20 } );

            item
                .append( "path" )
                .attr( { transform: "translate(0, -3)", d: "M0,0 H15", stroke: config.colsColor[ nodes[ 0 ].length - i - 1 ] } );
        });
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
        var transform = "translate(" + margin.left + "," + margin.top + ")";
        colsBlock = svg.append( "g" ).attr( { "class": "cols", transform: transform } );
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
        var props, chartData, chart, index = -1, offset = 0; charts.col = [];

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
            charts.col.push( chart );
        });
    }

    function drawLine( data ) {
        var props = { svg: svg, min: config.min, max: config.max, margin: margin, h: h, w: w };

        charts.line = Zero.Line( data, props );
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