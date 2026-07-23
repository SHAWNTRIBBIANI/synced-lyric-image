<?php
/**
 * Plugin Name: 同步歌词图片 Synced Lyric Image
 * Description: 一个古腾堡区块：音频播放时，歌词图片按行随时间轴淡入淡出。
 * Version: 1.0.0
 * Author: tongchun
 */

if ( ! defined( 'ABSPATH' ) ) exit;

/**
 * 解析行带配置：每行 "y0 y1 [x0 x1]"（百分比）
 * 返回 [[y0, y1, x0, x1], ...]
 */
function syl_parse_rows( $text ) {
	$rows = array();
	foreach ( preg_split( '/\r?\n/', trim( (string) $text ) ) as $line ) {
		$line = trim( $line );
		if ( '' === $line ) continue;
		$p = preg_split( '/[\s,]+/', $line );
		if ( count( $p ) < 2 || ! is_numeric( $p[0] ) || ! is_numeric( $p[1] ) ) continue;
		$rows[] = array(
			floatval( $p[0] ),
			floatval( $p[1] ),
			isset( $p[2] ) && is_numeric( $p[2] ) ? floatval( $p[2] ) : 0,
			isset( $p[3] ) && is_numeric( $p[3] ) ? floatval( $p[3] ) : 100,
		);
	}
	return $rows;
}

/**
 * 解析时间轴配置：每行 "[mm:ss.xx] 行号" 或 "[mm:ss.xx] 首行-末行"（行号从 1 开始）
 * 返回 [[t秒, r0, r1], ...]（r 为 0 起始的行带下标）
 */
function syl_parse_cues( $text ) {
	$cues = array();
	foreach ( preg_split( '/\r?\n/', trim( (string) $text ) ) as $line ) {
		if ( preg_match( '/\[(\d+):(\d+(?:\.\d+)?)\]\s*(\d+)(?:\s*-\s*(\d+))?/', trim( $line ), $m ) ) {
			$t  = intval( $m[1] ) * 60 + floatval( $m[2] );
			$r0 = max( 0, intval( $m[3] ) - 1 );
			$r1 = ( isset( $m[4] ) && '' !== $m[4] ) ? max( 0, intval( $m[4] ) - 1 ) : $r0;
			$cues[] = array( $t, $r0, $r1 );
		}
	}
	return $cues;
}

function syl_render_block( $attributes ) {
	$audio = isset( $attributes['audioUrl'] ) ? $attributes['audioUrl'] : '';
	$image = isset( $attributes['imageUrl'] ) ? $attributes['imageUrl'] : '';

	if ( ! $audio || ! $image ) {
		return '<p>同步歌词图片：请在编辑器中选择音频文件和歌词图片。</p>';
	}

	$cfg = array(
		'image' => esc_url( $image ),
		'rows'  => syl_parse_rows( isset( $attributes['rowsText'] ) ? $attributes['rowsText'] : '' ),
		'cues'  => syl_parse_cues( isset( $attributes['cuesText'] ) ? $attributes['cuesText'] : '' ),
	);

	if ( empty( $cfg['rows'] ) || empty( $cfg['cues'] ) ) {
		return '<p>同步歌词图片：请填写「行带配置」和「时间轴配置」。</p>';
	}

	$json  = esc_attr( wp_json_encode( $cfg ) );
	$blend = ! empty( $attributes['blend'] ) ? ' syl-blend' : '';

	ob_start();
	?>
	<figure class="syl<?php echo $blend; ?>" data-config="<?php echo $json; ?>">
		<div class="syl-stage">
			<div class="syl-band"></div>
			<div class="syl-band"></div>
			<div class="syl-gap">· · ·</div>
		</div>
		<div class="syl-controls">
			<button type="button" class="syl-btn" aria-label="播放 / 暂停">
				<svg class="syl-ic-play" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
				<svg class="syl-ic-pause" viewBox="0 0 24 24"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>
			</button>
			<span class="syl-time syl-cur">0:00</span>
			<span class="syl-bar"><span class="syl-fill"></span></span>
			<span class="syl-time syl-dur">0:00</span>
		</div>
		<audio class="syl-audio" preload="metadata" src="<?php echo esc_url( $audio ); ?>"></audio>
	</figure>
	<?php
	return ob_get_clean();
}

add_action( 'init', function () {
	register_block_type( __DIR__ . '/block.json', array( 'render_callback' => 'syl_render_block' ) );
} );
