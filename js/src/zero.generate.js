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
        var dates = [];

        iterate( 0, datesCount, function() {
            dates.push([
                mtRand( 50000, 155000 ),
                mtRand( 5000, 15000 ),
                mtRand( 5000, 15000 ),
                mtRand( 13000, 15000 )
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