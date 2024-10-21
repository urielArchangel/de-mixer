export const urlresolve = (a:string)=>{
if(process.env.NODE_ENV == "production"){
    return window.location.origin+a;
}else{
    return a
}
}