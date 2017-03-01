var fs = require('fs');
var path = require('path');

var folders = fs.readdirSync(".").filter((file) => {
	return fs.statSync(path.join(".", file)).isDirectory();
});

folders.forEach((folder) => {
	console.log("Processing:", folder);
	
	var data = new Array(101);

    for (var index = 0; index <= 100; index++) {
		var fileName = "dyn000" + ("000" + index).substring(-3) + ".txt";
		
		// read the text file into an array
		try {
		data[index] = fs.readFileSync(path.join(folder, fileName));
		} catch (err) {
			console.log(err);
		}
	}
	
	
	var csvString = Array(101).map((d, i) => "time" + i).join(",") + "\n";
	var maxState = 1000;
	
	for (var state = 1; state < maxState; state++) {
		var stateString = "";
		for (var file = 0; file <= 100; file++) {
			stateString += data[file][state];
			
			if (file < 100) { stateString += ","; }
		}
		csvString += stateString;
		
		if (state < maxState - 1) { csvString += "\n"; }
	}

	// Write merged csv files
	try {
		// fData
		fs.writeFile(path.join(folder, "dyn100.csv"), csvString, (err) => {
			if (err) throw err;

			console.log("merged csv file saved.")
		});
	} catch (err) {
		console.log(err);
	}
});

