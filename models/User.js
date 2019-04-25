var  mongoose  = require("mongoose");

var userSchema = new mongoose.Schema({
       
                fullname:{
                    type:String,
                    required: true
                },
                username:{
                    type:String,
                    required: true
                },
                emailid:{
                    type:String,
                    required: true
                },
                password:{
                    type:String,
                    required: true
                }
});

module.exports = mongoose.model("User", userSchema);