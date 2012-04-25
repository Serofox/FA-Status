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

function setTitle(str) {
	DEBUG(str);
	$('head>title').text(str);
}

function getNotificationsMarkup(dom) {
	return $(dom).find('p').first();
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

	if (hasNotifs) {
		setTitle('(' + datums.values().join(', ') + ') ' + $(document).data('originalTitle'));
	} else {
		setTitle($(document).data('originalTitle'));
	}

	getNotificationsMarkup(document).html(getNotificationsMarkup(dom).html());
}

function updateStatusOnLoad() {
	DEBUG('StatusOnLoad...');

	$(document).data('originalTitle', $('head>title').text());

	parsePage(document);

	setTimeout(updateStatusAsync, REFRESH_PERIOD);
}

function updateStatusAsync() {
	DEBUG('StatusAsync');

	$.ajax({
		url: 'http://www.furaffinity.net/controls/',
		success: function (dom) { parsePage(dom); }
	}).fail(function () { DEBUG('Ajax request failed'); });

	setTimeout(updateStatusAsync, REFRESH_PERIOD);
}

$(function() { updateStatusOnLoad(); });