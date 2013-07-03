// Copyright (c) 2013 Raj Vardhan. All rights reserved.


// Search the bookmarks when entering the search keyword.
var storage = chrome.storage.local;
var bval = "";
$(function () {
    $('#search').change(function () {
	    //empty() removes all child nodes and content from selected elements
        $('#bookmarks').empty(); 	
        dumpBookmarks($('#search').val());
    });
});


// Traverse the bookmark tree, and print the folder and nodes.

function dumpBookmarks(query) {

    var bookmarkTreeNodes = chrome.bookmarks.getTree(

    function (bookmarkTreeNodes) {
        //the div bookmarks will be appended with content from the called function
		$('#bookmarks').append(dumpTreeNodes(bookmarkTreeNodes, query)); 
    });


}

function dumpTreeNodes(bookmarkNodes, query) {
    var list = $('<ul>');
    var i;
    var ct = 0;
    for (i = 0; i < bookmarkNodes.length; i++) {
        list.append(dumpNode(bookmarkNodes[i], query));

    }
    return list;
}

function isActive(stored, bm) {
    var tokenList = stored.split("#");
    for (var i = 0; i < tokenList.length; i++) {
        if (tokenList[i] == bm) {
            return 1;
        }

    }
    return 0;
}

function removeBm(stored, bm) {
    var find = "#" + bm + "#";
    var re = new RegExp(find, 'g');

    stored = stored.replace(re, '#');
    return stored;
}



//Below function is called for each node in the tree

