function ajaxFunction(){
	var subTotal='';
	$.ajax({
                    url: "json/cart.json",
                    dataType: "text",
                    success: function(data) {
                        
                        var json = $.parseJSON(data);

						for(var i=0; i<json.productsInCart.length; i++){
							var tags = $('div.container section').children('div').eq(0).html();
							var openMainTag = '<div class="row row' + (i+1) + '">\n';
							
							var closeMainTag = '\n</div>\n';
							
							var innerHTML = openMainTag + tags + closeMainTag;
							$('div.container section').append(innerHTML);  /* Duplicate the header tag in the html */
							
							$('div.row' + (i+1)).find('div').eq(0).html('<p class="left">' + '<img src="images/T' + json.productsInCart[i].p_id + '.jpg"/>' + '</p>' + '<p class="right">' + '<span class="pName grey">' + json.productsInCart[i].p_variation.toUpperCase() + ' ' + json.productsInCart[i].p_name.toUpperCase() + '</span><br/>' + '<span class="style grey">' + 'STYLE #: ' + json.productsInCart[i].p_style.toUpperCase() + '</span><br/><span class="color grey">' + 'Colour: ' + json.productsInCart[i].p_selected_color.name.toUpperCase() + '</p>'  + '<p class="menu grey"><span id="editMenu" data-toggle="modal" data-target="#myModal" class="menu' + (i+1) +'">EDIT</span> | <a href="#">X REMOVE</a> | <a href="#">SAVE FOR LATER</a> </p>'); /* First column of the product div container */
							
							$('div.row' + (i+1)).find('div').eq(1).html(json.productsInCart[i].p_selected_size.code.toUpperCase());
							$('div.row' + (i+1)).find('div').eq(2).html('<input type="text" name="P_CODE"' + 'value="' + json.productsInCart[i].p_quantity + '">');  /* Second column of the product div container */
							
							if(json.productsInCart[i].p_originalprice == json.productsInCart[i].p_price){
								$('div.row' + (i+1)).find('div').eq(3).html(json.productsInCart[i].c_currency + json.productsInCart[i].p_price.toFixed(2)); 
							} /* Condition to check the discount value and actual value and if both are same then it will add only done value */
							
							else{
								$('div.row' + (i+1)).find('div').eq(3).html('<del>' + json.productsInCart[i].c_currency + json.productsInCart[i].p_originalprice.toFixed(2) + '</del>' + '<br/>' + json.productsInCart[i].c_currency + json.productsInCart[i].p_price.toFixed(2));
								
							} /* Condition to check the discount value and actual value */
							
							subTotal = parseInt(subTotal + json.productsInCart[i].p_price); /* Sum the Price of each item and declared the same in the variable */
							
							if(i != json.productsInCart.length-1){
								$('div.row' + (i+1)).each(function (ind,ele){
									
									$(this).addClass('innerRows');
									$(this).addClass('borderBottom');
									$(this).addClass('padding-bottom-two');
									$(this).addClass('margin-top-one');
									
								});
							} /* Condition to check the all the items except last item of the json to apply different class */
							else{
								$('div.row' + (i+1)).each(function (ind,ele){
									
									$(this).addClass('lastInnerRows');
									$(this).addClass('padding-bottom-two');
									$(this).addClass('margin-top-one');
									
								});
							} /* Condition to check the last item of the json and apply different class than other items */
							
							$('div.container section').children('div#header').children('div').eq(0).html('<b>' + (i+1) + '</b> ITEMS'); /* Dynamic update of ITEM Count in the Header Row */
						} /* Loop Ends Here */

						$('p.subTotalAmount').html('<b>' + subTotal.toFixed(2) + '</b>');
						var promotionTotal = $('p.promotionAmount').text();
						var finalTotal = parseInt(subTotal.toFixed(2) + promotionTotal);
						$('p.TotalAmount').html('<b>' + finalTotal.toFixed(2) + '</b>');
					}
                });
	}

function promoField(){
	if($('section').children().length -1 >= 3){
		$('p.promotion').html('PROMOTION CODE JF10 APPLIED');
		$('p.promotionAmount').html('<b>-' + parseFloat($('p.TotalAmount').text()*(5/100)).toFixed(2) + '</b>');
		$('p.TotalAmount').html('<b>' + parseFloat(parseFloat($('p.TotalAmount').text()) + parseFloat($('p.promotionAmount').text())).toFixed(2) + '</b>');
	}
	else if($('section').children().length -1 < 3 && $('section').children().length -1 >= 6){
		$('p.promotion').html('PROMOTION CODE JF10 APPLIED');
		$('p.promotionAmount').html('<b>-' + parseFloat($('p.TotalAmount').text()*(10/100)).toFixed(2) + '</b>');
		$('p.TotalAmount').html('<b>' + parseFloat(parseFloat($('p.TotalAmount').text()) + parseFloat($('p.promotionAmount').text())).toFixed(2) + '</b>');
	}
	else if($('section').children().length -1 < 10){
		$('p.promotion').html('PROMOTION CODE JF10 APPLIED');
		$('p.promotionAmount').html('<b>-' + parseFloat($('p.TotalAmount').text()*(25/100)).toFixed(2) + '</b>');
		$('p.TotalAmount').html('<b>' + parseFloat(parseFloat($('p.TotalAmount').text()) + parseFloat($('p.promotionAmount').text())).toFixed(2) + '</b>');
	}
	
} /* Function to apply the promo code */
