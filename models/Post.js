var  mongoose   = require("mongoose");


var postSchema =new mongoose.Schema({
	title: String,
    postbody:String,
    author:{
	        id:{
	            type: mongoose.Schema.Types.ObjectId,
	            ref  : "User" // reference will be the model name
	        },
	        username:String
    },
    created: { type:Date, default: Date.now}
});

module.exports = mongoose.model("Post",postSchema);