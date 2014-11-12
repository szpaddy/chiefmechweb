
(function(global, undefined) {


if (global.seajs) {
  return
}

var seajs = global.seajs = {
  
  version: "2.1.0"
}

var data = seajs.data = {}



function isType(type) {
  return function(obj) {
    return Object.prototype.toString.call(obj) === "[object " + type + "]"
  }
}

var isObject = isType("Object")
var isString = isType("String")
var isArray = Array.isArray || isType("Array")
var isFunction = isType("Function")

var _cid = 0
function cid() {
  return _cid++
}




var events = data.events = {}


seajs.on = function(name, callback) {
  var list = events[name] || (events[name] = [])
  list.push(callback)
  return seajs
}




seajs.off = function(name, callback) {
  
  if (!(name || callback)) {
    events = data.events = {}
    return seajs
  }

  var list = events[name]
  if (list) {
    if (callback) {
      for (var i = list.length - 1; i >= 0; i--) {
        if (list[i] === callback) {
          list.splice(i, 1)
        }
      }
    }
    else {
      delete events[name]
    }
  }

  return seajs
}



var emit = seajs.emit = function(name, data) {
  var list = events[name], fn

  if (list) {
    
    list = list.slice()

    
    while ((fn = list.shift())) {
      fn(data)
    }
  }

  return seajs
}




var DIRNAME_RE = /[^?#]*\//

var DOT_RE = /\/\.\//g
var DOUBLE_DOT_RE = /\/[^/]+\/\.\.\//




function dirname(path) {
  return path.match(DIRNAME_RE)[0]
}



function realpath(path) {
  
  path = path.replace(DOT_RE, "/")

  
  while (path.match(DOUBLE_DOT_RE)) {
    path = path.replace(DOUBLE_DOT_RE, "/")
  }

  return path
}




function normalize(path) {
  var last = path.length - 1

  
  if (path.charAt(last) === "#") {
    return path.substring(0, last)
  }

  return  (path.substring(last - 2) === ".js" ||
      path.indexOf("?") > 0 ||
      path.substring(last - 3) === ".css") ? path : path + ".js"
}


var PATHS_RE = /^([^/:]+)(\/.+)$/
var VARS_RE = /{([^{]+)}/g

function parseAlias(id) {
  var alias = data.alias
  return alias && isString(alias[id]) ? alias[id] : id
}

function parsePaths(id) {
  var paths = data.paths
  var m

  if (paths && (m = id.match(PATHS_RE)) && isString(paths[m[1]])) {
    id = paths[m[1]] + m[2]
  }

  return id
}

function parseVars(id) {
  var vars = data.vars

  if (vars && id.indexOf("{") > -1) {
    id = id.replace(VARS_RE, function(m, key) {
      return isString(vars[key]) ? vars[key] : m
    })
  }

  return id
}

function parseMap(uri) {
  var map = data.map
  var ret = uri

  if (map) {
    for (var i = 0, len = map.length; i < len; i++) {
      var rule = map[i]

      ret = isFunction(rule) ?
          (rule(uri) || uri) :
          uri.replace(rule[0], rule[1])

      
      if (ret !== uri) break
    }
  }

  return ret
}


var ABSOLUTE_RE = /^\/\/.|:\//
var ROOT_DIR_RE = /^.*?\/\/.*?\//

function addBase(id, refUri) {
  var ret
  var first = id.charAt(0)

  
  if (ABSOLUTE_RE.test(id)) {
    ret = id
  }
  
  else if (first === ".") {
    ret = realpath((refUri ? dirname(refUri) : data.cwd) + id)
  }
  
  else if (first === "/") {
    var m = data.cwd.match(ROOT_DIR_RE)
    ret = m ? m[0] + id.substring(1) : id
  }
  
  else {
    ret = data.base + id
  }

  return ret
}

function id2Uri(id, refUri) {
  if (!id) return ""

  id = parseAlias(id)
  id = parsePaths(id)
  id = parseVars(id)
  id = normalize(id)

  var uri = addBase(id, refUri)
  uri = parseMap(uri)

  return uri
}


var doc = document
var loc = location
var cwd = dirname(loc.href)
var scripts = doc.getElementsByTagName("script")


var loaderScript = doc.getElementById("seajsnode") ||
    scripts[scripts.length - 1]


var loaderDir = dirname(getScriptAbsoluteSrc(loaderScript) || cwd)

function getScriptAbsoluteSrc(node) {
  return node.hasAttribute ? 
      node.src :
    
      node.getAttribute("src", 4)
}




var head = doc.getElementsByTagName("head")[0] || doc.documentElement
var baseElement = head.getElementsByTagName("base")[0]

var IS_CSS_RE = /\.css(?:\?|$)/i
var READY_STATE_RE = /^(?:loaded|complete|undefined)$/

var currentlyAddingScript
var interactiveScript






var isOldWebKit = (navigator.userAgent
    .replace(/.*AppleWebKit\/(\d+)\..*/, "$1")) * 1 < 536


function request(url, callback, charset) {
  var isCSS = IS_CSS_RE.test(url)
  var node = doc.createElement(isCSS ? "link" : "script")

  if (charset) {
    var cs = isFunction(charset) ? charset(url) : charset
    if (cs) {
      node.charset = cs
    }
  }

  addOnload(node, callback, isCSS)

  if (isCSS) {
    node.rel = "stylesheet"
    node.href = url
  }
  else {
    node.async = true
    node.src = url
  }

  
  
  
  currentlyAddingScript = node

  
  baseElement ?
      head.insertBefore(node, baseElement) :
      head.appendChild(node)

  currentlyAddingScript = null
}

function addOnload(node, callback, isCSS) {
  var missingOnload = isCSS && (isOldWebKit || !("onload" in node))

  
  if (missingOnload) {
    setTimeout(function() {
      pollCss(node, callback)
    }, 1) 
    return
  }

  node.onload = node.onerror = node.onreadystatechange = function() {
    if (READY_STATE_RE.test(node.readyState)) {

      
      node.onload = node.onerror = node.onreadystatechange = null

      
      if (!isCSS && !data.debug) {
        head.removeChild(node)
      }

      
      node = null

      callback()
    }
  }
}

function pollCss(node, callback) {
  var sheet = node.sheet
  var isLoaded

  
  if (isOldWebKit) {
    if (sheet) {
      isLoaded = true
    }
  }
  
  else if (sheet) {
    try {
      if (sheet.cssRules) {
        isLoaded = true
      }
    } catch (ex) {
      
      
      
      if (ex.name === "NS_ERROR_DOM_SECURITY_ERR") {
        isLoaded = true
      }
    }
  }

  setTimeout(function() {
    if (isLoaded) {
      
      callback()
    }
    else {
      pollCss(node, callback)
    }
  }, 20)
}

function getCurrentScript() {
  if (currentlyAddingScript) {
    return currentlyAddingScript
  }

  
  
  
  
  
  if (interactiveScript && interactiveScript.readyState === "interactive") {
    return interactiveScript
  }

  var scripts = head.getElementsByTagName("script")

  for (var i = scripts.length - 1; i >= 0; i--) {
    var script = scripts[i]
    if (script.readyState === "interactive") {
      interactiveScript = script
      return interactiveScript
    }
  }
}




var REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^\/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g
var SLASH_RE = /\\\\/g

function parseDependencies(code) {
  var ret = []

  code.replace(SLASH_RE, "")
      .replace(REQUIRE_RE, function(m, m1, m2) {
        if (m2) {
          ret.push(m2)
        }
      })

  return ret
}




var cachedMods = seajs.cache = {}
var anonymousMeta

var fetchingList = {}
var fetchedList = {}
var callbackList = {}

var STATUS = Module.STATUS = {
  
  FETCHING: 1,
  
  SAVED: 2,
  
  LOADING: 3,
  
  LOADED: 4,
  
  EXECUTING: 5,
  
  EXECUTED: 6
}


function Module(uri, deps) {
  this.uri = uri
  this.dependencies = deps || []
  this.exports = null
  this.status = 0

  
  this._waitings = {}

  
  this._remain = 0
}


Module.prototype.resolve = function() {
  var mod = this
  var ids = mod.dependencies
  var uris = []

  for (var i = 0, len = ids.length; i < len; i++) {
    uris[i] = resolve(ids[i], mod.uri)
  }
  return uris
}


Module.prototype.load = function() {
  var mod = this

  
  if (mod.status >= STATUS.LOADING) {
    return
  }

  mod.status = STATUS.LOADING

  
  var uris = mod.resolve()
  emit("load", uris)

  var len = mod._remain = uris.length
  var m

  
  for (var i = 0; i < len; i++) {
    m = Module.get(uris[i])

    if (m.status < STATUS.LOADED) {
      
      m._waitings[mod.uri] = (m._waitings[mod.uri] || 0) + 1
    }
    else {
      mod._remain--
    }
  }

  if (mod._remain === 0) {
    mod.onload()
    return
  }

  
  var requestCache = {}

  for (i = 0; i < len; i++) {
    m = cachedMods[uris[i]]

    if (m.status < STATUS.FETCHING) {
      m.fetch(requestCache)
    }
    else if (m.status === STATUS.SAVED) {
      m.load()
    }
  }

  
  for (var requestUri in requestCache) {
    if (requestCache.hasOwnProperty(requestUri)) {
      requestCache[requestUri]()
    }
  }
}


Module.prototype.onload = function() {
  var mod = this
  mod.status = STATUS.LOADED

  if (mod.callback) {
    mod.callback()
  }

  
  var waitings = mod._waitings
  var uri, m

  for (uri in waitings) {
    if (waitings.hasOwnProperty(uri)) {
      m = cachedMods[uri]
      m._remain -= waitings[uri]
      if (m._remain === 0) {
        m.onload()
      }
    }
  }

  
  delete mod._waitings
  delete mod._remain
}


Module.prototype.fetch = function(requestCache) {
  var mod = this
  var uri = mod.uri

  mod.status = STATUS.FETCHING

  
  var emitData = { uri: uri }
  emit("fetch", emitData)
  var requestUri = emitData.requestUri || uri

  
  if (!requestUri || fetchedList[requestUri]) {
    mod.load()
    return
  }

  if (fetchingList[requestUri]) {
    callbackList[requestUri].push(mod)
    return
  }

  fetchingList[requestUri] = true
  callbackList[requestUri] = [mod]

  
  emit("request", emitData = {
    uri: uri,
    requestUri: requestUri,
    onRequest: onRequest,
    charset: data.charset
  })

  if (!emitData.requested) {
    requestCache ?
        requestCache[emitData.requestUri] = sendRequest :
        sendRequest()
  }

  function sendRequest() {
    request(emitData.requestUri, emitData.onRequest, emitData.charset)
  }

  function onRequest() {
    delete fetchingList[requestUri]
    fetchedList[requestUri] = true

    
    if (anonymousMeta) {
      save(uri, anonymousMeta)
      anonymousMeta = null
    }

    
    var m, mods = callbackList[requestUri]
    delete callbackList[requestUri]
    while ((m = mods.shift())) m.load()
  }
}


Module.prototype.exec = function () {
  var mod = this

  
  
  
  if (mod.status >= STATUS.EXECUTING) {
    return mod.exports
  }

  mod.status = STATUS.EXECUTING

  
  var uri = mod.uri

  function require(id) {
    return cachedMods[require.resolve(id)].exec()
  }

  require.resolve = function(id) {
    return resolve(id, uri)
  }

  require.async = function(ids, callback) {
    Module.use(ids, callback, uri + "_async_" + cid())
    return require
  }

  
  var factory = mod.factory

  var exports = isFunction(factory) ?
      factory(require, mod.exports = {}, mod) :
      factory

  if (exports === undefined) {
    exports = mod.exports
  }

  
  if (exports === null && !IS_CSS_RE.test(uri)) {
    emit("error", mod)
  }

  
  delete mod.factory

  mod.exports = exports
  mod.status = STATUS.EXECUTED

  
  emit("exec", mod)

  return exports
}


Module.define = function (id, deps, factory) {
  var argsLen = arguments.length

  
  if (argsLen === 1) {
    factory = id
    id = undefined
  }
  else if (argsLen === 2) {
    factory = deps

    
    if (isArray(id)) {
      deps = id
      id = undefined
    }
    
    else {
      deps = undefined
    }
  }

  
  if (!isArray(deps) && isFunction(factory)) {
    deps = parseDependencies(factory.toString())
  }

  var meta = {
    id: id,
    uri: resolve(id),
    deps: deps,
    factory: factory
  }

  
  if (!meta.uri && doc.attachEvent) {
    var script = getCurrentScript()

    if (script) {
      meta.uri = script.src
    }

    
    
  }

  
  emit("define", meta)

  meta.uri ? save(meta.uri, meta) :
      
      anonymousMeta = meta
}


Module.get = function(uri, deps) {
  return cachedMods[uri] || (cachedMods[uri] = new Module(uri, deps))
}


Module.use = function (ids, callback, uri) {
  var mod = Module.get(uri, isArray(ids) ? ids : [ids])

  mod.callback = function() {
    var exports = []
    var uris = mod.resolve()

    for (var i = 0, len = uris.length; i < len; i++) {
      exports[i] = cachedMods[uris[i]].exec()
    }

    if (callback) {
      callback.apply(global, exports)
    }

    delete mod.callback
  }

  mod.load()
}


Module.preload = function(callback) {
  var preloadMods = data.preload
  var len = preloadMods.length

  if (len) {
    Module.use(preloadMods, function() {
      
      preloadMods.splice(0, len)

      
      Module.preload(callback)
    }, data.cwd + "_preload_" + cid())
  }
  else {
    callback()
  }
}




function resolve(id, refUri) {
  
  var emitData = { id: id, refUri: refUri }
  emit("resolve", emitData)

  return emitData.uri || id2Uri(emitData.id, refUri)
}

function save(uri, meta) {
  var mod = Module.get(uri)

  
  if (mod.status < STATUS.SAVED) {
    mod.id = meta.id || uri
    mod.dependencies = meta.deps || []
    mod.factory = meta.factory
    mod.status = STATUS.SAVED
  }
}




seajs.use = function(ids, callback) {
  Module.preload(function() {
    Module.use(ids, callback, data.cwd + "_use_" + cid())
  })
  return seajs
}

Module.define.cmd = {}
global.define = Module.define




seajs.Module = Module
data.fetchedList = fetchedList
data.cid = cid

seajs.resolve = id2Uri
seajs.require = function(id) {
  return (cachedMods[resolve(id)] || {}).exports
}




var BASE_RE = /^(.+?\/)(\?\?)?(seajs\/)+/




data.base = (loaderDir.match(BASE_RE) || ["", loaderDir])[1]


data.dir = loaderDir


data.cwd = cwd


data.charset = "utf-8"


data.preload = (function() {
  var plugins = []

  
  
  var str = loc.search.replace(/(seajs-\w+)(&|$)/g, "$1=1$2")

  
  str += " " + doc.cookie

  
  str.replace(/(seajs-\w+)=1/g, function(m, name) {
    plugins.push(name)
  })

  return plugins
})()







seajs.config = function(configData) {

  for (var key in configData) {
    var curr = configData[key]
    var prev = data[key]

    
    if (prev && isObject(prev)) {
      for (var k in curr) {
        prev[k] = curr[k]
      }
    }
    else {
      
      if (isArray(prev)) {
        curr = prev.concat(curr)
      }
      
      else if (key === "base") {
        (curr.slice(-1) === "/") || (curr += "/")
        curr = addBase(curr)
      }

      
      data[key] = curr
    }
  }

  emit("config", configData)
  return seajs
}


})(this);
;
;define('lib/jsonParser.js', [], function(require, exports, module){
	'use strict';

    var SINGLE_TAB;
    var _dateObj, _regexpObj, _defaultOptions;

    SINGLE_TAB = "  ";

    _dateObj = new Date();
    _regexpObj = new RegExp();
    _defaultOptions = {
        tabSize: 2,
        QuoteKeys: false
    };

    function JsonParser(options) {
        if(!options) {
            options = _defaultOptions;
        }
        for(var prop in _defaultOptions) {
            if(_defaultOptions.hasOwnProperty(prop)) {
                this[prop] = (options[prop] !== undefined) ? options[prop] : _defaultOptions[prop];
            }
        }

        this.setTab(this.tabSize);
    }

    JsonParser.prototype.setTab = function(tabSize) {
        this.TAB = _multiplyString(tabSize, SINGLE_TAB);
    };

    JsonParser.prototype.parseAndCheck = function(jsonStr) {
        var obj;

        try {
            obj = eval("[" + jsonStr + "]");
        } catch(e) {
            alert("JSON数据格式不正确:\n" + e.message);
            console.log("JSON数据格式不正确:\n" + e.message);
            return false;
        }

        return obj[0];
    };

    JsonParser.prototype.filter = function(jsonStr) {
        var obj, jsonStr, quote, html, div, str, reg;

        obj = this.parseAndCheck(jsonStr);

        if(obj == false) {
            return false;
        }

        reg = new RegExp("<[^>]+>","g");
        quote = this.QuoteKeys ? "\"" : "";
        html = _processObject(obj, 0, this.TAB, false, quote, false, false);
        html = $.trim(html);
        jsonStr = html.replace(reg, "");  
        return jsonStr;
    };

    JsonParser.prototype.process = function(jsonStr) {
        var obj, html, quote;

        html = "";
        if(jsonStr == "") { 
            jsonStr = "\"\"";
            return html;
        }

        obj = this.parseAndCheck(jsonStr);
        if(obj == false) {
            return false;
        }
        quote = this.QuoteKeys ? "\"" : "";
        html = _processObject(obj, 0, this.TAB, false, quote, false, false);
        html = "<PRE class='CodeContainer'>" + html + "</PRE>";

        return html;
    }

    function _isArray(obj) {
        return  obj && 
                typeof obj === 'object' && 
                typeof obj.length === 'number' &&
                       !(obj.propertyIsEnumerable('length'));
    }

    function _multiplyString(num, str){
        var sb;

        sb = [];
        for(var i = 0; i < num; i ++){
            sb.push(str);
        }
        return sb.join("");
    }

    function _getRow(indent, tab, data, isPropertyContent){
        var tabs;

        tabs = "";
        for(var i = 0; i < indent && !isPropertyContent; i++) {
            tabs += tab;
        }

        if(data != null && data.length > 0 && data.charAt(data.length - 1) != "\n") {
            data = data + "\n";
        }

        return tabs + data;                       
    }

    
    function _processObject(obj, indent, tab, addComma, quote, isArray, isPropertyContent) {
        var html, comma, type, clpsHtml, numProps, keyIndex;

        comma = (addComma) ? "<span class='Comma'>,</span> " : ""; 
        type = typeof obj;
        clpsHtml = "";
        html = "";
        if(_isArray(obj)) {
            if(obj.length == 0){
                html += _getRow(indent, tab, "<span class='ArrayBrace'>[ ]</span>" + comma, isPropertyContent);
            }else{
                html += _getRow(indent, tab, "<span class='ArrayBrace'>[</span>", isPropertyContent);
                for(var i = 0, length = obj.length; i < length; i ++){
                    html += _processObject(obj[i], indent + 1, tab, i < (length - 1), quote, true, false);
                }
                html += _getRow(indent, tab, "<span class='ArrayBrace'>]</span>" + comma);
            }
        } else if(type == 'object') {
            if (obj == null){
                html += _formatLiteral("null", tab, "", comma, indent, isArray, "Null");

            } else if (obj.constructor == _dateObj.constructor) { 
                html += _formatLiteral("new Date(" + obj.getTime() + ") ", tab, "", comma, indent, isArray, "Date"); 
            
            } else if (obj.constructor == _regexpObj.constructor) {
                html += _formatLiteral("new RegExp(" + obj + ")", tab, "", comma, indent, isArray, "RegExp"); 
            
            } else {
                numProps = 0;
                for(var prop in obj) {
                    numProps ++;
                }

                if(numProps == 0){
                    html += _getRow(indent, tab, "<span class='ObjectBrace'>{ }</span>" + comma, isPropertyContent);
                } else {
                    html += _getRow(indent, tab, "<span class='ObjectBrace'>{</span>", isPropertyContent);

                    keyIndex = 0;
                    for(var prop in obj) {
                        html += _getRow(indent + 1, tab, "<span class='PropertyName'>" + quote + prop + quote + "</span>: " + _processObject(obj[prop], indent + 1, tab, ++keyIndex < numProps, quote, false, true));
                    }
                    html += _getRow(indent, tab, "<span class='ObjectBrace'>}</span>" + comma);
                }
            }
        } else if(type == 'number') {
            html += _formatLiteral(obj, tab, "", comma, indent, isArray, "Number");

        } else if(type == 'boolean') {
            html += _formatLiteral(obj, tab, "", comma, indent, isArray, "Boolean");

        } else if(type == 'function') {
            if(obj.constructor == _regexpObj.constructor) {
                html += _formatLiteral("new RegExp(" + obj + ")", tab, "", comma, indent, isArray, "RegExp"); 

            } else {
                obj = _formatFunction(indent, tab, obj);
                html += _formatLiteral(obj, tab, "", comma, indent, isArray, "Function");
            }

        } else if(type == 'undefined') {
            html += _formatLiteral("undefined", tab, "", comma, indent, isArray, "Null");
        
        } else {
            html += _formatLiteral(obj.toString().split("\\").join("\\\\").split('"').join('\\"'), tab, "\"", comma, indent, isArray, "String");
        }

        return html;
    }

    function _formatLiteral(literal, tab, quote, comma, indent, isArray, style) {
        var str;

        if(typeof literal == 'string'){
            literal = literal.split("<").join("&lt;").split(">").join("&gt;");
        }
        str = "<span class='" + style + "'>" + quote + literal + quote + comma + "</span>";

        if(isArray) {
            str = _getRow(indent, tab, str);
        }

        return str;
    }

    function _formatFunction(indent, tab, obj) {
        var funcStrArray, tabs, str;

        tabs = "";
        for(var i = 0; i < indent; i ++) {
            tabs += tab;
        }

        str = "";
        funcStrArray = obj.toString().split("\n");
        for(var i = 0; i < funcStrArray.length; i ++) {
            str += ((i==0) ? "" : tabs) + funcStrArray[i] + "\n";
        }

        return str;
    }

    return exports = JsonParser;
});
;;define('lib/xmlParser.js', [], function(require, exports, module){
	'use strict';

    var getPrefix = function(prefixIndex) {
        var span = '    ';
        var output = [];
        for(var i = 0 ; i < prefixIndex; ++i) {
            output.push(span);
        }
        
        return output.join('');
    };

    var formatXml = function(text) {
        
        text = '\n' + text.replace(/(<\w+)(\s.*?>)/g, function($0, name, props) {
            return name + ' ' + props.replace(/\s+(\w+=)/g," $1");
        }).replace(/>\s*?</g,">\n<");
        
        
        text = text.replace(/\n/g,'\r').replace(/<!--(.+?)-->/g, function($0, text) {
            var ret = '<!--' + escape(text) + '-->';
            return ret;
        }).replace(/\r/g,'\n');
        
        
        var rgx = /\n(<(([^\?]).+?)(?:\s|\s*?>|\s*?(\/)>)(?:.*?(?:(?:(\/)>)|(?:<(\/)\2>)))?)/mg;
        var nodeStack = [];
        var output = text.replace(rgx, function($0, all, name, isBegin, isCloseFull1, isCloseFull2,isFull1,isFull2) {
            var isClosed = (isCloseFull1 == '/') || (isCloseFull2 == '/' ) || (isFull1 == '/') || (isFull2 == '/');
            var prefix = '';
            if(isBegin == '!') {
                prefix = getPrefix(nodeStack.length);
            }
            else {
                if(isBegin != '/') {
                    prefix = getPrefix(nodeStack.length);
                    if(!isClosed) {
                        nodeStack.push(name);
                    }
                }
                else {
                    nodeStack.pop();
                    prefix = getPrefix(nodeStack.length);
                }
            }
            var ret =  '\n' + prefix + all;
            return ret;
        });
        
        var prefixSpace = -1;
        var outputText = output.substring(1);

        
        outputText = outputText.replace(/\n/g,'\r').replace(/(\s*)<!--(.+?)-->/g, function($0, prefix,  text) {
            if(prefix.charAt(0) == '\r')
                prefix = prefix.substring(1);
            text = unescape(text).replace(/\r/g,'\n');
            var ret = '\n' + prefix + '<!--' + text.replace(/^\s*/mg, prefix ) + '-->';
            return ret;
        });
        
        return outputText.replace(/\s+$/g,'').replace(/\r/g,'\r\n');
    };

    function xmlParser() {
        this.parse = formatXml;
    }

    return exports = xmlParser;
});        ;



/*members "", "\b", "\t", "\n", "\f", "\r", "\"", JSON, "\\", apply,
    call, charCodeAt, getUTCDate, getUTCFullYear, getUTCHours,
    getUTCMinutes, getUTCMonth, getUTCSeconds, hasOwnProperty, join,
    lastIndex, length, parse, prototype, push, replace, slice, stringify,
    test, toJSON, toString, valueOf
*/





if (typeof JSON !== 'object') {
    JSON = {};
}

(function () {
    'use strict';

    function f(n) {
        
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf())
                ? this.getUTCFullYear()     + '-' +
                    f(this.getUTCMonth() + 1) + '-' +
                    f(this.getUTCDate())      + 'T' +
                    f(this.getUTCHours())     + ':' +
                    f(this.getUTCMinutes())   + ':' +
                    f(this.getUTCSeconds())   + 'Z'
                : null;
        };

        String.prototype.toJSON      =
            Number.prototype.toJSON  =
            Boolean.prototype.toJSON = function () {
                return this.valueOf();
            };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {






        escapable.lastIndex = 0;
        return escapable.test(string) ? '"' + string.replace(escapable, function (a) {
            var c = meta[a];
            return typeof c === 'string'
                ? c
                : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
        }) + '"' : '"' + string + '"';
    }


    function str(key, holder) {



        var i,          
            k,          
            v,          
            length,
            mind = gap,
            partial,
            value = holder[key];



        if (value && typeof value === 'object' &&
                typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }




        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

// What happens next depends on the value's type.

        switch (typeof value) {
        case 'string':
            return quote(value);

        case 'number':



            return isFinite(value) ? String(value) : 'null';

        case 'boolean':
        case 'null':





            return String(value);




        case 'object':




            if (!value) {
                return 'null';
            }



            gap += indent;
            partial = [];



            if (Object.prototype.toString.apply(value) === '[object Array]') {




                length = value.length;
                for (i = 0; i < length; i += 1) {
                    partial[i] = str(i, value) || 'null';
                }




                v = partial.length === 0
                    ? '[]'
                    : gap
                    ? '[\n' + gap + partial.join(',\n' + gap) + '\n' + mind + ']'
                    : '[' + partial.join(',') + ']';
                gap = mind;
                return v;
            }



            if (rep && typeof rep === 'object') {
                length = rep.length;
                for (i = 0; i < length; i += 1) {
                    if (typeof rep[i] === 'string') {
                        k = rep[i];
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            } else {



                for (k in value) {
                    if (Object.prototype.hasOwnProperty.call(value, k)) {
                        v = str(k, value);
                        if (v) {
                            partial.push(quote(k) + (gap ? ': ' : ':') + v);
                        }
                    }
                }
            }




            v = partial.length === 0
                ? '{}'
                : gap
                ? '{\n' + gap + partial.join(',\n' + gap) + '\n' + mind + '}'
                : '{' + partial.join(',') + '}';
            gap = mind;
            return v;
        }
    }



    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {







            var i;
            gap = '';
            indent = '';




            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }



            } else if (typeof space === 'string') {
                indent = space;
            }




            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                    (typeof replacer !== 'object' ||
                    typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }




            return str('', {'': value});
        };
    }




    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {




            var j;

            function walk(holder, key) {




                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.prototype.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }






            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                        ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }














            if (/^[\],:{}\s]*$/
                    .test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@')
                        .replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']')
                        .replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {






                j = eval('(' + text + ')');




                return typeof reviver === 'function'
                    ? walk({'': j}, '')
                    : j;
            }



            throw new SyntaxError('JSON.parse');
        };
    }
}());
;


