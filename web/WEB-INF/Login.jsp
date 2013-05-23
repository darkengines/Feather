<%@ include file="header.jsp" %>
<div class="Card">
    <div class="Content">
	<div class="Login Contrast Form" style="width: 512px;">
	    <form action="http://127.0.0.1:8080/nexus/login" method="post">
		<h3>Login</h3>
		<div class="Field">
		    <label for="join_email">Email</label>
		    <input style="width: 260px;" id="join_email" type="text" name="email" value="<%= request.getParameter("email") != null ? request.getParameter("email") : ""  %>" />
			<div class="Result"></div>
		</div>
		<div class="Field">
		    <label for="join_password">Password</label>
		    <input style="width: 260px;" id="join_password" type="password" name="password" value="<%= request.getParameter("password") != null ? request.getParameter("password") : "" %>" />
		    <div class="Result"></div>
		</div>
		<div class="Field">
		    <input style="width:266px;" type="submit" value="Join" />
		</div>
	    </form>
	</div>
    </div>
</div>
<%@ include file="footer.jsp" %>