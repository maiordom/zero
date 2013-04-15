(function( global ) {
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

Zero.Col = function( props, config ) {
    var event = {}, col, h = props.h, yScale = props.yScale;

    function init() {
        drawColBlock();
        drawCol( props );
        bindEvents();
    }

    function on( eventName, callback ) {
        event[ eventName ] = callback;
    }

    function drawColBlock() {
        col = props.colsBlock.append( "g" ).attr( "class", "cols-item" );
    }

    function drawCol( props ) {
        var value = props.data[ props.locIndex ], border = h;

        iterate( 0, props.locIndex, function( i ) {
            border -= yScale( props.data[ i ] );
        });

        props.border = border;
        props.colHeight = yScale( value );
        props.mc = props.time( props.colHeight );

        drawColItem( props );

        if ( props.locIndex++ < props.data.length - 1 ) {
            setTimeout( function() {
                drawCol( props );
            }, props.mc );
        } else {
            setTimeout( function() {
                event.draw ? event.draw( col.selectAll( "rect" ) ) : null;
            }, props.mc );
        }
    }

    function drawColItem( props ) {
        var attr = {
            width: 35,
            x: 35 * props.index + props.offset,
            y: props.border - props.colHeight,
            fill: props.colors[ props.locIndex ]
        };

        col
            .append( "rect" )
            .attr( attr )
            .transition()
            .ease( "linear" )
            .tween( "custom", getTween( props.border, props.colHeight ) )
            .duration( props.mc )
            .attr( "height", props.colHeight );
    }

    function getTween( border, colHeight ) {
        return function tween() {
            return function( t ) {
                d3.select( this ).attr( { y: border - colHeight * t  } );
            }
        }
    }

    function bindEvents() {
        col
            .on( "mouseover", onColMouseEnter )
            .on( "mouseout",  onColMouseOut );
    }

    function onColMouseEnter() {
        col.style( "opacity", 0.7 );
    }

    function onColMouseOut() {
        col.style( "opacity", 1 );
    }

    init();

    return {
        on: on
    };
};

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

Zero.Init = function() {
    var data, config;

    data = Zero.Generate();

    config = {
        min: 2000,
        max: 200000,
        colsColor: [ "#00acf2", "#8a8a8a", "#bdf700", "#ca1300" ],
        axisX: {
            ticks: data.axisXTicks,
            helpers: [ "Удаленных", "Без фото", "Заблок.", "Нормальных" ]
        },
        axisY: {
            tickSize: 5,
            helpers: [ "Удаленные", "Без фото", "Заблокированные", "Нормальные" ]
        },
        width: 1031,
        height: 510,
        title: {
            text: "состав группы"
        },
        subtitle: {
            text: ", тысячи человек"
        },
        series: [{
            type: "col",
            data: data.col
        }, {
            type: "line",
            data: data.line
        }]
    };

    console.log( data );

    Plot = Zero.Plot( document.getElementById( "zero-1" ), config );
};

forEach = function( obj, callback, ctx ) {
    for ( var i = 0; i < obj.length; i++ ) {
        if ( callback.call( ctx || obj[ i ], obj[ i ], i ) === false ) { break; };
    }
};

iterate = function( start, end, callback ) {
    for ( ; start < end; start++ ) {
        if ( callback.call( null, start ) === false ) { break; };
    }
};

Zero.Generate = function() {
    var loc, oneDateMc, Plot, date, weeksCount, monthsCount, datesCount;

    monthsCount = 6;
    weeksCount  = 4;
    datesCount  = 7;
    oneDateMc   = 24 * 60 * 60 * 1000;

    date = new Date();
    date.setMonth( 0 );
    date.setHours( 0, 0, 0, 0 );
    date.setDate( 0 );

    loc = {
        dayNamesShort: [ "Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс" ],
        monthNames: [ "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь" ]
    };

    function mtRand( min, max ) {
        var range = max - min + 1;
        return Math.floor( Math.random() * range ) + min;
    }

    function getNextDate() {
        setNextDate();
        return getFormatDate();
    }

    function setNextDate() {
        date.setTime( date.getTime() + oneDateMc );
    }

    function getFormatDate() {
        var month = date.getMonth() + 1;
        return date.getDate() + "." + ( month < 10 ? "0" + month : month ) + "." + date.getFullYear();
    }

    function getWeekTitle() {
        var month = date.getMonth() + 1,
            dateNumber = date.getDate() - 6;

        month = month < 10 ? "0" + month : month
        return dateNumber + "." + month + "-" + ( dateNumber + 6 ) + "." + month + "." + date.getFullYear();
    }

    function setNextMonth() {
        date.setMonth( date.getMonth() + 1 );
        date.setHours( 0, 0, 0, 0 );
        date.setDate( 0 );
    }

    function getWeekData( dates ) {
        var week = {
            data: [ 0, 0, 0, 0 ]
        };

        forEach( dates, function( item, i ) {
            week.data[ 0 ] += item[ 0 ];
            week.data[ 1 ] += item[ 1 ];
            week.data[ 2 ] += item[ 2 ];
            week.data[ 3 ] += item[ 3 ];
        });

        week.data[ 0 ] = Math.floor( week.data[ 0 ] / dates.length );
        week.data[ 1 ] = Math.floor( week.data[ 1 ] / dates.length );
        week.data[ 2 ] = Math.floor( week.data[ 2 ] / dates.length );
        week.data[ 3 ] = Math.floor( week.data[ 3 ] / dates.length );

        week.title = getWeekTitle();

        return week;
    }

    function generateDates() {
        var dates = [], data = [];

        data = [
            mtRand( 50000, 155000 ),
            mtRand( 5000, 15000 ),
            mtRand( 5000, 15000 ),
            mtRand( 13000, 15000 )
        ];

        iterate( 0, datesCount, function( i ) {
            dates.push([
                data[ 0 ],
                data[ 1 ] + mtRand( -3000, 3000 ),
                data[ 2 ] + mtRand( -3000, 3000 ),
                data[ 3 ] + mtRand( -3000, 3000 )
            ]);
            setNextDate();
        });

        return dates;
    }

    function generateSeriesData() {
        var month, week, dates, arr;

        arr = {
            line: [],
            col: [],
            axisXTicks: []
        };

        iterate( 0, monthsCount, function() {
            iterate( 0, weeksCount, function() {
                dates = generateDates();
                week  = getWeekData( dates );
                arr.col.push( week );
                arr.line = arr.line.concat( dates );
            });
            arr.axisXTicks.push( loc.monthNames[ date.getMonth() ] );
            setNextMonth();
        });

        return arr;
    }

    function modifyWeek( week ) {
        var val = 200000 / 4;
        week.data = [ val, val, val, val ];
    }

    return generateSeriesData();
};

})( window );