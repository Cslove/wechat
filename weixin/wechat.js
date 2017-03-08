'use strict'

var Promise=require('bluebird');
var request=Promise.promisify(require('request'));
var util=require('./util.js');
var fs=require('fs');

var prefix='https://api.weixin.qq.com/cgi-bin/';
var api={
	accessToken:prefix+'token?grant_type=client_credential&',
	temporary:{
		uploadUrl:prefix+"media/upload?"
	},
	permanent:{
		uploadUrl:prefix+"material/add_material?"
	},
	tag:{
		create:prefix+'tags/create?',
		get:prefix+'tags/get?',
		update:prefix+"tags/update?",
		del:prefix+'tags/delete?',
		fetchFence:prefix+'user/tag/get?',
		batchTag:prefix+'tags/members/batchtagging?',
		batchUnTag:prefix+"tags/members/batchuntagging?",
		getTagList:prefix+'tags/getidlist?'
	},
	user:{
		getUser:prefix+'user/get?',
		getInfo:prefix+'user/info?'
	},
	mess:{
		sendTag:prefix+'message/mass/sendall?'
	},
	menu:{
		create:prefix+"menu/create?",
		get:prefix+'menu/get?',
		del:prefix+'menu/delete?',
		getinfo:prefix+'get_current_selfmenu_info?'
	},
	ticket:{
		get:prefix+"ticket/getticket?"
	}
};
function Wechat(opts){	
	// var that=this;
	 this.appID=opts.appID;
	 this.appSecret=opts.appSecret;
	 this.getAccessToken=opts.getAccessToken;
	 this.saveAccessToken=opts.saveAccessToken;
	 this.getTicket=opts.getTicket;
	 this.saveTicket=opts.saveTicket;
	 this.fetchAccessToken();
	 

};
Wechat.prototype.fetchAccessToken=function(){
	var that=this;
	return new Promise(function(resolve,reject){

		if(that.access_token&&that.expires_in){
			if(that.isValidAccessToken(that)){
				resolve(that);
			}
		}

		that.getAccessToken().then(function(data){
		 	try{
		 		data=JSON.parse(data)
		 	}catch(e){
		 		return that.updateAccessToken();
		 	}
		 	if(that.isValidAccessToken(data)){
		 		return Promise.resolve(data);
		 	}else{
		 		return that.updateAccessToken();
		 	}
		 }).then(function(data){
		 	that.saveAccessToken(data);
		 	
		 	resolve(data);
		 	
		 })
	})

}
Wechat.prototype.fetchTicket=function(access_token){
	var that=this;
	return new Promise(function(resolve,reject){

		that.getTicket().then(function(data){
		 	try{
		 		data=JSON.parse(data)
		 	}catch(e){
		 		return that.updateTicket(access_token);
		 	}
		 	if(that.isValidTicket(data)){
		 		return Promise.resolve(data);
		 	}else{
		 		return that.updateTicket(access_token);
		 	}
		 }).then(function(data){
		 	that.saveTicket(data);
		 	
		 	resolve(data);
		 	
		 })
	})

}
Wechat.prototype.upLoadMaterial=function(type,filePath,permanent){
	var that=this;
	var form={
		media:fs.createReadStream(filePath)
	};
	
	return new Promise(function(resolve,reject){

		that.fetchAccessToken().then(function(data){
			if(permanent){
				var prefix=api.permanent.uploadUrl;
				if(type==="video"){
					form.access_token=data.access_token;
					form.type=permanent.type;
					form.descripion=permanent.descripion;					 
				}
			}else{
				prefix=api.temporary.uploadUrl;
			
			}
			
			var url=prefix+"access_token="+data.access_token+
			"&type="+type;
			
			request({method:"POST",url:url,formData:form,json:true})
			.then(function(response){
				 var _data=response.body;
				
				console.log(_data)
				resolve(_data);
			})
		})
	});
}
//根据标签群发
Wechat.prototype.sendByTags=function(type,message,tagId){
	var that=this;
	return new Promise(function(resolve,reject){
		that.fetchAccessToken().then(function(data){	
			var msg={
				filter:{},
				msgtype:type
			};
			msg[type]=message;
			if(!tagId){
				msg.filter.is_to_all=true;
			}else{
				msg.filter.is_to_all=false;
				msg.filter.tag_id=tagId;
			}
			var url=api.mess.sendTag+"access_token="+data.access_token
			request({method:"POST",url:url,body:msg,json:true})
			.then(function(response){
				 var _data=response.body;			
				console.log(_data);
				resolve(_data);
			})
		})
	});
}
//创建菜单
Wechat.prototype.createMenu=function(menu){
	var that=this;
	return new Promise(function(resolve,reject){
		that.fetchAccessToken().then(function(data){	
			
			var url=api.menu.create+"access_token="+data.access_token
			request({method:"POST",url:url,body:menu,json:true})
			.then(function(response){
				 var _data=response.body;			
				console.log(_data);
				resolve(_data);
			})
		})
	});
}
//获取菜单
Wechat.prototype.getMenu=function(){
	var that=this;
	return new Promise(function(resolve,reject){
		that.fetchAccessToken().then(function(data){	
			
			var url=api.menu.get+"access_token="+data.access_token
			request({url:url,json:true})
			.then(function(response){
				 var _data=response.body;			
				console.log(_data);
				resolve(_data);
			})
		})
	});
}
//删除菜单
Wechat.prototype.deleteMenu=function(){
	var that=this;
	return new Promise(function(resolve,reject){
		that.fetchAccessToken().then(function(data){	
			
			var url=api.menu.del+"access_token="+data.access_token
			request({url:url,json:true})
			.then(function(response){
				 var _data=response.body;			
				console.log(_data);
				resolve(_data);
			})
		})
	});
}
//获取菜单配置信息
Wechat.prototype.getMenuInfo=function(){
	var that=this;
	return new Promise(function(resolve,reject){
		that.fetchAccessToken().then(function(data){	
			
			var url=api.menu.getinfo+"access_token="+data.access_token
			request({url:url,json:true})
			.then(function(response){
				 var _data=response.body;			
				console.log(_data);
				resolve(_data);
			})
		})
	});
}
// 创建标签
Wechat.prototype.createTags=function(name){
	var that=this;
	return new Promise(function(resolve,reject){
		that.fetchAccessToken().then(function(data){	
			var form={
					tag:{
						name:name
					}
				};
			var url=api.tag.create+"access_token="+data.access_token
			request({method:"POST",url:url,body:form,json:true})
			.then(function(response){
				 var _data=response.body;			
				console.log(_data);
				resolve(_data);
			})
		})
	});
}
//获取已创建标签
Wechat.prototype.fetchTags=function(){
	var that=this;
	return new Promise(function(resolve,reject){
		that.fetchAccessToken().then(function(data){	
			var url=api.tag.get+"access_token="+data.access_token
			request({url:url,json:true})
			.then(function(response){
				 var _data=response.body;
				console.log(_data)
				resolve(_data);
			})
		})
	});
}
//编辑更新标签
Wechat.prototype.updateTags=function(id,name){
	var that=this;
	return new Promise(function(resolve,reject){
		that.fetchAccessToken().then(function(data){	
			var url=api.tag.update+"access_token="+data.access_token;
			var form={
				tag:{
					id:id,
					name:name
				}
			}
			request({method:"POST",url:url,body:form,json:true})
			.then(function(response){
				 var _data=response.body;
				console.log(_data)
				resolve(_data);
			})
		})
	});
}
//删除标签
Wechat.prototype.deleteTags=function(id){
	var that=this;
	return new Promise(function(resolve,reject){
		that.fetchAccessToken().then(function(data){	
			var url=api.tag.del+"access_token="+data.access_token;
			var form={
				tag:{
					id:id
				}
			};
			request({method:"POST",url:url,body:form,json:true})
			.then(function(response){
				 var _data=response.body;
				console.log(_data);
				resolve(_data);
			})
		})
	});
}
//获取标签下粉丝列表
Wechat.prototype.fetchTagsFanceList=function(){
	var that=this;
	return new Promise(function(resolve,reject){
		that.fetchAccessToken().then(function(data){	
			var url=api.tag.fetchFence+"access_token="+data.access_token
			request({url:url,json:true})
			.then(function(response){
				 var _data=response.body;
				console.log(_data)
				resolve(_data);
			})
		})
	});
}
//批量为用户打标签
Wechat.prototype.batchTags=function(arr_id_list,tagId){
	var that=this;
	return new Promise(function(resolve,reject){
		that.fetchAccessToken().then(function(data){	
			var url=api.tag.batchTag+"access_token="+data.access_token;
			var form={
				openid_list:arr_id_list,
				tagid:tagId
			};
			request({method:"POST",url:url,body:form,json:true})
			.then(function(response){
				 var _data=response.body;
				console.log(_data);
				resolve(_data);
			})
		})
	});
}
//批量为用户取消标签
Wechat.prototype.batchUnTags=function(arr_id_list,tagId){
	var that=this;
	return new Promise(function(resolve,reject){
		that.fetchAccessToken().then(function(data){	
			var url=api.tag.batchUnTag+"access_token="+data.access_token;
			var form={
				openid_list:arr_id_list,
				tagid:tagId
			};
			request({method:"POST",url:url,body:form,json:true})
			.then(function(response){
				 var _data=response.body;
				console.log(_data);
				resolve(_data);
			})
		})
	});
}
//获取用户身上的标签列表
Wechat.prototype.fetchUserTagList=function(openId){
	var that=this;
	return new Promise(function(resolve,reject){
		that.fetchAccessToken().then(function(data){	
			var url=api.tag.batchUnTag+"access_token="+data.access_token;
			var form={
				openid:openId
			};
			request({method:"POST",url:url,body:form,json:true})
			.then(function(response){
				 var _data=response.body;
				console.log(_data);
				resolve(_data);
			})
		})
	});
}
//获取用户列表
Wechat.prototype.getUsers=function(openId){
	var that=this;
	return new Promise(function(resolve,reject){
		that.fetchAccessToken().then(function(data){	
			var url=api.user.getUser+"access_token="+data.access_token
			if(openId){
				url+='&next_openid'+openId
			}
			request({url:url,json:true})
			.then(function(response){
				 var _data=response.body;
				console.log(_data)
				resolve(_data);
			})
		})
	});
};
//获取用户信息
Wechat.prototype.getUserInfo=function(openId){
	var that=this;
	return new Promise(function(resolve,reject){
		that.fetchAccessToken().then(function(data){	
			var url=api.user.getUser+"access_token="+data.access_token
				+'&openid'+openId+'&lang=zh_CN';
			
			request({url:url,json:true})
			.then(function(response){
				 var _data=response.body;
				console.log(_data)
				resolve(_data);
			})
		})
	});
};
Wechat.prototype.isValidAccessToken=function(data){
	if(!data||!data.access_token||!data.expires_in){
		return false
	}else{
		var access_token=data.access_token;
		var expires_in=data.expires_in;
		var now=(new Date().getTime());
		if(now<expires_in){
			return true
		}else{
			return false
		}	
	}
};

