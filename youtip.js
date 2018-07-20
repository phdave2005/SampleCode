/*
 * youTip - A tooltip populated by data pulled from the YouTube API
 * Copyright 2018 David Partyka
 * www.cssburner.com
 *
 * Version 1.0
 *
 * The youTip jQuery plug-in is dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

(function($) {
    $.fn.youTip = function(arg) {
        var default_settings = {
                animationOnDestroy: false,
                arrowOffset: 3,
                background: '#cdcdcd',
                createCallback: false,
                delay: 250,
                destroyCallback: false,
                destroyOnMouseleave: true,
                hiddenSections: ['status'],
                maxWidth: .25,
                showEmbed: true
            },
            settings = arg.user_defined_settings ? $.extend(default_settings, arg.user_defined_settings) : default_settings,
            videoId = $(arg.t).attr("data-video_id"),
            yt_key = /* YOUR YOUTUBE KEY GOES HERE */,
            w = $(window),
            ww = w.width(),
            wh = w.height(),
            font_awesome_version;

        // Constrain size of container
        if (settings.maxWidth > .45) {
            settings.maxWidth = .45;
        } else {
            if (settings.maxWidth < .15) {
                settings.maxWidth = .15;
            }
        }

        if ($("#yt_container").length) {
            removeYoutip();
        }

        $("link").each(function() {
            var href = $(this)[0].href;
            if (href.match(/font-awesome-4\./)) {
                font_awesome_version = 4;
                return false;
            } else {
                if (href.match(/fontawesome-free-5\./)) {
                    font_awesome_version = 5;
                    return false;
                }
            }
        });

        var maxWidth = settings.maxWidth * ww,
            maxHeight = (9 / 16) * maxWidth,
            vidWidth = .99 * maxWidth,
            vidHeight = .99 * maxHeight;

        $.ajax({
            type: "GET",
            url: 'https://www.googleapis.com/youtube/v3/videos?key=' + yt_key + '&part=snippet,statistics,status&id=' + videoId,
            data: {},
            success: function(response) {
                var i,
                    items = response.items,
                    formatDate = function(publishedAt) {
                        var date = new Date(publishedAt).toString(),
                            splitDate,
                            formattedDate;

                        splitDate = date.split(" ");
                        splitDate.shift();
                        splitDate.pop();
                        formattedDate = splitDate.join(" ");
                        formattedDate = formattedDate.slice(0, formattedDate.indexOf(" ("));

                        return formattedDate;
                    };

                if (items.length) {
                    outer: for (i in items) {
                        if (items[i]['id'] && (items[i]['id'] === videoId)) {
                            var sn = items[i]['snippet'],
                                st = items[i]['statistics'],
                                sts = items[i]['status'],
                                ARG = {};
                            if (settings.hiddenSections.indexOf("snippet") === -1) {
                                ARG.snippet = {
                                    Title: sn.title,
                                    Description: sn.description,
                                    Published_At: formatDate(sn.publishedAt)
                                };
                            }
                            if (settings.hiddenSections.indexOf("statistics") === -1) {
                                ARG.statistics = {
                                    Views: st.viewCount,
                                    Likes: st.likeCount,
                                    Dislikes: st.dislikeCount,
                                    Favorites: st.favoriteCount,
                                    Comments: st.commentCount
                                };
                            }
                            if (settings.hiddenSections.indexOf("status") === -1) {
                                ARG.status = {
                                    License: sts.license,
                                    Privacy_Status: sts.privacyStatus
                                };
                            }
                            break;
                        }
                    }

                    if (ARG) {
                        populateContainer(ARG);
                    }
                }
            },
            error: function(jqXHR, textStatus, errorThrown) {
                populateContainer();
            }
        });

        function isSupportedAnimation(type) {
            var supported = ['fadeOut', 'slideUp'];
            return supported.indexOf(type) > -1;
        }

        function populateContainer(ARG) {
            var i, j,
                inner = '',
                iframe = (typeof(settings.showEmbed) === 'boolean' && settings.showEmbed) ? '<iframe style="width:' + vidWidth + 'px;height:' + vidHeight + 'px" src="https://www.youtube.com/embed/' + videoId + '"></iframe>' : '',
                stats_symbol_builder = function(key) {
                    var str;
                    if (font_awesome_version) {
                        var map = {
                            v4: {
                                Comments: "fa fa-comment",
                                Dislikes: "fa fa-thumbs-down",
                                Favorites: "fa fa-star",
                                Likes: "fa fa-thumbs-up",
                                Views: "fa fa-bar-chart"
                            },
                            v5: {
                                Comments: "fas fa-comment",
                                Dislikes: "fas fa-thumbs-down",
                                Favorites: "fas fa-star",
                                Likes: "fas fa-thumbs-up",
                                Views: "fas fa-chart-bar"
                            }
                        };

                        str = '<i class="' + map["v" + font_awesome_version][key] + '"></i>';
                    }

                    return str;
                },
                html_iterator = {
                    snippet: function(key, val) {
                        return '<p><b>' + key.replace(/_/g, " ") + ':</b> ' + val + '</p>';
                    },
                    statistics: function(key, val) {
                        var entity_map = {
                                Comments: function() {
                                    return stats_symbol_builder('Comments') || '&#128172;';
                                },
                                Dislikes: function() {
                                    return stats_symbol_builder('Dislikes') || '&#128202;';
                                },
                                Favorites: function() {
                                    return stats_symbol_builder('Favorites') || '&#9733;';
                                },
                                Likes: function() {
                                    return stats_symbol_builder('Likes') || '&#128078;';
                                },
                                Views: function() {
                                    return stats_symbol_builder('Views') || '&#128077;';
                                }
                            },
                            html = '';

                        if (key === 'Views') {
                            html += '<p><b>Statistics:</b> ';
                        }

                        html += entity_map[key]() + '&nbsp;' + val;

                        if (key === 'Comments') {
                            html += '</p>';
                        } else {
                            html += '&emsp;';
                        }

                        return html;
                    },
                    status: function(key, val) {
                        return '<p><b>' + key.replace(/_/g, " ") + ':</b> ' + val + '</p>';
                    }
                };
            if (ARG) {
                for (i in ARG) {
                    for (j in ARG[i]) {
                        inner += html_iterator[i](j, ARG[i][j]);
                    }
                }
            } else {
                inner = '<p>API Error</p>';
            }

            var append = '<div id="yt_container" style="width:' + maxWidth + 'px;background:' + settings.background + '">' + iframe + inner + '</div>';
            append += '<div id="arrow"></div>';

            $("body").click(function(e) {
                if (e.target.id !== 'yt_container') {
                    removeYoutip(1);
                }
            }).append(append);

            setTimeout(function() {
                var container = $("#yt_container"),
                    arrow = $("#arrow"),
                    ow = container.outerWidth(),
                    oh = container.outerHeight(),
                    half_ow = .5 * ow,
                    half_oh = .5 * oh,
                    arrow_width = .02 * ow,
                    arrow_base_border = arrow_width + "px solid " + settings.background,
                    tip_translate = 3 * arrow_width,
                    applyArrowCSS = function(orientation) {
                        switch (orientation) {
                            case 1:
                                arrow.css({
                                    "border-left": "none",
                                    "border-right": arrow_base_border
                                });
                                break;
                            case 2:
                                arrow.css({
                                    "border-right": "none",
                                    "border-left": arrow_base_border
                                });
                                break;
                            case 3:
                                arrow.css({
                                    "border-top": "none",
                                    "border-bottom": arrow_base_border
                                });
                                break;
                            case 4:
                                arrow.css({
                                    "border-bottom": "none",
                                    "border-top": arrow_base_border
                                });
                                break;
                        }
                        
                        var offset_coordinates = {
                            x: Math.cos(orientation * Math.PI) * settings.arrowOffset,
                            y: Math.sin(orientation * Math.PI) * settings.arrowOffset
                        };

                        return offset_coordinates;
                    },
                    offset_coordinates = {
                        x: 0,
                        y: 0
                    },
                    container_coordinates = {};

                arrow.css({
                    "border": arrow_width + "px solid transparent"
                });

                if (arg.event.pageX <= (.5 * ww)) {
                    if (arg.event.pageY <= (.5 * wh)) { //Q2
                        if ((arg.event.pageY - half_oh) > 0) {
                            offset_coordinates = applyArrowCSS(1);
                            container_coordinates = {
                                x: arg.event.pageX + arrow_width,
                                y: arg.event.pageY - half_oh
                            };
                        } else {
                            if ((arg.event.pageX - half_ow) > 0) {
                                offset_coordinates = applyArrowCSS(3);
                                container_coordinates = {
                                    x: arg.event.pageX + arrow_width - half_ow,
                                    y: arg.event.pageY + arrow_width
                                };
                            } else {
                                if (arg.event.pageY >= arg.event.pageX) {
                                    offset_coordinates = applyArrowCSS(1);
                                    container_coordinates = {
                                        x: arg.event.pageX + arrow_width,
                                        y: arg.event.pageY - arrow_width
                                    };
                                } else {
                                    offset_coordinates = applyArrowCSS(3);
                                    container_coordinates = {
                                        x: arg.event.pageX - arrow_width,
                                        y: arg.event.pageY + arrow_width
                                    };
                                }
                            }
                        }
                    } else { //Q3
                        if ((arg.event.pageY + half_oh + arrow_width) < wh) {
                            offset_coordinates = applyArrowCSS(1);
                            container_coordinates = {
                                x: arg.event.pageX + arrow_width,
                                y: arg.event.pageY - half_oh
                            };
                        } else {
                            if ((arg.event.pageX - half_ow) > 0) {
                                offset_coordinates = applyArrowCSS(4);
                                container_coordinates = {
                                    x: arg.event.pageX + arrow_width - half_ow,
                                    y: arg.event.pageY - oh
                                };
                            } else {
                                if ((wh - arg.event.pageY) >= arg.event.pageX) {
                                    offset_coordinates = applyArrowCSS(1);
                                    container_coordinates = {
                                        x: arg.event.pageX + arrow_width,
                                        y: arg.event.pageY + tip_translate - oh
                                    };
                                } else {
                                    offset_coordinates = applyArrowCSS(4);
                                    container_coordinates = {
                                        x: arg.event.pageX - arrow_width,
                                        y: arg.event.pageY - oh
                                    };
                                }
                            }
                        }
                    }
                } else {
                    if (arg.event.pageY <= (.5 * wh)) { //Q1
                        if ((arg.event.pageY - half_oh) > 0) {
                            offset_coordinates = applyArrowCSS(2);
                            container_coordinates = {
                                x: arg.event.pageX - ow,
                                y: arg.event.pageY - half_oh
                            };
                        } else {
                            if ((arg.event.pageX + half_ow) < ww) {
                                offset_coordinates = applyArrowCSS(3);
                                container_coordinates = {
                                    x: arg.event.pageX + arrow_width - half_ow,
                                    y: arg.event.pageY + arrow_width
                                };
                            } else {
                                if (arg.event.pageY >= (ww - arg.event.pageX)) {
                                    offset_coordinates = applyArrowCSS(2);
                                    container_coordinates = {
                                        x: arg.event.pageX - ow,
                                        y: arg.event.pageY - arrow_width
                                    };
                                } else {
                                    offset_coordinates = applyArrowCSS(3);
                                    container_coordinates = {
                                        x: arg.event.pageX + tip_translate - ow,
                                        y: arg.event.pageY + arrow_width
                                    };
                                }
                            }
                        }
                    } else { //Q4
                        if ((arg.event.pageY + half_oh + arrow_width) < wh) {
                            offset_coordinates = applyArrowCSS(2);
                            container_coordinates = {
                                x: arg.event.pageX - ow,
                                y: arg.event.pageY - half_oh
                            };
                        } else {
                            if ((arg.event.pageX + half_ow) < ww) {
                                offset_coordinates = applyArrowCSS(4);
                                container_coordinates = {
                                    x: arg.event.pageX + arrow_width - half_ow,
                                    y: arg.event.pageY - oh
                                };
                            } else {
                                if ((wh - arg.event.pageY) >= (ww - arg.event.pageX)) {
                                    offset_coordinates = applyArrowCSS(2);
                                    container_coordinates = {
                                        x: arg.event.pageX - ow,
                                        y: arg.event.pageY + tip_translate - oh
                                    };
                                } else {
                                    offset_coordinates = applyArrowCSS(4);
                                    container_coordinates = {
                                        x: arg.event.pageX + tip_translate - ow,
                                        y: arg.event.pageY - oh
                                    };
                                }
                            }
                        }
                    }
                }

                if (typeof(settings.destroyOnMouseleave) === 'boolean' && settings.destroyOnMouseleave) {
                    $("#yt_container").mouseleave(function() {
                        removeYoutip(1);
                    });
                }

                container.css({
                    "left": (container_coordinates.x + offset_coordinates.x) + "px",
                    "top": (container_coordinates.y + offset_coordinates.y) + "px",
                    "visibility": "visible"
                });
                arrow.css({
                    "left": (arg.event.pageX + offset_coordinates.x) + "px",
                    "top": (arg.event.pageY + offset_coordinates.y) + "px",
                    "visibility": "visible"
                });
                if(typeof(settings.createCallback) === 'function' && settings.createCallback) {
                    settings.createCallback();
                }
            }, settings.delay);
        }

        var animation_in_progress;
        function removeYoutip(user_destroy) {
            var handleDestroyCallback = function() {
                $("#arrow,#yt_container").remove();
                animation_in_progress = false;
                if (typeof(settings.destroyCallback) === 'function' && settings.destroyCallback) {
                    settings.destroyCallback();
                }
            };
            if (user_destroy) {
                if (settings.animationOnDestroy) {
                    if (!animation_in_progress) {
                        animation_in_progress = true;
                        $("#arrow").hide();
                        if (isSupportedAnimation(settings.animationOnDestroy)) {
                            $("#yt_container")[settings.animationOnDestroy](500, function() {
                                handleDestroyCallback();
                            });
                        } else {
                            handleDestroyCallback();
                        }
                    }
                } else {
                    handleDestroyCallback();
                }
            } else {
                handleDestroyCallback();
            }
        }
    };
})(jQuery);
