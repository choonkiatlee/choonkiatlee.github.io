const exposed = {};
if (location.search) {
	var a = document.createElement("a");
	a.href = location.href;
	a.search = "";
	history.replaceState(null, null, a.href);
}

function tweet_(url) {
	open(
		"https://twitter.com/intent/tweet?url=" + encodeURIComponent(url),
		"_blank"
	);
}
function tweet(anchor) {
	tweet_(anchor.getAttribute("href"));
}
expose("tweet", tweet);

function message(msg) {
	var dialog = document.getElementById("message");
	dialog.textContent = msg;
	dialog.setAttribute("open", "");
	setTimeout(function () {
		dialog.removeAttribute("open");
	}, 3000);
}

function prefetch(e) {
	if (e.target.tagName != "A") {
		return;
	}
	if (e.target.origin != location.origin) {
		return;
	}
	var l = document.createElement("link");
	l.rel = "prefetch";
	l.href = e.target.href;
	document.head.appendChild(l);
}
document.documentElement.addEventListener("mouseover", prefetch, {
	capture: true,
	passive: true,
});
document.documentElement.addEventListener("touchstart", prefetch, {
	capture: true,
	passive: true,
});

const GA_ID = document.documentElement.getAttribute("ga-id");
window.ga =
	window.ga ||
	function () {
		if (!GA_ID) {
			return;
		}
		(ga.q = ga.q || []).push(arguments);
	};
ga.l = +new Date();
ga("create", GA_ID, "auto");
ga("set", "transport", "beacon");
var timeout = setTimeout(
	(onload = function () {
		clearTimeout(timeout);
		ga("send", "pageview");
	}),
	1000
);

var ref = +new Date();
function ping(event) {
	var now = +new Date();
	if (now - ref < 1000) {
		return;
	}
	ga("send", {
		hitType: "event",
		eventCategory: "page",
		eventAction: event.type,
		eventLabel: Math.round((now - ref) / 1000),
	});
	ref = now;
}
addEventListener("pagehide", ping);
addEventListener("visibilitychange", ping);
addEventListener(
	"click",
	function (e) {
		var button = e.target.closest("button");
		if (!button) {
			return;
		}
		ga("send", {
			hitType: "event",
			eventCategory: "button",
			eventAction: button.getAttribute("aria-label") || button.textContent,
		});
	},
	true
);
var selectionTimeout;
addEventListener(
	"selectionchange",
	function () {
		clearTimeout(selectionTimeout);
		var text = String(document.getSelection()).trim();
		if (text.split(/[\s\n\r]+/).length < 3) {
			return;
		}
		selectionTimeout = setTimeout(function () {
			ga("send", {
				hitType: "event",
				eventCategory: "selection",
				eventAction: text,
			});
		}, 2000);
	},
	true
);

if (window.ResizeObserver && document.querySelector("header nav #nav")) {
	var progress = document.getElementById("reading-progress");

	var timeOfLastScroll = 0;
	var requestedAniFrame = false;
	function scroll() {
		if (!requestedAniFrame) {
			requestAnimationFrame(updateProgress);
			requestedAniFrame = true;
		}
		timeOfLastScroll = Date.now();
	}
	addEventListener("scroll", scroll);

	var winHeight = 1000;
	var bottom = 10000;
	function updateProgress() {
		requestedAniFrame = false;
		var percent = Math.min(
			(document.scrollingElement.scrollTop / (bottom - winHeight)) * 100,
			100
		);
		progress.style.transform = `translate(-${100 - percent}vw, 0)`;
		if (Date.now() - timeOfLastScroll < 3000) {
			requestAnimationFrame(updateProgress);
			requestedAniFrame = true;
		}
	}

	new ResizeObserver(() => {
		if (document.querySelector("#comments,footer")) {
			bottom =
				document.scrollingElement.scrollTop +
				// document.querySelector("#comments,footer").getBoundingClientRect().top;
				document.querySelector("#comments,footer").getBoundingClientRect().top;
		}
		winHeight = window.innerHeight;
		scroll();
	}).observe(document.body);
}

function expose(name, fn) {
	exposed[name] = fn;
}

