HTMLenc = function(s) {
	return $('<div/>').text(s).html();			
}
$(document).ready(function() {							

	var height=document.documentElement.clientHeight - 200;    			
	qtag = "";
	
	/* Initialize Bookmark Dialog */
	bm_dialog();	
	
	/* Initialize Flexigrid */
	$('#ymarks_flexigrid').flexigrid({
 		url: '/api/ymarks/get_ymark.json',
		dataType: 'json',
 		method: 'GET',
 		colModel: [	
			{display: 'Hash', name : 'hash', width : 85, sortable : false, align: 'left', hide: true},
			{display: 'Public', name : 'public', width : 20, sortable : true, align: 'center'},
			{display: 'Crawl start', name : 'crawl_start', width : 20, sortable : false, align: 'center'},
			{display: 'Title', name : 'title', width : 400, sortable : true, align: 'left'},
			{display: 'Tags', name : 'tags', width : 160, sortable : false, align: 'left'},
			{display: 'Folders', name : 'folders', width : 160, sortable : true, align: 'left', hide: true},
			{display: 'Date added', name : 'date_added', width : 100, sortable : true, align: 'left'},
			{display: 'Date modified', name : 'date_modified', width : 100, sortable : true, align: 'left'},
			{display: 'Date visited', name : 'date_visited', width : 100, sortable : true, align: 'left', hide: true},			
			{display: 'API PK', name : 'apicall_pk', width : 85, sortable : true, align: 'left', hide: true},
			{display: 'Date recording', name : 'date_recording', width : 100, sortable : false, align: 'left', hide: true},
			{display: 'Date next exec', name : 'date_next_exec', width : 100, sortable : false, align: 'left', hide: true},
			{display: 'Date last exec', name : 'date_last_exec', width : 100, sortable : false, align: 'left', hide: true}
		],
		buttons: [				
			{name: '...', bclass: 'refresh', onpress: function() {
				$('#ymarks_flexigrid').flexOptions({
					sortname: "title",
					sortorder: "asc",	
					query: ".*",
				 	qtype: "title"								
				});
				$('#ymarks_flexigrid').flexReload();
				loadTreeView();
				
			}},
			{separator: true},
			{name: 'Add', bclass: 'bookmark', onpress: bm_action},
			{name: 'Edit', bclass: 'edit', onpress: bm_action},
			{name: 'Delete', bclass: 'delete', onpress: bm_action},
			{separator: true},
			{name: 'Crawl', bclass: 'crawl', onpress: bm_action},
			{name: 'Schedule', bclass: 'calendar', onpress: bm_action},
			{separator: true},
			{name: 'Add', bclass: 'addTag', onpress: tag_action},
			{name: 'Rename', bclass: 'editTag', onpress: tag_action},
			{separator: true},
			{name: 'Help', bclass: 'help', onpress: bm_action}
		],
		searchitems : [
			{display: 'Full text (regexp)', name : ''},
			{display: 'Tags (comma seperated)', name : '_tags'},
			{display: 'Tags (regexp)', name : 'tags'},
			{display: 'Singel Folder', name : '_folder'},
			{display: 'Folders (regexp)', name : 'folders'},
			{display: 'Title (regexp)', name : 'title'},
			{display: 'Description (regexp)', name : 'desc'}
		],													
		useRp: true,
		rp: 15,
		sortname: "title",
		sortorder: "asc",
		usepager: true,					
		striped: true,
		nowrap: false,			 									    				
 		height: height,
 		query: ".*",
 		qtype: "title"									    				
	});
	
	/* Initialize Sidebar */
	$('#ymarks_sidebar').height(height+90);
	$tabs = $('#ymarks_sidebar').tabs({
		// tabs options
	});

	$tabs.bind('tabsselect', function(event, ui) {
		/* 
	    Objects available in the function context:
		    ui.tab     - anchor element of the selected (clicked) tab
		    ui.panel   - element, that contains the selected/clicked tab contents
		    ui.index   - zero-based index of the selected (clicked) tab
	    */
    	tabid = "#"+ui.panel.id;
		if (tabid == "#ymarks_tags_tab") {
			loadTagCloud();
		}
		return true;
	});

	loadTreeView();
	
	$('input[name=importer]').change(function() {
	     if ($("input[name=importer]:checked").val() == 'crawls') {             
	    	$("input[name='bmkfile']").attr("disabled","disabled");
	        $("input[name='root']").setValue("/Crawl Start");
	     }
	     else {
	    	 $("input[name='bmkfile']").removeAttr("disabled");
	     	 $("input[name='root']").setValue("/Imported Bookmarks");
	     }
	     if ($("input[name=importer]:checked").val() == 'bmks') {             
		    	$("input[name='bmkfile']").attr("disabled","disabled");
		     }
	     else {
	    	 $("input[name='bmkfile']").removeAttr("disabled");
	     }
	  });

	loadTags();

});

function loadTags() {
	$("#tag_include").empty();	
	$.ajax({
		type: "GET",
		url: "/api/ymarks/get_tags.xml?sort=alpha",			
		dataType: "xml",
		cache: false,
		success: function(xml) {			
			$(xml).find('tag').each(function(){					
				var count = $(this).attr('count');
				var tag = $(this).attr('tag');									
				$('<option value="'+tag+'">'+tag+' ['+count+']</option>').appendTo('#tag_include');	
			}); //close each(	
			$("#tag_include").multiselect({
				noneSelectedText: "Select tags ...",
				height: "400",
				click: function(event, ui) {
					if(ui.checked) {						
						qtag = qtag + "," + ui.value;
					}	
				},
				close: function() {
					$('#ymarks_flexigrid').flexOptions({
						query: qtag,
						qtype: "_tags",
						newp: 1
					});
					$('#ymarks_flexigrid').flexReload();
				},
				beforeopen: function() {
					$(this).multiselect("uncheckAll");
				},
				open: function() {
					qtag = "";
				}
			});
		}
	}); //close $.ajax(
}

function loadTagCloud() {		
	$("#ymarks_tagcloud *").remove();
	$.ajax({
		type: "GET",
		url: "/api/ymarks/get_tags.xml?top=25&sort=alpha",			
		dataType: "xml",
		cache: false,
		success: function(xml) {			
			$(xml).find('tag').each(function(){					
				var count = $(this).attr('count');
				var tag = $(this).attr('tag');										
				var size = ((count/20)+0.3);
				if (size < 1) {size = 1;}					
				$('<a style="font-size:'+size+'em"></a>')
					.html(HTMLenc(tag)+' ')						
					.appendTo('#ymarks_tagcloud')
					.bind('click', function() {
						var qtag = $(this).text().replace(/\s+$/g,"");								
						$('#ymarks_flexigrid').flexOptions({
							query: qtag,
							qtype: "_tags",
							newp: 1
						});
						$('#ymarks_flexigrid').flexReload();					
					});																									
			}); //close each(							
		}
	}); //close $.ajax(
};

function loadTreeView() {
	$("#ymarks_treeview").empty();
	$("#ymarks_treeview").treeview({
		url: "/api/ymarks/get_treeview.json?bmtype=href",
		unique: true,
		persist: "location"
	});						

	$("#ymarks_treeview").bind("click", function(event) {
		if ($(event.target).is("li") || $(event.target).parents("li").length) {
			var folder = $(event.target).parents("li").filter(":first").attr("id");
			$('#ymarks_flexigrid').flexOptions({
				query: folder,
				qtype: "_folder",
				newp: 1
			});
			$('#ymarks_flexigrid').flexReload();
			return false;
		}	
	});
}