;define('common/eventCenter.js', [], function(require, exports, module){
	'use strict';

	var EventCenter = {
		eventList: [],	

		
		
		bind: function(eventType, handler, context, functionName, isBindOnce, isOnce) {
			var funcList, func;

			if(!this.eventList[eventType]) {
				this.eventList[eventType] = [];
			}

			func = {
				handler: handler,
				name: functionName,
				context: context,
				once: !!isOnce
			};
			funcList = this.eventList[eventType];

			
			if(!!isBindOnce) {
				for(var i = 0, length = funcList.length; i < length; i ++) {
					if(funcList[i].handler === handler) {
						return ;
					}
				}
			}

			funcList.push(func);
		},

		once: function(eventType, handler, context, functionName) {
			this.bind(eventType, handler, context, functionName, false, true)
		},

		bindOnce: function(eventType, handler, context, functionName) {
			this.bind(eventType, handler, context, functionName, true);
		},

		
		
		trigger: function(eventType) {
			var events, result, paramArray, returnValues, context, name, eventObj;
			
			if( !this.eventList[eventType] ) {
				this.eventList[eventType] = [];
			}

			returnValues = [];
			events = this.eventList[eventType];
			for(var i = 0; i < events.length; i ++) {
				eventObj = events[i];
				paramArray = Array.prototype.slice.call(arguments, 1);
				name = eventObj.name;
				context = eventObj.context;
				result = eventObj.handler.apply(context, paramArray);

				if(name) 
					returnValues[name] = result;
				else 
					returnValues.push(result);

				if(eventObj.isOnce === true) {
					events.splice(i, 1);
					i --;
				}
				
				if(result === false) 
					return false;
				else
					return returnValues;
			}
		},	

		
		
		
		unbind: function(eventType, handler) {
			if( !this.eventList ) {
				throw new Error("The eventList was undefined");
			}
			if( !this.eventList[eventType] ) {
				throw new Error("The event type " + eventType + " was not found");
			}

			if( handler === undefined ) {
				this.eventList[eventType] = [];
			} else {
				var events = this.eventList[eventType];
				var length = events.length;

				for(var i = 0; i < length; i ++) {
					if( events[i].handler === handler ) {
						events.splice(i, 1);
						break ;
					}
				}
			}
		}
	};

	return exports = EventCenter;
});
;
;define('common/viewer.js', ['formValidator.js', 'common/eventCenter.js'], function(require, exports, module){
	'use strict';

	
	var _contentDiv = $("#content"),
		_methodSpan = $("#methodType"),
		_typeSelector = $("#typeSelector"),
		_formSelector = $("#formSelector"),
		_formContainer = $("#formContainer"),
		_formSelectorDiv = $("#formSelectorDiv");

	var _elemTemplate = _.template($("#elem-template").html()),
		_formTemplate = _.template($("#form-template").html()),
		_argsTemplate = _.template($("#args-template").html()),
		_textareaTemplate = _.template($("#textarea-template").html()),
		_formOptionTemplate = _.template($("#form-option-template").html()),
		_typeOptionTemplate = _.template($("#type-option-template").html());

	var	FormValidator = require('formValidator.js'),
		EventCenter = require('common/eventCenter.js');

	var _formValidator = new FormValidator();

	var getAttributeString = function(type, config) {
		var result = "";

		if(config.method === "GET") {
			result += 'reserved-name="' + config.name + '"';
		} else {
			result += 'name="' + config.name + '"';
		}

		result += ' method="' + config.method + '"';
		result += ' data-type="' + config.type + '"';
		if(config.required) {
			result += ' required=' + config.required + ' ';
		}
		if((type === "string" || type === "number" || type === "url" || type === "email") && config.diabled !== "") {
			result += ' value="' + config.diabled + '"';
			result += ' disabled="true"';
			result += ' readonly="true"';
		}
        if(config.sync) {
           result += ' sync="true"';
        }

		return result;
	};

	
	var _bindEvents = function() {
		$(document).on("change", "#typeSelector", function(e) {
			EventCenter.trigger("App::selectType", e.target.value);
		});

		$(document).on("change", "#formSelector", function(e) {
			EventCenter.trigger("FormFactory::selectForm", e.target.value);
			EventCenter.trigger("App::selectForm", e.target.value); 
		});

		$(document).on("blur", "#formContent input[type='text']", function(e) {
			var formValidator, checkResult, formElem, button;

			if($(this).attr("readonly")) {
				return true;
			}

			_formValidator.validate($(this), true);

			formElem = $(this).parent().parent();
			button = formElem.find("#submit");
			if(_formValidator.validateForm(formElem, false)) {
				button.removeClass("unsubmit").addClass("submit");
			} else {
				button.removeClass("submit").addClass("unsubmit");
			}

			return true;
		});

		$(document).on("change", "#formContent input[type='file']", function(e) {
			var formValidator, checkResult, formElem, button;

			_formValidator.validate($(this), true);

			formElem = $(this).parent().parent();
			button = formElem.find("#submit");
			if(_formValidator.validateForm(formElem, false)) {
				button.removeClass("unsubmit").addClass("submit");
			} else {
				button.removeClass("submit").addClass("unsubmit");
			}
		});

		$(document).on("change", "#formContent select", function(e) {
			var formElem, fileElem;

			formElem = $(this).parent().parent();
			fileElem = formElem.find("input[type='file']");

			fileElem.after(fileElem.clone().val(""));
			fileElem.remove();
		});

		$(document).on("click", "#submit", function(e) {
			var elem, result;

			elem = e.target;
			result = EventCenter.trigger("FormFactory::submit", elem);

			return result["submit"] || result;
		});
	};

	var showForm = function(form) {
		_formContainer.html(form);
		form = _formContainer.find("form :eq(0)");

		return form;
	};

	var showMethodOfForm = function(method) {
		_methodSpan.html("方法：" + method);
	};

	var setTypeSelector = function(configs) {
		var typeOptionStr, content;

		typeOptionStr = _typeOptionTemplate({
			forms: configs
		});

		content = $.trim(_typeSelector.html());
		if(!content) {
			_typeSelector.html(typeOptionStr);
			
		}
	};

    var changeTypeSelector = function(value) {
        $("#typeSelector").get(0).selectedIndex = value;
    };

	var setFormSelector = function(forms) {
		var formOptionStr;

		formOptionStr = _formOptionTemplate({
			forms: forms
		});
		_formSelector.html(formOptionStr);
		EventCenter.trigger("FormFactory::selectForm", _formSelector.val());
	};

    var changeFormSelector = function(value) {
        $("#formSelector").val(value);
    };

	var createForm = function(config) {
		var item, typesArray, attrString, _inputElemStr, 
			formContentStr, form, args, isFileType, container;

		isFileType = false;
		if(config.type === "args" && (args = config.args)) {
			for(var j = 0; j < args.length; j ++) {
				item = args[j];
				typesArray = item.diabled.split(',');
				attrString = getAttributeString(item.type, item);
				_inputElemStr = _elemTemplate({
					type: item.type,
					attrString: attrString,
					typesArray: typesArray
				});
				_inputElemStr = $.trim(_inputElemStr);
				item.inputElem = _inputElemStr;
				if(item.type === "file") {
					isFileType = true;
				}
			}
			formContentStr = _argsTemplate({args: args});
		} else {
			formContentStr = _textareaTemplate();
		}
		form = _formTemplate({
			form: config,
			formContent: formContentStr
		});

		container = $("<div></div>");
		container.html(form);
		form = container.children().eq(0);
		if(isFileType === true) {
			form.attr("enctype", "multipart/form-data");
		}

		return form;
	};

	var syncValueByName = function(attr, name) {
        var selector;

        selector = "#formContainer  *[" + attr + "='" + name + "']";
		$(document).on("keyup", selector, function(e) {
            var elem, selector;

            elem = $(e.target);
            if(elem.attr("sync")) {
                $.cache.sync[name] = e.target.value;
			    EventCenter.trigger("FormFactory::setValueByName", attr, name, e.target.value);
		    }
        });
	};

    var getFormConfigs = function() {
        var formElem, configs;

        configs = [];
        formElem = $("#formContainer").find("form");
        formElem.children().each(function(index, elem) {
            var result, inputElem;

            result = {};
            elem = $(elem);
            inputElem = elem.find("input");
            if(inputElem.length === 0 || inputElem.attr("type") === "submit") {
                return true;
            }

            
            if(inputElem.data('skipxml') == '1') {
            	return true;
            }

            if(inputElem.attr("method") === "GET") {
                result.name = inputElem.attr("reserved-name");
            } else {
                result.name = inputElem.attr("name");
            }

            if(result.name === "url") {
                return true;
            }

            result.value = inputElem.val();
            result.type = inputElem.attr("data-type");
            configs.push(result);
        });

        return configs;
    };

	function Viewer() {
		this.elemTemplate = _elemTemplate;
		this.formTemplate = _formTemplate;
		this.argsTemplate = _argsTemplate;
		this.textareaTemplate = _textareaTemplate;
		this.formOptionTemplate = _formOptionTemplate;
		this.typeOptionTemplate = _typeOptionTemplate;

		_bindEvents();
		this.subscribeEvents();
	};

	Viewer.prototype.subscribeEvents = function() {
		EventCenter.bind("Viewer::showForm", showForm, this, "showForm");
		EventCenter.bind("Viewer::createForm", createForm, this, "createForm");
		EventCenter.bind("Viewer::setFormSelector", setFormSelector, this);
		EventCenter.bind("Viewer::setTypeSelector", setTypeSelector, this);
		EventCenter.bind("Viewer::showMethodOfForm", showMethodOfForm, this);
		EventCenter.bind("Viewer::syncValueByName", syncValueByName, this);
	    EventCenter.bind("Viewer::getFormConfigs", getFormConfigs, this, "formConfigs");
        EventCenter.bind("Viewer::changeTypeSelector", changeTypeSelector, this);
        EventCenter.bind("Viewer::changeFormSelector", changeFormSelector, this);
    };

	return exports = Viewer;
});
;;define('packages/formFactory/apiinfoFormFactory.js', ['lib/jsonParser.js', 'formValidator.js', 'packages/formFactory/formFactory.js', 'packages/formFactory/formRegister.js'], function(require, exports, module){
	'use strict';

	var JsonParser = require('lib/jsonParser.js'),
        FormValidator = require('formValidator.js'),
		FormFactory = require('packages/formFactory/formFactory.js'),
		FormRegister = require('packages/formFactory/formRegister.js');

	var _formValidator = new FormValidator(),
        _jsonParser = new JsonParser({QuoteKeys: true});

	var _generateGetArgsForAction = function(argsStr, container, elemName) {
		var span;

		container.find(elemName).each(function(index, elem) {
			var name, value, method;

			elem = $(elem);
			method = elem.attr("method");
			if(method === "GET") {
				name = elem.attr("reserved-name");
				value = elem.val(); 
				elem[0].removeAttribute("name");

				if(argsStr === "") {
					argsStr = name + "=" + value;
				} else {
					argsStr = argsStr + "&" + name + "=" + value;
				}
			}
		});

		return argsStr;
	};	
	
    var _checkAndFilterJsonStr = function(self, formElem) {
        var args, config, arg, value, target;

        config = self.configs[self.currentFormIndex];
        args = config.args;

        for(var i = 0, length = args.length; i < length; i ++) {
            arg = args[i];
            if(arg.parse_type === "json"){
                if(arg.method.toLowerCase() === "post") {
                    target = formElem.find("*[name=" + arg.name + "]");
                } else {
                    target = formElem.find("*[reserved-name=" + arg.name + "]");
                }
                value = _jsonParser.filter(target.val());
                if(value !== false) {
                    target.val(value); 
                } else {
                    return false;
                }
            }
        }

        return true;
    };

	
	function f() {}
	f.prototype = FormFactory.prototype;
	ApiinfoFormFactory.prototype = new f();
	ApiinfoFormFactory.prototype.parent_init = FormFactory.prototype.init;

	ApiinfoFormFactory.prototype.init = function(typeName, configs) {
		this.parent_init(typeName, configs);
	};

	function ApiinfoFormFactory(typeName, configs) {
		this.init(typeName, configs);
	};

	ApiinfoFormFactory.prototype.submit = function(self) {
		var formElem, postElem, getElem, action, prev, span, button, checkJson,
			value, name, method, urlStr, argsStr, formMethod, newIframe;

		argsStr = "";
		action = "/debug/cgi-bin/apiagent"; 
		formElem = $(self).parent();
		urlStr = formElem.attr("action-target") + "?";
		formMethod = formElem.attr("form-method");
        
        checkJson = _checkAndFilterJsonStr(this, formElem);
        if(!checkJson) {
            return false;
        }
		this.checkResult = _formValidator.validateForm(formElem, true);
		if(this.checkResult === false) {
			button = formElem.find("#submit");
			button.removeClass("submit").addClass("unsubmit");
			return false;
		}

		if(formElem.attr("form-type") === "args") {
			argsStr = _generateGetArgsForAction(argsStr, formElem, "input");
			argsStr = _generateGetArgsForAction(argsStr, formElem, "select");

			urlStr = urlStr + argsStr;
			action = action + "?url=" + encodeURIComponent(urlStr) + "&method=" + formMethod + "&body=0";
		} else {
			urlStr = formElem.find('input[name="URL"]').val();
			
			action = action + "?url=" + urlStr + "&body=1";
		}

		formElem[0].setAttribute("action", action);

		formElem.trigger("submit");

		return true;
	};
	
	FormRegister.register("ApiinfoFormFactory", ApiinfoFormFactory);
	return exports = ApiinfoFormFactory;
});
;;define('packages/formFactory/rawinfoFormFactory.js', ['formValidator.js', 'packages/formFactory/formFactory.js', 'packages/formFactory/formRegister.js'], function(require, exports, module){
	'use strict';

	var FormValidator = require('formValidator.js'),
		FormFactory = require('packages/formFactory/formFactory.js'),
		FormRegister = require('packages/formFactory/formRegister.js');

	var _formValidator = new FormValidator();

	function f() {}
	f.prototype = FormFactory.prototype;
	RawinfoFormFactory.prototype = new f();
    RawinfoFormFactory.prototype.parent_init = FormFactory.prototype.init;

	RawinfoFormFactory.prototype.init = function(typeName, configs) {
		this.parent_init(typeName, configs);
	};

	function RawinfoFormFactory(typeName, configs) {
		this.init(typeName, configs);
	};

	RawinfoFormFactory.prototype.submit = function(self) {
		var url, formElem, action;

		formElem = $(self).parent();
		body = formElem.find("input[name='body']").val();
		url = formElem.find("input[reserved-name='URL']").val();
		this.checkResult = _formValidator.validateForm(formElem, true);
		if(this.checkResult === false) {
			button = formElem.find("#submit");
			button.removeClass("submit").addClass("unsubmit");
			return false;
		}

		action = "/debug/callbackagent?url=" + encodeURIComponent(url);
		formElem[0].setAttribute("action", action);

		return true;
	};

	FormRegister.register("RawinfoFormFactory", RawinfoFormFactory);
	return exports = RawinfoFormFactory;
});
;;define('packages/formFactory/callbackinfoFormFactory.js', ['formValidator.js', 'common/eventCenter.js', 'packages/formFactory/formFactory.js', 'packages/formFactory/formRegister.js'], function(require, exports, module){
	'use strict';

	var FormValidator = require('formValidator.js'),
		EventCenter = require('common/eventCenter.js'),
		FormFactory = require('packages/formFactory/formFactory.js'),
		FormRegister = require('packages/formFactory/formRegister.js');

	var _formValidator = new FormValidator();

	var getXMLStr = function(self) {
		var config, configs, returnResults, xmlStr;

		returnResults = EventCenter.trigger("Viewer::getFormConfigs");
		configs = returnResults["formConfigs"];

		xmlStr = "<xml>";
		for(var i = 0, length = configs.length; i < length; i ++) {
			config = configs[i];
			if(config.type === "string") {
				xmlStr += "<" + config.name + ">" + "<![CDATA[" + config.value + "]]></" + config.name + ">";
			} else {
				xmlStr += "<" + config.name + ">" + config.value + "</" + config.name + ">";
			}
		}
		xmlStr += "</xml>";

		return xmlStr;
	};

	function f() {}
	f.prototype = FormFactory.prototype;
	CallbackinfoFormFactory.prototype = new f();
	CallbackinfoFormFactory.prototype.parent_init = FormFactory.prototype.init;

	CallbackinfoFormFactory.prototype.init = function(typeName, configs) {
		this.parent_init(typeName, configs);
	};

	function CallbackinfoFormFactory(typeName, configs) {
		this.init(typeName, configs);
	};

    CallbackinfoFormFactory.prototype.parent_selectForm = FormFactory.prototype.selectForm;
    CallbackinfoFormFactory.prototype.selectForm = function(formIndex) {
        var formElem, bodyInputElem;

        this.parent_selectForm(formIndex);
        formElem = $("#formContainer").find("form");
        if(formElem.length !== 0 && formElem.find("#bodyInputContainer").length === 0) {
            bodyInputElem = $('<input type="text" class="hide" name="body" id="bodyInputContainer"/>');
            formElem.append(bodyInputElem);
        }
    };

	CallbackinfoFormFactory.prototype.submit = function(self) {
		var url, formElem, action, xmlStr, bodyInputElem, body;

		formElem = $(self).parent();
		body = formElem.find("input[name='body']").val();
		url = formElem.find("input[reserved-name='URL']").val();
		
		action = "/debug/cgi-bin/callbackagent?url=" + encodeURIComponent(url);
		formElem[0].setAttribute("action", action);

		xmlStr = getXMLStr.call(this);

        formElem.find("#bodyInputContainer").val(xmlStr);

		return true;
	};

	FormRegister.register("CallbackinfoFormFactory", CallbackinfoFormFactory);
	return exports = CallbackinfoFormFactory;
});
;
;define('packages/formFactory/formFactory.js', ['common/viewer.js', 'common/eventCenter.js', 'formValidator.js'], function(require, exports, module){
	'use strict';

	var _form, _formArray, _config, args, _input, _submit,
		_formSelector, _formOption,  _contentDiv, _formContentDiv, _resultContainer,
		_inputDiv, _textareaDiv, _textarea, _methodSpan;

	var Viewer = require('common/viewer.js'),
		EventCenter = require('common/eventCenter.js'),
		FormValidator = require('formValidator.js');

	var _public = this,
		_viewer = new Viewer(),
		_formValidator = new FormValidator();

	function FormFactory() {
		if(this.__proto__ && this.__proto__ === FormFactory.prototype) {
			throw Error("Can't Instantiate from a absctract class 'FormFactory'");
		}
		if(this.constructor === FormFactory) {
			throw Error("Can't Instantiate from a absctract class 'FormFactory'");
		}
	};

	FormFactory.prototype.submit = function() {
		
		
	};

	FormFactory.prototype.setValueByName = function(attr, name, value, isSelfSet) {
		var selector, formArray, currentForm, target;

		formArray = this.formArray;
        currentForm = $("#formContainer").find("form");
		for(var i = 0, length = formArray.length; i < length; i ++) {
			if(formArray[i] && formArray[i].length) {
                if(!isSelfSet && formArray[i][0] === currentForm[0]) {
                    continue;
                }
                selector = "[" + attr + "='" + name + "']";
                target = formArray[i].find(selector);

                if(!target.length || !target.attr("sync")) {
                    continue;
                }

                target.val(value);
			}
		}
	};

	
	FormFactory.prototype.init = function(typeName, configs) {
		var form, tempDiv, result;

		
		this.formArray = [];
		this.checkResult = true;
		this.typeName = typeName;
		this.configs = configs;
        this.currentFormIndex = 0;

		tempDiv = $("<div></div>");
		for(var i = 0, length = configs.length; i < length; i ++) {
			result = EventCenter.trigger("Viewer::createForm", this.configs[i]);
			form = result["createForm"];
			tempDiv.html(form);
			this.formArray[i] = tempDiv.children(":eq(0)");
		}
	};

    
    
    FormFactory.prototype.syncValues = function(configs) {
        var args, value, attr, config, name;

        if(!configs.args) {
            return ;
        }
        if(!$.cache.sync) {
            $.cache.sync = {};
        }

        args = configs.args;
        for(var i = 0, length = args.length; i < length; i ++) {
            config = args[i];
            name = config.name;
            if(config.method.toUpperCase() === "GET") {
                attr = "reserved-name";
            } else {
                attr = "name";
            }
            if(!$.cache.sync[name]) {
                $.cache.sync[name] = true;
                EventCenter.trigger("Viewer::syncValueByName", attr, name);
            } else {
                if($.cache.sync[name] === true) {
                    continue;
                }
                value = $.cache.sync[name];
                this.setValueByName(attr, name, value, true);
            }
        }
    }

	
	
	FormFactory.prototype.selectForm = function(formIndex) {
		var result, formArray;

		formArray = this.formArray;
		for(var i = 0, length = formArray.length; i < length; i ++) {
			if(formArray[i] && i !== formIndex) {
				formArray[i].remove();
			}
		}

		EventCenter.trigger("Viewer::showMethodOfForm", this.configs[formIndex].method); 

		if(!formArray[formIndex]) {
			result = EventCenter.trigger("Viewer::createForm", this.configs[formIndex]);
			formArray[formIndex] = result["createForm"];
		}

		result = EventCenter.trigger("Viewer::showForm", formArray[formIndex]);
		formArray[formIndex] = result["showForm"];
	
        this.syncValues(this.configs[formIndex]);
        this.currentFormIndex = formIndex;
    };

	FormFactory.prototype.off = function() {
		EventCenter.unbind("FormFactory::submit", this.submit);
		EventCenter.unbind("FormFactory::selectForm", this.selectForm);
		EventCenter.unbind("FormFactory::setValueByName", this.setValueByName);
	};

	FormFactory.prototype.on = function() {
		EventCenter.bind("FormFactory::submit", this.submit, this, "submit");
		EventCenter.bind("FormFactory::selectForm", this.selectForm, this, "selectForm");
		EventCenter.bind("FormFactory::setValueByName", this.setValueByName, this, "setValueByName");
	};

	return exports = FormFactory;
});
;

