(self.webpackChunkgatsby_starter_blog=self.webpackChunkgatsby_starter_blog||[]).push([[678,797],{9535:function(e,t,r){"use strict";var n=r(7294),a=r(5444),i=r(2359);t.Z=function(){var e,t,o=(0,a.useStaticQuery)("3257411868"),l=null===(e=o.site.siteMetadata)||void 0===e?void 0:e.author,c=null===(t=o.site.siteMetadata)||void 0===t?void 0:t.social;return n.createElement("div",{className:"bio"},n.createElement(i.S,{className:"bio-avatar",layout:"fixed",formats:["auto","webp","avif"],src:"../images/profile-pic.png",width:50,height:50,quality:95,alt:"Profile picture",__imageData:r(1550)}),(null==l?void 0:l.name)&&n.createElement("p",null,"Written by ",n.createElement("strong",null,l.name)," ",(null==l?void 0:l.summary)||null," ",n.createElement("a",{href:"https://twitter.com/"+((null==c?void 0:c.twitter)||"")},"You should follow me on Twitter")))}},4175:function(e,t,r){"use strict";r.r(t),r.d(t,{default:function(){return O}});var n=r(7294),a=r(9535),i=r(7198),o=r(3751),l=r(4694),c=r(5697),s=r.n(c);function f(e){return f="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},f(e)}function u(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function p(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function m(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?p(Object(r),!0).forEach((function(t){u(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):p(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function d(e,t){if(null==e)return{};var r,n,a=function(e,t){if(null==e)return{};var r,n,a={},i=Object.keys(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||(a[r]=e[r]);return a}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(n=0;n<i.length;n++)r=i[n],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(a[r]=e[r])}return a}function y(e){return function(e){if(Array.isArray(e)){for(var t=0,r=new Array(e.length);t<e.length;t++)r[t]=e[t];return r}}(e)||function(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}()}function b(e){return t=e,(t-=0)==t?e:(e=e.replace(/[\-_\s]+(.)?/g,(function(e,t){return t?t.toUpperCase():""}))).substr(0,1).toLowerCase()+e.substr(1);var t}function h(e){return e.split(";").map((function(e){return e.trim()})).filter((function(e){return e})).reduce((function(e,t){var r,n=t.indexOf(":"),a=b(t.slice(0,n)),i=t.slice(n+1).trim();return a.startsWith("webkit")?e[(r=a,r.charAt(0).toUpperCase()+r.slice(1))]=i:e[a]=i,e}),{})}var v=!1;try{v=!0}catch(k){}function g(e){return e&&"object"===f(e)&&e.prefix&&e.iconName&&e.icon?e:l.parse.icon?l.parse.icon(e):null===e?null:e&&"object"===f(e)&&e.prefix&&e.iconName?e:Array.isArray(e)&&2===e.length?{prefix:e[0],iconName:e[1]}:"string"==typeof e?{prefix:"fas",iconName:e}:void 0}function w(e,t){return Array.isArray(t)&&t.length>0||!Array.isArray(t)&&t?u({},e,t):{}}function x(e){var t=e.forwardedRef,r=d(e,["forwardedRef"]),n=r.icon,a=r.mask,i=r.symbol,o=r.className,c=r.title,s=r.titleId,f=g(n),p=w("classes",[].concat(y(function(e){var t,r=e.spin,n=e.pulse,a=e.fixedWidth,i=e.inverse,o=e.border,l=e.listItem,c=e.flip,s=e.size,f=e.rotation,p=e.pull,m=(u(t={"fa-spin":r,"fa-pulse":n,"fa-fw":a,"fa-inverse":i,"fa-border":o,"fa-li":l,"fa-flip-horizontal":"horizontal"===c||"both"===c,"fa-flip-vertical":"vertical"===c||"both"===c},"fa-".concat(s),null!=s),u(t,"fa-rotate-".concat(f),null!=f&&0!==f),u(t,"fa-pull-".concat(p),null!=p),u(t,"fa-swap-opacity",e.swapOpacity),t);return Object.keys(m).map((function(e){return m[e]?e:null})).filter((function(e){return e}))}(r)),y(o.split(" ")))),b=w("transform","string"==typeof r.transform?l.parse.transform(r.transform):r.transform),h=w("mask",g(a)),A=(0,l.icon)(f,m({},p,{},b,{},h,{symbol:i,title:c,titleId:s}));if(!A)return function(){var e;!v&&console&&"function"==typeof console.error&&(e=console).error.apply(e,arguments)}("Could not find icon",f),null;var O=A.abstract,k={ref:t};return Object.keys(r).forEach((function(e){x.defaultProps.hasOwnProperty(e)||(k[e]=r[e])})),E(O[0],k)}x.displayName="FontAwesomeIcon",x.propTypes={border:s().bool,className:s().string,mask:s().oneOfType([s().object,s().array,s().string]),fixedWidth:s().bool,inverse:s().bool,flip:s().oneOf(["horizontal","vertical","both"]),icon:s().oneOfType([s().object,s().array,s().string]),listItem:s().bool,pull:s().oneOf(["right","left"]),pulse:s().bool,rotation:s().oneOf([0,90,180,270]),size:s().oneOf(["lg","xs","sm","1x","2x","3x","4x","5x","6x","7x","8x","9x","10x"]),spin:s().bool,symbol:s().oneOfType([s().bool,s().string]),title:s().string,transform:s().oneOfType([s().string,s().object]),swapOpacity:s().bool},x.defaultProps={border:!1,className:"",mask:null,fixedWidth:!1,inverse:!1,flip:null,icon:null,listItem:!1,pull:null,pulse:!1,rotation:null,size:null,spin:!1,symbol:!1,title:"",transform:null,swapOpacity:!1};var E=function e(t,r){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};if("string"==typeof r)return r;var a=(r.children||[]).map((function(r){return e(t,r)})),i=Object.keys(r.attributes||{}).reduce((function(e,t){var n=r.attributes[t];switch(t){case"class":e.attrs.className=n,delete r.attributes.class;break;case"style":e.attrs.style=h(n);break;default:0===t.indexOf("aria-")||0===t.indexOf("data-")?e.attrs[t.toLowerCase()]=n:e.attrs[b(t)]=n}return e}),{attrs:{}}),o=n.style,l=void 0===o?{}:o,c=d(n,["style"]);return i.attrs.style=m({},i.attrs.style,{},l),t.apply(void 0,[r.tag,m({},i.attrs,{},c)].concat(y(a)))}.bind(null,n.createElement),A=r(7190),O=(r(3445),function(e){var t,r=e.data,l=e.location,c=(null===(t=r.site.siteMetadata)||void 0===t?void 0:t.title)||"Title";return 0===r.allMarkdownRemark.nodes.length?n.createElement(i.Z,{location:l,title:c},n.createElement(o.Z,{title:"All posts"}),n.createElement(a.Z,null),n.createElement("p",null,'No blog posts found. Add markdown posts to "content/blog" (or the directory you specified for the "gatsby-source-filesystem" plugin in gatsby-config.js).')):n.createElement(i.Z,{location:l,title:c},n.createElement("div",{class:"container"},n.createElement(o.Z,{title:"All posts"}),n.createElement("div",{className:"flexCenter applyWidth"},n.createElement("img",{className:"bio-avatar",id:"profilePicture",layout:"fixed",formats:["auto","webp","avif"],src:"profile-pic.png",width:200,height:200,quality:95,alt:"Profile picture"}),n.createElement("span",{style:{textAlign:"left"}},"Hi there!",n.createElement("br",null),n.createElement("br",null),"I'm a Computer Engineer from the University of Alberta.",n.createElement("br",null),"I currently work as a Software Engineer at ",n.createElement("a",{href:"https://www.lumnion.com/"},"Lumnion"),".")),n.createElement("div",{style:{display:"flex",justifyContent:"space-around",flexDirection:"row",textAlign:"center",padding:"20px"}},n.createElement("a",{className:"content",target:"_blank",href:"https://github.com/aktasfatih"},n.createElement("div",{className:"activate",style:{flex:1,flexGrow:1,verticalAlign:"center",padding:10,textAlign:"center"}},n.createElement(x,{icon:A.zhw,style:{display:"inline-block",width:"50px",height:"50px"}}),n.createElement("div",null,"github.com/aktasfatih"))),n.createElement("a",{className:"content",target:"_blank",href:"https://stackoverflow.com/users/5027899/fatih-akta%c5%9f"},n.createElement("div",{className:"activate",style:{flex:1,flexGrow:1,verticalAlign:"center",padding:10,textAlign:"center"}},n.createElement(x,{icon:A.mGT,style:{display:"inline-block",width:"50px",height:"50px"}}),n.createElement("div",null,"stackoverflow.com")))),n.createElement("div",{style:{display:"flex",flexDirection:"row",justifyContent:"space-around",textAlign:"center",padding:"20px"}},n.createElement("a",{className:"content",target:"_blank",href:"https://twitter.com/moreincode"},n.createElement("div",{onClick:function(){return l.href="twitter.com/moreincode"},className:"activate",style:{flex:1,flexGrow:1,verticalAlign:"center",padding:10,textAlign:"center"}},n.createElement(x,{icon:A.mdU,style:{display:"inline-block",width:"50px",height:"50px"}}),n.createElement("div",null,"twitter.com/moreincode"))),n.createElement("a",{className:"content",target:"_blank",href:"https://www.linkedin.com/in/fatih-aktas/"},n.createElement("div",{onClick:function(){l.href="linkedin.com/in/fatih-aktas/"},className:"activate",style:{flex:1,flexGrow:1,verticalAlign:"center",padding:10,textAlign:"center"}},n.createElement(x,{icon:A.D9H,style:{display:"inline-block",width:"50px",height:"50px"}}),n.createElement("div",null,"linkedin.com/in/fatih-aktas/")))),n.createElement("div",{className:"flexCenter applyWidth"})))})},3445:function(){var e=document.createElement("canvas"),t=e.width=.75*window.innerWidth,r=e.height=.75*window.innerHeight;document.body.prepend(e);var n=e.getContext("webgl");n.clearColor(100,100,100,1);for(var a={x:0,y:0},i=10,o=[],l=0;l<i;l++){var c=60*Math.random()+10;o.push({x:Math.random()*(t-2*c)+c,y:Math.random()*(r-2*c)+c,vx:1*(Math.random()-.5),vy:1*(Math.random()-.5),r:.75*c})}var s="\nprecision highp float;\n\nconst float WIDTH = "+(t>>0)+".0;\nconst float HEIGHT = "+(r>>0)+".0;\n\nuniform vec3 metaballs["+"10];\n\nvoid main(){\nfloat x = gl_FragCoord.x;\nfloat y = gl_FragCoord.y;\n\nfloat sum = 0.0;\nfor (int i = 0; i < "+"10; i++) {\nvec3 metaball = metaballs[i];\nfloat dx = metaball.x - x;\nfloat dy = metaball.y - y;\nfloat radius = metaball.z;\n\nsum += (radius * radius) / (dx * dx + dy * dy);\n}\n\nif (sum >= 0.99) {\ngl_FragColor = vec4(mix(vec3(x / WIDTH, y / HEIGHT, 1.0), vec3(0, 0, 0), max(0.0, 1.0 - (sum - 0.99) * 100.0)), 1.0);\nreturn;\n}\n\ngl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n}\n\n",f=h("\nattribute vec2 position;\n\nvoid main() {\n// position specifies only x and y.\n// We set z to be 0.0, and w to be 1.0\ngl_Position = vec4(position, 0.0, 1.0);\n}\n",n.VERTEX_SHADER),u=h(s,n.FRAGMENT_SHADER),p=n.createProgram();n.attachShader(p,f),n.attachShader(p,u),n.linkProgram(p),n.useProgram(p);var m=new Float32Array([-1,1,-1,-1,1,1,1,-1]),d=n.createBuffer();n.bindBuffer(n.ARRAY_BUFFER,d),n.bufferData(n.ARRAY_BUFFER,m,n.STATIC_DRAW);var y=function(e,t){var r=n.getAttribLocation(e,t);if(-1===r)throw"Can not find attribute "+t+".";return r}(p,"position");n.enableVertexAttribArray(y),n.vertexAttribPointer(y,2,n.FLOAT,n.FALSE,8,0);var b=function(e,t){var r=n.getUniformLocation(e,t);if(-1===r)throw"Can not find uniform "+t+".";return r}(p,"metaballs");function h(e,t){var r=n.createShader(t);if(n.shaderSource(r,e),n.compileShader(r),!n.getShaderParameter(r,n.COMPILE_STATUS))throw"Shader compile failed with: "+n.getShaderInfoLog(r);return r}!function e(){for(var a=0;a<i;a++){var l=o[a];l.x+=l.vx,l.y+=l.vy,(l.x<l.r||l.x>t-l.r)&&(l.vx*=-1),(l.y<l.r||l.y>r-l.r)&&(l.vy*=-1)}var c=new Float32Array(30);for(a=0;a<i;a++){var s=3*a,f=o[a];c[s+0]=f.x,c[s+1]=f.y,c[s+2]=f.r}n.uniform3fv(b,c),n.drawArrays(n.TRIANGLE_STRIP,0,4),requestAnimationFrame(e)}(),e.onmousemove=function(e){a.x=e.clientX,a.y=e.clientY}},1550:function(e){"use strict";e.exports=JSON.parse('{"layout":"fixed","backgroundColor":"#f8f8f8","images":{"fallback":{"src":"/static/c7c03b0c93a9850327551511183afda6/e5610/profile-pic.png","srcSet":"/static/c7c03b0c93a9850327551511183afda6/e5610/profile-pic.png 50w,\\n/static/c7c03b0c93a9850327551511183afda6/e9b55/profile-pic.png 100w","sizes":"50px"},"sources":[{"srcSet":"/static/c7c03b0c93a9850327551511183afda6/d4bf4/profile-pic.avif 50w,\\n/static/c7c03b0c93a9850327551511183afda6/ee81f/profile-pic.avif 100w","type":"image/avif","sizes":"50px"},{"srcSet":"/static/c7c03b0c93a9850327551511183afda6/3faea/profile-pic.webp 50w,\\n/static/c7c03b0c93a9850327551511183afda6/6a679/profile-pic.webp 100w","type":"image/webp","sizes":"50px"}]},"width":50,"height":50}')}}]);
//# sourceMappingURL=component---src-pages-index-js-38a5c8968e8630e96d7c.js.map