// Configure the package

Jobs.configure = function (data) {
	Object.keys(data).forEach(function (key) {
		Jobs.private.configuration[key] = data[key];
	});
}

// Register jobs

Jobs.register = function (jobs) {
	Object.keys(jobs).forEach(function (job) {
		if (typeof jobs[job] === "function") {
			Jobs.private.registry[job] = jobs[job];	
		} else {
			console.log("Jobs: Error registering " + job);
			console.log("Jobs: Please make sure its a valid function");
			console.log("----");
		}
	});
}

// Add a new job to MongoDB

Jobs.add = function (job) {
	// 1. Check that we have the right input
		if (typeof job === "object") {
			if (typeof job.name !== "string") {
				console.log("Jobs: must specify name")
			}
		} else {
			console.log("Jobs: Invalid input");
			console.log(job)
			console.log("----");
			return;
		}

	// 2. Check that the job being added exists
		if (!Jobs.private.registry[job.name]) {
			console.log("Jobs: Invalid job name: " + job.name);
		}

	// 3. Ensure there is a valid date to work with
	var date = function () {
		if (job.on) {
			return new Date()
		} else if (job.in) {
			return new Date()
		} else {
			return new Date();
		}
	}();

	if (date) {
		var result = Jobs.private.collection.insert({
			due: date,
			name: job.name,
			state: "pending",
			parameters: job.parameters
		});

		return result;
	} else {
		console.log("Invalid date specified");
	}
}

// Cancel a job without removing it from MongoDB

Jobs.cancel = function (id) {
	job = Jobs.private.collection.findOne(id)

	if (job) {
		if (job.state === "pending" || job.state === "failed") {
			result = Jobs.private.collection.update(id, {
				state: "cancelled"
			})

			return result;
		} else {
			console.log("Jobs: Cancel failed for " + id);
			console.log("Jobs: Job has completed successful or is already cancelled.");
			console.log("----");
			return false;
		}
	} else {
		console.log("Jobs: Cancel failed for " + id);
		console.log("Jobs: No such job found.");
		console.log("----");
		return false;
	}
}

// Start or stop the queue
// Could be handy for debugging or with meteor-shell

Jobs.start = function () {
	JobsRunner.start();
}

Jobs.stop = function () {
	JobsRunner.stop();
}

// Get info on a job/jobs

Jobs.get = function (id) {
	return Jobs.private.collection.findOne(id)
}

// Run a job ahead of time

Jobs.run = function (doc, callback) {
	if (typeof doc === "object") {
		Jobs.private.run(doc, callback)
	} else if (typeof doc === "string") {
		jobDoc = Jobs.private.collection.findOne(doc);

		if (jobDoc) {
			Jobs.private.run(jobDoc, callback)
		}
	} else {
		console.log("Jobs: Invalid input for Jobs.run();")
		console.log(doc)
		console.log('----')
	}
}

Jobs.collection = Jobs.private.collection