;define('packages/formFactory/formRegister.js', [], function(require, exports, module){
	'use strict';


	var FormRegister = {
		classContainer: [],

		register: function(className, classFunc) {
			this.classContainer[className] = classFunc;
		},

		getClass: function(className) {
			return this.classContainer[className];
		},

		removeClass: function(className) {
			this.classContainer[className] = undefined;
		}
	};

	return exports = FormRegister;
});
;

;define('formValidator.js', [], function(require, exports, module){
	'use strict';

	var FormValidator = function() {
		var _public, _validator, _ERRMSG, _FILETYPES;

		_validator = {};
		_ERRMSG = {
			"0": "校验通过",
			"1": "该项不能为空",
			"2": "不合法的数字",
			"4": "电子邮件地址格式不正确，缺少@符号",
			"5": "电子邮件地址格式不正确，邮件服务器域名错误",
			"6": "声音文件格式不正确",
			"7": "图片文件格式不正确",
			"8": "视频文件格式不正确",
			"9": "缩略图文件格式不正确",
			"10": "url格式不正确",
			"11": "未知错误",
			"12": "参数中请勿带有空格",
			"13": "消息加密密钥格式不正确"
		};
		_public = this;

		_validator["num"] = {};
		_validator["num"].validate = function(elem) {
			var value;

			value = $.trim(elem.val());
			if(elem.attr("required") && value === "") {
				return 1;
			};

			if(value.split(" ").length > 1) {
				return 12;
			}
			
			if(isNaN(Number(value))) {
				return 2;
			}

			elem.val(value);
			return 0;
		};

		_validator["email"] = {};
		_validator["email"].validate = function(elem) {
			var value, strArray;

			value = $.trim(elem.val());
			if(elem.attr("required") && value === "") {
				return 1;
			}

			if(value.split(" ").length > 1) {
				return 12;
			}

			strArray = value.split("@");
			if(strArray.length === 1) {
				return 4;
			} else if(strArray[1].split(".").length === 1) {
				return 5;
			}

			elem.val(value);
			return 0;
		};

		_validator["url"] = {};
		_validator["url"].validate = function(elem) {
			var value;

			value = $.trim(elem.val());
			if(elem.attr("required") && value === "") {
				return 1;
			}

			if(value.split(" ").length > 1) {
				return 12;
			}

			elem.val(value);
			return 0;
		};

		_validator["string"] = {};
		_validator["string"].validate = function(elem) {
			var value;

			value = $.trim(elem.val());
			if(elem.attr("required") && value === "") {
				return 1;
			}

			if(value.split(" ").length > 1) {
				return 12;
			}

			elem.val(value);
			return 0;
		};

		_validator["encodingaeskey"] = {};
		_validator["encodingaeskey"].validate = function(elem) {
			var value;

			value = $.trim(elem.val());
			if(elem.attr("required") && value === "") {
				return 1;
			}

			if(value.length != 43) {
				return 13;
			}

			if(! value.match(/^[a-zA-Z0-9]+$/g) ) {
				return 13;
			}

			elem.val(value);
			return 0;
		};

		_FILETYPES = {
			"image": {
				"jpg": true,
				"jpeg": true
			},
			"voice": {
				"amr": true
			},
			"video": {
				"mp4": true
			},
			"thumb": {
				"jpg": true,
				"jpeg": true
			}
		};
		_validator["file"] = {};
		_validator["file"].validate = function(elem) {
			var type, typeArray, extensionName;

			if(elem.attr("required") && (elem.val() === "" || elem.val() == null)) {
				return 1;
			}

			type = elem.parent().parent().find("select").val();
			type = type.toLowerCase();
            typeArray = elem.val().split(".");
			extensionName = typeArray[typeArray.length - 1];
		    extensionName = extensionName.toLowerCase();

			if(type === "image" && !_FILETYPES[type][extensionName]) {
				return 7;
			} else if(type === "voice" && !_FILETYPES[type][extensionName]) {
				return 6;
			} else if(type === "video" && !_FILETYPES[type][extensionName]) {
				return 8;
			} else if(type === "thumb" && !_FILETYPES[type][extensionName]) {
				return 9;
			}

			return 0;
		};

		_public.validate = function(inputElem, isMsgShow) {
			var type, andArray, orArray, errCode, errMsg, isValid;

			isValid = true;
			type = inputElem.attr("data-type");

			if(!type || type === "selector" || 
					inputElem.attr("type") === "submit") {
				return true;
			}

			andArray = type.split("&");
			orArray = type.split("|");

			
			var getErrorCode = function(array) {
				var errCode, validator;
			
					for(var i = 0; i < array.length; i ++) {
					validator = _validator[array[i]];
					if(!validator) {
						return 8;
					}
					errCode = validator.validate(inputElem);
					if(errCode !== 0) {
						return errCode;
					}
				}
			};

			
			if(andArray.length === 1 && orArray.length === 1) {
				errCode = _validator[type].validate(inputElem);
			} else if(andArray.length === 1) {
				errCode = getErrorCode(orArray);
			} else if(orArray.length === 1) {
				errCode = getErrorCode(andArray);
			} else {
				
			}
			
			if(isMsgShow) {	
				
				errMsg = _ERRMSG[errCode];
				if(errCode !== 0) {
					inputElem.parent().find(".errMsg").html(errMsg).removeClass("green").addClass("red");
					isValid = false;
				} else {
					inputElem.parent().find(".errMsg").html(errMsg).removeClass("red").addClass("green");
				}
			} else {
				if(errCode !== 0) {
					isValid = false;
				}
			}

			return isValid;
		};

		
		
		_public.validateForm = function(targetForm, isMsgShow) {
			var isValid, self;

			self = this;
			isValid = true;

			
			targetForm.find("input").each(function(index, elem) {
				elem = $(elem);

				if(self.validate(elem, isMsgShow) === false) {
					isValid = false;
				}
			});	

			return isValid;
		};
	};

	return exports = FormValidator;
});
;;define('resultHandler.js', ['resultViewer.js', 'common/eventCenter.js'], function(require, exports, module){
	'use strict';

	var ResultViewer = require('resultViewer.js'),
		EventCenter = require('common/eventCenter.js');

	var ResultHandler = {
		resultList: [],

		addNewResult: function(result, resultType) {
			
			var resultElem;
			
			this.foldAllResults();
			resultElem = ResultViewer.showResult(result, resultType);
			this.resultList.push(resultElem);
		},

		foldAllResults: function() {
			var resultList;

			resultList = this.resultList;
			for(var i = 0, length = resultList.length; i < length; i ++) {
				EventCenter.trigger("ResultViewer::foldResult", resultList[i]);
			}
		},

		unfoldAllResults: function() {
			var resultList;

			resultList = this.resultList;
			for(var i = 0, length = resultList.length; i < length; i ++) {
				EventCenter.trigger("ResultViewer::unfoldResult", resultList[i]);
			}
		},

		deleteResult: function(resultElem) {
			var resultList, resultIndex;
			resultList = this.resultList;
			for(var i = 0, length = resultList.length; i < length; i ++) {
				if(resultElem[0] === resultList[i][0]) {
					resultIndex = i;
					resultElem.fadeOut(1000, function() {
						resultElem.remove();
					})
				}
			}

			if(resultIndex !== undefined) {
				resultList.splice(resultIndex, 1);
			}
		},

		clearAllResults: function() {
			var resultList;

			resultList = this.resultList;
			for(var i = 0, length = resultList.length; i < length; i ++) {
				resultList[i].remove();
			}

			resultList = [];
		},

		subscribeEvents: function() {
			EventCenter.bind("ResultHandler::deleteResult", this.deleteResult, this);
			EventCenter.bind("ResultHandler::clearAllResults", this.clearAllResults, this);
			EventCenter.bind("ResultHandler::foldAllResults", this.foldAllResults, this);
			EventCenter.bind("ResultHandler::unfoldAllResults", this.unfoldAllResults, this);
		},

		init: function() {
			this.subscribeEvents();
		}
	};

	ResultHandler.init();

	return exports = ResultHandler;
});
;;define('resultViewer.js', ['lib/jsonParser.js', 'lib/xmlParser.js', 'common/eventCenter.js'], function(require, exports, module){
	'use strict';

	var JsonParser = require('lib/jsonParser.js'),
		XMLParser = require('lib/xmlParser.js'),
		EventCenter = require('common/eventCenter.js'),
		_resultContainer = $(parent.document.body).find("#resultContainer"),
		_resultTemplate = _.template($(parent.document.body).find("#result-template").html());

	var htmlEncode = function(str) {
		var div = document.createElement("div");
		
		div.appendChild(document.createTextNode(str));

		return div.innerHTML;
	};

	var xmlParser = new XMLParser(),
		jsonParser = new JsonParser({QuoteKeys: true});

	var _toggleResultContainer = function(e) {
		var elem, banner, content;
			
		banner = $(e.target).parent();
		elem = banner.parent();
		content = elem.find(".result");
		content.toggleClass("hide");	
	};

	var _foldAllResults = function(e) {
		EventCenter.trigger("ResultHandler::foldAllResults");
	};

	var _unfoldAllResults = function(e) {
		EventCenter.trigger("ResultHandler::unfoldAllResults");
	};

	var _deleteResult = function(e) {
        var elem;

		elem = $(e.target).parent().parent();
		EventCenter.trigger("ResultHandler::deleteResult", elem);
	};

	var _clearAllResults = function(e) {
		EventCenter.trigger("ResultHandler::clearAllResults");
	};

	var _bannerHover = function(e) {
		var elem;
        
        elem = $(e.target);
		elem.addClass("banner_hover");
	};

	var _bannerUnhover = function(e) {
		var elem;
        
        elem = $(e.target);
		elem.removeClass("banner_hover");
	};	

	var _bannerActive = function(e) {
		var elem;
        
        elem = $(e.target);
		elem.addClass("banner_active");
	};

	var _bannerUnActive = function(e) {
		var elem;
        
        elem = $(e.target);
		elem.removeClass("banner_active");
	};

    var _getImageSizeIfExist = function(result, callback) {
        var image;

        if(!result.media || result.media.type !== "image") {
            callback(-1, -1);
            return false;
        }

        image = new Image();
        image.src = result.media.url;
        if(image.complete) {
            callback(image.width, image.height, result.media.url);
        } else {
            image.onload = function() {
                callback(image.width, image.height, result.media.url);
            };
        }
    };

    var _scaleImageSizeIfExist = function(resultElem, width, height, url) {
        var image, rate, body;
        
        if(width <= 0 || height <= 0) {
            return resultElem;
        }

        body = resultElem.find(".body").find("code");
        
        if(width >= 700) {
            rate = width / height;
            width = 500;
            height = width / rate;
        }

        image = $('<img src="' + url + '" width="' + width + '" height="' + height + '" />');
        body.html(image);
        return resultElem;
        
    };

    function HTMLDecode(text) 
    {    
        var temp = document.createElement("div"); 
        temp.innerHTML = text; 
        var output = temp.innerText || temp.textContent; 
        temp = null; 
        return output; 
    } 

	var ResultViewer = {
		bindEvents: function() {
			
			$(document).on("click", ".bannerDiv .banner", _toggleResultContainer);	
			
			$(document).on("click", ".bannerDiv .closeButton", _deleteResult);
			
			$(document).on("mouseenter", ".bannerDiv a", _bannerHover);
			
			$(document).on("mouseleave", ".bannerDiv a", _bannerUnhover);
			
			$(document).on("mousedown", ".bannerDiv a", _bannerActive);
			
			$(document).on("mouseup", ".bannerDiv a", _bannerUnActive);
		},

		showResult: function(result, resultType) {
			var body, typeName, formName, resultElem, tempDiv, resultStr;

			
			if (!result) {
				alert('检查失败，请检查参数是否正确');
			}
			

			typeName = $(document.body).find("#typeSelector").find("option:selected").text();
			formName = $(document.body).find("#formSelector").find("option:selected").text();
			
			if(!result.media) {
				if(resultType === "json") {
					body = jsonParser.process(result.body);
				} else {
                    
					result.body = decodeURIComponent(result.body.replace(/\+/g, '%20'));
					body = "<xmp>" + xmlParser.parse(result.body) + "</xmp>";
				}
			} else {
                    body =  "<div style='margin-top:20px;'>" + 
                                "<img src='https://mp.weixin.qq.com/mpres/htmledition/images/icon/common/icon16_loading_light.gif' />" +
                                "<span>图片加载中...</span>" +
                            "</div>"
            }

            
            if (result.decrypt_xml) {
            	result.decrypt_xml = decodeURIComponent(result.decrypt_xml.replace(/\+/g, " ")); 
            	result.decrypt_xml = $('<div/>').text(result.decrypt_xml).html(); 
            }

			resultStr = _resultTemplate({
				request_url: decodeURIComponent(result.request_url),
				status_line: result.status_line,
				headers: result.header,
				body: body, 
				hint: result.hint,
				formName: formName,
				typeName: typeName,
				
				reason: result.reason,
				decrypt_xml: result.decrypt_xml,
				encrypt_type: result.encrypt_type ? '1' : '0' 
			});
			
            tempDiv = $("<div></div>");
            tempDiv.html(resultStr);
            resultElem = tempDiv.children(":eq(0)");

            _getImageSizeIfExist(result, function(width, height, url) {
                resultElem = _scaleImageSizeIfExist(resultElem, width, height, url);
            });

            _resultContainer.prepend(resultElem);
			return resultElem; 
		},

		foldResult: function(elem) {
			var resultContent;

			resultContent = elem.find(".result");
			if(resultContent) {
				resultContent.addClass("hide");
			}
		},

		unfoldResult: function(elem) {
			var resultContent;

			resultContent = elem.find(".result");
			if(resultContent) {
				resultContent.removeClass("hide");
			}
		},

		subscribeEvents: function() {
			EventCenter.bind("ResultViewer::showResult", this.showResult, this, "showResult");
			EventCenter.bind("ResultViewer::unfoldResult", this.unfoldResult, this);
			EventCenter.bind("ResultViewer::foldResult", this.foldResult, this);
		},

		init: function() {
			this.bindEvents();
			this.subscribeEvents();
		}
	};

	ResultViewer.init();
 
	return exports = ResultViewer;
});
;
;define('app.js', ['resultViewer.js', 'resultHandler.js', 'common/eventCenter.js', 'packages/formFactory/formFactory.js', 'packages/formFactory/formRegister.js', 'packages/formFactory/apiinfoFormFactory.js', 'packages/formFactory/rawinfoFormFactory.js', 'packages/formFactory/callbackinfoFormFactory.js'], function(require, exports, module){
	'use strict';

	var ResultViewer = require('resultViewer.js'),
		ResultHandler = require('resultHandler.js'),
		EventCenter = require('common/eventCenter.js'),
		FormFactory = require('packages/formFactory/formFactory.js'),
		FormRegister = require('packages/formFactory/formRegister.js'),
		ApiinfoFormFactory = require('packages/formFactory/apiinfoFormFactory.js'),
		RawinfoFormFactory = require('packages/formFactory/rawinfoFormFactory.js'),
        CallbackinfoFormFactory = require('packages/formFactory/callbackinfoFormFactory.js');

	
	window.ResultHandler = ResultHandler;

	var escapeChars = ["_", "-"];
	var getClassName = function(name) {
		var strArray, name;

		name = name.toLowerCase();
		for(var i = 0, length = escapeChars.length; i < length; i ++) {
			name = name.replace(escapeChars[i], "");
		}

		return name.substring(0, 1).toUpperCase() + name.substring(1) + "FormFactory";
	};

	var app = {
		forms: [],

		currentForm: null,

		configs: null,

		init: function(configs) {
			var config, classConstructor, formType, className;
			
			this.configs = configs;
			for(var i = 0, length = configs.length; i < length; i ++) {
                config = configs[i];
                formType = config.show_name;
                className = getClassName(config.class_name);
                classConstructor = FormRegister.getClass(className);
                if(classConstructor) {
                    this.forms[i] = new classConstructor(formType, config.content);
                }
			}

			$.cache.sync = {};
			this.subscribeEvents();
			EventCenter.trigger("Viewer::setTypeSelector", configs);
            this.selectTypeAndFormByUrlParams(configs);
		},

        selectTypeAndFormByUrlParams: function(configs) {
            var url, parser, params, paramsArray, paramArray, config, 
                name, value, typeName, formName, typeIndex, formIndex,
                content;
            
            parser = document.createElement('a');
            url = window.location.href;
            parser.href = url;

            params = decodeURIComponent(parser.search);
            params = params.slice(1);
            paramsArray = params.split("&");
            for(var i = 0, length = paramsArray.length; i < length; i ++) {
                paramArray = paramsArray[i].split("=");
                name = paramArray[0];
                value = paramArray[1];
                if(name === "form") {
                    formName = value;
                }
                if(name === "type") {
                    typeName = value;
                }
            }

            for(var i = 0, length = configs.length; i < length; i ++) {
                config = configs[i];
                if(typeName === config.show_name) {
                    typeIndex = i;
                    content = config.content;
                    for(var j = 0, l = content.length; j < l; j ++) {
                        if(formName === content[j].show_name) {
                            formIndex = j;
                            break;
                        }
                    }
                    break;
                }
            }

            if(typeIndex !== undefined && formIndex !== undefined) {
                this.selectType(typeIndex);
                EventCenter.trigger("Viewer::changeTypeSelector", typeIndex);
                EventCenter.trigger("Viewer::changeFormSelector", formIndex);
                EventCenter.trigger("FormFactory::selectForm", formIndex);
            } else {
                this.selectType(0);
                EventCenter.trigger("FormFactory::selectForm", 0);
            }

            this.hackFormBySelectTypeAndForm(); 
        },

		selectType: function(typeName) {
			if(this.currentForm) {
				this.currentForm.off();
			}

			this.currentForm = this.forms[typeName];
			this.currentForm.on();
			EventCenter.trigger("Viewer::setFormSelector", this.configs[typeName].content);

            
            this.hackFormBySelectTypeAndForm();
        },

        
        selectForm: function(typeName) {
            this.hackFormBySelectTypeAndForm();
        },

		subscribeEvents: function() {
			EventCenter.bind("App::selectType", this.selectType, this);
            EventCenter.bind("App::selectForm", this.selectForm, this);
		},

        
        
        hackFormBySelectTypeAndForm: function() {
            var selectType = $('#typeSelector').val(),
                selectForm = $('#formSelector').val();
            

            if (selectType == '5') { 
                var triggerEncryptType = function(){
                    var $form = $('#formContainer form'),
                        $encryptType = $form.find('.js_div_EncryptType'),
                        $appId = $form.find('.js_div_appId'),
                        $token = $form.find('.js_div_token'),
                        $encodingAESKey = $form.find('.js_div_encodingAESKey');
                    var value = $encryptType.find('input[type="radio"]:checked').val();
                    if (value != '0') {
                        $appId.show().find('input').attr('required', 'true');
                        $token.show().find('input').attr('required', 'true');
                        $encodingAESKey.show().find('input').attr('required', 'true');
                    } else {
                        $appId.hide().find('input').removeAttr('required');
                        $token.hide().find('input').removeAttr('required');
                        $encodingAESKey.hide().find('input').removeAttr('required');
                    }
                };

                
                setTimeout(function(){
                    var $form = $('#formContainer form');
                    if ($form.find('.js_div_EncryptType').length > 0) {
                        var $input = $form.find('.js_div_EncryptType').find('input[type=radio]');
                        
                            $input.on('change', triggerEncryptType);
                        
                        return;
                    }

                    var $encryptType = $('<div class="inputDiv js_div_EncryptType"><span class="name">加密调试 : </span><input type="radio" name="encrypt_type" data-type="num" data-skipxml="1" value="0">明文模式 <input type="radio" name="encrypt_type" data-type="num" data-skipxml="1" value="1">兼容模式 <input type="radio" name="encrypt_type" data-type="num" data-skipxml="1" value="2">安全模式<br><br></div>');
                    var $appId = $('<div class="inputDiv js_div_appId"><span class="red">*</span><span class="name">Appid : </span><input type="text" name="appid" data-type="string" data-skipxml="1" required="true"><span class="errMsg"></span><br></div>');
                    var $token = $('<div class="inputDiv js_div_token"><span class="red">*</span><span class="name">Token : </span><input type="text" name="token" data-type="string" data-skipxml="1" required="true"><span class="errMsg"></span><br></div>');
                    var $encodingAESKey = $('<div class="inputDiv js_div_encodingAESKey"><span class="red">*</span><span class="name">EncodingAESKey : </span><input type="text" name="encodingaeskey" data-type="encodingaeskey" data-skipxml="1" required="true"><span class="tips">43位字符，字符范围为A-Z，a-z，0-9</span><span class="errMsg"></span><br></div>');

                    $encryptType.find('input[type=radio]').on('change', triggerEncryptType);

                    $form.find('.inputDiv').last().after($encryptType);
                    $form.find('.inputDiv').last().after($appId);
                    $form.find('.inputDiv').last().after($token);
                    $form.find('.inputDiv').last().after($encodingAESKey);

                    $encryptType.find('input[type="radio"][value="0"]').trigger('click');
                }, 10);
            }
        }
	};

	return exports = app;
});
;