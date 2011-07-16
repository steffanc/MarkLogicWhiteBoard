// NOTES:
// - Images are displayed with coordinates relative to the #main div 

// TODO:
// - Render only in field of vision to support scaling
// - Resize large pictures
// - Allow downloading of images to desktop
// - Allow for multiple selections
// - Support for Google Chrome
// - Support for You Tube videos
// - Support for drawing on page
// - Support for document uploads
// - Time line slider bar
// 
// ** - some sort of integration with MarkSpace
//
// - Button to auto collage using geospatial functions
// - Mappings of pictures to locations
//
// - make use of geospatial capabilities
// 		- search for comments based on coordinates assigned to pictures
//
// - make each background text entry into its own separate document

// Generate unique IDs for incoming elements from the DB
(function($) {
    var uid = 0;
    $.getUID = function() {
        uid++;
        return 'jQ-uid-'+uid;
    };
    $.fn.getUID = function() {
        if(!this.length) {
            return 0;
        }
        var fst = this.first(), id = fst.attr('id');
        if(!id) {
            id = $.getUID();
            fst.attr('id', id);
        }
        return id;
    };
})(jQuery);

// disable highlighting on certain elements
$.fn.disableSelection = function() {
  return $(this).each( function( index, el ) {
    if( typeof el.style.MozUserSelect != 'undefined' ) {
      el.style.MozUserSelect = 'none';
    }
    else {
      el.onmousedown = function() { return false; };
    }
    el.style.cursor = 'pointer';
  } );
};

var mlWhiteBoard = {};

mlWhiteBoard.helpers = function() {
	var obj = {};
	
	obj.getImgDirectory = function(src) {
		return src.match("images/*.*"); 
	};

	// TODO: fix this later with an appropriate regex
	obj.getImgName = function(src) {
		return src.split("/")[2].split(".")[0];
	};

	return obj;
}();

