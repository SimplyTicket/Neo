self.onmessage = function (e) {
	if (e.data !== undefined) {
		// Do work
		var total = e.data + " World";
		// Posting back to the page
		self.postMessage(total);
	}
};