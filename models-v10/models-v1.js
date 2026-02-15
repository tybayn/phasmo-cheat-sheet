function load_models() {
    fetch("https://zero-network.net/phasmophobia/data/3d-models.json", {signal: AbortSignal.timeout(6000)})
    .then(data => data.json())
    .then(data => {

        setTimeout(() => {
            for(var i = 0; i < data.length; i++){
                models_found = true
                var model_html = `
                <div id="model_name">${data[i]['name']}</div>
                <div id="model_date">Modeled on: ${data[i]['designed_at']}<br>By: SeverelyZero</div>
                <img loading="lazy" src="${data[i]['image_url']}" id="model_image" onerror="this.style.display='none'" onload="this.style.display='block'">
                <div id="model_description">
                    <a href="https://www.thingiverse.com/thing:${data[i]['thingiverse_id']}" target="_blank">Download on Thingiverse >></a></div>
                <hr>
                `
                document.getElementById('3d_info_block').innerHTML += model_html
                
            }
        },1000);
    })
    .catch(error => {
        // Om nom nom
    })
}