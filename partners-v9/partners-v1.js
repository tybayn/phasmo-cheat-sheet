$(window).on('load', function() {
    fetch("https://zero-network.net/zn/partners.html", {signal: AbortSignal.timeout(6000)})
    .then(data => data.text())
    .then(data => {
        setTimeout(() => {
            document.getElementById('partner_info_block').innerHTML += data
        },1000);
    })
    .catch(error => {
        // Om nom nom
    })
})