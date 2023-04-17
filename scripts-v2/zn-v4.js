function getCookie(e){let t=e+"=",i=decodeURIComponent(document.cookie).split(";");for(let n=0;n<i.length;n++){let o=i[n];for(;" "==o.charAt(0);)o=o.substring(1);if(0==o.indexOf(t))return o.substring(t.length,o.length)}return""}
function setCookie(e,t,i){let n=new Date;n.setTime(n.getTime()+864e5*i);let o="expires="+n.toUTCString();document.cookie=e+"="+t+";"+o+";path=/"}
async function get_session(){
    var e="";
    var id;
    try{
        id = JSON.parse(getCookie("discord_link"))['id'];
    } catch(Error) {
        id = false;
    }
    e=await fetch(`https://zero-network.net/zn/${id ? '?discord_id='+id : ''}`,{headers:{Accept:"application/json"},signal: AbortSignal.timeout(2000)})
    .then(e=>e.json())
    .then(e => {
        setCookie("znid",e.znid,1)
        auto_link()
        getLink()
        $("#session").text(e.znid)
        heartbeat()
    })
    .catch(response => {
        setCookie("znid","no-connection-to-server",1)
        $("#session").text("no-connection-to-server")
    })
    
}
function heartbeat(){
    var uuid = getCookie("znid")
    if(uuid != "no-connection-to-server"){
        state['settings'] = JSON.stringify(user_settings)
        fetch("https://zero-network.net/zn/"+uuid,{method:"POST",Accept:"application/json",body:JSON.stringify(state),signal: AbortSignal.timeout(2000)})
        .then(response => response.json())
        .then(data => {
            $("#active-users-label").text("Active Users: " + data['active_num_users'])
            $(".active_title").text("Active Users: " + data['active_num_users'])
        })
        .catch(response => {
            $("#active-users-label").text("Active Users: -")
            $(".active_title").text("Active Users: -")
        });
    }
    else {
        $("#active-users-label").text("Active Users: -")
        $(".active_title").text("Active Users: -")
    }
}
var znid=getCookie("znid")
if(znid){
    auto_link()
    getLink()
    $("#session").text(znid)
    heartbeat()
}
else{
    get_session()
}