addEventListener("click", (e) => {
	const handler = e.target.closest("[on-click]");
	if (!handler) {
		return;
	}
	e.preventDefault();
	const name = handler.getAttribute("on-click");
	const fn = exposed[name];
	if (!fn) {
		throw new Error("Unknown handler" + name);
	}
	fn(handler);
});

// There is a race condition here if an image loads faster than this JS file. But
// - that is unlikely
// - it only means potentially more costly layouts for that image.
// - And so it isn't worth the querySelectorAll it would cost to synchronously check
//   load state.
document.body.addEventListener(
	"load",
	(e) => {
		if (e.target.tagName != "IMG") {
			return;
		}
		// Ensure the browser doesn't try to draw the placeholder when the real image is present.
		e.target.style.backgroundImage = "none";
	},
  /* capture */ "true"
);

// scrolling toc
// -----------------------------------------
if (document.querySelectorAll("h2, h3, h4") != null) {
	function headingTOC() {
		document.querySelectorAll("h2, h3, h4").forEach((heading) => {
			if (document.getElementsByTagName("html")[0].scrollTop >= heading.offsetTop - 100) {
				var id = heading.getAttribute("id"); // id of headings
				if (id != null) {
					var toc = document.getElementsByClassName("toc")[0];
					if (toc != null) {
						toc.querySelectorAll("a").forEach((item) => {
							item.parentElement.classList.remove("toc-active");
						});
						document.querySelector(`.toc li a[href="#${id}"]`).parentElement.classList.add('toc-active');
					}
				}
			}
		});
	}
	addEventListener("scroll", headingTOC);
}

// anchor link fixed navigation from top
// -----------------------------------------
function offsetAnchor() {
	if (location.hash.length !== 0) {
		window.scrollTo({ left: window.scrollX, top: window.scrollY - 60 });
	}
}
// Captures click events of all <a> elements with href starting with #
addEventListener('click', function (e) {
	// Click events are captured before hashchanges. Timeout
	// causes offsetAnchor to be called after the page jump.
	if (e.target.tagName == "A" && e.target.hash.startsWith("#")) {
		window.setTimeout(function () {
			offsetAnchor();
		}, 0);
	}
});
// Set the offset when entering page with hash present in the url
window.setTimeout(offsetAnchor, 0);

// hide/show box
// -----------------------------------------
var triggers = Array.from(document.querySelectorAll('[class="hs__title"]'));
window.addEventListener('click', (ev) => {
	if (ev.target.classList.contains("hs__title")) {
		ev.target.classList.toggle("show");
	}
}, false);


// elasticlunr
// -----------------------------------------
// add .selected to current li
const addSelected2 = (ulRes, li) => {
	// remove class "selected" from all li
	ulRes.querySelectorAll("li").forEach((item) => {
			item.classList.remove("selected");
		});
	// add class "selected" to the current li
	li.classList.add("selected");
}

