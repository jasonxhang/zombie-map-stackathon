Papa.parse("http://example.com/big.csv", {
	download: true,
	step: function(row) {
		console.log("Row:", row.data);
	},
	complete: function() {
		console.log("All done!");
	}
});

Papa.parse(fileInput.files[0], {
	complete: function(results) {
		console.log(results);
	}
});
