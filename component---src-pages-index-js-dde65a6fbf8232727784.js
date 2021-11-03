"use strict";(self.webpackChunkgatsby_starter_blog=self.webpackChunkgatsby_starter_blog||[]).push([[678],{9535:function(e,t,r){var a=r(7294),n=r(5444),i=r(2359);t.Z=function(){var e,t,o=(0,n.useStaticQuery)("3257411868"),l=null===(e=o.site.siteMetadata)||void 0===e?void 0:e.author,c=null===(t=o.site.siteMetadata)||void 0===t?void 0:t.social;return a.createElement("div",{className:"bio"},a.createElement(i.S,{className:"bio-avatar",layout:"fixed",formats:["auto","webp","avif"],src:"../images/profile-pic.png",width:50,height:50,quality:95,alt:"Profile picture",__imageData:r(1550)}),(null==l?void 0:l.name)&&a.createElement("p",null,"Written by ",a.createElement("strong",null,l.name)," ",(null==l?void 0:l.summary)||null," ",a.createElement("a",{href:"https://twitter.com/"+((null==c?void 0:c.twitter)||"")},"You should follow me on Twitter")))}},4175:function(e,t,r){r.r(t),r.d(t,{default:function(){return j}});var a=r(7294),n=r(9535),i=r(7198),o=r(3751),l=r(2359),c=r(4694),s=r(5697),f=r.n(s);function p(e){return p="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},p(e)}function u(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e}function m(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,a)}return r}function d(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?m(Object(r),!0).forEach((function(t){u(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):m(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}function b(e,t){if(null==e)return{};var r,a,n=function(e,t){if(null==e)return{};var r,a,n={},i=Object.keys(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||(n[r]=e[r]);return n}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)r=i[a],t.indexOf(r)>=0||Object.prototype.propertyIsEnumerable.call(e,r)&&(n[r]=e[r])}return n}function y(e){return function(e){if(Array.isArray(e)){for(var t=0,r=new Array(e.length);t<e.length;t++)r[t]=e[t];return r}}(e)||function(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}(e)||function(){throw new TypeError("Invalid attempt to spread non-iterable instance")}()}function g(e){return t=e,(t-=0)==t?e:(e=e.replace(/[\-_\s]+(.)?/g,(function(e,t){return t?t.toUpperCase():""}))).substr(0,1).toLowerCase()+e.substr(1);var t}function h(e){return e.split(";").map((function(e){return e.trim()})).filter((function(e){return e})).reduce((function(e,t){var r,a=t.indexOf(":"),n=g(t.slice(0,a)),i=t.slice(a+1).trim();return n.startsWith("webkit")?e[(r=n,r.charAt(0).toUpperCase()+r.slice(1))]=i:e[n]=i,e}),{})}var w=!1;try{w=!0}catch(A){}function v(e){return e&&"object"===p(e)&&e.prefix&&e.iconName&&e.icon?e:c.parse.icon?c.parse.icon(e):null===e?null:e&&"object"===p(e)&&e.prefix&&e.iconName?e:Array.isArray(e)&&2===e.length?{prefix:e[0],iconName:e[1]}:"string"==typeof e?{prefix:"fas",iconName:e}:void 0}function x(e,t){return Array.isArray(t)&&t.length>0||!Array.isArray(t)&&t?u({},e,t):{}}function O(e){var t=e.forwardedRef,r=b(e,["forwardedRef"]),a=r.icon,n=r.mask,i=r.symbol,o=r.className,l=r.title,s=r.titleId,f=v(a),p=x("classes",[].concat(y(function(e){var t,r=e.spin,a=e.pulse,n=e.fixedWidth,i=e.inverse,o=e.border,l=e.listItem,c=e.flip,s=e.size,f=e.rotation,p=e.pull,m=(u(t={"fa-spin":r,"fa-pulse":a,"fa-fw":n,"fa-inverse":i,"fa-border":o,"fa-li":l,"fa-flip-horizontal":"horizontal"===c||"both"===c,"fa-flip-vertical":"vertical"===c||"both"===c},"fa-".concat(s),null!=s),u(t,"fa-rotate-".concat(f),null!=f&&0!==f),u(t,"fa-pull-".concat(p),null!=p),u(t,"fa-swap-opacity",e.swapOpacity),t);return Object.keys(m).map((function(e){return m[e]?e:null})).filter((function(e){return e}))}(r)),y(o.split(" ")))),m=x("transform","string"==typeof r.transform?c.parse.transform(r.transform):r.transform),g=x("mask",v(n)),h=(0,c.icon)(f,d({},p,{},m,{},g,{symbol:i,title:l,titleId:s}));if(!h)return function(){var e;!w&&console&&"function"==typeof console.error&&(e=console).error.apply(e,arguments)}("Could not find icon",f),null;var k=h.abstract,j={ref:t};return Object.keys(r).forEach((function(e){O.defaultProps.hasOwnProperty(e)||(j[e]=r[e])})),E(k[0],j)}O.displayName="FontAwesomeIcon",O.propTypes={border:f().bool,className:f().string,mask:f().oneOfType([f().object,f().array,f().string]),fixedWidth:f().bool,inverse:f().bool,flip:f().oneOf(["horizontal","vertical","both"]),icon:f().oneOfType([f().object,f().array,f().string]),listItem:f().bool,pull:f().oneOf(["right","left"]),pulse:f().bool,rotation:f().oneOf([0,90,180,270]),size:f().oneOf(["lg","xs","sm","1x","2x","3x","4x","5x","6x","7x","8x","9x","10x"]),spin:f().bool,symbol:f().oneOfType([f().bool,f().string]),title:f().string,transform:f().oneOfType([f().string,f().object]),swapOpacity:f().bool},O.defaultProps={border:!1,className:"",mask:null,fixedWidth:!1,inverse:!1,flip:null,icon:null,listItem:!1,pull:null,pulse:!1,rotation:null,size:null,spin:!1,symbol:!1,title:"",transform:null,swapOpacity:!1};var E=function e(t,r){var a=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{};if("string"==typeof r)return r;var n=(r.children||[]).map((function(r){return e(t,r)})),i=Object.keys(r.attributes||{}).reduce((function(e,t){var a=r.attributes[t];switch(t){case"class":e.attrs.className=a,delete r.attributes.class;break;case"style":e.attrs.style=h(a);break;default:0===t.indexOf("aria-")||0===t.indexOf("data-")?e.attrs[t.toLowerCase()]=a:e.attrs[g(t)]=a}return e}),{attrs:{}}),o=a.style,l=void 0===o?{}:o,c=b(a,["style"]);return i.attrs.style=d({},i.attrs.style,{},l),t.apply(void 0,[r.tag,d({},i.attrs,{},c)].concat(y(n)))}.bind(null,a.createElement),k=r(7190),j=function(e){var t,c=e.data,s=e.location,f=(null===(t=c.site.siteMetadata)||void 0===t?void 0:t.title)||"Title";return 0===c.allMarkdownRemark.nodes.length?a.createElement(i.Z,{location:s,title:f},a.createElement(o.Z,{title:"All posts"}),a.createElement(n.Z,null),a.createElement("p",null,'No blog posts found. Add markdown posts to "content/blog" (or the directory you specified for the "gatsby-source-filesystem" plugin in gatsby-config.js).')):a.createElement(i.Z,{location:s,title:f},a.createElement(o.Z,{title:"All posts"}),a.createElement(l.S,{className:"bio-avatar",layout:"fixed",formats:["auto","webp","avif"],src:"../images/profile-pic.png",width:150,height:150,style:{marginBottom:"1.45rem",marginLeft:"auto",marginRight:"auto",display:"block"},quality:95,alt:"Profile picture",__imageData:r(1828)}),a.createElement("div",{style:{textAlign:"center"}},"Computer Engineering Graduate from the University of Alberta.",a.createElement("br",null),"Currently working as a Software Engineer at ",a.createElement("a",{href:"https://www.lumnion.com/"},"Lumnion"),"."),a.createElement("br",null),a.createElement("br",null),a.createElement("div",{style:{display:"flex",flexDirection:"row",textAlign:"center",padding:"20px"}},a.createElement("a",{className:"content",href:"https://github.com/aktasfatih"},a.createElement("div",{className:"activate",style:{flex:1,flexGrow:1,verticalAlign:"center",padding:10,textAlign:"center"}},a.createElement(O,{icon:k.zhw,style:{display:"inline-block",width:"50px",height:"50px"}}),a.createElement("div",null,"github.com/aktasfatih"))),a.createElement("a",{className:"content",href:"https://twitter.com/moreincode"},a.createElement("div",{onClick:function(){return s.href="twitter.com/moreincode"},className:"activate",style:{flex:1,flexGrow:1,verticalAlign:"center",padding:10,textAlign:"center"}},a.createElement(O,{icon:k.mdU,style:{display:"inline-block",width:"50px",height:"50px"}}),a.createElement("div",null,"twitter.com/moreincode"))),a.createElement("a",{className:"content",href:"https://www.linkedin.com/in/fatih-aktas/"},a.createElement("div",{onClick:function(){s.href="linkedin.com/in/fatih-aktas/"},className:"activate",style:{flex:1,flexGrow:1,verticalAlign:"center",padding:10,textAlign:"center"}},a.createElement(O,{icon:k.D9H,style:{display:"inline-block",width:"50px",height:"50px"}}),a.createElement("div",null,"linkedin.com/in/fatih-aktas/")))),a.createElement("span",{style:{fontSize:12}},a.createElement("b",null,"Note:")," Hey, I am currently working on this website. I will be adding more content. In the meantime, you could check out my",a.createElement("a",{href:"http://www.twitter.com/moreincode"}," twitter")," or ",a.createElement("a",{href:"mailto: abc@example.com"},"contact me")," directly."))}},1550:function(e){e.exports=JSON.parse('{"layout":"fixed","backgroundColor":"#f8f8f8","images":{"fallback":{"src":"/static/c7c03b0c93a9850327551511183afda6/e5610/profile-pic.png","srcSet":"/static/c7c03b0c93a9850327551511183afda6/e5610/profile-pic.png 50w,\\n/static/c7c03b0c93a9850327551511183afda6/e9b55/profile-pic.png 100w","sizes":"50px"},"sources":[{"srcSet":"/static/c7c03b0c93a9850327551511183afda6/d4bf4/profile-pic.avif 50w,\\n/static/c7c03b0c93a9850327551511183afda6/ee81f/profile-pic.avif 100w","type":"image/avif","sizes":"50px"},{"srcSet":"/static/c7c03b0c93a9850327551511183afda6/3faea/profile-pic.webp 50w,\\n/static/c7c03b0c93a9850327551511183afda6/6a679/profile-pic.webp 100w","type":"image/webp","sizes":"50px"}]},"width":50,"height":50}')},1828:function(e){e.exports=JSON.parse('{"layout":"fixed","backgroundColor":"#f8f8f8","images":{"fallback":{"src":"/static/c7c03b0c93a9850327551511183afda6/01986/profile-pic.png","srcSet":"/static/c7c03b0c93a9850327551511183afda6/01986/profile-pic.png 150w,\\n/static/c7c03b0c93a9850327551511183afda6/c0d5f/profile-pic.png 300w","sizes":"150px"},"sources":[{"srcSet":"/static/c7c03b0c93a9850327551511183afda6/95309/profile-pic.avif 150w,\\n/static/c7c03b0c93a9850327551511183afda6/288e4/profile-pic.avif 300w","type":"image/avif","sizes":"150px"},{"srcSet":"/static/c7c03b0c93a9850327551511183afda6/7ddcc/profile-pic.webp 150w,\\n/static/c7c03b0c93a9850327551511183afda6/dd79f/profile-pic.webp 300w","type":"image/webp","sizes":"150px"}]},"width":150,"height":150}')}}]);
//# sourceMappingURL=component---src-pages-index-js-dde65a6fbf8232727784.js.map