(function (window, document) {
	"use strict";

	const search = (e) => {
		const results = window.searchIndex.search(e.target.value, {
			bool: "OR",
			expand: true,
		});

		const kw = e.target.value;
		var regEx = new RegExp(kw, "ig");
		var ae;

		const divRes = document.getElementById("nav-search__result-container"); // div (ul's father)
		const ulRes = document.getElementById("nav-search__ul"); // ul
		const noResEl = document.getElementById("nav-search__no-result");

		ulRes.innerHTML = "";
		if (kw != "") {
			divRes.style.display = "block";
			if (results != "") { // if there is result
				noResEl.style.display = "none";
				results.map((r) => {
					var { id, title, keywords, cat } = r.doc; // use keywords instead

					// use content??? (modify .eleventy.js also!)
					// var { id, title, keywords, cat, content } = r.doc;
					// keywords = content;

					const el = document.createElement("li");
					ulRes.appendChild(el);

					const divIcon = document.createElement("div");
					divIcon.setAttribute("class", "item__icon");
					el.appendChild(divIcon);
					const divIcon__img = document.createElement("img");
					divIcon__img.setAttribute("src", cat);
					divIcon.appendChild(divIcon__img);

					const divContent = document.createElement("div");
					divContent.setAttribute("class", "item__content");
					el.appendChild(divContent);

					const h3 = document.createElement("h3");
					divContent.appendChild(h3);
					const a = document.createElement("a");
					a.setAttribute("href", id);
					if (title && kw) {
						if (title.toLowerCase().includes(kw.toLowerCase())) {
							title = title.replace(regEx, function (x) {
								return '<mark>' + x + '</mark>';
							});
						}
					}
					a.innerHTML = title;
					h3.appendChild(a);

					const p = document.createElement("p");

					if (keywords && kw) {
						if (keywords.toLowerCase().includes(kw.toLowerCase())) {
							keywords = keywords.replace(regEx, function (x) {
								return ' <mark>' + x + '</mark>';
							});
						}
						if (keywords.indexOf("<mark>") > 10){
							keywords = "..." + keywords.substring(keywords.indexOf("<mark>") - 10);
						}
						// too long keywords or content
						// -- uncomment below if search on full content
						// if (keywords.length > 500) {
						// 	keywords = "..." + keywords.substring(0, keywords.indexOf("<mark>") + kw.length + 15) + "..."
						// }
					}
					p.innerHTML = keywords;
					divContent.appendChild(p);

					const enter = document.createElement("div");
					enter.setAttribute("class", "enter");
					el.appendChild(enter);
					const enter__img = document.createElement("img");
					enter__img.setAttribute("src", "/img/nav/enter.svg");
					enter.appendChild(enter__img);

				});

				ulRes.firstChild.classList.add("selected");

				// mouse hover trigger for li
				ulRes.querySelectorAll("li").forEach((item) => {
					item.addEventListener("mousemove", () => {
						addSelected2(ulRes, item);
					}, false);

					// if <a> focused by a Tab key
					item
						.getElementsByClassName("item__content")[0]
						.firstChild.firstChild.addEventListener("focus", () => {
							addSelected2(ulRes, item);
						}, false);
				});

			} else {
				noResEl.style.display = "block";
			}
		} else {
			divRes.style.display = "none";
		}

	};

	fetch("/pages/search-index.json").then((response) =>
		response.json().then((rawIndex) => {
			window.searchIndex = elasticlunr.Index.load(rawIndex);
			document.getElementById("nav-search__input").addEventListener("input", search);
		})
	);

	// fullstory stuff
	window['_fs_debug'] = false;
	window['_fs_host'] = 'fullstory.com';
	window['_fs_script'] = 'edge.fullstory.com/s/fs.js';
	window['_fs_org'] = '104F77';
	window['_fs_namespace'] = 'FS';
	(function(m,n,e,t,l,o,g,y){
		if (e in m) {if(m.console && m.console.log) { m.console.log('FullStory namespace conflict. Please set window["_fs_namespace"].');} return;}
		g=m[e]=function(a,b,s){g.q?g.q.push([a,b,s]):g._api(a,b,s);};g.q=[];
		o=n.createElement(t);o.async=1;o.crossOrigin='anonymous';o.src='https://'+_fs_script;
		y=n.getElementsByTagName(t)[0];y.parentNode.insertBefore(o,y);
		g.identify=function(i,v,s){g(l,{uid:i},s);if(v)g(l,v,s)};g.setUserVars=function(v,s){g(l,v,s)};g.event=function(i,v,s){g('event',{n:i,p:v},s)};
		g.anonymize=function(){g.identify(!!0)};
		g.shutdown=function(){g("rec",!1)};g.restart=function(){g("rec",!0)};
		g.log = function(a,b){g("log",[a,b])};
		g.consent=function(a){g("consent",!arguments.length||a)};
		g.identifyAccount=function(i,v){o='account';v=v||{};v.acctId=i;g(o,v)};
		g.clearUserCookie=function(){};
		g.setVars=function(n, p){g('setVars',[n,p]);};
		g._w={};y='XMLHttpRequest';g._w[y]=m[y];y='fetch';g._w[y]=m[y];
		if(m[y])m[y]=function(){return g._w[y].apply(this,arguments)};
		g._v="1.3.0";
	})(window,document,window['_fs_namespace'],'script','user');

})(window, document);