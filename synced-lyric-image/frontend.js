( function () {
	var HOLD = 9; // 一句歌词最长停留秒数（防止长间奏时残留）

	function fmt( s ) {
		if ( ! isFinite( s ) ) return '0:00';
		var m = Math.floor( s / 60 ), ss = Math.floor( s % 60 );
		return m + ':' + ( ss < 10 ? '0' : '' ) + ss;
	}

	function init( fig ) {
		if ( fig.dataset.sylInit ) return;
		fig.dataset.sylInit = '1';

		var cfg;
		try { cfg = JSON.parse( fig.dataset.config ); } catch ( e ) { return; }

		var audio  = fig.querySelector( '.syl-audio' );
		var bands  = fig.querySelectorAll( '.syl-band' );
		var gap    = fig.querySelector( '.syl-gap' );
		var btn    = fig.querySelector( '.syl-btn' );
		var bar    = fig.querySelector( '.syl-bar' );
		var fill   = fig.querySelector( '.syl-fill' );
		var cur    = fig.querySelector( '.syl-cur' );
		var dur    = fig.querySelector( '.syl-dur' );
		var stage  = fig.querySelector( '.syl-stage' );

		var cues = cfg.cues, rows = cfg.rows;
		var natW = 0, natH = 0, active = -2, flip = 0;
		var trimMap = null; // 每条行带的墨迹横向范围 [x0%, x1%]

		var im = new Image();
		im.onload = function () {
			natW = im.naturalWidth; natH = im.naturalHeight;
			computeTrim();
			active = -2;
		};
		im.src = cfg.image;

		// 用 canvas 扫描每条行带内的墨迹像素，自动收紧左右空白
		function computeTrim() {
			try {
				var cv = document.createElement( 'canvas' );
				cv.width = natW; cv.height = natH;
				var cx = cv.getContext( '2d', { willReadFrequently: true } );
				cx.drawImage( im, 0, 0 );
				var data = cx.getImageData( 0, 0, natW, natH ).data;
				trimMap = rows.map( function ( r ) {
					var y0 = Math.floor( r[ 0 ] / 100 * natH ),
						y1 = Math.ceil( r[ 1 ] / 100 * natH );
					var minX = natW, maxX = -1;
					for ( var y = y0; y < y1; y++ ) {
						var off = y * natW * 4;
						for ( var x = 0; x < natW; x++ ) {
							var i = off + x * 4, a = data[ i + 3 ];
							if ( a < 40 ) continue; // 透明底
							var lum = ( data[ i ] * 299 + data[ i + 1 ] * 587 + data[ i + 2 ] * 114 ) / 1000;
							if ( a > 200 && lum > 200 ) continue; // 不透明白纸
							if ( x < minX ) minX = x;
							if ( x > maxX ) maxX = x;
						}
					}
					if ( maxX < 0 ) return null;
					var pad = natW * 0.015;
					return [
						Math.max( 0, ( minX - pad ) / natW * 100 ),
						Math.min( 100, ( maxX + pad ) / natW * 100 )
					];
				} );
			} catch ( e ) { trimMap = null; } // 跨域等情况下退回整宽
		}

		function geom( r0, r1 ) {
			var y0 = rows[ r0 ][ 0 ], y1 = rows[ r1 ][ 1 ], x0 = 100, x1 = 0;
			for ( var i = r0; i <= r1 && i < rows.length; i++ ) {
				var explicit = rows[ i ][ 2 ] > 0 || rows[ i ][ 3 ] < 100;
				var rx = explicit
					? [ rows[ i ][ 2 ], rows[ i ][ 3 ] ]
					: ( trimMap && trimMap[ i ] ) || [ 0, 100 ];
				x0 = Math.min( x0, rx[ 0 ] );
				x1 = Math.max( x1, rx[ 1 ] );
			}
			return { y0: y0, y1: y1, x0: x0, x1: x1 };
		}

		function layout( el, g ) {
			var W = stage.clientWidth;
			if ( ! W || ! natW ) return;
			var H = W * natH / natW;
			el.style.width = ( ( g.x1 - g.x0 ) / 100 * W ) + 'px';
			el.style.height = ( ( g.y1 - g.y0 ) / 100 * H ) + 'px';
			el.style.backgroundImage = 'url("' + cfg.image + '")';
			el.style.backgroundSize = W + 'px ' + H + 'px';
			el.style.backgroundPosition =
				'-' + ( g.x0 / 100 * W ) + 'px -' + ( g.y0 / 100 * H ) + 'px';
		}

		function render() {
			var t = audio.currentTime, idx = -1;
			for ( var i = 0; i < cues.length; i++ ) {
				if ( cues[ i ][ 0 ] <= t ) idx = i; else break;
			}
			if ( idx >= 0 ) {
				var next = idx + 1 < cues.length ? cues[ idx + 1 ][ 0 ] : Infinity;
				if ( t > Math.min( next, cues[ idx ][ 0 ] + HOLD ) ) idx = -1;
			}

			if ( idx !== active ) {
				if ( idx >= 0 ) {
					var incoming = bands[ flip ], outgoing = bands[ 1 - flip ];
					layout( incoming, geom( cues[ idx ][ 1 ], cues[ idx ][ 2 ] ) );
					incoming.classList.add( 'on' );
					outgoing.classList.remove( 'on' );
					flip = 1 - flip;
				} else {
					bands[ 0 ].classList.remove( 'on' );
					bands[ 1 ].classList.remove( 'on' );
				}
				gap.classList.toggle( 'on', idx === -1 && t > 2 && ! audio.paused );
				active = idx;
			}

			if ( audio.duration ) {
				fill.style.width = ( audio.currentTime / audio.duration * 100 ) + '%';
				cur.textContent = fmt( audio.currentTime );
				dur.textContent = fmt( audio.duration );
			}
			requestAnimationFrame( render );
		}
		requestAnimationFrame( render );

		btn.addEventListener( 'click', function () {
			audio.paused ? audio.play() : audio.pause();
		} );
		audio.addEventListener( 'play',  function () { fig.classList.add( 'playing' ); } );
		audio.addEventListener( 'pause', function () { fig.classList.remove( 'playing' ); } );
		bar.addEventListener( 'click', function ( e ) {
			var r = bar.getBoundingClientRect();
			if ( audio.duration ) audio.currentTime = ( e.clientX - r.left ) / r.width * audio.duration;
		} );
		window.addEventListener( 'resize', function () { active = -2; } );
	}

	function boot() {
		document.querySelectorAll( '.syl[data-config]' ).forEach( init );
	}
	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', boot );
	} else {
		boot();
	}
} )();
