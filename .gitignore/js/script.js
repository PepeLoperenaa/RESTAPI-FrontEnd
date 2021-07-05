$(function() {

	$.ajax({
		type: "GET", //get movie with id
		url: "http://localhost:8080/movies/piechart/",
		success: function (result) {
			var colors = ["blue","red","yellow"];
			var data = [];
			let keys = Object.keys(result);

			for(let i=0;i<keys.length;i++) {
				data.push({
					"name" : keys[i],
					"value" : result[keys[i]].toString(),
					"color" : colors[i]
				});
			}
			console.log(JSON.stringify(data));

			$('#piechart').listtopie({
				size:'auto',
				strokeWidth:2,
				dataJson: JSON.stringify(data),
				hoverEvent:true,
				speedDraw:50,
				hoverBorderColor:'#585858',
				hoverWidth:1,
				textColor:'#cccccc',
				strokeColor:'#f1f1f1',
				backColor:'#f1f1f1',
				textSize:'16',
				marginCenter:20,
				listVal:true,
				listValClick:true,
				//listValMouseOver: false,
				infoText:true,
				setValues:true,
				listValInsertClass:'legend',
				backColorOpacity: '0.5',
				hoverSectorColor:true,
				usePercent:false
			});

		},
		error: function (error) {
			console.log(error);
		}
	});
	
});