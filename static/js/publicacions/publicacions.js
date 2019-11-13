
	_cache_tag = '';
	

	function obtenerTag(element){
		$('#div_todos').addClass('div_tag').removeClass('div_tag_sel');
		nuevo_tag = $(element).attr("data-tag");
		
		if (nuevo_tag == _cache_tag){
			borrar_filtros();
			$(element).children().addClass('div_tag').removeClass('div_tag_sel');
		}else{
			_cache_tag = nuevo_tag;
			$('.div_tag_sel').addClass('div_tag').removeClass('div_tag_sel');
			$(element).children().addClass('div_tag_sel').removeClass('div_tag');
		}
		if (_cache_tag != ''){
			actualizar_publicaciones();
			
		}else{
			eliminar_filtros();
			
		}
		
	};
	
	

	function actualizar_publicaciones(){
        //Now _cache_tag can also contain a comma separated list
        var _cache_tag_list = _cache_tag.split(",");
       $(".div_bloque_publicacion").each(function(){
			$( this ).hide();
			var tags_publicacion = $( this ).attr("data-tags");  
			if (tags_publicacion!=null){
				var res = tags_publicacion.split(",");
                mostrar = false;
                var i = 0;
                var j = 0;
                while(!mostrar && i < res.length) {
                    while(!mostrar && j < _cache_tag_list.length) {
            	        if( res[i] == _cache_tag_list[j]){
                            $( this ).show();
                            mostrar = true;
					    }
                        j++;
                    }
                    i++;
                } 
			}
		});
	};
	
	function eliminar_filtros(){
		$(".div_bloque_publicacion").each(function(){
			$( this ).show();
		});
		
	}
	
	function borrar_filtros(){
		_cache_tag = '';
		eliminar_filtros();
		$('.div_tag_sel').addClass('div_tag').removeClass('div_tag_sel');
		$('#div_todos').addClass('div_tag_sel').removeClass('div_tag');
	}	
