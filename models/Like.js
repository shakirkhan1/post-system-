var  mongoose   = require("mongoose");


var likeSchema =new mongoose.Schema({
    post_id:{
	            type: mongoose.Schema.Types.ObjectId,
	            ref  : "Post" // reference will be the model name
	        },
    bywhom :String,
    totalcount:{
    	type    : Number,
    	default : 0
    }
});

module.exports = mongoose.model("Like",likeSchema);