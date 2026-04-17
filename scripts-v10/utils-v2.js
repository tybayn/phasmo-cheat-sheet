function dtFormat(t,f){
    [match,YYYY,MM,DD,HH,mm,ss,TZ] = t.matchAll(/([0-9]{4})-([0-9]{2})-([0-9]{2}) ([0-9]{2}):([0-9]{2}):([0-9]{2}) ([a-zA-Z]{3})/mg).toArray()[0]
    return f.replaceAll("YYYY",YYYY).replaceAll("MM",MM).replaceAll("DD",DD).replaceAll("HH",HH).replaceAll("mm",mm).replaceAll("ss",ss).replaceAll("TZ",TZ)
}
function dtLocal(t,e="UTC",f="YYYY-MM-DD HH:mm:ss TZ"){let[i,n]=t.split(" "),[o,a,m]=i.split("-").map(Number),[r,d,u]=n.split(":").map(Number),h=Date.UTC(o,a-1,m,r,d,u),s=new Date(h),c=new Intl.DateTimeFormat("en-US",{timeZoneName:"short",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hour12:!1}),l=c.formatToParts(s),p=t=>l.find(e=>e.type===t)?.value,T=`${p("year")}-${p("month")}-${p("day")} ${p("hour")}:${p("minute")}:${p("second")}`,g=p("timeZoneName");return dtFormat(`${T} ${g}`,f)}
function getCurrentWeekUTC(){let t=new Date,e=t.getUTCDay(),C=new Date(Date.UTC(t.getUTCFullYear(),t.getUTCMonth(),t.getUTCDate()+((0===e?-6:1)-e)));C.setUTCHours(0,0,0,0);let T=new Date(C);T.setUTCDate(C.getUTCDate()+6),T.setUTCHours(23,59,59,999);let U=t=>{let e=String(t.getUTCMonth()+1).padStart(2,"0"),C=String(t.getUTCDate()).padStart(2,"0");return`${e}/${C}`};return`${U(C)} - ${U(T)}`}
function localize(text){
    let text1 = text.replaceAll(/([0-9]{4}-[0-9]{2}-[0-9]{2}) ([0-9]{2}:[0-9]{2}:[0-9]{2}) - ([0-9]{2}:[0-9]{2}:[0-9]{2}) \(([a-zA-Z]{3})\)|([0-9]{4}-[0-9]{2}-[0-9]{2}) ([0-9]{2}:[0-9]{2}:[0-9]{2}) - ([0-9]{2}:[0-9]{2}:[0-9]{2})( [a-zA-Z]{3})|([0-9]{4}-[0-9]{2}-[0-9]{2}) ([0-9]{2}:[0-9]{2}:[0-9]{2}) - ([0-9]{2}:[0-9]{2}:[0-9]{2})/gm,(match,p1,p2,p3,p4,p5,p6,p7,p8,p9,p10,p11)=>{
        if(p1){return `${dtLocal(p1+' '+p2,p4.trim(),'YYYY-MM-DD HH:mm:ss')} - ${dtLocal(p1+' '+p3,p4.trim(),'HH:mm:ss (TZ)')}`}
        else if(p4){return `${dtLocal(p5+' '+p6,p8.trim(),'YYYY-MM-DD HH:mm:ss')} - ${dtLocal(p5+' '+p7,p8.trim(),'HH:mm:ss TZ')}`}
        else if(p6){return `${dtLocal(p9+' '+p10,'UTC','YYYY-MM-DD HH:mm:ss')} - ${dtLocal(p9+' '+p11,'UTC','HH:mm:ss TZ')}`}
        else{return match}
    })
    if (text1!==text){return text1}
    return text.replaceAll(/([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2})( [a-zA-Z]{3})|([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2})/gm,(match,p1,p2,p3)=>{if(p1){return dtLocal(p1,p2.trim())}else if(p3){return dtLocal(p3)}else{return match}})
}