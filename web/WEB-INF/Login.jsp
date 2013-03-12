<%@ include file="header.jsp" %>
<div class="Card">
    <div class="Content">
	<form action="login" method="post">
	    <div class="Login Contrast Form">
		<div class="Field">
		    <label for="login_email">Email</label>
		    <input style="width: 260px;" id="login_email" autocomplete="off" type="text" name="email" value="<%= request.getParameter("email").toString() %>" />
		</div>

		<div class="Field">
		    <label for="login_password">Password</label>
		    <input style="width: 186px;" id="login_password" type="password" name="password" value="<%= request.getParameter("password").toString() %>" />
		    <input type="submit" value="Login"/>
		</div>
	    </div>
	</form>
    </div>
</div>
<%@ include file="footer.jsp" %>