/*
    This file is part of xdRequest.

    Foobar is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    Foobar is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with Foobar.  If not, see <http://www.gnu.org/licenses/>.
*/

RegExp.escape = function(str)
{
  var specials = new RegExp("[.*+?|()\\[\\]{}\\\\\\/]", "g"); // .*+?|()[]{}\/
  return str.replace(specials, "\\$&");
}

var globalResponse;

// Got this from http://www.sitepoint.com/blogs/2009/08/19/javascript-json-serialization/
// implement JSON.stringify serialization
if(typeof JSON == "undefined") {
	JSON = {};
}

JSON.stringify = JSON.stringify || function (obj) {
	var t = typeof (obj);
	if (t != "object" || obj === null) {

		// simple data type
		if (t == "string") obj = '"'+obj+'"';
		return String(obj);
	}
	else {
		// recurse array or object
		var n, v, json = [], arr = (obj && obj.constructor == Array);
		for (n in obj) {
			v = obj[n]; t = typeof(v);
			if (t == "string") v = '"'+v+'"';
			else if (t == "object" && v !== null) v = JSON.stringify(v);
			json.push((arr ? "" : '"' + n + '":') + String(v));
		}
		return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
	}
};

// implement JSON.parse de-serialization
JSON.parse = JSON.parse || function (str) {
	if (str === "") str = '""';
	eval("var p=" + str + ";");
	return p;
};

