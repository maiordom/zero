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
        width: 911,
        height: 410,
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