"use strict";
// Custom select
function enableSelectBoxes(){
	"use strict";
	jQuery('div.selectBox').each(function(){
		jQuery(this).children('span.selected').html(jQuery(this).children('div.selectOptions').children('span.selectOption:first').html());
		jQuery(this).attr('value',jQuery(this).children('div.selectOptions').children('span.selectOption:first').attr('value'));
		
		jQuery(this).children('span.selected, span.selectArrow').on("click", function(){
			if(jQuery(this).parent().children('div.selectOptions').css('display') == 'none'){
				jQuery(this).parent().children('div.selectOptions').css('display','block');
				jQuery(this).parents('.selectBox').addClass('act');
			}
			else
			{
				jQuery(this).parent().children('div.selectOptions').css('display','none');
				jQuery(this).parents('.selectBox').removeClass('act');
			}
		});
		
		jQuery(this).find('span.selectOption').on("click", function(){
			jQuery(this).parent().css('display','none');
			jQuery(this).closest('div.selectBox').attr('value',jQuery(this).attr('value'));
			jQuery(this).parent().siblings('span.selected').html(jQuery(this).html());
			jQuery(this).parents('.selectBox').removeClass('act');
		});
		
		jQuery("div.selectOptions").mouseleave(function() {
			jQuery('div.selectOptions').css('display','none');
			jQuery('.selectBox').removeClass('act');
		});
		
	});				
}

// Fullwidth module
function fw_block() {
	"use strict";
	if (jQuery('div').hasClass('right-sidebar') || jQuery('div').hasClass('left-sidebar')) {} else {
		var fw_block = jQuery('.fw_block');
		var fw_block_parent = fw_block.parent().width();
		var fw_site_width = fw_block.parents('.wrapper').width();
		var fw_contentarea_site_width_diff = fw_site_width - fw_block_parent - 70;

		fw_block.css('margin-left', '-'+fw_contentarea_site_width_diff/2+'px').css('width', fw_site_width - 70 +'px').children().css('padding-left', fw_contentarea_site_width_diff/2+'px').css('padding-right', fw_contentarea_site_width_diff/2+'px');
	jQuery('.module_google_map .fw_wrapinner, .module_wall .fw_wrapinner, .nfwrap .fw_wrapinner').css('padding-left', '0px').css('padding-right', '0px');
	}
}

// Google Map Module
function google_map_mobile() {
	"use strict";
	if (jQuery(window).width() < 768) {
		jQuery('.module_google_map').each(function(){
			jQuery(this).find('iframe').css({'height': jQuery(window).width()*0.4 + 130 + 'px'});
		});
	}
}

// Wrapper Height
function wrapper_height() {
	"use strict";
	if (jQuery('.site_wrapper').size() > 0 && jQuery('footer').size() > 0) {
		jQuery('.site_wrapper').css({'min-height': (jQuery(window).height() - jQuery('footer').height()) + 'px'});
	}
}

