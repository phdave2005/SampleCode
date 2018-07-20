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
 
   The youTip tooltip is a pure jQuery-based tooltip which first makes a YouTube API request to pull data, and then uses this data to populate the tooltip before rendering it. As such, you must add your YouTube API key to replace the comment (in the accompanying JS file) that says " YOUR YOUTUBE KEY GOES HERE "; youTip is enabled to use all default values by simply invoking it as a callback as follows:
    
    $(selector).on("mouseenter", function () {
        $(this).youTip(arg);
    }); // other events, e.g., click can also be used
    
where the minimal object (arg) that is passed is 
    
    arg = {
      event: e,
      t: this
    };
 
The selector must pass an attribute: **data-video_id**
where this attribute is the YouTube video id, e.g. <div data-video_id="fd54h_88gGi"></div>
 
The default options can be overwritten by also passing "user_defined_settings":

     arg = {
      event: e,
      t: this,
      user_defined_settings: {
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
      }
    };
   
    
The supported values of each user defined setting is as follows:

animationOnDestroy:
    false: The youTip container will simply be removed from the DOM
    'fadeOut': the container will fadeOut over 500ms, and then be removed
    'slideUp': the container will slideUp over 500ms, and then be removed

arrowOffset:
    <number>: The number of pixel to offset the container and arrow from the event which calls youTip() in callback
  
background:
    <color> or <image>: The background for the container
  
createCallback:
    <function>: A function to call right after the tooltip is rendered
  
delay:
    <number>: The milliseconds to delay before rendering the tooltip

destroyCallback:
    <function>: A function to call right after the tooltip is removed from the DOM

destroyOnMouseleave:
    <boolean>: If tooltip is moused over, it will be destroyed on mouseleave (if set to true, otherwise not destroyed)

hiddenSections:
    Add these as an array to hide sections rendered in tooltip...possible values are:
    'snippet': Will render the video's title, description, publishedAt
    'statistics': Will render the stats for the video
    'status': Will render license and privacyStatus
    
    // So to exclude all 3 ---> ['snippet', 'statistics', 'status'] whereas to include all 3 ---> []

maxWidth:
    <number>: relative to window width, where window width = 1, will be constrained to be between .15 and .45,

showEmbed:
    <boolean>: If set to true, the embedded video will be included in the tooltip, otherwise excluded
  
  
In addition, the youTip function will scan the DOM and look for inclusion of font awesome 4 or 5 (free version). If found, the statistics icons will be FA, otherwise, plain HTML entities.
