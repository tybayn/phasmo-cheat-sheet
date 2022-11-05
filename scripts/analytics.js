function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

async function get_session(){
    var uuid = ''

    uuid = await fetch("http://zero-network.duckdns.org:54480/session",{headers:{"Accept":"application/json"}}).then((Response) => {
        return Response.json()
    })

    data = await fetch("https://ipinfo.io",{headers:{"Accept":"application/json"}}).then((Response) => {
        return Response.json()
    })

    var payload = {
        "language":String(navigator.language),
        "platform":String(navigator.platform),
        "agent":String(navigator.userAgent),
        "webdriver":String(navigator.webdriver),
        "ip":String(data["ip"]),
        "city":String(data["city"]),
        "region":String(data["region"]),
        "country":String(data["country"]),
        "timezone":String(data["timezone"])
    }

    response = await fetch("http://zero-network.duckdns.org:54480/analytics/"+uuid['uuid'],{method:'POST',body:JSON.stringify(payload)}).then((Response) => {
        return Response.json()
    })

    setCookie("session",uuid['uuid'],1)
    $("#session").text(uuid['uuid'])
}

var uuid = getCookie("session");
if (!uuid){
    get_session()
}
else{
    console.log(uuid)
    $("#session").text(uuid)
}