jQuery(document).ready(function () {
	"use strict";
    var window_w = jQuery(window).width(),
        window_h = jQuery(window).height(),
        wrapper_h = jQuery('.wrapper').height(),
        header_h = jQuery('header').height(),
        footer_h = jQuery('footer').height(),
        cont_fw_h = jQuery('.container.fw').height();

    var bodytimer = setTimeout(function(){
		jQuery('body').css('opacity', '1');
		clearTimeout(bodytimer);
	}, 1500);
	
	if (jQuery('.menu_scroll').size() > 0) {
		jQuery('.menu_scroll .menu-main-container').append('<ul class="menu">'+jQuery('header').find('ul.menu').html()+'</ul>');
	}

    jQuery('.gt3_menu .menu .sub-menu .current-menu-item').parent().css('display', 'block').parent().addClass("gt3_menu_active_menu_item").find("span > i").removeClass("icon-chevron-down").addClass("icon-chevron-up");

    jQuery('.current-menu-ancestor .current-menu-parent').addClass("current-menu-parent_open").parent().css('display', 'block').parent().addClass("gt3_menu_active_menu_item").find("span > i").removeClass("icon-chevron-down").addClass("icon-chevron-up");

    jQuery('.horizontal_menu ul li > .sub-menu li.menu-item-has-children a span i').removeClass('icon-chevron-down').addClass('icon-angle-right');

    var active_menu = jQuery('.gt3_menu .menu-item-has-children .sub-menu .menu-item-has-children').hasClass('current-menu-parent');
    if (active_menu == false) {
        jQuery('.gt3_menu .menu-item-has-children .sub-menu .menu-item-has-children').find("span > i").removeClass("icon-chevron-up").addClass("icon-chevron-down");
    }	

    if (window_w < 767) {
        jQuery('.gt3_menu').wrap("<div class='menu_mobile'></div>");
        jQuery('.menu_scroll').removeClass('menu_scroll');
        jQuery('.menu_toggler').on("click", function(){
            jQuery('.menu_mobile').slideToggle(300);
        });
    }

    jQuery('.menu_scroll').jScrollPane({
        autoReinitialise: true
    });

    jQuery('.share_text').on("click", function () {
        jQuery(this).parent().find('.sh_fo_detail').toggle('fast');
    });

    jQuery('.menu_toggler').on("click", function () {
        jQuery(this).toggleClass('active');
        jQuery('body').toggleClass('gt3_menu_active');
    });

    jQuery(document).on("click", "footer, .wrapper", function () {
        jQuery('.menu_toggler').removeClass('active');
        jQuery('body').removeClass('gt3_menu_active');
    });

    jQuery(".search_form i").on("click", function () {
        jQuery(this).parents(".search_form").find(".s_btn_search").on("click", function () {			
		});
    });

    jQuery(".gt3_menu .menu-item-has-children > a").on("click", function () {
        jQuery(this).next().slideToggle("fast").parent().toggleClass("gt3_menu_active_menu_item");
        jQuery(this).find("span > i").toggleClass("icon-chevron-down");
        jQuery(this).find("span > i").toggleClass("icon-chevron-up");
    });

    jQuery('.layer_block').mouseenter(function() {
        var block_width = jQuery(this).attr('data-width'),
            content_number = jQuery(this).find('.layer_block_content').size(),
            content_height = jQuery('.layer_block_content').height(),
            content_margin = (block_width - (content_height * content_number)) / 2;
        jQuery(this).css({
            'width': block_width,
            'height': block_width,
            'margin-left': -(block_width / 2 + 18),
            'margin-top': -(block_width / 2 + 18),
            'padding': (block_width / 2)
        }).addClass('hovered').find('.layer_block_content:first-child').css({'margin-top': content_margin});
        var hoveredtimer = setTimeout(function(){
			jQuery('.hovered>.layer_block_content').css('display', 'block').css('transform', 'scale(1)');
			clearTimeout(hoveredtimer);
		}, 300);		
    }).mouseleave(function() {
        jQuery('.layer_block_content').css('display', 'none');
        jQuery(this).css({
            'width': 8,
            'height': 8,
            'margin-left': 0,
            'margin-top': 0,
            'padding': 0
        }).removeClass('hovered');
    });
	
	if (jQuery('.shop_ordering').size() > 0) {
		// Custom select
		enableSelectBoxes();
	}
	
	/* NivoSlider */
	if (jQuery('.nivoSlider').size() > 0) {
		jQuery('.nivoSlider').each(function(){
			jQuery(this).nivoSlider({
				directionNav: true,
				controlNav: false,
				effect:'sliceUpDownLeft',
				animSpeed: 600,
				pauseTime:3000
			});
		});
	}
	
	// Accordion & Toggle
	if (jQuery('.module_accordion').size() > 0 || jQuery('.module_toggle').size() > 0) {
		jQuery('.shortcode_accordion_item_title').on("click", function(){
			if (!jQuery(this).hasClass('state-active')) {
				jQuery(this).parents('.shortcode_accordion').find('.shortcode_accordion_item_body').slideUp('fast');
				jQuery(this).next().slideToggle('fast');
				jQuery(this).parents('.shortcode_accordion').find('.state-active').removeClass('state-active');
				jQuery(this).addClass('state-active');
			}
		});
		jQuery('.shortcode_toggles_item_title').on("click", function(){
			jQuery(this).next().slideToggle('fast');
			jQuery(this).toggleClass('state-active');
		});
	
		jQuery('.shortcode_accordion_item_title.expanded_yes, .shortcode_toggles_item_title.expanded_yes').each(function( index ) {
			jQuery(this).next().slideDown('fast');
			jQuery(this).addClass('state-active');
		});
	}
	
	// Counter
	if (jQuery('.shortcode_counter').size() > 0) {
		if (jQuery(window).width() > 760) {
			jQuery('.shortcode_counter').waypoint(function(){							
				var set_count = jQuery(this).find('.stat_count').attr('data-count');
				jQuery(this).find('.stat_temp').stop().animate({width: set_count}, {duration: 3000, step: function(now) {
						var data = Math.floor(now);
						jQuery(this).parents('.counter_wrapper').find('.stat_count').html(data);
					}
				});
				jQuery(this).find('.stat_count');
			},{offset: 'bottom-in-view', triggerOnce: true});
		} else {
			jQuery('.shortcode_counter').each(function(){
				var set_count = jQuery(this).find('.stat_count').attr('data-count');
				jQuery(this).find('.stat_temp').animate({width: set_count}, {duration: 3000, step: function(now) {
						var data = Math.floor(now);
						jQuery(this).parents('.counter_wrapper').find('.stat_count').html(data);
					}
				});
				jQuery(this).find('.stat_count');
			});
		}
	}
	
	// Tabs
	if (jQuery('.module_tabs').size() > 0) {
		jQuery('.shortcode_tabs').each(function(index) {
			/* GET ALL HEADERS */
			var i = 1;
			jQuery(this).find('.shortcode_tab_item_title').each(function(index) {
				jQuery(this).addClass('it'+i); jQuery(this).attr('whatopen', 'body'+i);
				jQuery(this).addClass('head'+i);
				jQuery(this).parents('.shortcode_tabs').find('.all_heads_cont').append(this);
				i++;
			});
	
			/* GET ALL BODY */
			var i = 1;
			jQuery(this).find('.shortcode_tab_item_body').each(function(index) {
				jQuery(this).addClass('body'+i);
				jQuery(this).addClass('it'+i);
				jQuery(this).parents('.shortcode_tabs').find('.all_body_cont').append(this);
				i++;
			});
	
			/* OPEN ON START */
			jQuery(this).find('.expand_yes').addClass('active');
			var whatopenOnStart = jQuery(this).find('.expand_yes').attr('whatopen');
			jQuery(this).find('.'+whatopenOnStart).addClass('active').fadeIn();
		});
	
		jQuery(document).on('click', '.shortcode_tab_item_title', function(){
			jQuery(this).parents('.shortcode_tabs').find('.shortcode_tab_item_body').removeClass('active').hide();
			jQuery(this).parents('.shortcode_tabs').find('.shortcode_tab_item_title').removeClass('active');
			var whatopen = jQuery(this).attr('whatopen');
			jQuery(this).parents('.shortcode_tabs').find('.'+whatopen).addClass('active').fadeIn();
			jQuery(this).addClass('active');
		});
	}
	
	// Message Box
	if (jQuery('.module_messageboxes').size() > 0) {
		jQuery('.module_messageboxes .box_close').on("click", function(){
			jQuery(this).parents('.module_messageboxes').fadeOut();
		});
	}
	
	// Skills
	if (jQuery('.skills_list').size() > 0) {
		jQuery('.skills_list').waypoint(function(){
			jQuery(this).find('.skill_li').each(function(){
				var this_chart_width = parseInt(jQuery(this).find('.chart').width(), 10);
				var this_data_percent = parseInt(jQuery(this).find('.chart').attr('data-percent'), 10) * this_chart_width / 100;
				jQuery(this).find('.chart').find('.innerline').css('width', this_data_percent+'px');
			});
		},{offset: 'bottom-in-view'});
	}
	
	// Contact form
	if (jQuery('.contact_form').size() > 0) {
		jQuery("#ajax-contact-form").on("submit", function() {
			var str = $(this).serialize();		
			$.ajax({
				type: "POST",
				url: "contact_form/contact_process.php",
				data: str,
				success: function(msg) {
					// Message Sent - Show the 'Thank You' message and hide the form
					if(msg == 'OK') {
						var result = '<div class="notification_ok">Your message has been sent. Thank you!</div>';
						jQuery("#fields").hide();
					} else {
						var result = msg;
					}
					jQuery('#note').html(result);
				}
			});
			return false;
		});
	}
	
	jQuery('.fw_block').wrapInner('<div class="fw_wrapinner"></div>');
	fw_block();
	
	google_map_mobile();
	
	// Magnific Popup
	if (jQuery('.photozoom').size() > 0) {
		if (jQuery('.photozoom').parents('.photo_gallery').hasClass('photo_gallery')) {
			jQuery('.photo_gallery').each(function() {
				jQuery(this).magnificPopup({
					delegate: 'a',
					type: 'image',
					gallery: {
						enabled: true
					},
					iframe: {
						markup: '<div class="mfp-iframe-scaler">'+'<div class="mfp-close"></div>'+'<iframe class="mfp-iframe" frameborder="0" allowfullscreen></iframe>'+'<div class="mfp-counter"></div>'+'</div>'
					}
				});
			});
		} else {
			jQuery('.photozoom').magnificPopup({type:'image'});
		}
	}
	
	wrapper_height();	
	
});

jQuery(window).load(function () {
    var bodytimer = setTimeout(function(){
		jQuery('body').css('opacity', '1');
		clearTimeout(bodytimer);
	}, 500);
	wrapper_height();
});

jQuery(window).resize(function () {
	"use strict";
    jQuery('.menu_scroll').jScrollPane({
        autoReinitialise: true
    });	
	fw_block();	
	google_map_mobile();
	
	if (jQuery('.skills_list').size() > 0) {
		jQuery('.skill_li').each(function(){
			var this_chart_width = parseInt(jQuery(this).find('.chart').width(), 10);
			var this_data_percent = parseInt(jQuery(this).find('.chart').attr('data-percent'), 10) * this_chart_width / 100;
			jQuery(this).find('.chart').find('.innerline').css('width', this_data_percent+'px');
		});
	}
	
	wrapper_height();
});
