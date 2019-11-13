
	function iniciar_noticias(){
		$('.div_cuerpo_noticia').hide();
		
		$( ".div_noticia" ).hover(function() {
			num_noticia = $(this).attr("num_noticia");
			$('.div_cuerpo_noticia[num_noticia="'+num_noticia+'"]').toggle();
			$('.div_noticia[num_noticia="'+num_noticia+'"]').attr('class', 'div_noticia_ext');
			$('.div_tit_noticia[num_noticia="'+num_noticia+'"]').attr('class', 'div_tit_noticia_ext');
		}, function() {
			num_noticia = $(this).attr("num_noticia");	
			$('.div_cuerpo_noticia[num_noticia="'+num_noticia+'"]').toggle();
			$('.div_noticia_ext[num_noticia="'+num_noticia+'"]').attr('class', 'div_noticia');
			$('.div_tit_noticia_ext[num_noticia="'+num_noticia+'"]').attr('class', 'div_tit_noticia');
		});
	}
	
	function filtrar_destacados(){
		$('.div_sub_cat_ind').hide();
		var parameters = location.search.substring(1).split("&");
		var temp = parameters[0].split("=");
		opcion = unescape(temp[1]);
		//temp = parameters[1].split("=");
		//p = unescape(temp[1]);
		if (opcion=='destacado'){
			_cache_tag = opcion;
			$('#div_destacados').addClass('div_tag_sel').removeClass('div_tag');
			actualizar_publicaciones();
			//$('.div_bloque_publicacion').hide();
			//$('.div_bloque_publicacion').find("[data-destacado='y']").show();;
			//$("[data-destacado="+destacats+"]").show();
			
		}else if (opcion=='documents'){
			_cache_tag=opcion;
			$('#div_documentos').addClass('div_tag_sel').removeClass('div_tag');
			actualizar_publicaciones();
			//$('.div_bloque_publicacion').hide();
			//$('.div_bloque_publicacion').find("[data-destacado='y']").show();;
			//$("[data-destacado="+destacats+"]").show();
			
		}
			
		//document.getElementById("log").innerHTML = l;
		//document.getElementById("pass").innerHTML = p;
	}
	
	
	function buscarMenu(seleccionado){
		
		var dondeEstamos = 'iaqse.caib.es';
			if (document.location.hostname == 'localhost'){
				dondeEstamos = 'localhost:3000';
			}
		$("#div_menu_wrap").load('http://'+dondeEstamos+'/menu.html', 
								function() {
									$('#'+seleccionado).parent().attr('class', 'div_ele_menu_sel');
								});
	}
	
	
	function buscar_pie(){
		var dondeEstamos = 'iaqse.caib.es';
			if (document.location.hostname == 'localhost'){
				dondeEstamos = 'localhost:3000';
			}
		$("#div_pie").load('http://'+dondeEstamos+'/pie.html');
		
	}
	
	

	