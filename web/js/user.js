(function(){
   User = function(params) {
       user = {
	   //Properties
	   id: params.id,
	   email: params.email,
	   displayName: params.displayName,
	   online: params.online,
	   isFriend: params.isFriend,
	   chatMessages: new Array(),
	   pendingChatMessages: new Array()
       };
       return user;
   }
})();

