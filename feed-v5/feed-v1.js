let feed_recent_date = null
let feed_interactions = {}

$(window).on('load', function() {
    fetch("https://zero-network.net/phasmophobia/data/feed.json", {signal: AbortSignal.timeout(6000)})
    .then(data => data.json())
    .then(data => {
        let feed_found = false
        if(data.length > 0){
            var last_checked = getCookie("feed_last_date")
            try{
                feed_interactions = JSON.parse(getCookie("feed_interactions"))
            }
            catch(e){
                feed_interactions = {}
            }
            feed_recent_date = data[0]['start_date']
            if(feed_recent_date != last_checked){
                document.getElementById("feed_icon_img").src = "imgs/news-icon-notif.png"
            }
        }

        for(var i = 0; i < data.length; i++){
            feed_found = true
            var feed_html = `
            <div id="feed_title">${data[i]['title']}</div>
            <div id="feed_date">${data[i]['start_date'].replace('T',' ')}</div>
            <img loading="lazy" src="${data[i]['thumbnail']}" id="feed_image" onerror="this.style.display='none'" onload="this.style.display='block'">
            <div id="feed_description">${data[i]['description']}</div>
            <div id="feed_notes">${data[i]['notes']}</div>
            <div id="feed_sentiment">
                <div id="feed_like"><img class="feed_icon${(feed_interactions[data[i]['title']] ?? '') == 'liked' ? ' liked' : ''}" src="imgs/arrow.png" onclick="like_feed(this,'${data[i]['title']}')"></div>
                <div id="feed_sentiment_value">${data[i]['likes']-data[i]['dislikes']}</div>
                <div id="feed_dislike"><img class="feed_icon${(feed_interactions[data[i]['title']] ?? '') == 'disliked' ? ' disliked' : ''}" src="imgs/arrow.png" onclick="dislike_feed(this,'${data[i]['title']}')" style="transform: rotate(180deg)"></div>
            </div>
            <hr>
            `
            document.getElementById('feed_info_block').innerHTML += feed_html
        }
        if(!feed_found){
            var feed_html = `
            <div id="feed_title">Feed is empty!</div>
            <div id="feed_date"></div>
            <img src="" id="feed_image" onerror="this.style.display='none'" onload="this.style.display='block'">
            <div id="feed_description">Check back later!</div>
            <div id="feed_notes"></div>
            <hr>
            `
            document.getElementById('feed_info_block').innerHTML += feed_html
        }
    })
    .catch(error => {
        // Om nom nom
    })
})

function mark_feed_read(){
    setCookie("feed_last_date",feed_recent_date,365)
    document.getElementById("feed_icon_img").src = "imgs/news-icon.png"
}

function like_feed(elem,title){
    var prev = parseInt($(elem.parentElement).siblings("#feed_sentiment_value")[0].textContent)
    var co = $(elem.parentElement).siblings("#feed_dislike")[0].children[0]
    var lvalue = 0
    var dvalue = 0
    if($(elem).hasClass("liked")){
        lvalue = -1
        $(elem).removeClass("liked")
        delete feed_interactions[title]
    }
    else{
        lvalue = 1
        $(elem).addClass("liked")
        if($(co).hasClass("disliked")){
            $(co).removeClass("disliked")
            dvalue = 1
            interact_post(title,"negative",dvalue*-1)
        }
        feed_interactions[title] = "liked"
    }
    
    interact_post(title,"positive",lvalue)
    $(elem.parentElement).siblings("#feed_sentiment_value")[0].textContent = prev + lvalue + dvalue
    setCookie("feed_interactions",JSON.stringify(feed_interactions),365)
}

function dislike_feed(elem,title){
    var prev = parseInt($(elem.parentElement).siblings("#feed_sentiment_value")[0].textContent)
    var co = $(elem.parentElement).siblings("#feed_like")[0].children[0]
    var lvalue = 0
    var dvalue = 0
    if($(elem).hasClass("disliked")){
        dvalue = -1
        $(elem).removeClass("disliked")
        delete feed_interactions[title]
    }
    else{
        dvalue = 1
        $(elem).addClass("disliked")
        if($(co).hasClass("liked")){
            $(co).removeClass("liked")
            lvalue = 1
            interact_post(title,"positive",lvalue*-1)
        }
        feed_interactions[title] = "disliked"
    }

    interact_post(title,"negative",dvalue)
    $(elem.parentElement).siblings("#feed_sentiment_value")[0].textContent = prev - dvalue - lvalue
    setCookie("feed_interactions",JSON.stringify(feed_interactions),365)
}

function interact_post(title, sentiment, value){
    var interaction_body = {
        "title":title,
        "sentiment":sentiment,
        "value":value
    }

    fetch("https://zero-network.net/phasmophobia/data/feed/interact",{
        method:"POST",
        headers:{
            'Content-Type':'application/json'
        },
        body:JSON.stringify(interaction_body),
        signal: AbortSignal.timeout(2000)
    })
    .catch((response) => {
        // Om nom nom
    });
}