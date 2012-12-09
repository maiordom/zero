<?php
$files = Array(
    "zero.plot.js",
    "zero.col.js",
    "zero.line.js",
    "zero.init.js",
    "zero.generate.js"
);

function createBundle( $files, $bundle ) {
    $file_str = "";

    for ( $i = 0, $ilen = count( $files ); $i < $ilen; $i++ ) {
        $file_str .= file_get_contents( "js/src/". $files[ $i ] ) . "\r\n\r\n";
    }

    $file_str = preg_replace( "/window/", "global", $file_str );

    $file_handle = fopen( $bundle, "w+" );
    fwrite( $file_handle, "(function( global ) {\r\n" );
    fwrite( $file_handle, $file_str );
    fwrite( $file_handle, "})( window );" );
    fclose( $file_handle );
}

function getBundle() {
    header( "HTTP/1.0 200 OK" );
    header( "Content-Type: application/javascript" );
    echo file_get_contents( "js/zero.js" );
}

function route( $files ) {
    createBundle( $files, "js/zero.js" );
    getBundle();
}

route( $files );