// Define the global array to track callbacks for the JASONP calls
xdRequest_callback_array = new Array();
function xdRequest(inputURL) {
	// Local "constants"
	var remote_table_definition = "http://xdrequest.googlecode.com/svn/trunk/xdRequest.xml";
	var baseYQLURL = "https://query.yahooapis.com/v1/public/yql?format=json&debug=true&q=";
	var baseYQLStatement = "USE '" + remote_table_definition + "' AS remote;";
	
	// public properties
	this.post_body;
	this.post_hidden_fields = true;

	// Private properties
	var self = this;
	var properties = {"headers" : []};
	var cookiejar = new Array();
	var url = false;
	var html;
	
	// URL setting method
	this.setURL = function(inputURL) {
		// Validate the URL pattern
		if(inputURL.match(/^https?:\/\/([\w]*\.)*[\w]{2,}$/) || inputURL.match(/^https?:\/\/([\w]*\.)*[\w]{2,}\/.*$/)) {
			url = inputURL;
		}
		else {
			throw "Invalid URL specified.";
		}
		return self;
	}
	
	// Return the URL
	this.getURL = function() {
		return url;
	}
	
	// Header addition
	this.header = function(name, value) {
		properties.headers.push(new Array(name, value));
		return self;
	}
	
	// Return current headers
	this.headers = function() {
		return properties.headers;
	}

	// Get method
	this.get = function(param1, param2) {
		// This method takes up to two parameters
		// If a single parameter is specified, it needs to be a callback function
		// If two parameters are specified, the first needs to be a URL and the second a callback function
		// If we have no parameters, we have a problem.  We at least need a callback function
		if(!param1) {
			throw "get method requires at least a callback function";
		}
		
		// If we only have one parameter, it better be a function
		if(!param2) {
			if(!typeof param1 == "function") {
				throw "If get is called with a single parameter, it must be a callback function.";
			}
			callback = param1;
		}
		else {
			// We have two parameters.  Check to make sure the second is a function
			if(!typeof param2 == "function") {
				throw "Second parameter in get method must be a callback function.";
			}
			
			// Set the url to the first parameter
			try {
				this.setURL(param1);
			}
			catch(err) {
				throw "Malformed URL was specified in get method.";
			}
			callback = param2;
		}
		
		// Make sure we were passed in a function
		if(!typeof callback == "function") {
			throw "Callback needs to be a function.";
		}

		// Set everything up to make the YQL call
		properties.method = "GET";
		
		// Add the cookies to the headers
		var cookies = this.cookies();
		if(cookies) {
			var cookieString = "";
			for(var cookie in cookies) {
				if(cookie != "index") {
					if(cookies[cookie].match(url, this.secure())) {
						cookieString += cookies[cookie].name + "=" + cookies[cookie].value + "; ";
					}
				}
			}
			cookieString = cookieString.replace(/; $/, "");
			this.header("Cookie", cookieString);
		}
		var yqlStatement = baseYQLStatement + "SELECT * FROM remote WHERE url='" + url + "' AND parameters='" + JSON.stringify(properties) + "'";
		var yqlURL = baseYQLURL + encodeURIComponent(yqlStatement).replace(/%255C'/g, "%5C'") + "&callback=" + encodeURIComponent(newCallback(callback, url));
		
		// Append the JSONP script
		var script = document.createElement("script");
		script.id = url;
		script.src = yqlURL;
		document.body.appendChild(script);
		
		// Clear out properties for the next call
		properties = {"headers" : []};
		return self;
	}
	
	this.post = function(param1, param2) {
		// This method takes up to two parameters
		// If a single parameter is specified, it needs to be a callback function
		// If two parameters are specified, the first needs to be a URL and the second a callback function
		// The post_body property must be set in order for this function to work
		// If we have no parameters, we have a problem.  We at least need a callback function
		if(!param1) {
			throw "get method requires at least a callback function";
		}
		
		// If we only have one parameter, it better be a function
		if(!param2) {
			if(!typeof param1 == "function") {
				throw "If get is called with a single parameter, it must be a callback function.";
			}
			callback = param1;
		}
		else {
			// We have two parameters.  Check to make sure the second is a function
			if(!typeof param2 == "function") {
				throw "Second parameter in get method must be a callback function.";
			}
			
			// Set the url to the first parameter
			try {
				this.setURL(param1);
			}
			catch(err) {
				throw "Malformed URL was specified in get method.";
			}
			callback = param2;
		}
		
		// Make sure we were passed in a function
		if(!typeof callback == "function") {
			throw "Callback needs to be a function.";
		}
		// Make sure we have a post body
		if(!self.post_body) {
			throw "Postbody required for post method";
		}

		// Set everything up to make the YQL call
		properties.method = "POST";
		properties.postbody = self.post_body;

		// Check to see if we should post hidden fields
		if(self.post_hidden_fields) {
			var hidden_fields = self.getHiddenFields();
			var field;
			// Append the hidden fields to the post body, if we found any
			if(hidden_fields) {
				for(field in hidden_fields) {
					properties.postbody += "&" + hidden_fields[field].name + "=" + hidden_fields[field].value;
				}
			}
		}
		
		// Build the cookie header
		var cookies = this.cookies();
		if(cookies) {
			var cookieString = "";
			for(var cookie in cookies) {
				if(cookie != "index") {
					if(cookies[cookie].match(url, this.secure())) {
						cookieString += cookies[cookie].name + "=" + cookies[cookie].value + "; ";
					}
				}
			}
			cookieString = cookieString.replace(/; $/, "");
			this.header("Cookie", cookieString);
		}
		var yqlStatement = baseYQLStatement + "SELECT * FROM remote WHERE url='" + url + "' AND parameters='" + JSON.stringify(properties) + "'";
		var yqlURL = baseYQLURL + encodeURIComponent(yqlStatement).replace(/%255C'/g, "%5C'") + "&callback=" + encodeURIComponent(newCallback(callback, url));
		
		// Append the JSONP script
		var script = document.createElement("script");
		script.id = url;
		script.src = yqlURL;
		document.body.appendChild(script);

		// Clear out properties for the next call
		properties = {"headers" : []};
		return self;
	}
	
	// Private method for setting up a new callback function
	function newCallback(callback, scriptID) {
		// Add the callback to the callback array
		xdRequest_callback_array.push(
			function (response) {
				globalResponse = response;
				if(response.query.results) {
					// If we got an error back in the results, output it
					if (response.query.results.error) {
						callback(response.query.results.error);
					}
					// If the HTML is undefined, we got a bad URL
					else if(response.query.results.result.html.match(/org.mozilla.javascript.Undefined/)) {
						var error = {"error" : "Invalid URL was specified."};
						callback(error);
					}
					else {
						// First, we need to add cookies to the cookie jar
						if(response.query.results.result.response_headers["set-cookie"]) {
							addCookies(response.query.results.result.response_headers["set-cookie"]);
						}
						
						// Next, we need to check for a redirect
						// If we get a redirect, we need to perform a new get to the URL
						if(response.query.results.result.status.match(/^3[\d]{2}/)) {
							for(var header in response.query.results.result.response_headers) {
								if(header != "index") {
									if(header == "location") {
										var redirect = response.query.results.result.response_headers[header];
										break;
									}
								}
							}
							self.get(redirect, callback);
						}
						else if(response.query.results.result != 200) {
							// If we got something other than a 200, append it to the results
							newresult = response.query.results.result;
							//newresult.error = response.query.diagnostics.url[1]["http-status-message"];
							
							// Set the HTML
							self.html = response.query.results.result.html;
							callback(response.query.results.result);
						}
						else {
							// Set the HTML
							self.html = response.query.results.result.html;
							callback(response.query.results.result);
						}
					}
				}
				else {
					// There was no query,  there must have been an error.  Send back the error instead
					if(response.error) {
						if(response.error.description.match(/mismatched character/)) {
							error = {"error" : "Invalid parameters transmitted.  Please ensure that single quotes are properly escaped."}
						}
						else {
							error = {"error" : response.error.description}
						}
						callback(error);
					}
					else {
						var error = {"error" : "Unknown error."};
						callback(error);
					}
				}

				// Remove the script from the document
				var script = document.getElementById(scriptID);
				try {
					script.parentNode.removeChild(script);
				}
				catch(err) {
					// Just ignore any problems removing the script, because it's already gone
				}
			}
		);
		// Return a string with the name of the callback from the array
		return "xdRequest_callback_array[" + (xdRequest_callback_array.length-1).toString() + "]";
	}
	
	this.addCookie = function(newCookieString) {
		var newCookie;
		var cookieIndex;
		newCookie = new xdRequest_cookie(newCookieString);
		if(!newCookie.domain) {
			newCookie.domain = this.domain();
		}
		
		// Update the expiration if we find it by name and value
		if(cookieIndex = getCookie(newCookie.name, newCookie.value, true)) {
			cookiejar[cookieIndex].expiration = newCookie.expiration;
		}
		// Otherwise, add it to the cookiejar
		else {
			cookiejar.push(newCookie);
		}
		return self;
	}
	
	// Method to add cookies
	function addCookies(newCookieArray) {
		// If we were passed in a string, just convert it to an array with a single value
		if (typeof newCookieArray == "string") {
			newCookieArray = [newCookieArray];
		}
		// Add all the cookies
		for(var newCookie in newCookieArray) {
			if(newCookie != "index") {
				self.addCookie(newCookieArray[newCookie]);
			}
		}
		
		// Delete any expired cookies
		for(var index in cookiejar) {
			if(index != "index") {
				if (cookiejar[index].isExpired()) {
					deleteCookie(index);
				}
			}
		}
	}
	
	// Public method to return the cookiejar, based on the current URL
	this.cookies = function() {
		var outputCookies = new Array();
		for(cookie in cookiejar) {
			if(cookiejar[cookie].match(url, this.secure())) {
				outputCookies.push(cookiejar[cookie]);
			}
		}
		if(outputCookies.length > 0) {
			return outputCookies;
		}
		else {
			return false;
		}
	}
	
	// Is the current URL secure or not?
	this.secure = function() {
		if(url.match(/^https/)) {
			return true;
		}
		else {
			return false;
		}
	}
	
	// Get the domain
	this.domain = function() {
		if(!url) {
			return false;
		}
		if (url.match(/^https?:\/\/([^\/]*).*/)) {
			return url.match(/^https?:\/\/([^\/]*).*/)[1];
		}
		return false;
	}
	
	// Method to get a cookie by name and value
	function getCookie(name, value, returnIndex) {
		for(var index in cookiejar) {
			if(index != "index") {
				if(name == cookiejar[index].name && value == cookiejar[index].value) {
					// Return the index, if that's what we wanted
					if(returnIndex) {
						return index;
					}
					// Otherwise, return the cookie itself
					else {
						return cookiejar[index];
					}
				}
			}
		}
		// We didnt' find the cookie
		return false;
	}
	
	// Method to delete a cookie
	function deleteCookie(cookie) {
		// Delete by index
		if(typeof cookie == "number") {
			return cookiejar.splice(cookie,1);
		}
		// Delete by cookie
		else if(typeof cookie == "xdRequest_cookie") {
			return cookiejar.splice(getCookie(cookie.name, cookie.value, true), 1);
		}
		else {
			return false;
		}
	}
	
	// Get hidden form values from the html
	this.getHiddenFields = function() {
		if(!this.html) {
			return false;
		}
		
		var inputs;
		if(inputs = this.html.match(/<\s*input[^>]*>/ig)) {
			// Check to see if we have any hidden inputs
			var hidden;
			var newInput;
			if(hidden = inputs.join("").match(/<\s*input(?:(?:(?!type\s*=\s*['"]hidden['"])[^>])*)type\s*=\s*['"]hidden['"][^>]*>/ig)) {
				for(var x in hidden) {
					if(x != "index") {
						newInput = {};
						if(hidden[x].match(/.*name\s*=\s*['"]([^'"]*)['"].*/)) {
							newInput.name = hidden[x].match(/.*name\s*=\s*['"]([^'"]*)['"].*/)[1];
						}
						if(hidden[x].match(/.*value\s*=\s*['"]([^'"]*)['"].*/)) {
							newInput.value = hidden[x].match(/.*value\s*=\s*['"]([^'"]*)['"].*/)[1];
						}
						hidden[x] = newInput;
					}
				}
				return hidden;
			}
			else {
				return false;
			}
		}
		// If we have no form, return false
		else {
			return false;
		}
		
	}
	
	this.getInputs = function() {
		if(!this.html) {
			return false;
		}
		
		var inputs;
		var newInput;
		if(inputs = this.html.match(/<\s*input[^>]*>/ig)) {
			for(var x in inputs) {
				if(x != "index") {
					newInput = {};
					if(inputs[x].match(/.*name\s*=\s*['"]([^'"]*)['"].*/)) {
						newInput.name = inputs[x].match(/.*name\s*=\s*['"]([^'"]*)['"].*/)[1];
					}
					if(inputs[x].match(/.*value\s*=\s*['"]([^'"]*)['"].*/)) {
						newInput.value = inputs[x].match(/.*value\s*=\s*['"]([^'"]*)['"].*/)[1]
					}
					inputs[x] = newInput;
				}
			}
			return inputs;
		}
		// If we have no form, return false
		else {
			return false;
		}
		
	}
	
	this.getInput = function(name) {
		var inputs = this.getInputs();
		if (inputs) {
			for(var input in inputs) {
				if(input != "index") {
					if (inputs[input].name == name) {
						return inputs[input].value;
					}
				}
			}
		}
		return false;
	}

	// Set the input URL if it was specified on the creation of the object
	if(inputURL) {
		this.setURL(inputURL);
	}	
}

function xdRequest_cookie(cookieString) {
	// Public properties
	this.name;
	this.value;
	this.domain;
	this.path;
	this.expiration;
	this.secure = false;

	this.isExpired = function() {
		if (this.expiration == "session") {
			return false;
		}
		
		if(Date.parse(Date()) > this.expiration) {
			return true;
		}
		else {
			return false;
		}
	}
	
	// Check to see if a cookie matches the input parameters
	this.match = function(url, compareSecure) {
		// First of all, if this cookie is expired, return false
		if(this.isExpired()) {
			return false;
		}
		
		// Check the domain
		var compareDomain = url.match(/^https?:\/\/([^\/]*).*/);
		if (!compareDomain) {
			throw "Invalid URL specified on cookie match.";
		}
		compareDomain = compareDomain[1];
		if (!compareDomain.match(RegExp.escape(this.domain))) {
			return false;
		}
		
		// Check the path
		if(!url.match(/^https?:\/\/[^\/]*\/.*/)) {
			var comparePath = "/";
		}
		else {
			var comparePath = url.match(/^https?:\/\/[^\/]*(\/.*)/)[1];
		}
		if (!comparePath.match(RegExp.escape("^" + this.path))) {
			return false;
		}
		
		// If we're on an insecure site, we're good to go
		if(url.match(/^http:/) && this.secure) {
			return false;
		}
		return true;
	}
	
	// Constructor
	if(cookieString) {
		var propertyName;
		var propertyValue;
		var self = this;
		
		this.name = cookieString.split(/;\s*/)[0].match(/^([^=]*)=/)[1];
		this.value = cookieString.split(/;\s*/)[0].match(/^[^=]*=(.*)$/)[1];
		var properties = cookieString.split(/;\s*/);
		for(var property in properties) {
			if(property != "index") {
				// Check to see if the property name has a "=" in it
				// If it does, then it is a property with a value
				if(properties[property].match(/^([^=]*)=/)) {
					propertyName = properties[property].match(/^([^=]*)=/)[1];
					propertyValue = properties[property].match(/^[^=]*=(.*)$/)[1];
					switch(propertyName) {
						case "domain":
						case "Domain":
							this.domain = propertyValue.replace(/"|'/g, "");
							break;
						
						case "path":
						case "Path":
							this.path = propertyValue.replace(/"|'/g, "");
							break;
						
						case "expires":
						case "Expires":
							this.expiration = Date.parse(propertyValue.replace(/"|'/g, ""));
							break;
						
						default:
							break;				
					}
				}
			}
			// If it doesn't have a value, then it is a flag-type of property
			else {
				switch(properties[property]) {
					case "secure":
						this.secure = true;
						break;
						
					default:
						break;
				}
			}
		}
		
		if (!this.expiration) {
			this.expiration = "session";
		}
		return self;
	}
}
