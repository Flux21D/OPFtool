	function ajaxFunction(){
		var subTotal='';
		$.ajax({
			url: "json/database.json",
			dataType: "text",
			success: function(data) {
				
				var json = $.parseJSON(data);
				for(var i=0; i<json.length; i++){
					
					if(json[i].coverImage == undefined){
						coverURL = 'Not Found';
					}
					else{
						coverURL = '<img src="file://' + json[i].coverImage.toString().replace(/\\/g,'\/') + '"/>';
					}
					if(json[i].folderName == undefined){
						json[i].folderName = 'Not Found';
					}
					 
					$('div.container').find('section.metaInfoSection').append('<div class="row row' + (i+1) + ' padding-bottom-four margin-top-two"></div>');
					$('div.container').find('section.metaInfoSection').children('div').eq($('div.container').find('section.metaInfoSection').children('div').length-1).html('<div class="col-lg-2 col-md-6 col-sm-12 item center">' + coverURL + '</div>' + '\n' + '<div class="col-lg-2 col-md-2 col-sm-12 size center">' + json[i].folderName + '</div>' + '\n' + '<div class="col-lg-2 col-md-2 col-sm-12 quantity center">' + 'Title Name' + '</div>' + '\n' + '<div class="col-lg-2 col-md-2 col-sm-12 price center">' + 'Author Name' + '</div>');

					
				}
				
			}
		});
	}
	$(document).ready(function(){
	$('#Process').click(function (){
		alert($(this).attr('value'));
	});

	});