;(function(e,t,n){function i(n,s){if(!t[n]){if(!e[n]){var o=typeof require=="function"&&require;if(!s&&o)return o(n,!0);if(r)return r(n,!0);throw new Error("Cannot find module '"+n+"'")}var u=t[n]={exports:{}};e[n][0].call(u.exports,function(t){var r=e[n][1][t];return i(r?r:t)},u,u.exports)}return t[n].exports}var r=typeof require=="function"&&require;for(var s=0;s<n.length;s++)i(n[s]);return i})({1:[function(require,module,exports){
const Zlib = module.exports = require('./zlib');

// the least I can do is make error messages for the rest of the node.js/zlib api.
// (thanks, dominictarr)
function error () {
  var m = [].slice.call(arguments).join(' ')
  throw new Error([
    m,
    'we accept pull requests',
    'http://github.com/brianloveswords/zlib-browserify'
    ].join('\n'))
}

;['createGzip'
, 'createGunzip'
, 'createDeflate'
, 'createDeflateRaw'
, 'createInflate'
, 'createInflateRaw'
, 'createUnzip'
, 'Gzip'
, 'Gunzip'
, 'Inflate'
, 'InflateRaw'
, 'Deflate'
, 'DeflateRaw'
, 'Unzip'
, 'inflateRaw'
, 'deflateRaw'].forEach(function (name) {
  Zlib[name] = function () {
    error('sorry,', name, 'is not implemented yet')
  }
});

const _deflate = Zlib.deflate;
const _gzip = Zlib.gzip;

Zlib.deflate = function deflate(stringOrBuffer, callback) {
  return _deflate(BufferShim(stringOrBuffer), callback);
};
Zlib.gzip = function gzip(stringOrBuffer, callback) {
  return _gzip(BufferShim(stringOrBuffer), callback);
};
},{"./zlib":2}],2:[function(require,module,exports){
(function(process){/** @license zlib.js 2012 - imaya [ https://github.com/imaya/zlib.js ] The MIT License */
(function() {'use strict';function m(c){throw c;}var r=void 0,u=!0;var B="undefined"!==typeof Uint8Array&&"undefined"!==typeof Uint16Array&&"undefined"!==typeof Uint32Array;function aa(c){if("string"===typeof c){var a=c.split(""),b,e;b=0;for(e=a.length;b<e;b++)a[b]=(a[b].charCodeAt(0)&255)>>>0;c=a}for(var f=1,d=0,g=c.length,h,j=0;0<g;){h=1024<g?1024:g;g-=h;do f+=c[j++],d+=f;while(--h);f%=65521;d%=65521}return(d<<16|f)>>>0};function I(c,a){this.index="number"===typeof a?a:0;this.n=0;this.buffer=c instanceof(B?Uint8Array:Array)?c:new (B?Uint8Array:Array)(32768);2*this.buffer.length<=this.index&&m(Error("invalid index"));this.buffer.length<=this.index&&this.f()}I.prototype.f=function(){var c=this.buffer,a,b=c.length,e=new (B?Uint8Array:Array)(b<<1);if(B)e.set(c);else for(a=0;a<b;++a)e[a]=c[a];return this.buffer=e};
I.prototype.d=function(c,a,b){var e=this.buffer,f=this.index,d=this.n,g=e[f],h;b&&1<a&&(c=8<a?(K[c&255]<<24|K[c>>>8&255]<<16|K[c>>>16&255]<<8|K[c>>>24&255])>>32-a:K[c]>>8-a);if(8>a+d)g=g<<a|c,d+=a;else for(h=0;h<a;++h)g=g<<1|c>>a-h-1&1,8===++d&&(d=0,e[f++]=K[g],g=0,f===e.length&&(e=this.f()));e[f]=g;this.buffer=e;this.n=d;this.index=f};I.prototype.finish=function(){var c=this.buffer,a=this.index,b;0<this.n&&(c[a]<<=8-this.n,c[a]=K[c[a]],a++);B?b=c.subarray(0,a):(c.length=a,b=c);return b};
var ba=new (B?Uint8Array:Array)(256),Q;for(Q=0;256>Q;++Q){for(var R=Q,ga=R,ha=7,R=R>>>1;R;R>>>=1)ga<<=1,ga|=R&1,--ha;ba[Q]=(ga<<ha&255)>>>0}var K=ba;var S={k:function(c,a,b){return S.update(c,0,a,b)},update:function(c,a,b,e){for(var f=S.L,d="number"===typeof b?b:b=0,g="number"===typeof e?e:c.length,a=a^4294967295,d=g&7;d--;++b)a=a>>>8^f[(a^c[b])&255];for(d=g>>3;d--;b+=8)a=a>>>8^f[(a^c[b])&255],a=a>>>8^f[(a^c[b+1])&255],a=a>>>8^f[(a^c[b+2])&255],a=a>>>8^f[(a^c[b+3])&255],a=a>>>8^f[(a^c[b+4])&255],a=a>>>8^f[(a^c[b+5])&255],a=a>>>8^f[(a^c[b+6])&255],a=a>>>8^f[(a^c[b+7])&255];return(a^4294967295)>>>0}},ia=S,ja,ka=[0,1996959894,3993919788,2567524794,
124634137,1886057615,3915621685,2657392035,249268274,2044508324,3772115230,2547177864,162941995,2125561021,3887607047,2428444049,498536548,1789927666,4089016648,2227061214,450548861,1843258603,4107580753,2211677639,325883990,1684777152,4251122042,2321926636,335633487,1661365465,4195302755,2366115317,997073096,1281953886,3579855332,2724688242,1006888145,1258607687,3524101629,2768942443,901097722,1119000684,3686517206,2898065728,853044451,1172266101,3705015759,2882616665,651767980,1373503546,3369554304,
3218104598,565507253,1454621731,3485111705,3099436303,671266974,1594198024,3322730930,2970347812,795835527,1483230225,3244367275,3060149565,1994146192,31158534,2563907772,4023717930,1907459465,112637215,2680153253,3904427059,2013776290,251722036,2517215374,3775830040,2137656763,141376813,2439277719,3865271297,1802195444,476864866,2238001368,4066508878,1812370925,453092731,2181625025,4111451223,1706088902,314042704,2344532202,4240017532,1658658271,366619977,2362670323,4224994405,1303535960,984961486,
2747007092,3569037538,1256170817,1037604311,2765210733,3554079995,1131014506,879679996,2909243462,3663771856,1141124467,855842277,2852801631,3708648649,1342533948,654459306,3188396048,3373015174,1466479909,544179635,3110523913,3462522015,1591671054,702138776,2966460450,3352799412,1504918807,783551873,3082640443,3233442989,3988292384,2596254646,62317068,1957810842,3939845945,2647816111,81470997,1943803523,3814918930,2489596804,225274430,2053790376,3826175755,2466906013,167816743,2097651377,4027552580,
2265490386,503444072,1762050814,4150417245,2154129355,426522225,1852507879,4275313526,2312317920,282753626,1742555852,4189708143,2394877945,397917763,1622183637,3604390888,2714866558,953729732,1340076626,3518719985,2797360999,1068828381,1219638859,3624741850,2936675148,906185462,1090812512,3747672003,2825379669,829329135,1181335161,3412177804,3160834842,628085408,1382605366,3423369109,3138078467,570562233,1426400815,3317316542,2998733608,733239954,1555261956,3268935591,3050360625,752459403,1541320221,
2607071920,3965973030,1969922972,40735498,2617837225,3943577151,1913087877,83908371,2512341634,3803740692,2075208622,213261112,2463272603,3855990285,2094854071,198958881,2262029012,4057260610,1759359992,534414190,2176718541,4139329115,1873836001,414664567,2282248934,4279200368,1711684554,285281116,2405801727,4167216745,1634467795,376229701,2685067896,3608007406,1308918612,956543938,2808555105,3495958263,1231636301,1047427035,2932959818,3654703836,1088359270,936918E3,2847714899,3736837829,1202900863,
817233897,3183342108,3401237130,1404277552,615818150,3134207493,3453421203,1423857449,601450431,3009837614,3294710456,1567103746,711928724,3020668471,3272380065,1510334235,755167117];ja=B?new Uint32Array(ka):ka;ia.L=ja;function na(){};function oa(c){this.buffer=new (B?Uint16Array:Array)(2*c);this.length=0}oa.prototype.getParent=function(c){return 2*((c-2)/4|0)};oa.prototype.push=function(c,a){var b,e,f=this.buffer,d;b=this.length;f[this.length++]=a;for(f[this.length++]=c;0<b;)if(e=this.getParent(b),f[b]>f[e])d=f[b],f[b]=f[e],f[e]=d,d=f[b+1],f[b+1]=f[e+1],f[e+1]=d,b=e;else break;return this.length};
oa.prototype.pop=function(){var c,a,b=this.buffer,e,f,d;a=b[0];c=b[1];this.length-=2;b[0]=b[this.length];b[1]=b[this.length+1];for(d=0;;){f=2*d+2;if(f>=this.length)break;f+2<this.length&&b[f+2]>b[f]&&(f+=2);if(b[f]>b[d])e=b[d],b[d]=b[f],b[f]=e,e=b[d+1],b[d+1]=b[f+1],b[f+1]=e;else break;d=f}return{index:c,value:a,length:this.length}};function T(c){var a=c.length,b=0,e=Number.POSITIVE_INFINITY,f,d,g,h,j,i,q,l,k;for(l=0;l<a;++l)c[l]>b&&(b=c[l]),c[l]<e&&(e=c[l]);f=1<<b;d=new (B?Uint32Array:Array)(f);g=1;h=0;for(j=2;g<=b;){for(l=0;l<a;++l)if(c[l]===g){i=0;q=h;for(k=0;k<g;++k)i=i<<1|q&1,q>>=1;for(k=i;k<f;k+=j)d[k]=g<<16|l;++h}++g;h<<=1;j<<=1}return[d,b,e]};function pa(c,a){this.l=qa;this.F=0;this.input=c;this.b=0;a&&(a.lazy&&(this.F=a.lazy),"number"===typeof a.compressionType&&(this.l=a.compressionType),a.outputBuffer&&(this.a=B&&a.outputBuffer instanceof Array?new Uint8Array(a.outputBuffer):a.outputBuffer),"number"===typeof a.outputIndex&&(this.b=a.outputIndex));this.a||(this.a=new (B?Uint8Array:Array)(32768))}var qa=2,ra={NONE:0,K:1,u:qa,W:3},sa=[],U;
for(U=0;288>U;U++)switch(u){case 143>=U:sa.push([U+48,8]);break;case 255>=U:sa.push([U-144+400,9]);break;case 279>=U:sa.push([U-256+0,7]);break;case 287>=U:sa.push([U-280+192,8]);break;default:m("invalid literal: "+U)}
pa.prototype.h=function(){var c,a,b,e,f=this.input;switch(this.l){case 0:b=0;for(e=f.length;b<e;){a=B?f.subarray(b,b+65535):f.slice(b,b+65535);b+=a.length;var d=a,g=b===e,h=r,j=r,i=r,q=r,l=r,k=this.a,p=this.b;if(B){for(k=new Uint8Array(this.a.buffer);k.length<=p+d.length+5;)k=new Uint8Array(k.length<<1);k.set(this.a)}h=g?1:0;k[p++]=h|0;j=d.length;i=~j+65536&65535;k[p++]=j&255;k[p++]=j>>>8&255;k[p++]=i&255;k[p++]=i>>>8&255;if(B)k.set(d,p),p+=d.length,k=k.subarray(0,p);else{q=0;for(l=d.length;q<l;++q)k[p++]=
d[q];k.length=p}this.b=p;this.a=k}break;case 1:var t=new I(new Uint8Array(this.a.buffer),this.b);t.d(1,1,u);t.d(1,2,u);var v=ta(this,f),x,F,w;x=0;for(F=v.length;x<F;x++)if(w=v[x],I.prototype.d.apply(t,sa[w]),256<w)t.d(v[++x],v[++x],u),t.d(v[++x],5),t.d(v[++x],v[++x],u);else if(256===w)break;this.a=t.finish();this.b=this.a.length;break;case qa:var A=new I(new Uint8Array(this.a),this.b),C,n,s,E,D,ca=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],V,La,da,Ma,la,va=Array(19),Na,Z,ma,G,Oa;C=qa;A.d(1,
1,u);A.d(C,2,u);n=ta(this,f);V=ua(this.T,15);La=wa(V);da=ua(this.S,7);Ma=wa(da);for(s=286;257<s&&0===V[s-1];s--);for(E=30;1<E&&0===da[E-1];E--);var Pa=s,Qa=E,M=new (B?Uint32Array:Array)(Pa+Qa),y,N,z,ea,L=new (B?Uint32Array:Array)(316),J,H,O=new (B?Uint8Array:Array)(19);for(y=N=0;y<Pa;y++)M[N++]=V[y];for(y=0;y<Qa;y++)M[N++]=da[y];if(!B){y=0;for(ea=O.length;y<ea;++y)O[y]=0}y=J=0;for(ea=M.length;y<ea;y+=N){for(N=1;y+N<ea&&M[y+N]===M[y];++N);z=N;if(0===M[y])if(3>z)for(;0<z--;)L[J++]=0,O[0]++;else for(;0<
z;)H=138>z?z:138,H>z-3&&H<z&&(H=z-3),10>=H?(L[J++]=17,L[J++]=H-3,O[17]++):(L[J++]=18,L[J++]=H-11,O[18]++),z-=H;else if(L[J++]=M[y],O[M[y]]++,z--,3>z)for(;0<z--;)L[J++]=M[y],O[M[y]]++;else for(;0<z;)H=6>z?z:6,H>z-3&&H<z&&(H=z-3),L[J++]=16,L[J++]=H-3,O[16]++,z-=H}c=B?L.subarray(0,J):L.slice(0,J);la=ua(O,7);for(G=0;19>G;G++)va[G]=la[ca[G]];for(D=19;4<D&&0===va[D-1];D--);Na=wa(la);A.d(s-257,5,u);A.d(E-1,5,u);A.d(D-4,4,u);for(G=0;G<D;G++)A.d(va[G],3,u);G=0;for(Oa=c.length;G<Oa;G++)if(Z=c[G],A.d(Na[Z],
la[Z],u),16<=Z){G++;switch(Z){case 16:ma=2;break;case 17:ma=3;break;case 18:ma=7;break;default:m("invalid code: "+Z)}A.d(c[G],ma,u)}var Ra=[La,V],Sa=[Ma,da],P,Ta,fa,ya,Ua,Va,Wa,Xa;Ua=Ra[0];Va=Ra[1];Wa=Sa[0];Xa=Sa[1];P=0;for(Ta=n.length;P<Ta;++P)if(fa=n[P],A.d(Ua[fa],Va[fa],u),256<fa)A.d(n[++P],n[++P],u),ya=n[++P],A.d(Wa[ya],Xa[ya],u),A.d(n[++P],n[++P],u);else if(256===fa)break;this.a=A.finish();this.b=this.a.length;break;default:m("invalid compression type")}return this.a};
function xa(c,a){this.length=c;this.N=a}
function za(){var c=Aa;switch(u){case 3===c:return[257,c-3,0];case 4===c:return[258,c-4,0];case 5===c:return[259,c-5,0];case 6===c:return[260,c-6,0];case 7===c:return[261,c-7,0];case 8===c:return[262,c-8,0];case 9===c:return[263,c-9,0];case 10===c:return[264,c-10,0];case 12>=c:return[265,c-11,1];case 14>=c:return[266,c-13,1];case 16>=c:return[267,c-15,1];case 18>=c:return[268,c-17,1];case 22>=c:return[269,c-19,2];case 26>=c:return[270,c-23,2];case 30>=c:return[271,c-27,2];case 34>=c:return[272,c-
31,2];case 42>=c:return[273,c-35,3];case 50>=c:return[274,c-43,3];case 58>=c:return[275,c-51,3];case 66>=c:return[276,c-59,3];case 82>=c:return[277,c-67,4];case 98>=c:return[278,c-83,4];case 114>=c:return[279,c-99,4];case 130>=c:return[280,c-115,4];case 162>=c:return[281,c-131,5];case 194>=c:return[282,c-163,5];case 226>=c:return[283,c-195,5];case 257>=c:return[284,c-227,5];case 258===c:return[285,c-258,0];default:m("invalid length: "+c)}}var Ba=[],Aa,Ca;
for(Aa=3;258>=Aa;Aa++)Ca=za(),Ba[Aa]=Ca[2]<<24|Ca[1]<<16|Ca[0];var Da=B?new Uint32Array(Ba):Ba;
function ta(c,a){function b(a,c){var b=a.N,d=[],e=0,f;f=Da[a.length];d[e++]=f&65535;d[e++]=f>>16&255;d[e++]=f>>24;var g;switch(u){case 1===b:g=[0,b-1,0];break;case 2===b:g=[1,b-2,0];break;case 3===b:g=[2,b-3,0];break;case 4===b:g=[3,b-4,0];break;case 6>=b:g=[4,b-5,1];break;case 8>=b:g=[5,b-7,1];break;case 12>=b:g=[6,b-9,2];break;case 16>=b:g=[7,b-13,2];break;case 24>=b:g=[8,b-17,3];break;case 32>=b:g=[9,b-25,3];break;case 48>=b:g=[10,b-33,4];break;case 64>=b:g=[11,b-49,4];break;case 96>=b:g=[12,b-
65,5];break;case 128>=b:g=[13,b-97,5];break;case 192>=b:g=[14,b-129,6];break;case 256>=b:g=[15,b-193,6];break;case 384>=b:g=[16,b-257,7];break;case 512>=b:g=[17,b-385,7];break;case 768>=b:g=[18,b-513,8];break;case 1024>=b:g=[19,b-769,8];break;case 1536>=b:g=[20,b-1025,9];break;case 2048>=b:g=[21,b-1537,9];break;case 3072>=b:g=[22,b-2049,10];break;case 4096>=b:g=[23,b-3073,10];break;case 6144>=b:g=[24,b-4097,11];break;case 8192>=b:g=[25,b-6145,11];break;case 12288>=b:g=[26,b-8193,12];break;case 16384>=
b:g=[27,b-12289,12];break;case 24576>=b:g=[28,b-16385,13];break;case 32768>=b:g=[29,b-24577,13];break;default:m("invalid distance")}f=g;d[e++]=f[0];d[e++]=f[1];d[e++]=f[2];var h,i;h=0;for(i=d.length;h<i;++h)k[p++]=d[h];v[d[0]]++;x[d[3]]++;t=a.length+c-1;l=null}var e,f,d,g,h,j={},i,q,l,k=B?new Uint16Array(2*a.length):[],p=0,t=0,v=new (B?Uint32Array:Array)(286),x=new (B?Uint32Array:Array)(30),F=c.F,w;if(!B){for(d=0;285>=d;)v[d++]=0;for(d=0;29>=d;)x[d++]=0}v[256]=1;e=0;for(f=a.length;e<f;++e){d=h=0;
for(g=3;d<g&&e+d!==f;++d)h=h<<8|a[e+d];j[h]===r&&(j[h]=[]);i=j[h];if(!(0<t--)){for(;0<i.length&&32768<e-i[0];)i.shift();if(e+3>=f){l&&b(l,-1);d=0;for(g=f-e;d<g;++d)w=a[e+d],k[p++]=w,++v[w];break}if(0<i.length){var A=r,C=r,n=0,s=r,E=r,D=r,ca=r,V=a.length,E=0,ca=i.length;a:for(;E<ca;E++){A=i[ca-E-1];s=3;if(3<n){for(D=n;3<D;D--)if(a[A+D-1]!==a[e+D-1])continue a;s=n}for(;258>s&&e+s<V&&a[A+s]===a[e+s];)++s;s>n&&(C=A,n=s);if(258===s)break}q=new xa(n,e-C);l?l.length<q.length?(w=a[e-1],k[p++]=w,++v[w],b(q,
0)):b(l,-1):q.length<F?l=q:b(q,0)}else l?b(l,-1):(w=a[e],k[p++]=w,++v[w])}i.push(e)}k[p++]=256;v[256]++;c.T=v;c.S=x;return B?k.subarray(0,p):k}
function ua(c,a){function b(a){var c=x[a][F[a]];c===l?(b(a+1),b(a+1)):--t[c];++F[a]}var e=c.length,f=new oa(572),d=new (B?Uint8Array:Array)(e),g,h,j,i,q;if(!B)for(i=0;i<e;i++)d[i]=0;for(i=0;i<e;++i)0<c[i]&&f.push(i,c[i]);g=Array(f.length/2);h=new (B?Uint32Array:Array)(f.length/2);if(1===g.length)return d[f.pop().index]=1,d;i=0;for(q=f.length/2;i<q;++i)g[i]=f.pop(),h[i]=g[i].value;var l=h.length,k=new (B?Uint16Array:Array)(a),p=new (B?Uint8Array:Array)(a),t=new (B?Uint8Array:Array)(l),v=Array(a),x=
Array(a),F=Array(a),w=(1<<a)-l,A=1<<a-1,C,n,s,E,D;k[a-1]=l;for(n=0;n<a;++n)w<A?p[n]=0:(p[n]=1,w-=A),w<<=1,k[a-2-n]=(k[a-1-n]/2|0)+l;k[0]=p[0];v[0]=Array(k[0]);x[0]=Array(k[0]);for(n=1;n<a;++n)k[n]>2*k[n-1]+p[n]&&(k[n]=2*k[n-1]+p[n]),v[n]=Array(k[n]),x[n]=Array(k[n]);for(C=0;C<l;++C)t[C]=a;for(s=0;s<k[a-1];++s)v[a-1][s]=h[s],x[a-1][s]=s;for(C=0;C<a;++C)F[C]=0;1===p[a-1]&&(--t[0],++F[a-1]);for(n=a-2;0<=n;--n){E=C=0;D=F[n+1];for(s=0;s<k[n];s++)E=v[n+1][D]+v[n+1][D+1],E>h[C]?(v[n][s]=E,x[n][s]=l,D+=2):
(v[n][s]=h[C],x[n][s]=C,++C);F[n]=0;1===p[n]&&b(n)}j=t;i=0;for(q=g.length;i<q;++i)d[g[i].index]=j[i];return d}function wa(c){var a=new (B?Uint16Array:Array)(c.length),b=[],e=[],f=0,d,g,h,j;d=0;for(g=c.length;d<g;d++)b[c[d]]=(b[c[d]]|0)+1;d=1;for(g=16;d<=g;d++)e[d]=f,f+=b[d]|0,f<<=1;d=0;for(g=c.length;d<g;d++){f=e[c[d]];e[c[d]]+=1;h=a[d]=0;for(j=c[d];h<j;h++)a[d]=a[d]<<1|f&1,f>>>=1}return a};function Ea(c,a){this.input=c;this.a=new (B?Uint8Array:Array)(32768);this.l=Fa.u;var b={},e;if((a||!(a={}))&&"number"===typeof a.compressionType)this.l=a.compressionType;for(e in a)b[e]=a[e];b.outputBuffer=this.a;this.H=new pa(this.input,b)}var Fa=ra;
Ea.prototype.h=function(){var c,a,b,e,f,d,g,h=0;g=this.a;c=Ga;switch(c){case Ga:a=Math.LOG2E*Math.log(32768)-8;break;default:m(Error("invalid compression method"))}b=a<<4|c;g[h++]=b;switch(c){case Ga:switch(this.l){case Fa.NONE:f=0;break;case Fa.K:f=1;break;case Fa.u:f=2;break;default:m(Error("unsupported compression type"))}break;default:m(Error("invalid compression method"))}e=f<<6|0;g[h++]=e|31-(256*b+e)%31;d=aa(this.input);this.H.b=h;g=this.H.h();h=g.length;B&&(g=new Uint8Array(g.buffer),g.length<=
h+4&&(this.a=new Uint8Array(g.length+4),this.a.set(g),g=this.a),g=g.subarray(0,h+4));g[h++]=d>>24&255;g[h++]=d>>16&255;g[h++]=d>>8&255;g[h++]=d&255;return g};function Ha(c,a){this.input=c;this.b=this.c=0;this.g={};a&&(a.flags&&(this.g=a.flags),"string"===typeof a.filename&&(this.filename=a.filename),"string"===typeof a.comment&&(this.comment=a.comment),a.deflateOptions&&(this.m=a.deflateOptions));this.m||(this.m={})}
Ha.prototype.h=function(){var c,a,b,e,f,d,g,h,j=new (B?Uint8Array:Array)(32768),i=0,q=this.input,l=this.c,k=this.filename,p=this.comment;j[i++]=31;j[i++]=139;j[i++]=8;c=0;this.g.fname&&(c|=Ia);this.g.fcomment&&(c|=Ja);this.g.fhcrc&&(c|=Ka);j[i++]=c;a=(Date.now?Date.now():+new Date)/1E3|0;j[i++]=a&255;j[i++]=a>>>8&255;j[i++]=a>>>16&255;j[i++]=a>>>24&255;j[i++]=0;j[i++]=Ya;if(this.g.fname!==r){g=0;for(h=k.length;g<h;++g)d=k.charCodeAt(g),255<d&&(j[i++]=d>>>8&255),j[i++]=d&255;j[i++]=0}if(this.g.comment){g=
0;for(h=p.length;g<h;++g)d=p.charCodeAt(g),255<d&&(j[i++]=d>>>8&255),j[i++]=d&255;j[i++]=0}this.g.fhcrc&&(b=S.k(j,0,i)&65535,j[i++]=b&255,j[i++]=b>>>8&255);this.m.outputBuffer=j;this.m.outputIndex=i;f=new pa(q,this.m);j=f.h();i=f.b;B&&(i+8>j.buffer.byteLength?(this.a=new Uint8Array(i+8),this.a.set(new Uint8Array(j.buffer)),j=this.a):j=new Uint8Array(j.buffer));e=S.k(q);j[i++]=e&255;j[i++]=e>>>8&255;j[i++]=e>>>16&255;j[i++]=e>>>24&255;h=q.length;j[i++]=h&255;j[i++]=h>>>8&255;j[i++]=h>>>16&255;j[i++]=
h>>>24&255;this.c=l;B&&i<j.length&&(this.a=j=j.subarray(0,i));return j};var Ya=255,Ka=2,Ia=8,Ja=16;function W(c,a){this.p=[];this.q=32768;this.e=this.j=this.c=this.t=0;this.input=B?new Uint8Array(c):c;this.v=!1;this.r=Za;this.J=!1;if(a||!(a={}))a.index&&(this.c=a.index),a.bufferSize&&(this.q=a.bufferSize),a.bufferType&&(this.r=a.bufferType),a.resize&&(this.J=a.resize);switch(this.r){case $a:this.b=32768;this.a=new (B?Uint8Array:Array)(32768+this.q+258);break;case Za:this.b=0;this.a=new (B?Uint8Array:Array)(this.q);this.f=this.R;this.z=this.O;this.s=this.Q;break;default:m(Error("invalid inflate mode"))}}
var $a=0,Za=1;
W.prototype.i=function(){for(;!this.v;){var c=X(this,3);c&1&&(this.v=u);c>>>=1;switch(c){case 0:var a=this.input,b=this.c,e=this.a,f=this.b,d=r,g=r,h=r,j=e.length,i=r;this.e=this.j=0;d=a[b++];d===r&&m(Error("invalid uncompressed block header: LEN (first byte)"));g=d;d=a[b++];d===r&&m(Error("invalid uncompressed block header: LEN (second byte)"));g|=d<<8;d=a[b++];d===r&&m(Error("invalid uncompressed block header: NLEN (first byte)"));h=d;d=a[b++];d===r&&m(Error("invalid uncompressed block header: NLEN (second byte)"));h|=
d<<8;g===~h&&m(Error("invalid uncompressed block header: length verify"));b+g>a.length&&m(Error("input buffer is broken"));switch(this.r){case $a:for(;f+g>e.length;){i=j-f;g-=i;if(B)e.set(a.subarray(b,b+i),f),f+=i,b+=i;else for(;i--;)e[f++]=a[b++];this.b=f;e=this.f();f=this.b}break;case Za:for(;f+g>e.length;)e=this.f({B:2});break;default:m(Error("invalid inflate mode"))}if(B)e.set(a.subarray(b,b+g),f),f+=g,b+=g;else for(;g--;)e[f++]=a[b++];this.c=b;this.b=f;this.a=e;break;case 1:this.s(ab,bb);break;
case 2:cb(this);break;default:m(Error("unknown BTYPE: "+c))}}return this.z()};
var db=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],eb=B?new Uint16Array(db):db,fb=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,258,258],gb=B?new Uint16Array(fb):fb,hb=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0],ib=B?new Uint8Array(hb):hb,jb=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],kb=B?new Uint16Array(jb):jb,lb=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,
10,11,11,12,12,13,13],mb=B?new Uint8Array(lb):lb,nb=new (B?Uint8Array:Array)(288),Y,ob;Y=0;for(ob=nb.length;Y<ob;++Y)nb[Y]=143>=Y?8:255>=Y?9:279>=Y?7:8;var ab=T(nb),pb=new (B?Uint8Array:Array)(30),qb,rb;qb=0;for(rb=pb.length;qb<rb;++qb)pb[qb]=5;var bb=T(pb);function X(c,a){for(var b=c.j,e=c.e,f=c.input,d=c.c,g;e<a;)g=f[d++],g===r&&m(Error("input buffer is broken")),b|=g<<e,e+=8;g=b&(1<<a)-1;c.j=b>>>a;c.e=e-a;c.c=d;return g}
function sb(c,a){for(var b=c.j,e=c.e,f=c.input,d=c.c,g=a[0],h=a[1],j,i,q;e<h;)j=f[d++],j===r&&m(Error("input buffer is broken")),b|=j<<e,e+=8;i=g[b&(1<<h)-1];q=i>>>16;c.j=b>>q;c.e=e-q;c.c=d;return i&65535}
function cb(c){function a(a,b,c){var d,f,e,g;for(g=0;g<a;)switch(d=sb(this,b),d){case 16:for(e=3+X(this,2);e--;)c[g++]=f;break;case 17:for(e=3+X(this,3);e--;)c[g++]=0;f=0;break;case 18:for(e=11+X(this,7);e--;)c[g++]=0;f=0;break;default:f=c[g++]=d}return c}var b=X(c,5)+257,e=X(c,5)+1,f=X(c,4)+4,d=new (B?Uint8Array:Array)(eb.length),g,h,j,i;for(i=0;i<f;++i)d[eb[i]]=X(c,3);g=T(d);h=new (B?Uint8Array:Array)(b);j=new (B?Uint8Array:Array)(e);c.s(T(a.call(c,b,g,h)),T(a.call(c,e,g,j)))}
W.prototype.s=function(c,a){var b=this.a,e=this.b;this.A=c;for(var f=b.length-258,d,g,h,j;256!==(d=sb(this,c));)if(256>d)e>=f&&(this.b=e,b=this.f(),e=this.b),b[e++]=d;else{g=d-257;j=gb[g];0<ib[g]&&(j+=X(this,ib[g]));d=sb(this,a);h=kb[d];0<mb[d]&&(h+=X(this,mb[d]));e>=f&&(this.b=e,b=this.f(),e=this.b);for(;j--;)b[e]=b[e++-h]}for(;8<=this.e;)this.e-=8,this.c--;this.b=e};
W.prototype.Q=function(c,a){var b=this.a,e=this.b;this.A=c;for(var f=b.length,d,g,h,j;256!==(d=sb(this,c));)if(256>d)e>=f&&(b=this.f(),f=b.length),b[e++]=d;else{g=d-257;j=gb[g];0<ib[g]&&(j+=X(this,ib[g]));d=sb(this,a);h=kb[d];0<mb[d]&&(h+=X(this,mb[d]));e+j>f&&(b=this.f(),f=b.length);for(;j--;)b[e]=b[e++-h]}for(;8<=this.e;)this.e-=8,this.c--;this.b=e};
W.prototype.f=function(){var c=new (B?Uint8Array:Array)(this.b-32768),a=this.b-32768,b,e,f=this.a;if(B)c.set(f.subarray(32768,c.length));else{b=0;for(e=c.length;b<e;++b)c[b]=f[b+32768]}this.p.push(c);this.t+=c.length;if(B)f.set(f.subarray(a,a+32768));else for(b=0;32768>b;++b)f[b]=f[a+b];this.b=32768;return f};
W.prototype.R=function(c){var a,b=this.input.length/this.c+1|0,e,f,d,g=this.input,h=this.a;c&&("number"===typeof c.B&&(b=c.B),"number"===typeof c.M&&(b+=c.M));2>b?(e=(g.length-this.c)/this.A[2],d=258*(e/2)|0,f=d<h.length?h.length+d:h.length<<1):f=h.length*b;B?(a=new Uint8Array(f),a.set(h)):a=h;return this.a=a};
W.prototype.z=function(){var c=0,a=this.a,b=this.p,e,f=new (B?Uint8Array:Array)(this.t+(this.b-32768)),d,g,h,j;if(0===b.length)return B?this.a.subarray(32768,this.b):this.a.slice(32768,this.b);d=0;for(g=b.length;d<g;++d){e=b[d];h=0;for(j=e.length;h<j;++h)f[c++]=e[h]}d=32768;for(g=this.b;d<g;++d)f[c++]=a[d];this.p=[];return this.buffer=f};
W.prototype.O=function(){var c,a=this.b;B?this.J?(c=new Uint8Array(a),c.set(this.a.subarray(0,a))):c=this.a.subarray(0,a):(this.a.length>a&&(this.a.length=a),c=this.a);return this.buffer=c};function tb(c){this.input=c;this.c=0;this.member=[]}
tb.prototype.i=function(){for(var c=this.input.length;this.c<c;){var a=new na,b=r,e=r,f=r,d=r,g=r,h=r,j=r,i=r,q=r,l=this.input,k=this.c;a.C=l[k++];a.D=l[k++];(31!==a.C||139!==a.D)&&m(Error("invalid file signature:",a.C,a.D));a.w=l[k++];switch(a.w){case 8:break;default:m(Error("unknown compression method: "+a.w))}a.o=l[k++];i=l[k++]|l[k++]<<8|l[k++]<<16|l[k++]<<24;a.Z=new Date(1E3*i);a.aa=l[k++];a.$=l[k++];0<(a.o&4)&&(a.V=l[k++]|l[k++]<<8,k+=a.V);if(0<(a.o&Ia)){j=[];for(h=0;0<(g=l[k++]);)j[h++]=String.fromCharCode(g);
a.name=j.join("")}if(0<(a.o&Ja)){j=[];for(h=0;0<(g=l[k++]);)j[h++]=String.fromCharCode(g);a.comment=j.join("")}0<(a.o&Ka)&&(a.P=S.k(l,0,k)&65535,a.P!==(l[k++]|l[k++]<<8)&&m(Error("invalid header crc16")));b=l[l.length-4]|l[l.length-3]<<8|l[l.length-2]<<16|l[l.length-1]<<24;l.length-k-4-4<512*b&&(d=b);e=new W(l,{index:k,bufferSize:d});a.data=f=e.i();k=e.c;a.X=q=(l[k++]|l[k++]<<8|l[k++]<<16|l[k++]<<24)>>>0;S.k(f)!==q&&m(Error("invalid CRC-32 checksum: 0x"+S.k(f).toString(16)+" / 0x"+q.toString(16)));
a.Y=b=(l[k++]|l[k++]<<8|l[k++]<<16|l[k++]<<24)>>>0;(f.length&4294967295)!==b&&m(Error("invalid input size: "+(f.length&4294967295)+" / "+b));this.member.push(a);this.c=k}var p=this.member,t,v,x=0,F=0,w;t=0;for(v=p.length;t<v;++t)F+=p[t].data.length;if(B){w=new Uint8Array(F);for(t=0;t<v;++t)w.set(p[t].data,x),x+=p[t].data.length}else{w=[];for(t=0;t<v;++t)w[t]=p[t].data;w=Array.prototype.concat.apply([],w)}return w};function ub(c,a){var b,e;this.input=c;this.c=0;if(a||!(a={}))a.index&&(this.c=a.index),a.verify&&(this.U=a.verify);b=c[this.c++];e=c[this.c++];switch(b&15){case Ga:this.method=Ga;break;default:m(Error("unsupported compression method"))}0!==((b<<8)+e)%31&&m(Error("invalid fcheck flag:"+((b<<8)+e)%31));e&32&&m(Error("fdict flag is not supported"));this.I=new W(c,{index:this.c,bufferSize:a.bufferSize,bufferType:a.bufferType,resize:a.resize})}
ub.prototype.i=function(){var c=this.input,a,b;a=this.I.i();this.c=this.I.c;this.U&&(b=(c[this.c++]<<24|c[this.c++]<<16|c[this.c++]<<8|c[this.c++])>>>0,b!==aa(a)&&m(Error("invalid adler-32 checksum")));return a};exports.deflate=vb;exports.deflateSync=wb;exports.inflate=xb;exports.inflateSync=yb;exports.gzip=zb;exports.gzipSync=Ab;exports.gunzip=Bb;exports.gunzipSync=Cb;function vb(c,a,b){process.nextTick(function(){var e,f;try{f=wb(c,b)}catch(d){e=d}a(e,f)})}function wb(c,a){var b;b=(new Ea(c)).h();a||(a={});return a.G?b:Db(b)}function xb(c,a,b){process.nextTick(function(){var e,f;try{f=yb(c,b)}catch(d){e=d}a(e,f)})}
function yb(c,a){var b;c.subarray=c.slice;b=(new ub(c)).i();a||(a={});return a.noBuffer?b:Db(b)}function zb(c,a,b){process.nextTick(function(){var e,f;try{f=Ab(c,b)}catch(d){e=d}a(e,f)})}function Ab(c,a){var b;c.subarray=c.slice;b=(new Ha(c)).h();a||(a={});return a.G?b:Db(b)}function Bb(c,a,b){process.nextTick(function(){var e,f;try{f=Cb(c,b)}catch(d){e=d}a(e,f)})}function Cb(c,a){var b;c.subarray=c.slice;b=(new tb(c)).i();a||(a={});return a.G?b:Db(b)}
function Db(c){var a=new BufferShim(c.length),b,e;b=0;for(e=c.length;b<e;++b)a[b]=c[b];return a};var Eb=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];B&&new Uint16Array(Eb);var Fb=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,258,258];B&&new Uint16Array(Fb);var Gb=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0];B&&new Uint8Array(Gb);var Hb=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577];B&&new Uint16Array(Hb);
var Ib=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];B&&new Uint8Array(Ib);var Jb=new (B?Uint8Array:Array)(288),$,Kb;$=0;for(Kb=Jb.length;$<Kb;++$)Jb[$]=143>=$?8:255>=$?9:279>=$?7:8;T(Jb);var Lb=new (B?Uint8Array:Array)(30),Mb,Nb;Mb=0;for(Nb=Lb.length;Mb<Nb;++Mb)Lb[Mb]=5;T(Lb);var Ga=8;}).call(this);

})(require("__browserify_process"))
},{"__browserify_process":3}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],4:[function(require,module,exports){
(function(){self.OSM = self.OSM || {};

var pbf = require('osm-pbf');

OSM.PBFParser = {
    getNodes: function(buffer) {
        var result = {};

        var blockFile = new pbf.BufferBlockFile(buffer);
        var pbffile = new pbf.PBFFile(blockFile);
        pbffile.nodes(function(node) {
            result[node.id] = {
                id : node.id,
                type : "node",
                lat: node.lat, 
                lon: node.lon,
                tags : node.keyval,
                used : false
            };
        }, function() {
            // finish is not called when process.nextTick shim is synchronous
        });

        return result;
    },

    getWays: function(buffer, nodes) {
        var result = [];

        var blockFile = new pbf.BufferBlockFile(buffer);
        var pbffile = new pbf.PBFFile(blockFile);
        pbffile.ways(function(way) {
            var len, incomplete = false;
            var way_object = {
                id : way.id,
                type : "way",
                nodes : new Array(way.refs.length),
                tags : way.keysvals
            };

            len = way_object.nodes.length;
            for (var j = 0; j < len; j++) {
                var node = nodes[way.refs[j]];
                if (!node) {
                    incomplete = true;
                    break;
                }
                way_object.nodes[j] = node;
                node.used = true;
            }

            //discard incomplete ways
            if (!incomplete) {
                result.push(way_object);
            }
        }, function() {
            // finish is not called when process.nextTick shim is synchronous
        });

        return result;
    }
};
})()
},{"osm-pbf":10}],5:[function(require,module,exports){
require('./PBFParser.js');
require('./lib/OSMReader.js');
require('./lib/leaflet-osm.js');

L.OSM.PBF = L.OSM.DataLayer.extend({
    options: {
        parser: OSM.PBFParser
    },
    
	initialize : function(data, options) {
		L.OSM.DataLayer.prototype.initialize.call(this, data, options);
	}
});

L.osmPbf = function (data, options) {
    return new L.OSM.PBF(data, options);
};

},{"./PBFParser.js":4,"./lib/OSMReader.js":6,"./lib/leaflet-osm.js":7}],6:[function(require,module,exports){
self.OSM = self.OSM || {};

OSM.Reader = function (parser) {
    this.options.parser = parser;
};

OSM.Reader.incl = {
    getParser: function(data) {
        return this.options.parser;
    },

    parseData: function(data) {
        var result = {},
            parser = this.getParser(data);
        result.nodes = parser.getNodes(data);
        result.ways = parser.getWays(data, result.nodes);
        return result;
    },

    buildFeatures: function (obj) {
      var nodeFeatures = [],
        wayFeatures = [],
        areaFeatures = [],
        landuseFeatures = [],
        nodes,
        ways;

      if (!('nodes' in obj && 'ways' in obj)) {
          obj = this.parseData(obj);
      } 
      nodes = obj.nodes;
      ways = obj.ways;
    
      for (var node_id in nodes) {
        var node = nodes[node_id];
        if (this.interestingNode(node, ways)) {
          nodeFeatures.push(node);
        }
      }
    
      for (var i = 0; i < ways.length; i++) {
        var way = ways[i];
        way.area = this.isWayArea(way);
        if (way.area) {
          if (way.tags['landuse']) {
            landuseFeatures.push(way);
          } else {
            areaFeatures.push(way);
          }
        } else {
          wayFeatures.push(way);
        }
      }
    
      // simple feature "layering" through ordering to reduce large features hiding smaller ones
      return landuseFeatures.concat(areaFeatures).concat(wayFeatures).concat(nodeFeatures);
    },
    
    isWayArea: function (way) {
      if (way.nodes[0] != way.nodes[way.nodes.length - 1]) {
        return false;
      }
    
      if (way.tags['area'] === 'no') {
        return false;
      }
    
      for (var key in way.tags) {
        if (~this.options.areaTags.indexOf(key)) {
          return true;
        }
      }
    
      return false;
    },
    
    interestingNode: function (node, ways) {
      if (!node.used) {
        return true;
      }
    
      for (var key in node.tags) {
        if (this.options.uninterestingTags.indexOf(key) < 0) {
          return true;
        }
      }
    
      return false;
    }
};

OSM.Reader.prototype.parseData = OSM.Reader.incl.parseData;
OSM.Reader.prototype.buildFeatures = OSM.Reader.incl.buildFeatures;
OSM.Reader.prototype.isWayArea = OSM.Reader.incl.isWayArea;
OSM.Reader.prototype.interestingNode = OSM.Reader.incl.interestingNode;
OSM.Reader.prototype.getParser = OSM.Reader.incl.getParser;

OSM.Reader.prototype.options = {
    areaTags: ['area', 'building', 'leisure', 'tourism', 'ruins', 'historic', 'landuse', 'military', 'natural', 'sport'],
    uninterestingTags: ['source', 'source_ref', 'source:ref', 'history', 'attribution', 'created_by', 'tiger:county', 'tiger:tlid', 'tiger:upload_uuid']
};

},{}],7:[function(require,module,exports){
L.OSM = {};

L.OSM.TileLayer = L.TileLayer.extend({
  options: {
    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© <a target="_parent" href="http://www.openstreetmap.org">OpenStreetMap</a> and contributors, under an <a target="_parent" href="http://www.openstreetmap.org/copyright">open license</a>'
  },

  initialize: function (options) {
    options = L.Util.setOptions(this, options);
    L.TileLayer.prototype.initialize.call(this, options.url);
  }
});

L.OSM.Mapnik = L.OSM.TileLayer.extend({
  options: {
    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
  }
});

L.OSM.CycleMap = L.OSM.TileLayer.extend({
  options: {
    url: 'http://{s}.tile.opencyclemap.org/cycle/{z}/{x}/{y}.png'
  }
});

L.OSM.TransportMap = L.OSM.TileLayer.extend({
  options: {
    url: 'http://{s}.tile2.opencyclemap.org/transport/{z}/{x}/{y}.png'
  }
});

L.OSM.MapQuestOpen = L.OSM.TileLayer.extend({
  options: {
    url: 'http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png',
    subdomains: '1234',
    attribution: "Tiles courtesy of <a href='http://www.mapquest.com/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png'>"
  }
});

L.OSM.DataLayer = L.FeatureGroup.extend({
  options: {
    styles: {},
    parser: L.OSM
  },

  initialize: function (xml, options) {
    L.Util.setOptions(this, options);

    L.FeatureGroup.prototype.initialize.call(this);

    if (xml) {
      this.addData(xml);
    }
  },

  addData: function (features) {
    if (!(features instanceof Array)) {
      features = this.buildFeatures(features);
    }

    for (var i = 0; i < features.length; i++) {
      var feature = features[i], layer, latLng, node;
      
      if (this.options.filter && !this.options.filter(feature, this)) { 
          continue;
      }

      if (feature.type === "node") {
        latLng = L.latLng(feature.lat, feature.lon);
        layer = L.circleMarker(latLng, this.options.styles.node);
      } else {
        var latLngs = new Array(feature.nodes.length);

        for (var j = 0; j < feature.nodes.length; j++) {
          node = feature.nodes[j];
          latLngs[j] = L.latLng(node.lat, node.lon);
        }

        if (feature.area) {
          latLngs.pop(); // Remove last == first.
          layer = L.polygon(latLngs, this.options.styles.area);
        } else {
          layer = L.polyline(latLngs, this.options.styles.way);
        }
      }

      layer.addTo(this);
      layer.feature = feature;

      if (this.options.onEachFeature) {
        this.options.onEachFeature(feature, layer);
      }      
    }
  }
});

L.OSM.DataLayer.mergeOptions(OSM.Reader.prototype.options);
L.OSM.DataLayer.include(OSM.Reader.incl);

L.Util.extend(L.OSM, {
  getNodes: function (xml) {
    var result = {};

    var nodes = xml.getElementsByTagName("node");
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i], id = node.getAttribute("id");
      result[id] = {
        id: id,
        type: "node",
        lat: node.getAttribute("lat"),
        lon: node.getAttribute("lon"),
        tags: this.getTags(node),
        used: false
      };
    }

    return result;
  },

  getWays: function (xml, nodes) {
    var result = [];

    var ways = xml.getElementsByTagName("way");
    for (var i = 0; i < ways.length; i++) {
      var way = ways[i], nds = way.getElementsByTagName("nd");

      var way_object = {
        id: way.getAttribute("id"),
        type: "way",
        nodes: new Array(nds.length),
        tags: this.getTags(way)
      };

      for (var j = 0; j < nds.length; j++) {
        var node = nodes[nds[j].getAttribute("ref")];
        way_object.nodes[j] = node;
        node.used = true;
      }

      result.push(way_object);
    }

    return result;
  },

  getTags: function (xml) {
    var result = {};

    var tags = xml.getElementsByTagName("tag");
    for (var j = 0; j < tags.length; j++) {
      result[tags[j].getAttribute("k")] = tags[j].getAttribute("v");
    }

    return result;
  }
});

},{}],8:[function(require,module,exports){
(function(){// minimal node.js BufferShim browser shim for pbf.js

// global
BufferShim = Uint8Array;

BufferShim.prototype.readUInt32BE = function(offset) {
    return new DataView(this.buffer).getUint32(offset, false);
};

BufferShim.prototype.slice = Uint8Array.prototype.subarray;

BufferShim.prototype.toString = function() {
    return this.utf8Slice(0, this.length);
};

// from Browser-buffer.js by Alex Wilson 
// https://github.com/arextar/browser-buffer/blob/b6afd534513189bc97b3a92930266266466aa392/src/browser-buffer.js#L230
//
//Based off of buffer.js in the Node project(copyright Joyent, Inc. and other Node contributors.)
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
BufferShim.prototype.utf8Slice = function (start, end) {
    for (var string = "", c, i = start, p = 0, c2, c3; p < end && (c = this[i]); i++) {
        p++;
        if (c < 128) {
            string += String.fromCharCode(c);
        } else if ((c > 191) && (c < 224)) {
            c2 = this[i + 1];
            string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
            i++;
        } else {
            c2 = this[i + 1];
            c3 = this[i + 2];
            string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
            i += 2;
        }
    }
    return string;
};

})()
},{}],9:[function(require,module,exports){
// minimal fs module browser shim for pbf.js
//
// pbf.js usages:
//   fs.read(fd,buf, 0,4, this.fileoffset,function(err,bytesRead,buffer){
//   fs.read(fd,headerbuf,0,metathis.headersize, metathis.fileoffset+4,function(err,bytesRead,buffer){
//   fs.read(fd,blobbuf, 0,metathis.payloadsize,metathis.fileoffset+metathis.headersize+4,function(err,bytesRead,buffer){
// Node.js signature:
//   fs.read = function(fd, buffer, offset, length, position, callback) {
var read = function(arrayBuffer, viewBuffer, offset, length, position, callback) {
    //log('fs.read offset = ' + offset + ', length = ' + length + ', position ' + position);
    var viewBufferLength = viewBuffer.length;
    // ignore offset, always 0
    viewBuffer.set(new Uint8Array(arrayBuffer, position, length));

    if (!(viewBufferLength === viewBuffer.length)) {
        console.log('lengths dont match: ' + viewBufferLength + '!=' + viewBuffer.length);
        throw "lengths don't match: ";
    }

    // without args, never used in pbf.js (uses viewBuffer)
    callback();
};

exports.read = read;
},{}],10:[function(require,module,exports){
(function(){var pbf = require('../pbf.js');

// Require replacements/extensions of Browserify's globals shims.
// See transforms.js for source transforms.
require('./buffer.js');
require('./process.js');

/**
 * buffer - ArrayBuffer
 */
function BufferBlockFile(buffer){
  this.read = function(onblock,onfinish){
    var offset=0;
    var onblobread = function(fb){
      if(fb){
        offset += fb.size;
        onblock(fb);
      }

      if(offset==buffer.byteLength) {
        if(onfinish!==undefined)
          onfinish();
        return;
      }

      var fileblock = new pbf.Fileblock(buffer,offset);
      fileblock.readHeader( onblobread );
    };
    onblobread(null,0);
  };

  this.fileblock = function(n,callback){
    var i=0;
    this.read(function(fileblock){
      if(n==i){
        callback(fileblock);
      }
      i++;
    });
  };
}

/** One-pass read. Reads both nodes and ways from payload in one pass. */
function OnePassPBFFile(blockfile){
  this.read = function(onnode, onway, onfinish){
    var stillreading=true;
    var nstarted=0;
    var nfinished=0;

    // for each file block read just the header
    blockfile.read(function(fileblock){

      // if it's a data block
      if(fileblock.header.type==="OSMData"){

        // read the payload
        nstarted += 1;
        var dd = nstarted;
        fileblock.readPayload(function(payload){
          //console.log( "read payload "+dd );

          // for each node in each file block
          // call the onnode callback
          payload.nodes(onnode, function(normalexit){
            if(normalexit===false){
              onfinish(false);
              return false;
            }

            // when finished, check if it is the last node ever; if so, call the onfinish callback
            nfinished += 1;

            //console.log( dd+" "+nfinished+"/"+nstarted+" finished" );
            if(!stillreading && (nfinished==nstarted)){
              onfinish(true);
            }
          });
          
          // for each way in each file block
          // call the onway callback
          payload.ways(onway, function(normalexit){
            if(normalexit===false){
              onfinish(false);
              return false;
            }

            // when finished, check if it is the last way ever; if so, call the onfinish callback
            nfinished += 1;

            if(!stillreading && (nfinished==nstarted)){
              onfinish(true);
            }
          });
          
        });
      }
    },function(){
      stillreading=false;
    });
  };
}

exports.BufferBlockFile = BufferBlockFile;
exports.OnePassPBFFile = OnePassPBFFile;
exports.PBFFile = pbf.PBFFile;

})()
},{"../pbf.js":13,"./buffer.js":8,"./process.js":11}],11:[function(require,module,exports){
(function(process){// modifies Browserify's process shim with synchronous nextTick

process.nextTick = function(func) {
    // process.nextTick synchronous - onfinish is not called
    func();
};

})(require("__browserify_process"))
},{"__browserify_process":3}],12:[function(require,module,exports){
var zlib = require('zlib');

// adds unzip method shim to zlib-browserify (imaya/zlib.js)
//
// @see https://github.com/brianloveswords/zlib-browserify
// @see https://github.com/imaya/zlib.js/blob/master/node/exports.js

zlib.unzip = function(buffer, callback) {
    //timer.start('zlib.unzip');

    // Avoid unnecessary conversion to BufferShim with 'noBuffer', returns Uint8Array.
    // With BufferShim shim both BufferShim and Uint8Array are patched for use with pbf.js.
    var unzipped = zlib.inflateSync(buffer, {'noBuffer': true});

    //timer.stop('zlib.unzip');
    callback(null, unzipped);
};

module.exports = zlib;

},{"zlib":1}],13:[function(require,module,exports){
(function(process){var fs = require('./browser/fs.js');
var zlib = require('./browser/zlib.js');
var protobuf = require('./protobuf.js');

function BlobHeader(message){
  this.type = message.val(1).toString();
  this.indexdata = message.val(2);
  this.datasize = message.val(3);
}

function Fileblock(fd, fileoffset){
  this.fd=fd;
  this.fileoffset=fileoffset;
  this.headersize=null;
  this.payloadsize=null;
  this.len=null;
  this.header=null;
  this.payload=null;

  var metathis=this;

  this.readHeader = function(callback){
    // read header length
    var buf = new BufferShim(4);
    fs.read(fd,buf,0,4,this.fileoffset,function(err,bytesRead,buffer){

      // read the header
      metathis.headersize = buf.readUInt32BE(0);
      var headerbuf = new BufferShim(metathis.headersize);
      fs.read(fd,headerbuf,0,metathis.headersize,metathis.fileoffset+4,function(err,bytesRead,buffer){

        var headerMessage = new protobuf.Message( headerbuf );
        metathis.header= new BlobHeader(headerMessage);
        metathis.payloadsize = metathis.header.datasize;
        metathis.size=4+metathis.headersize+metathis.payloadsize;
        callback(metathis);
      });
    });
  }

  this.convertPayloadMessage = function(payload){
    var messageType={"OSMHeader":HeaderBlock,
                     "OSMData":PrimitiveBlock};

    return new messageType[this.header.type](payload);
  }

  this.readPayload = function(callback){
    // read the blob payload
    var blobbuf = new BufferShim(metathis.payloadsize);
    fs.read(fd,blobbuf,0,metathis.payloadsize,metathis.fileoffset+metathis.headersize+4,function(err,bytesRead,buffer){

      var packedBlobMessage = new protobuf.Message( blobbuf );

      if( packedBlobMessage.hasField(1) ) {
        metathis.payload=metathis.convertPayloadMessage(new protobuf.Message(packedBlobMessage.val(1)));
        callback( metathis.payload );
      } else if( packedBlobMessage.hasField(3) ) {
        zlib.unzip(packedBlobMessage.val(3),function(err,buffer){
          var unpackedBlobMessage = new protobuf.Message( buffer );
          metathis.payload = metathis.convertPayloadMessage(unpackedBlobMessage);
          callback( metathis.payload );
        });
      }
    });
  }

  this.read = function(callback){
    this.readHeader(function(fb){
      metathis.readPayload(callback);
    });
  }
}

function DenseKeysVals(buf){
  this.densedata = new protobuf.DenseData(buf);
  this.more = function(){
    return this.densedata.more();
  }
  this.next = function(){
    var ret = []

    while(true){
      var k=this.densedata.next();
      if(k==0)
        return ret;
      var v=this.densedata.next();
      ret.push([k,v]);
    }  
  }
}

function StringTable(message){
  this.data = message.vals(1)
  this.get = function(i){
    return this.data[i].toString();
  }
}

function DenseInfo(message) {
}

function DenseNodes(message){
  this.message = message;
  this.nodesSync = function(onnode,onfinish){
    if(!this.message.hasField(1)) {
      debugger;
      onfinish();
      return; 
    }
    //debugger;

    var ids = new protobuf.DenseData( this.message.val(1) );
    var id = ids.next(true);

    var lats = new protobuf.DenseData( this.message.val(8) );
    var lat = lats.next(true);

    var lons = new protobuf.DenseData( this.message.val(9) );
    var lon = lons.next(true);

    if(this.message.hasField(10)){
      var keysvals = new DenseKeysVals( this.message.val(10) );
      var keyval = keysvals.next();
    }else{
      var keysvals=null;
    }

    if( id<0 ) {
      console.log( "DENSENODES FIRST NODE" );
      ids.i=0;
      id = ids.next(true);
      console.log( id, ids );
    }

    var progress = onnode({id:id,lat:lat/10000000,lon:lon/10000000,keyval:keyval});
    if( progress===false ){
      onfinish(false);
      return false;
    }
 
    var did;
    while( ids.more() ) {
      did = ids.next(true);
      id = did+id;
      lat = lats.next(true)+lat;
      lon = lons.next(true)+lon;
      keyval = keysvals ? keysvals.next() : null;

      if( id < 0 ) {
        console.log( "ID "+id+" < 0 " );
        console.log( ids );
        process.exit();
      }

      if( id<0 ) {
        console.log( "DENSENODES INTERMEDIATE NODE" );
        console.log( id, ids );
      }

      progress = onnode({id:id,lat:lat/10000000,lon:lon/10000000,keyval:keyval});
      if( progress===false ){
        onfinish(false);
        return false;
      }
    }

    onfinish(true);

  }

  var metathis=this;
  this.nodes = function(onnode,onfinish){
    var func = function(){metathis.nodesSync(onnode,onfinish);};
    process.nextTick(func);
  }
  
}

function Way(message){
  this.message=message;
  
  this.id = message.val(1);
  this.keysvals = function(){
    ret = [];
    if(!message.hasField(2) || !message.hasField(3))
      return ret;

    var keys = new protobuf.DenseData( message.val(2) );
    var vals = new protobuf.DenseData( message.val(3) );

    while(keys.more()){
      ret.push( [keys.next(), vals.next()] );
    }
    return ret;
  }
  this.refs = function(){
    ret = [];
    var denserefs = new protobuf.DenseData( message.val(8) );
    if(denserefs.more()){
      var ref = denserefs.next(true);
      ret.push(ref);
    }

    while(denserefs.more()){
      var ref = denserefs.next(true)+ref;
      ret.push( ref );
    }
    return ret;
  }
  
}

function PrimitiveGroup(message){
  this.dense=null;
  if( message.hasField(2) )
    this.dense = new DenseNodes( new protobuf.Message( message.val(2) ) );

  this.waysSync = function(onway,onfinish){
    if( message.hasField(3) ){
      var waymessages = message.vals(3);
      for(var i=0; i<waymessages.length; i++) {
        onway( new Way( new protobuf.Message( waymessages[i] ) ) );
      }
    }
    onfinish();
  }

  var metathis=this;
  this.ways = function(onway,onfinish){
    var foo = function(){metathis.waysSync(onway,onfinish);}
    process.nextTick(foo);
  }
}

function PrimitiveBlock(message){
  this.stringtable = new StringTable( new protobuf.Message( message.val(1) ) );
  this.primitivegroup = new PrimitiveGroup( new protobuf.Message( message.vals(2)[0] ) );
  this.primitivegroups=[];
  var msgs = message.vals(2);
  for(var i=0; i<msgs.length; i++){
    this.primitivegroups.push( new PrimitiveGroup( new protobuf.Message( msgs[i] ) ) );
  }

  var metathis=this;
  this.nodes = function(callback,onfinish){
    //console.log( "primitiveblock has "+this.primitivegroups.length+" primitvegroups" );

    if(this.primitivegroups.length==2){
      //debugger;
    }

    var finished=0;
    var metathis=this;
    var finishcounter = function(){
      //console.log( "primitiveblock finished" );
      finished += 1;
      if( finished==metathis.primitivegroups.length ){
        onfinish();
      }
    }

    for(var i in this.primitivegroups){
      var primitivegroup = this.primitivegroups[i];

      if(primitivegroup.dense===null){
        finishcounter();
        continue;
      }

      primitivegroup.dense.nodes(function(node){
        if(node.id<0){
          console.log(node);
          process.exit();
        }

        var keyval={};
        if(node.keyval!==undefined && node.keyval!==null){
          for(var i=0; i<node.keyval.length; i++){
            var key = metathis.stringtable.get(node.keyval[i][0]);
            var val = metathis.stringtable.get(node.keyval[i][1]);
            keyval[key]=val;
          }
        }
        node.keyval=keyval;
        return callback(node); //if this callback returns false, dense.nodes stops iterating and returns onfinish(false)
      },finishcounter);
    }
  }

  this.ways = function(onway,onfinish){
    //debugger

    var finished=0;
    var metathis=this;
    var finishcounter = function(){
      finished += 1;
      if( finished==metathis.primitivegroups.length ) {
        onfinish();
      }
    }

    for( var i in this.primitivegroups ){
      var primitivegroup = this.primitivegroups[i];

      primitivegroup.ways(function(way){
        var retway={};
        retway.id=way.id;

        var rawkeysvals=way.keysvals();
        retway.keysvals={}
        for(var i=0; i<rawkeysvals.length; i++){
          var key = metathis.stringtable.get(rawkeysvals[i][0]);
          var val = metathis.stringtable.get(rawkeysvals[i][1]);
          retway.keysvals[key]=val;
        }

        retway.refs = way.refs();

        onway(retway);
      },finishcounter);
    }
  }
}

function HeaderBlock(message){
}

function FileBlockFile(path){
  this.read = function(onblock,onfinish){
    fs.open( path, "r", function(err,fd) {
      var stats = fs.statSync( path );

      var offset=0;
      var onblobread = function(fb){
        if(fb){
          offset += fb.size;
          onblock(fb);
        }

        if(offset==stats.size) {
          if(onfinish!==undefined)
            onfinish();
          return;
        }

        var fileblock = new Fileblock(fd,offset);
        fileblock.readHeader( onblobread );
      }
      onblobread(null,0);
    });
  }

  this.fileblock = function(n,callback){
    var i=0;
    this.read(function(fileblock){
      if(n==i){
        callback(fileblock);
      } 
      i++;
    });
  }
}

function PBFFile(fileblockfile){
  this.nodes = function(onnode,onfinish){
    var stillreading=true;
    var nstarted=0;
    var nfinished=0;

    // for each file block read just the header
    fileblockfile.read(function(fileblock){

      // if it's a data block
      if(fileblock.header.type==="OSMData"){

        // read the payload
        nstarted += 1;
        var dd = nstarted;
        fileblock.readPayload(function(payload){
          //console.log( "read payload "+dd );

          // for each node in each file block
          // call the onnode callback
          payload.nodes(onnode, function(normalexit){
            if(normalexit===false){
              onfinish(false);
              return false;
            }

            // when finished, check if it is the last node ever; if so, call the onfinish callback
            nfinished += 1;

            //console.log( dd+" "+nfinished+"/"+nstarted+" finished" );
            if(!stillreading && (nfinished==nstarted)){
              onfinish(true);
            }
          });
        });
      }  
    },function(){
      stillreading=false;
    });
  }

  this.ways = function(onway,onfinish){
    var stillreading=true;
    var nstarted=0;
    var nfinished=0;


    // for each file block read just the header
    fileblockfile.read(function(fileblock){

      // if it's a data block
      if(fileblock.header.type==="OSMData"){

        // read the payload
        nstarted += 1;
        fileblock.readPayload(function(payload){

          // for each way in each file block
          // call the onway callback
 
          var waysReadThisPayload=0;

          payload.ways(function(way){waysReadThisPayload+=1;onway(way);}, function(normalexit){
            if(normalexit===false){
              onfinish(false);
              return false;
            }

            // when finished, check if it is the last way ever; if so, call the onfinish callback
            nfinished += 1;

            if(!stillreading && (nfinished==nstarted)){
              onfinish(true);
            }
          });
        });
      }  
      
       
    },function(){
      stillreading=false;
    });
  }
}

exports.FileBlockFile = FileBlockFile;
exports.PBFFile = PBFFile;
exports.Fileblock = Fileblock;

})(require("__browserify_process"))
},{"./browser/fs.js":9,"./browser/zlib.js":12,"./protobuf.js":14,"__browserify_process":3}],14:[function(require,module,exports){

var WIRETYPE={'LENGTH':2,
              'VARINT':0};

function more_bytes(bb){
  return (bb&0x80)==0x80;
}
function strip_msb(bb){
  return 0x7f&bb;
}
function get_wire_type(val){
  return 0x07&val;
}
function get_field_number(val){
  return val>>3;
}
function decode_signed(val){
  //zigzag encoding
  if(val%2==0)
    return val/2;
  return -((val+1)/2);
}

function readVarint( ary, offset ){
  var i=offset;
  var bytes = [strip_msb(ary[i])];
  while( more_bytes(ary[i]) && i<ary.length-1 ){
    i += 1;
    bytes.push( strip_msb(ary[i]) );
  }

  var val = 0;
  for(i=0; i<bytes.length; i++){
    val += bytes[i]*Math.pow(2,(7*i));  //if you do a bit shift, unexpected negative numbers result sometimes
  }
  return [val,i];
}

function readField(buf,offset){
  var nread=0;

  var fielddef = readVarint(buf,offset);
  var wire_type = get_wire_type(fielddef[0]);
  var field_number = get_field_number(fielddef[0]);
  nread += fielddef[1];

  var val = null;
  if(wire_type==WIRETYPE.LENGTH){
    var strlendef = readVarint(buf,offset+nread);
    var strlen = strlendef[0];
    nread += strlendef[1]; 
    val = buf.slice(offset+nread,offset+nread+strlen);
    nread += strlen;
  } else if(wire_type==WIRETYPE.VARINT) {
    valdef = readVarint( buf, offset+nread );
    val = valdef[0];
    nread += valdef[1];
  }

  return [field_number, val, nread];
}

function DenseData(buf){
  this.buf=buf;
  this.i=0;
  this.more = function(){
    return this.i<this.buf.length;
  }
  this.next = function(signed){
    var valdef;
    valdef = readVarint(this.buf,this.i);
    this.i += valdef[1];
    if(signed===true)
      return decode_signed(valdef[0]);
    else
      return valdef[0];
  }
}


function Message(buf){
  this.fields = {}

  var offset=0;
  while(offset<buf.length){
    var field = readField( buf, offset );
    var ftag=field[0].toString();
    var fval=field[1];
    var flen=field[2];

    if(this.fields[ftag] === undefined){
      this.fields[ftag] = []
    }

    this.fields[ftag].push(fval);
    offset += flen;
    
  }

  this.val = function(tag){
    if(!this.hasField(tag))
      return null;
    return this.fields[tag.toString()][0];
  }
  this.vals = function(tag){
    if(!this.hasField(tag))
      return []
    return this.fields[tag.toString()];
  }
  this.hasField = function(tag){
    return this.fields[tag.toString()]!==undefined
  }
}

exports.decode_signed=decode_signed;
exports.Message=Message;
exports.DenseData=DenseData;

},{}]},{},[5])
;