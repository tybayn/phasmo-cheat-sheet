var kill_sparkle = true

function set_sparkle(val) {
    kill_sparkle = val
}

function initSparkling() {
    // settings
    const color = "#FFFFAC";
    const svgPath = 'M26.5 25.5C19.0043 33.3697 0 34 0 34C0 34 19.1013 35.3684 26.5 43.5C33.234 50.901 34 68 34 68C34 68 36.9884 50.7065 44.5 43.5C51.6431 36.647 68 34 68 34C68 34 51.6947 32.0939 44.5 25.5C36.5605 18.2235 34 0 34 0C34 0 33.6591 17.9837 26.5 25.5Z';

    // sparkling effect
    let sparkling = function() {
        $('.sparkling').each(function() {
            let sparklingElement = $(this);
            let stars = sparklingElement.find('.star');

            // remove the first star when more than 6 stars existing
            if(stars.length > 5) {
                stars.each(function(index) {
                    if(index === 0) {
                        $(this).remove();
                    }
                });
            }
            // add a new star
            sparklingElement.append(addStar(sparklingElement));
        });

        let rand = Math.round(Math.random() * 700) + 300;
        if(!kill_sparkle){
            setTimeout(sparkling, rand);
        }
        else{
            try{
                stars.each(function(index) {
                    if(index === 0) {
                        $(this).remove();
                    }
                });
            } catch(Error) {
                // Om nom nom
            }
        }
    }
			
    // star
    let addStar = function(sparklingElement) {

        let child = sparklingElement.find('img')
        let size = Math.floor(Math.random() * 10) + 10;
        let top = Math.floor(Math.random() * child.height());
        let left = Math.floor(Math.random() * child.width());

        return '<span class="star" style="top:' + top + 'px; left:' + left + 'px;">'
            + '<svg width="' + size + '" height="' + size + '" viewBox="0 0 68 68" fill="none">'
            + '<path d="' + svgPath + '" fill="' + color + '" /></svg></span>';
    }

    // execute
    sparkling();
}