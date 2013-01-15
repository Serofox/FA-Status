chrome.extension.onRequest.addListener(function (request, sender, respond) {
	switch (request.fun) {
		case 'title_save':
			console.log("Saved new title: " + request.title);
		    localStorage['lastTitle'] = request.title;
		    localStorage['lastNotifMarkup'] = request.notifMarkup;
		    localStorage['lastFetchTime'] = Date.now();
		    break;
		case 'title_get':
			console.log("Giving out title: " + localStorage['lastTitle']);
			respond({
				'title': localStorage['lastTitle'],
				'notifMarkup': localStorage['notifMarkup'],
				'time': localStorage['lastFetchTime']
			});
			break;
		default:
			console.log('Received unknown message function: ' + request.fun);
	}
});