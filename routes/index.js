var 	express   = require("express"),
		router    = express.Router(),
		passport  = require("passport"),
	    bcrypt    = require("bcryptjs"),
		User      = require("../models/User"),
		Post      = require('../models/Post'),
		Like      = require('../models/Like');

const {ensureAuthenticated } = require('../config/auth');
	var postlike ;

router.get("/",  (req, res) =>{
    res.render("login");
});

router.get("/login",  (req, res) =>{
   res.render("login");
});

router.get("/logout",(req, res)=>{
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/login');
});
router.get("/signup",  (req, res) =>{
   res.render("signup");
    
});

 router.get("/home", ensureAuthenticated, (req, res) =>{
 	
 	Post.find({},(err, posts)=>{
 		if(err)
 		{
 			console.log(err);
 		}
 		else{ 
                
          function fun(posts){
				function async(post, callback) {
								 	var	nw = {
							 					_id    : post._id,
							 					title  : post.title,
							 					author :{
							 						id      : post.author.id,
							 						username: post.author.username
							 					},
							 					postbody : post.postbody,
							 					created  : post.created,
							 					likes    : 0
				 							};
					
				   Like.find({$and: [{"post_id":post._id},{"totalcount": { $gt : 0} }] },(err, info)=>{
								 	if(err)
								 	{
								 		 console.log(err);
								 	}
								 	else{
								 		 nw.likes = info.length;
								 	}
								 });	
				  setTimeout(function() { callback(nw); }, 100);
				}
				function final() { 
					//console.log(results); 
					res.render("home",{ name: req.user.username, posts: results});
				}
				// A simple async series:
				var items = posts;
				var results = [];
				var nw;
				//console.log(items);
				function series(item) {
				  if(item) {
				    async( item, function(result) {
				      results.push(result);
				      return series(items.shift());
				    });
				  } else {
				    return final();
				  }
				}
				 series(items.shift());

				}  
                   
 	  fun(posts); 
 	 }
   });
});



// =========================================================

// ===> ALL POST REQUESTs ==================================
router.post("/login", (req, res, next) =>{
    	
		passport.authenticate('local', {
			successRedirect : '/home',
			failureRedirect : '/login',
			failureFlash    : true
		})(req, res, next);

});

router.post("/signup", (req, res) => {
	const {fullname, username, emailid, password, cpassword } = req.body; // object de-structuring
	let errors= [] ;

	// check required fields
	if(!fullname || !username || !emailid || !password || !cpassword)
	{
		errors.push({msg: 'please fill in all fields'});
	}
	// check passwords match
    if( password !== cpassword)
    {
    	errors.push({msg:'passwords do not match'});
    }
    //check pass length
    if(password.length < 6)
    {
    	errors.push({msg:'passwords should be atleast 6 characters'});
    }
    // any issue
    if(errors.length >0 )
    {
    	res.render("signup",{
	    		errors,
	    		fullname,
	    		username,
	    		password,
	    		cpassword,
	    		emailid
    	});
    }
    else
    {
    	User.findOne({emailid: emailid},(err, info)=>{
    		if(info) // user exits
    			{
    				errors.push({msg: "email is already registered"});
    				res.render("signup",{
    					                errors,
							    		fullname,
							    		username,
							    		password,
							    		cpassword,
							    		emailid
							    	});
    			}
    			else{ // create new user
		    		   const newuser =new  User({
						    	fullname : req.body.fullname ,
						    	username : req.body.username ,
						    	emailid  : req.body.emailid,
						    	password : req.body.password
    	                     });

		    		   // hashing password using bcrypt
		    		   bcrypt.genSalt(10, (err, salt)=>
		    		          bcrypt.hash(newuser.password, salt, (err, hash) => {
		    		       	      if(err) throw err;
		    		       	      // save hash password
		    		       	      newuser.password = hash;
		    		       	      // save new user to database
		    		       	      User.create(newuser, (err, newuser)=>{
							         if(err)
							          {
							        	console.log(err);
							            res.render("signup");
							          }
							         else{
							        	// console.log(newuser);
							        	 req.flash('success_msg','You are now registered and can now login');
							             res.redirect("/login");
							             }
	   					         });	
		    		       }));	
    			      }
    	 });
	 }
    });

module.exports = router;