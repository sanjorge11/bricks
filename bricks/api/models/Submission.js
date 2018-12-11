/**
 * Subbmission
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs		:: http://sailsjs.org/#!documentation/models
 */

module.exports = {

	attributes: {
		user: {
			type: 'string',
			notEmpty: true,
			required: true
		},
		problem: {
			type: 'string',
			notEmpty: true,
			required: true
		},
		code: {
			type: 'string',
			notEmpty: true,
			required: true
		},
		style: { // TODO - fill out constraints
			type: 'json'
		},
		value: {
			type: 'json', //correct(functionality points) and style(style points)
			required: true
		},
		message: {
			type: 'string'
		},
		fbRequested: {
			type: 'boolean'
		},
		fbRequestTime: {
			type: 'datetime'
		},
		fbRequestMsg: {
			type: 'string'
		},
		fbResponder: {
			type: 'string'
		},
		fbResponseTime: {
			type: 'datetime'
		},
		fbResponseMsg: {
			type: 'string'
		},
		fbCode: {
			type: 'string'
		},
		feedbackSeen: { //where null implies no feedback given
			type:'boolean'
		},
		shareOK: {
			type: 'boolean'
		},
		shared: {
			type: 'boolean'
		}

	},

	beforeCreate: function (values, cb) {
		//values.message = false;
		Problem.findOne(values.problem).exec(function (err, p) {
			if (err) {
				console.log("There was an error loading the associated problem");
				return cb();
			}
			if(p.language != "javascript"){
				values.value = {correct: 0, style: 0};
				values.message = "Your submission has been recieved and your score will updated pending manual grading.";
				cb(null, values);
			}else {
				var onSubmit = new Function("batch", "code", "style", "solution", "fail", "pass", p.onSubmit);
				try {
					var updatePoints = function () {
						if(p.phase == 0){
							score.f = parseFloat(score.f)/2;
							score.s = parseFloat(score.s)/2;
						}
						score.f = parseFloat(parseFloat(score.f).toFixed(4));
						score.s = parseFloat(parseFloat(score.s).toFixed(4));
						values.value = {
							correct: score.f,  
							style:   score.s
						};
						cb(null, values);
					//	done.updated = true;
					};
					var score = {
						f: p.value.correct,  //begin with full points which users can lose
						s: p.value.style
					};
					var updated = null;
					onSubmit(
						require("../../batch/batch"),	// "batch" - the batch module
						values.code,					// "code" - the student's code
						values.style,					// "style" - the style analysis of the student's code
						p.solution,						// "solution" - the values stored in the solution in the problem
						{ 								// "fail" - the code behind fail.f() and fail.s()
							f: function (msg,pts) {
								//deduct all points if no percentage given
								var deduction = p.value.correct;
								if(pts){
									deduction = deduction * pts;
								}

								//subtract function points
								score.f = score.f - deduction;
								score.f = +score.f;
								if(score.f < 0){
									score.f = 0;
								}

								//append function message if given 
								if(msg != ""){
									if(!values.message){
										values.message = "Functional Error: " + msg;
									}else {
										values.message = values.message + "\n" + "Functional Error: " + msg;
									}
								}
							},
							s: function (msg,pts) {
								//deduct all points if no percentage given
								var deduction = p.value.style;
								if(pts){
									deduction = deduction * pts;
								}

								//subtract style points
								score.s = score.s - deduction;
								score.s = +score.s;
								if(score.s < 0){
									score.s = 0;
								}
								//append style message if given
								if(msg != ""){
									if(!values.message){
										values.message = "Style Error: " + msg;
									}else {
										values.message = values.message + "\n" + "Style Error: " + msg;
									}
								}
							},
						},
						{ 								// "pass" - the code behind pass.f() and pass.s()
							f: function (msg) {
								if(msg != "" && p.value.correct == score.f){
									if(!values.message){
										values.message = msg;
									}else {
										values.message = values.message + "\n" + msg;
									}
								}
								if(updated){
									updatePoints();
								}else {
									updated = true;
								}
							},
							s: function (msg) {
								if(msg != "" && p.value.style == score.s){
									if(!values.message){
										values.message = msg;
									}else {
										values.message = values.message + "\n" + msg;
									}
								}
								if(updated){
									updatePoints();
								}else {
									updated = true;
								}
							},
						}
					);
				} catch (e) {
					console.log("Running onSubmit failed: " + e);
					cb(e);
				}
			}
		});
	}

};
