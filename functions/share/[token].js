export async function onRequestGet({env,request}){
  const url=new URL(request.url);
  return env.ASSETS.fetch(new Request(new URL('/index.html',url),{headers:request.headers}));
}
