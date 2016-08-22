$(document).ready(function(){

  Papa.parse('format_data.csv', {
    download: true,
    skipEmptyLines: true,
    dynamicTyping: true,
    complete: function(results, file) {
     generateTable(results)
     chartView(results)
    }
  });

  var generateTable = function(results) {
    var data = results.data;
    var tableHeader = data[0];
    var th = data[1];
    var table = $('<table class="table table-hover"><thead><tr><th># <span class="caret up"></th></tr></thead><tbody></tbody></table>');

    $('.table-responsive').append('<h2 class="col-xs-12">'+ tableHeader[0] +'<button class="btn btn-primary pull-right btn-switch" type="button">Switch</button></h2>');

    $.each(th, function(i,x) {
      var t = "<th>"+ (x.trim().length == 0 ? "Date" : x) +"<span class='caret up'></span></th>";
      table.find('thead tr').append(t);
    });

    $.each(data, function(i,x) {
      if( i > 1) {
        var t = $('<tr><th scope="row">'+ (i-1) +'</th></tr>');
        $.each(x, function(j){
          t.append( '<td>'+ x[j] +'</td>');
        });

        table.find('tbody').append(t);
      }
    });

    $('.table-responsive').append(table);

  };

  $(document).on('click','thead th',function(){
    var $this = $(this),
      $table = $this.closest('.table'),
      $caret = $this.find('.caret');

    sortTable( $this.index(), $caret.hasClass('up') )

    $caret.toggleClass('up down');

  });

  $(document).on('click','.btn-switch',function(){
    $('.table-responsive table, #chart-container').toggleClass('hidden');
  });

  $(document).on('click','.btn-export',function(){
    svg_to_png( 'chart' );
  });

});



function sortTable( index, direction ){
   var tbody = $('.table tbody');
   var store = [];

   $.each( tbody.find("tr"), function(i,x){
     var row = $(this);
     var columnElement = row.children().get(index);
     if(index == 1) {
       var value = Date.parse( $(columnElement).text() );
     } else {
       var value = parseFloat( $(columnElement).text() );
     }

     if( !isNaN( value ) ) {
       store.push([value, row]);
     };

   });

   store.sort(function(x,y){
       //return x[0] - y[0];
       return ( direction ? x[0] - y[0] : y[0] - x[0]);
   });

   $.each(store, function(i,x){
     tbody.append( x[1] )
   });

   store = null;
}


function chartView(file_options) {
  var headerText = file_options.data[0],
    rowNames = file_options.data[1] //.slice(1, file_options.data[1].length),
    dataRows = file_options.data.slice(2, file_options.data.length);

  var xAxis= [],
    yAxis = [];

    $.each(rowNames,function(i,x){
      if( i == 0 ) {
        xAxis = dataRows.map(function(j,y){ return j[0] });
      } else {
        var t = {};
        t.name = x;
        t.data = dataRows.map(function(j,y){ return j[i] });
        yAxis.push(t);
      }
    });

    $('#chart-container').removeClass('hidden');
    $('#chart').highcharts({
        chart: {
            type: 'spline'
        },
        title: {
            text: ""
        },
        legend: {
            layout: 'vertical',
            align: 'right',
            verticalAlign: 'middle',
            borderWidth: 1,
            backgroundColor:  '#FFFFFF'
        },
        xAxis: {
            categories: xAxis
        },
        yAxis: {
            title: {
                text: ""
            }
        },
        tooltip: {
            shared: true,
            valueSuffix: ' MW'
        },
        credits: {
            enabled: false
        },
        plotOptions: {
            areaspline: {
                fillOpacity: 0.5
            }
        },
        series: yAxis
    });

    $('#chart-container').addClass('hidden');
}


function svg_to_png(container) {
    var wrapper = document.getElementById(container);
    var svg = wrapper.querySelector("svg");

    if (typeof window.XMLSerializer != "undefined") {
        var svgData = (new XMLSerializer()).serializeToString(svg);
    } else if (typeof svg.xml != "undefined") {
        var svgData = svg.xml;
    }

    var canvas = document.createElement("canvas");
    var svgSize = svg.getBoundingClientRect();
    canvas.width = svgSize.width;
    canvas.height = svgSize.height;
    var ctx = canvas.getContext("2d");

    var img = document.createElement("img");
    img.onload = function() {

        ctx.drawImage(img, 0, 0);
        var imgsrc = canvas.toDataURL("image/png");

        var a = document.createElement("a");
        a.download = container+".png";
        a.href = imgsrc;
        a.setAttribute("class", "btn btn-image");
        $('.btn-export').after(a);
        a.click();
    };
    img.setAttribute("src", "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData))) );
}
