function getCookie(e){let t=e+"=",i=decodeURIComponent(document.cookie).split(";");for(let n=0;n<i.length;n++){let o=i[n];for(;" "==o.charAt(0);)o=o.substring(1);if(0==o.indexOf(t))return o.substring(t.length,o.length)}return""}
function setCookie(e,t,i){let n=new Date;n.setTime(n.getTime()+864e5*i);let o="expires="+n.toUTCString();document.cookie=e+"="+t+";"+o+";path=/"}
async function get_session(){
    var e="";
    e=await fetch("https://zero-network.duckdns.org/analytics/",{headers:{Accept:"application/json"},signal: AbortSignal.timeout(8000)})
    .then(e=>e.json());
    setCookie("znid",e.znid,1)
    $("#session").text(e.znid)
    heartbeat()
}
function heartbeat(){
    var uuid = getCookie("znid")
    fetch("https://zero-network.duckdns.org/analytics/"+uuid,{method:"POST",Accept:"application/json",body:JSON.stringify(state),signal: AbortSignal.timeout(8000)})
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
var znid=getCookie("znid")
if(znid){
    $("#session").text(znid)
    heartbeat()
}
else{
    get_session()
}