mlWhiteBoard.WhiteBoard = function() {
	// initialize the whiteboard with init
	var obj = {};
	
	// private variables
	// which whiteboard are we looking at?
	var _id;
	var _imageData = [];
	var _userName = String("");

	// Drag options for anything that uses jQuery draggable
	var _dragOpts = {
		cursor: '-moz-grabbing',
		stack: "img", 
		zIndex: 0,
		distance: 0,
		scroll: false,
		start: function (e, ui) {
			$(e.target).data("drag", true);
		},
		stop: function (e, ui) {
			$(e.target).data("drag", false);
		}
	};
	
	// private functions
	var setWhiteBoardId = function() {
		// parse the url to get the subwhiteboard
		var url = $(location).attr('href');
		var baseUrl = url.match('http://.*/');
		_id = url.split(baseUrl)[1];
		_id = (_id === "") ? "main" : _id;	
	};
	
	var stringToHtml = function(strIn) {
		var htmlOut = strIn.replace(/\n/g,"<br/>")
			.replace(/ /g,"&nbsp;");
		return htmlOut;
	};

	var htmlToString = function(htmlIn) {
		var strOut = htmlIn.replace(/\<br\>/g, "\n")
			.replace(/&nbsp;/g," ");
		return strOut;
	};

	var constructTextDiv = function(id) {
		var textDiv = $("<div></div>")
			.css("position", "absolute")
			.css("width", "auto")
			.attr("id", id)
			.attr("class", "boardText")
			.dblclick(function(e) {
				var textArea = htmlToString($(this).html());
				$("#textInput").data("curText", id)
					.data("isEdit", true)
					.val(textArea)
					.focus();
			});
		return textDiv;
	};
	
	var initWindowEvents = function() {
		// HTML 5 Drag and Drop event handlers
		// jQuery window selectors are not working with these events
		// TODO: try using jQuery bind
		window.addEventListener("dragenter", function (e) {
			e.preventDefault();
		}, false);
		window.addEventListener("dragover", function (e) {
			e.preventDefault();
		}, false);
		window.addEventListener("dragleave", function (e) {
			e.preventDefault();
		}, false);
		window.addEventListener("drop", function (e) {
			e.preventDefault();
			var files = e.dataTransfer.files;
			
			if (files.length === 0) {
				return;
			} else {
				// upload each file one at a time
				var imageType = /image.*/;
				for (var i = 0; i < files.length; i++) {
					var file = files[i];
					if (file.type.match(imageType)) {
						var xhr = new XMLHttpRequest();
						xhr.open("POST", "ajax/ajax-upload-image.xqy");
						xhr.setRequestHeader("x", e.clientX - 2*$("#main").offset().left);
						xhr.setRequestHeader("y", e.clientY - 2*$("#main").offset().top);
						xhr.setRequestHeader("board", _id);
						xhr.setRequestHeader("filename", file.name);
						xhr.sendAsBinary(file.getAsBinary());
					}
				}
			}
		}, false);

		// Mouse handler for scrolling in the window
		$(window).mousedown(function (e) {
			if(e.target instanceof HTMLBodyElement || e.target instanceof HTMLHtmlElement) {
			   $(this)
					.data('down', true)
					.data('x', e.clientX)
					.data('y', e.clientY);
			}
		}).mouseup(function (e) {
			$(this).data('down', false);
		}).mousemove(function (e) {
			if ($(this).data('down') === true) {
				var l = $("#main").offset().left - ($(this).data('x') - e.clientX);
				var t = $("#main").offset().top - ($(this).data('y') - e.clientY);
				$("#main").offset({ left: l, top: t });
				$(this).data('x', e.clientX);
				$(this).data('y', e.clientY);
			}
		}).dblclick(function(e) {
			if(e.target instanceof HTMLImageElement) {
				var commentsID = mlWhiteBoard.helpers.getImgName($(e.target).attr("src"));
				var commentsObj = $(String("#"+commentsID));
				if(commentsObj.is(':data(dialog)')) {
					commentsObj.dialog('option', 'position', [e.clientX, e.clientY])
						.dialog('open');
				} else {
					commentsObj.dialog({ title: commentsID, 
						position: [e.clientX, e.clientY],
						width: 600,
						maxWidth: 600,
						height: 500,
						maxHeight: 500
					});
				}
			} else if(e.target instanceof HTMLBodyElement || e.target instanceof HTMLHtmlElement) {
				var id = String(Math.random());
				id = id.slice(id.indexOf(".")+1);
				var text = constructTextDiv(id);
				$("#main").append(text);
				text.offset({left: e.clientX, top: e.clientY});
				$("#textInput").data("curText", text.attr("id"))
					.focus();
				var t = text.offset().top;
				var l = text.offset().left;
			}
			return false;	
		});
	};

	var imagesToSend = function(verb) {
		var imageString = String("<images>");
		var commentString = String("<comments>");
		$("img").each(function() {
			var imgName = mlWhiteBoard.helpers.getImgName($(this).attr("src"));
			var leftDiff = $(this).offset().left - $("#main").offset().left;
			var topDiff = $(this).offset().top - $("#main").offset().top;
			var zIndx = $(this).css("z-index");

			// send all comment counts
			commentString +=  "<c u=\""+_imageData[imgName].path+"\" numComments=\""+_imageData[imgName].numComments+"\"/>";

			// only update img in db if someone has dragged it
			if (leftDiff != _imageData[imgName].oldCoords[0] || topDiff != _imageData[imgName].oldCoords[1] || zIndx != _imageData[imgName].oldCoords[2]) {
				verb.type = "POST";
				imageString += "<i u=\""+_imageData[imgName].path+"\" x=\""+leftDiff+"\" y=\""+topDiff+"\" z=\""+zIndx+"\"/>";
				_imageData[imgName].oldCoords = [leftDiff, topDiff, zIndx];
			}
		});
		imageString += "</images>";
		commentString += "</comments>";
		return (imageString + commentString);
	};

	var textToSend = function(verb, curTextBlock) {
		var textString = String("<text>");
		var found = false;
		$(".boardText").each(function() {
			if($(this).data("update") && !found) {
				$(this).data("update", false);
				var textId = $(this).attr("id");
				var leftDiff = $(this).position().left;
				var topDiff = $(this).position().top;
				var body = $(this).html();

				verb.type = "POST";
				textString += "<t id=\""+textId+"\" x=\""+leftDiff+"\" y=\""+topDiff+"\"/>";
				curTextBlock.t = htmlToString(body);
				found = true;
			}
		});
		textString += "</text>";
		return textString;
	};
	
	var dialogHtml = "<table class=\"comData\"><tbody>"
		+"</table></tbody>"
		+"<table><tbody>"
		+"<tr><td class=\"nameCol\">Name</td><td>Comment</td></tr>"
		+"<tr><td class=\"nameCol\"><input class=\"inputName\" type=\"text\"/></td><td><textarea rows=\"2\" cols=\"27\" class=\"inputCom\"/></td></tr>"
		+"<tr><td/><td><button type=\"button\" class=\"comSubmit\">Share</button></td></tr>"
		+"</tbody></table><div/>";

	var updateBoard = function() {
		var verb = {type:"GET"};
		var curTextBlock = {t:""};
		var toSend = "<data>";
		toSend += imagesToSend(verb);
		toSend += textToSend(verb, curTextBlock);
		toSend += "</data>";

		$.ajax({
			type: verb.type,
			url: "ajax/ajax-get-image-prop.xqy",
			data: { data: toSend, board: _id, textBlock: curTextBlock.t },
			dataType: "html",
			success: function(data) {
				var maxZIndx = 0;
				$(data).closest("i").each(function() {
					var imgSrc = $(this).attr("s");
					var imgObj = $('img[src=\"'+imgSrc+'\"]');
					var imgDir = mlWhiteBoard.helpers.getImgDirectory(imgSrc);
					var imgName = mlWhiteBoard.helpers.getImgName(imgSrc);

					if($(this).attr("x") !== undefined) {
						var leftDiff = parseInt($(this).attr("x"), 10);
						var topDiff = parseInt($(this).attr("y"), 10);
						var zIndx = parseInt($(this).attr("z"), 10);
						maxZIndx = (zIndx > maxZIndx) ? zIndx : maxZIndx;

						// image is not yet displayed on the screen		
						if(imgObj.length === 0) {
							var img = $("<img/>").offset({left: (leftDiff + $("#main").offset().left), top: (topDiff + $("#main").offset().top)});
							img.attr("src", $(this).attr("s"))
								.draggable(_dragOpts)
								.data("drag", false)
								.css("z-index", zIndx)
								.append($("<div id=\""+imgName+"\" class=\"comments\">"+dialogHtml))
								.getUID();
							$("#main").append(img);
							
							// button handler to upload comment when clicked
							$(String("#"+imgName+" .comSubmit")).click(function(){
								var comName = $(String("#"+imgName+" .inputName")).val();
								var comData = $(String("#"+imgName+" .inputCom")).val();
								$.ajax({
									type: "POST",
									url: "ajax/ajax-post-comment.xqy",
									data: { uri: String(imgDir), name: comName, com: comData },
									success: function(data) {
										$(String("#"+imgName+" .inputCom")).val("");
									}
								});
							});
							// construct new image data
							_imageData[imgName] = {path: imgDir, numComments: 1, oldCoords: [0,0,0]};
						// image has been displayed before on this screen						
						} else if(imgObj.data("drag") === false) {
							if(leftDiff != _imageData[imgName].oldCoords[0] || topDiff != _imageData[imgName].oldCoords[1]) {
								imgObj.offset({ left: (leftDiff + $("#main").offset().left), 
									top: (topDiff + $("#main").offset().top)});
							}
							if(zIndx != _imageData[imgName].oldCoords[2]) {
								imgObj.css("z-index", zIndx);
							}
						}
						_imageData[imgName].oldCoords = [leftDiff, topDiff, zIndx];
					}
					// display new comments in the appropriate dialog box
					$(this).find("com").each(function() {
						var name = $(this).attr("n");
						var date = $(this).attr("d");
						var comment = $(this).text();
						var comHtml = "<tr>"
							+"<td style=\"width:160px\" class=\"nameCol\">"+name+"<br/>"+date+"</td>"
							+"<td>"+comment+"</td>"
						+"</tr>";
						$(String("#"+imgName+" .comData")).append(comHtml);
						_imageData[imgName].numComments += 1;
					});
				});
				// update max z-index of search bar to keep it on top 
				// add 50 as a nice padding between updates
				$("#searchBar").css("z-index", maxZIndx+50);

				// text
				$(data).closest("t").each(function() {
					var id = $(this).attr("id");
					var leftDiff = parseInt($(this).attr("x"), 10);
					var topDiff = parseInt($(this).attr("y"), 10);
					var body = stringToHtml($(this).text());
					var textDiv = $("#"+id);
					if($("#"+id).length === 0) {
						textDiv = constructTextDiv(id);
						textDiv.offset({left: leftDiff,	top: topDiff});
						$("#main").append(textDiv);
					}
					if($(".hiddenTextIn").data("curText") != id) {
						textDiv.html(body);
					}
				});
				t=setTimeout(updateBoard, 500);
			}
		});
	};

	// public functions
	obj.update = function() {
		updateBoard();
	};

	obj.init = function() {
		$("img").draggable(_dragOpts)
			.data("drag", false);
		setWhiteBoardId();
		initWindowEvents();

		// Disable highlighting certain elements
		//$("#searchBar").disableSelection();
		//$("img").disableSelection();
		//$(".boardText").disableSelection();
		
		// Handle input
        // Create the input element that captures all entered text
        var input = $("<textarea/>");
        input.attr("id", "textInput")
			.css("position", "absolute")
			.attr("class", "hiddenTextIn")
			.offset({left: -1000, top: -1000})
			.focus(function(e) {
				if(!$(this).data("isEdit")) {
					$(this).val("");
				}
				$(this).data("isEdit", false);
			}).keyup(function(e) {
				var code = (e.keyCode ? e.keyCode : e.which);
				var textID = $(this).data("curText");
				var textIn = stringToHtml($(this).val());
				// enter = 13, esc = 27, spacebar = 32
				if(code == 27) {
					$(this).blur();
				} else {
					$("#"+textID).data("update", true);
					$("#"+textID).html(textIn);
				}
			}).blur(function(e) {
				$(this).val("");
				$(this).data("curText", "");
			});	
        $("body").append(input);
	};
	return obj;
}();

$(document).ready(function() {
	mlWhiteBoard.WhiteBoard.init();
	mlWhiteBoard.WhiteBoard.update();
});
