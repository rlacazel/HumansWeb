//inspired by http://product.voxmedia.com/post/68085482982/polygon-feature-design-svg-animations-for-fun-and

//Depends on jQuery

// Easing excerpt from George McGinley Smith
// https://gsgd.co.uk/sandbox/jquery/easing/
jQuery.extend( jQuery.easing,
    {
        easeInOutQuad: function (x, t, b, c, d) {
            if ((t/=d/2) < 1) return c/2*t*t + b;
            return -c/2 * ((--t)*(t-2) - 1) + b;
        }
    });



//If you want to add SVG to the DOM, jQuery won't do
//http://www.benknowscode.com/2012/09/using-svg-elements-with-jquery_6812.html

function SVG(tag) {
    return document.createElementNS('http://www.w3.org/2000/svg', tag);
}

function replaceLinesWithPaths(parentElement) {


    var lines = $(parentElement).find('#g_lines_timer line');

    $.each(lines, function() {

        var id = $(this).attr('id');

        var lineX1 = $(this).attr('x1');
        var lineY1 = $(this).attr('y1');

        var lineX2 = $(this).attr('x2');
        var lineY2 = $(this).attr('y2');

        var convertedPath = 'M' + lineX1 + ',' + lineY1 + ' ' + lineX2 + ',' + lineY2;


        $(SVG('path'))
            .attr('id', id)
            .attr('d', convertedPath)
            .attr('fill', $(this).attr('fill'))
            .attr('stroke', "green")
            .attr('stroke-width', 2)
            .insertAfter(this);

    });

    var paths = $(parentElement).find('path');

    //for each PATH
    $.each( paths, function(i) {

        //get the total length
        var totalLength = this.getTotalLength();

        //set PATHs to invisible
        $(this).css({
            'stroke-dashoffset': totalLength,
            'stroke-dasharray': totalLength + ' ' + totalLength
        });

    });
}

function startSVGAnimation(_parentElement, duration, id) {


    var paths = $(_parentElement).find('path');

    //for each PATH..
    $.each( paths, function(i) {

        //animate
        if (this.getAttribute('id') == id) {
            $(this).animate({
                'stroke-dashoffset': 0
            }, {
                duration: duration*1
            });
       }
    });
}

//replaceRectsWithPaths();
//startSVGAnimation($('svg'));
/*
function replaceRectsWithPaths(_parentElement) {

    replaceLinesWithPaths(_parentElement);

    var rects = $("#g_rectangles_timer rect");

    $.each(rects, function() {

        var id = $(this).attr('id');

        var rectX = $(this).attr('x');
        var rectY = $(this).attr('y');

        var rectX2 = parseFloat(rectX) + parseFloat($(this).attr('width'));
        var rectY2 = parseFloat(rectY) + parseFloat($(this).attr('height'));

        var convertedPath = 'M' + rectX + ',' + rectY + ' ' + rectX2 + ',' + rectY + ' ' + rectX2 + ',' + rectY2 + ' ' + rectX + ',' + rectY2 + ' ' + rectX + ',' + rectY;

        $(SVG('path'))
            .attr('id', id)
            .attr('d', convertedPath)
            .attr('fill', $(this).attr('fill'))
            .attr('stroke', "green")
            .attr('stroke-width', 3)
            .insertAfter(this);
    });

    var paths = $(_parentElement).find('path');

    //for each PATH
    $.each( paths, function(i) {

        //get the total length
        var totalLength = this.getTotalLength();

        //set PATHs to invisible
        $(this).css({
            'stroke-dashoffset': totalLength,
            'stroke-dasharray': totalLength + ' ' + totalLength
        });

    });

}
 */