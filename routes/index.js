/*
 * GET home page.
 */

exports.index = function(req, res){
	var http = require('http');
	var Client = require('node-rest-client').Client;
	var client = new Client();
	var secretkey = "123456789123456789qwertyuiopasdf";
	var crypto = require('crypto');
	var algorithm = "sha256";
	
	client.get("https://api.mongolab.com/api/1/databases/rachit/collections/gumballs?apiKey=V4vRUH6bvqWKuuF-rf-jB4u24SCMCLyA",function(doc, resp){
		//console.log(data);
		
		var hmac  = crypto.createHmac(algorithm,secretkey);
        hmac.setEncoding('hex');
    	//hmac.write();
    	var text = doc[0].modelNumber+doc[0].serialNumber+doc[0].countGumballs+"NoCoinState";
    	hmac.write(text);
    	hmac.end();
    	var hash = hmac.read();
        console.log(doc);
        console.log(hash);
        res.render('index', { id:doc[0]._id,modelNumber : doc[0].modelNumber, serialNumber : doc[0].serialNumber, state:"NoCoinState", count :doc[0].countGumballs,hashmsg: hash});
	});


};

exports.GumballAction=function(req,res){
	
	var event=req.param('event');
	var state=req.param('state');
	var count=req.param('count');
	var hash = req.param('hashmessage');
	var modelNumber=req.param('modelNumber');
	var serialNumber=req.param('serialNumber');
	var secretkey = "123456789123456789qwertyuiopasdf";
	var id = req.param('id');
	var crypto = require('crypto');
	var algorithm = "sha256";
	var Client = require('node-rest-client').Client;
	var client = new Client();
	
	
	if(event==='InsertQuater' && state==='NoCoinState'){
		console.log("Inside insert quarter");
		var text =modelNumber+serialNumber+count+state;
		var hmac  = crypto.createHmac(algorithm,secretkey);
        hmac.setEncoding('hex');
        hmac.write(text);
    	hmac.end();
    	var hashnew = hmac.read();
    	console.log("incoming hash:"+hash);
    	
    	console.log("new hash:"+hashnew);
    	
		if(hashnew==hash)
			{
			state='HasACoin';
			var hmacnew2  = crypto.createHmac(algorithm,secretkey);
	        hmacnew2.setEncoding('hex');
	        var newtext = modelNumber+serialNumber+count+state;
	        hmacnew2.write(newtext);
	    	hmacnew2.end();
	    	var hashnew2 = hmacnew2.read();
			
			res.render('index', { modelNumber : modelNumber, serialNumber : serialNumber, state:state, count : count,hashmsg: hashnew2,id:id});
			}
		else
			{
				res.render('index', { modelNumber : "Information corrupted by user, please restart", serialNumber : "Please restart as information is corrupted", state:"NoCoinState", count : "Please restart as information is corrupted",hashmsg: hash,id:id});
			}
		
	}
	
	
	
	if(event==='TurnTheCrank' && state==='HasACoin'){
		var MongoClient = require('mongodb').MongoClient;
		var messagesToBePutInPost=[];
		console.log("modelNumber"+modelNumber);
		console.log("serialNumber"+serialNumber);
		console.log("count"+count);
		console.log("state"+state);
		var text = modelNumber+serialNumber+count+state;
		var hmac  = crypto.createHmac(algorithm,secretkey);
        hmac.setEncoding('hex');
        hmac.write(text);
    	hmac.end();
    	console.log('id'+id);
    	var hashnew = hmac.read();
    	console.log("incoming hash:"+hash);
    	console.log("new generated hash:"+hashnew);
		if(hashnew==hash && count>0)
			{
				var newCount = count -1;
				
				var myCollection;
				
				
				    var args = {
	            			  data: JSON.stringify( { "$set" : { "countGumballs" : newCount } } ),
	            			  headers:{"Content-Type": "application/json"} 
	            			};
				    
					client.put("https://api.mongolab.com/api/1/databases/rachit/collections/gumballs?apiKey=V4vRUH6bvqWKuuF-rf-jB4u24SCMCLyA", args, function(data, response){
						
				    	    console.log('entry updated');
	            	});
	            	
				    
				    	var newText = modelNumber+serialNumber+newCount+"NoCoinState";
				    	var hmacnew  = crypto.createHmac(algorithm,secretkey);
				    	hmacnew.setEncoding('hex');
				    	hmacnew.write(newText);
				    	hmacnew.end();
				    	var newHash = hmacnew.read();
				    	console.log(newHash);
				    res.render('index', { modelNumber : modelNumber, serialNumber : serialNumber, state:"NoCoinState", count : newCount,hashmsg: newHash,id:id});
			
			}
		else
			{
				if(count == 0)
					{
						res.render('index', { modelNumber : modelNumber, serialNumber : serialNumber, state:"NoCoinState", count : count,hashmsg: hash,id:id});
					}
				else
					{
						res.render('index', { modelNumber : "Restart the application", serialNumber : "Restart The application", state:"NoCoinState", count : "Restart The Application",hashmsg: hash,id:id});
					}
			}
		
	}
	else
		{
		console.log("modelNumber:"+modelNumber);
			if(event==='TurnTheCrank' && state==='NoCoinState'){
				res.render('index', { modelNumber : "ABCDE", serialNumber : "1234998871109", state:"NoCoinState", count : "Information is corrupted so cant display coin value",hashmsg: hash,id:id});
			}
		}

	
};