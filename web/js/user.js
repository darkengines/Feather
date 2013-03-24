(function(){
   User = function(params) {
       user = {
	   //Properties
	   id: params.id,
	   email: params.email,
	   displayName: params.displayName,
	   online: params.online
       };
       return user;
   }
})();

