var fs=require('fs');
var s=fs.readFileSync('index.html','utf8');
s=s.replace(/(\?v=)(\d+)/g,function(m,p,n){return p+(parseInt(n,10)+1)});
fs.writeFileSync('index.html',s);
console.log('已升版本: '+ (s.match(/\?v=\d+/g)||[]).join(' '));