Wechat.prototype.isValidTicket=function(data){
	if(!data||!data.ticket||!data.expires_in){
		return false
	}else{
		var ticket=data.ticket;
		var expires_in=data.expires_in;
		var now=(new Date().getTime());
		if(ticket&&now<expires_in){
			return true
		}else{
			return false
		}	
	}
};
Wechat.prototype.updateAccessToken=function(){
	var appID=this.appID;
	var appSecret=this.appSecret;
	var url=api.accessToken+'appid='+appID+'&secret='+appSecret;
	return new Promise(function(resolve,reject){

		request({url:url,json:true}).then(function(response){
			 var data=response.body;
			var now=(new Date().getTime());
			var expires_in=now+(data.expires_in-20)*1000;
			data.expires_in=expires_in;
			resolve(data)
		})
	});
	
}
Wechat.prototype.updateTicket=function(access_token){
	var url=api.ticket.get+'access_token='+access_token+"&type=jsapi";
	return new Promise(function(resolve,reject){

		request({url:url,json:true}).then(function(response){
			 var data=response.body;
			var now=(new Date().getTime());
			var expires_in=now+(data.expires_in-20)*1000;
			data.expires_in=expires_in;
			resolve(data)
		})
	});
	
}
Wechat.prototype.reply=function(){
	var content=this.body;
	var message=this.weixin;
	var xml=util.tpl(content,message);
	this.status=200;
	console.log(xml)
	this.type='application/xml';
	this.body=xml;
};


module.exports=Wechat;