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
            }, props.mc + 100 );
        }
    }

    function drawColItem( props ) {
        var attr = {
            width: 30,
            x: 30 * props.index + props.offset,
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