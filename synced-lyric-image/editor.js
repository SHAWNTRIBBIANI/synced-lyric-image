( function ( wp ) {
	var el = wp.element.createElement;
	var Fragment = wp.element.Fragment;
	var registerBlockType = wp.blocks.registerBlockType;
	var MediaUpload = wp.blockEditor.MediaUpload;
	var MediaUploadCheck = wp.blockEditor.MediaUploadCheck;
	var InspectorControls = wp.blockEditor.InspectorControls;
	var PanelBody = wp.components.PanelBody;
	var Button = wp.components.Button;
	var TextareaControl = wp.components.TextareaControl;
	var TextControl = wp.components.TextControl;
	var ToggleControl = wp.components.ToggleControl;

	function mediaButton( attrs, setAttributes, type, urlKey, idKey, label, replaceLabel ) {
		return el( MediaUploadCheck, null,
			el( MediaUpload, {
				onSelect: function ( m ) {
					var upd = {};
					upd[ urlKey ] = m.url;
					upd[ idKey ] = m.id;
					setAttributes( upd );
				},
				allowedTypes: [ type ],
				value: attrs[ idKey ],
				render: function ( o ) {
					return el( Button, {
						variant: 'secondary',
						onClick: o.open,
						style: { marginRight: '8px', marginBottom: '8px' }
					}, attrs[ urlKey ] ? replaceLabel : label );
				}
			} )
		);
	}

	function splitRows( n ) {
		n = parseInt( n, 10 );
		if ( ! n || n < 1 ) return '';
		var out = [];
		for ( var i = 0; i < n; i++ ) {
			out.push( ( i * 100 / n ).toFixed( 1 ) + ' ' + ( ( i + 1 ) * 100 / n ).toFixed( 1 ) );
		}
		return out.join( '\n' );
	}

	registerBlockType( 'tongchun/synced-lyric-image', {
		edit: function ( props ) {
			var a = props.attributes;
			var set = props.setAttributes;

			var inspector = el( InspectorControls, null,
				el( PanelBody, { title: '素材', initialOpen: true },
					el( 'p', null,
						mediaButton( a, set, 'audio', 'audioUrl', 'audioId', '选择音频', '更换音频' )
					),
					el( 'p', null,
						mediaButton( a, set, 'image', 'imageUrl', 'imageId', '选择歌词图片', '更换歌词图片' )
					),
					el( ToggleControl, {
						label: '白底融入背景',
						help: '歌词图片是白底且网站背景为浅色时开启，纸面白色会自动隐形。',
						checked: !! a.blend,
						onChange: function ( v ) { set( { blend: v } ); }
					} )
				),
				el( PanelBody, { title: '行带配置（图片怎么切）', initialOpen: false },
					el( TextareaControl, {
						label: '行带（每行：上% 下% [左% 右%]）',
						help: '图片从上往下每一条歌词的纵向范围。左右空白会自动收紧，一般不用填；只有需要排除旁边墨迹（如签名）时才填左% 右%。',
						value: a.rowsText,
						onChange: function ( v ) { set( { rowsText: v } ); },
						rows: 10
					} ),
					el( TextControl, {
						label: '均分行数',
						type: 'number',
						value: a._splitN || '',
						onChange: function ( v ) { set( { _splitN: v } ); }
					} ),
					el( Button, {
						variant: 'secondary',
						onClick: function () { set( { rowsText: splitRows( a._splitN ) } ); }
					}, '按行数均分生成行带' ),
					el( 'p', { style: { fontSize: '12px', opacity: 0.7, marginTop: '8px' } },
						'均分适合排版整齐的歌词截图；手写稿建议用我给你的实测数值。'
					)
				),
				el( PanelBody, { title: '时间轴配置（什么时候显示哪行）', initialOpen: false },
					el( TextareaControl, {
						label: '时间轴（每行：[分:秒.毫秒] 行号 或 [分:秒.毫秒] 首行-末行）',
						help: '行号对应上面行带的顺序，从 1 开始。例：[00:41.32] 2 表示 41.32 秒时显示第 2 条行带。',
						value: a.cuesText,
						onChange: function ( v ) { set( { cuesText: v } ); },
						rows: 12
					} )
				)
			);

			var canvas;
			if ( ! a.audioUrl && ! a.imageUrl ) {
				canvas = el( 'div', {
						style: { border: '1px dashed #999', padding: '32px', textAlign: 'center', borderRadius: '4px' }
					},
					el( 'p', { style: { marginBottom: '16px' } }, '同步歌词图片：请选择音频和歌词图片'),
					el( 'p', null,
						mediaButton( a, set, 'audio', 'audioUrl', 'audioId', '选择音频', '更换音频' ),
						mediaButton( a, set, 'image', 'imageUrl', 'imageId', '选择歌词图片', '更换歌词图片' )
					)
				);
			} else {
				canvas = el( 'figure', { style: { textAlign: 'center', margin: '0' } },
					a.imageUrl ? el( 'img', {
						src: a.imageUrl,
						style: { maxWidth: '100%', opacity: 0.9 }
					} ) : null,
					a.audioUrl ? el( 'audio', {
						controls: true,
						src: a.audioUrl,
						style: { width: '100%', marginTop: '8px' }
					} ) : null,
					el( 'figcaption', { style: { fontSize: '12px', opacity: 0.6, marginTop: '6px' } },
						'前台显示为同步歌词播放器（歌词图片逐行淡入淡出）。行带与时间轴在右侧边栏配置。'
					)
				);
			}

			return el( Fragment, null, inspector, canvas );
		},
		save: function () { return null; }
	} );
} )( window.wp );
