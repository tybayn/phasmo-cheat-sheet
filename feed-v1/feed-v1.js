let feed_recent_date = null

$(window).on('load', function() {
    fetch("https://zero-network.net/phasmophobia/data/feed.json", {signal: AbortSignal.timeout(6000)})
    .then(data => data.json())
    .then(data => {
        let feed_found = false
        if(data.length > 0){
            var last_checked = getCookie("feed_last_date")
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
            <img src="${data[i]['thumbnail']}" id="feed_image" onerror="this.style.display='none'" onload="this.style.display='block'">
            <div id="feed_description">${data[i]['description']}</div>
            <div id="feed_notes">${data[i]['notes']}</div>
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
    setCookie("feed_last_date",feed_recent_date,90)
    document.getElementById("feed_icon_img").src = "imgs/news-icon.png"
}