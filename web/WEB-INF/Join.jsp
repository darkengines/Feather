<%@ include file="header.jsp" %>
<div class="Card">
    <div class="Content">
	<div class="Join Contrast Form" style="width: 512px;">
	    <form action="http://www.darkengines.net:8080/nexus/join" method="post">
		<h3>New on Feather ? <span style="color: #999;">create an account</span></h3>
		<div class="Field">
		    <label for="join_email">Email</label>
		    <input style="width: 260px;" id="join_email" autocomplete="off" type="text" name="email" value="<%= request.getParameter("email") != null ? request.getParameter("email") : ""  %>" />
			<div class="Result"></div>
		</div>
		<div class="Field">
		    <label for="join_password">Password</label>
		    <input style="width: 260px;" id="join_password" type="password" name="password" value="<%= request.getParameter("password") != null ? request.getParameter("password") : "" %>" />
		    <div class="Result"></div>
		</div>
		<div class="Field">
		    <label for="join_display_name">Display name</label>
		    <input style="width: 260px;" id="join_display_name" autocomplete="off" type="text" name="display_name" value ="<%= request.getParameter("display_name") != null ? request.getParameter("display_name") : "" %>"/>
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