function dumpNode(bookmarkNode, query) {
    if (bookmarkNode.title) {
        if (query && !bookmarkNode.children) {
            if (String(bookmarkNode.title).indexOf(query) == -1) {  //-1 means that the query has not been found anywhere. So return a blank span element 
                return $('<span></span>');
            }
        }
        var anchor = $('<a>');
        anchor.attr('href', bookmarkNode.url);
        anchor.text(bookmarkNode.title);
        /*
         * When clicking on a bookmark in the extension, a new tab is fired with
         * the bookmark url.
         */
        anchor.click(function () {
            if (bookmarkNode.url) chrome.tabs.create({
                url: bookmarkNode.url
            });
        });
        var span;
        if (!bookmarkNode.children) span = $('<span class="collapsable" id="mySpan">');
        else span = $('<span class="collapsable" id="mySpan2">');
        //if the bookmarkNode has children (meaning it is only a category) then show the options 'Add' and 'Open All' next to it, otherwise show 'Edit', 'Delete' and 'Status' options
        var options = bookmarkNode.children ? $('<span><img src="add1.png" id="addlink" height="18" width="18" title="add bookmark" style="padding:0px 3px 0px 3px;"/> <img src="tab1.png" id="openAllLinks" height="18" width="18" title="Open all active bookmarks under this category" /></span>') : $('<br><span id="optSpan"><img src="edit1.png" id="editlink" height="18" width="18" title="edit bookmark" style="padding:0px 3px 0px 3px;"/> <img src="delete1.png" id="deletelink" height="18" width="18" title="delete bookmark" style="padding:0px 3px 0px 3px;"/><img src="uncheck.png" id="checkmark" title="Bookmark status" height="18" width="18" style="padding:0px 3px 0px 3px;"/><a href="#" id="resetLink" style="display:none";>Reset</a></span>');
        var edit = bookmarkNode.children ? $('<table><tr><td>Name</td><td>' + '<input id="title"></td></tr><tr><td>URL</td><td><input id="url">' + '</td></tr></table>') : $('<input>');


        // Show option links when hover over. 
		/*
		 * This function needs slight improvement. When you hover over a span element, options are shown below. All html elements
		 * below it move down further. jQuery slideDown() function can be used here to make the transition smoother. So far I am unable
		 * to get a hold of it.
		 */
        span.hover(function () {
            span.append("  ").append(options);

            /*Storage.get fetches the '#'-separated-active-bookmark-list from chrome storage. It then checks whether
			 * the current bookmark node's id is present in the list or not. If so, then it shows the status icon as
			 * checked (checkBox.png) or otherwise as uncheked (uncheck.png).
			 *
			 * bflag is simply the name of the key used to store the '#'-separated-active-bookmark-list in chrome storage. 
			 *
			*/
			storage.get('bflag', function (items) {
                if (items.bflag) {
                    document.getElementById("forTest").innerHTML = "got: " + items.bflag;
                    var ch = isActive(items.bflag, bookmarkNode.id.toString());
                    document.getElementById("forTest2").innerHTML = "returned: " + ch;
                    if (ch == 1) {
                        $("#checkmark").attr("src", "checkBox.png");
                    } else {
                        $("#checkmark").attr("src", "uncheck.png");

                    }

                }
            });

            /* When the status option is clicked we basically again check to see if that bookmark node is active or not and
			 * then make two changes. First is that we toggle its image. Second, if the node is active, we need to remove it
			 * from the '#'-separated-active-bookmark-list for which we use the function 'removeBm'. If the node is inactive
			 * we add it to the '#'-separated-active-bookmark-list. 
			 *
			*/			
			
			
            $('#checkmark').click(function () {

                storage.get('bflag', function (items) {
                    if (items.bflag) {
                        bval = items.bflag;
                        document.getElementById("forTest").innerHTML = "i got: " + bval;

                    }
                    var ch = isActive(bval, bookmarkNode.id.toString());
                    document.getElementById("forTest2").innerHTML = "on click returned: " + ch;
                    if (ch == 1) {
                        var newStr = removeBm(bval, bookmarkNode.id.toString());
                        storage.set({
                            'bflag': newStr
                        }, function () {
                            document.getElementById("forTest2").innerHTML = "set changed to: " + newStr;

                        });


                        anchor.css("color", "#5A5A5A");
                        $("#checkmark").attr("src", "uncheck.png");

                    } else {
                        if (bval == "") bval = bval + "#" + bookmarkNode.id.toString() + "#";
                        else bval = bval + bookmarkNode.id.toString() + "#";
                        storage.set({
                            'bflag': bval
                        }, function () {
                            document.getElementById("forTest2").innerHTML = "set: " + bval;

                        });
                        anchor.css("color", "#008AE6");
                        $("#checkmark").attr("src", "checkBox.png");
                    }

                });
            });


			/*This button is for testing purposes and has currently been hidden (display:none) */
            $("#resetLink").click(function () {
                storage.remove('bflag', function (items) {
                    document.getElementById("forTest").innerHTML = "Reset";
                    document.getElementById("forTest2").innerHTML = "";
                });


            });

            $(".collapsable").click(function () {
                //alert("hello");
                $(this).parent().children('ul').toggle();
                //$(this).toggle();
                //$(this).hide();
            });

            $('#deletelink').click(function () {
                $('#deletedialog').empty().dialog({ //deletedialog is a div element in popup.html
                    autoOpen: false,
                    title: 'Confirm Deletion',
                    resizable: false,
                    height: 140,
                    modal: true,
                    overlay: {
                        backgroundColor: '#000',
                        opacity: 0.5
                    },
                    buttons: {
                        'Yes, Delete It!': function () {
                            chrome.bookmarks.remove(String(bookmarkNode.id));
                            span.parent().remove();
                            $(this).dialog('destroy');
                        },
                        Cancel: function () {
                            $(this).dialog('destroy');
                        }
                    }
                }).dialog('open');
            });
            $('#addlink').click(function () {
                $('#adddialog').empty().append(edit).dialog({
                    autoOpen: false,
                    closeOnEscape: true,
                    title: 'Add New Bookmark',
                    modal: true,
                    buttons: {
                        'Add': function () {
                            chrome.bookmarks.create({
                                parentId: bookmarkNode.id,
                                title: $('#title').val(),
                                url: $('#url').val()
                            });

                            $('#bookmarks').empty();
                            $(this).dialog('destroy');
                            window.dumpBookmarks();
                        },
                        'Cancel': function () {
                            $(this).dialog('destroy');
                        }
                    }
                }).dialog('open');
            });
			
			// Open all active links under a given category
            $('#openAllLinks').click(function () {

                storage.get('bflag', function (items) {
                    if (items.bflag) {
                        bval = items.bflag;
                        var j;
                        for (j = 0; j < bookmarkNode.children.length; j++) {
                       
                            if (bookmarkNode.children[j].url) {
                                document.getElementById("forTest2").innerHTML = "reached this far";
                                var ch = isActive(bval, bookmarkNode.children[j].id.toString());
                                if (ch == 1) {
                                    chrome.tabs.create({
                                        url: bookmarkNode.children[j].url
                                    });
                                }
                            }
                        }
                    } else bval = "";



                });
            });




            $('#editlink').click(function () {
                edit.val(anchor.text());
                $('#editdialog').empty().append(edit).dialog({
                    autoOpen: false,
                    closeOnEscape: true,
                    title: 'Edit Title',
                    modal: true,
                    show: 'slide',
                    buttons: {
                        'Save': function () {
                            chrome.bookmarks.update(String(bookmarkNode.id), {
                                title: edit.val()
                            });
                            anchor.text(edit.val());
                            options.show();
                            $(this).dialog('destroy');
                        },
                        'Cancel': function () {
                            $(this).dialog('destroy');
                        }
                    }
                }).dialog('open');
            });

            options.fadeIn();
        },
        // unhover

        function () {
            options.remove();
        }).append(anchor);
        storage.get('bflag', function (items) {
            if (items.bflag) {
                //document.getElementById("forTest").innerHTML = "got: "+items.bflag;
                var ch = isActive(items.bflag, bookmarkNode.id.toString());
                //document.getElementById("forTest2").innerHTML = "returned: "+ch;
                if (ch == 1) {
                    anchor.css("color", "#008AE6");
                } else {
                    anchor.css("color", "#5A5A5A");

                }
            }
        });

    }

    var li;
    if (bookmarkNode.children) li = $(bookmarkNode.title ? '<li class="categ">' : '<div>').append(span);
    else li = $(bookmarkNode.title ? '<li>' : '<div>').append(span);
    if (bookmarkNode.children && bookmarkNode.children.length > 0) {
        li.append(dumpTreeNodes(bookmarkNode.children, query));
    }
    return li;
}

document.addEventListener('DOMContentLoaded', function () {
    dumpBookmarks();
});