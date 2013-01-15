var dbg = false;
var REFRESH_PERIOD = 1000 * 30;

Array.prototype.values = function() {
	ret = []
	for (i in this) {
		if (this.hasOwnProperty(i)) {
			ret.push(this[i]);
		}
	}
	return ret;
}

function DEBUG(str) {
	if (dbg) {
		console.log(str);
	}
}

function saveTitle(title, notif_markup) {
  chrome.extension.sendRequest({fun: 'title_save', title: title, notifMarkup: notif_markup});
}

function getLastTitle(callback) {
  chrome.extension.sendRequest({fun: 'title_get'}, function(resp) {
    callback(resp.title, resp.notifMarkup, resp.time);
  });
}

function setTitle(str) {
	DEBUG(str);
	$('head>title').text(str);
}

function setNotificationsMarkup(markup) {
	getNotificationsMarkup(document).html(markup);
}

function getNotificationsMarkup(dom) {
	return $(dom).find('.header_bkg li.noblock').first();
}

function parsePage(dom) {
	datums = new Array();
	hasNotifs = false;
	selectors = ['/msg/submissions', '/msg/others', '/msg/pms', '/msg/troubletickets'];
	for (i in selectors) {
		var val = getNotificationsMarkup(dom).find('a[href^="' + selectors[i] + '"]').first().text();
		if (val != '' && val[0] >= '0' && val[0] <= '9') {
			datums[selectors[i]] = val;
			hasNotifs = true;
		}
	}

	var title;
	if (hasNotifs) {
		title = '(' + datums.values().join(', ') + ') ' + $(document).data('originalTitle');
	} else {
		title = $(document).data('originalTitle');
	}

	notifs_markup = getNotificationsMarkup(dom).html();

	saveTitle(title, notifs_markup);

	setTitle(title);
	setNotificationsMarkup(notifs_markup);
}

function updateStatusOnLoad() {
	DEBUG('StatusOnLoad...');

	$(document).data('originalTitle', $('head>title').text());

	parsePage(document);

	setTimeout(updateStatusAsync, REFRESH_PERIOD);
}

function updateStatusAsync() {
	DEBUG('StatusAsync');

	var last_title_data = getLastTitle(function (title, notifs_markup, update_time) {
		var current_time = Date.now();
		if (current_time - update_time < REFRESH_PERIOD) {
			setTitle(title);
			setNotificationsMarkup(notifs_markup);
		} else {
			doUpdateFetch();
		}

		setTimeout(updateStatusAsync, REFRESH_PERIOD);
	});
}

function doUpdateFetch() {
	DEBUG("Doing full fetch :(")

	$.ajax({
		url: 'http://www.furaffinity.net/controls/',
		success: function (dom) { parsePage(dom); }
	}).fail(function () { DEBUG('Ajax request failed'); });
}

$(function() { updateStatusOnLoad(); });