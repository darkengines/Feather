<%@ include file="header.jsp" %>
<div class="Card">
    <div class="Content Presentation">
	<p>
	    <b>
		Welcome to Feather</b>, you can use this service to come in videoconference with your friends or with strangers. This service is completely free, but requires a browser incorporating the latest web functionalities.
	</p>
	<p>
	    This service still experimental and might change through time.
	</p>
	<div class="Featurings">
	    <div class="Featuring">
		<a href="http://www.google.com/chrome"><img src="image/chrome.png"/></a>
		<a href="http://sites.google.com/site/webrtc/"><img src="image/webrtc.png"/></a>
		<a href="http://www.w3schools.com"><img src="image/html5.png"/></a>
	    </div>
	</div>
    </div>
    <div class="Content">
	<form action="login" method="post">
	    <div class="Inline Login Contrast Form">
		<div class="Field">
		    <label for="login_email">Email</label>
		    <input style="width: 264px;" id="login_email" autocomplete="off" type="text" name="email" />
		</div>

		<div class="Field">
		    <label for="login_password">Password</label>
		    <input style="width: 186px;" id="login_password" type="password" name="password" />
		    <input type="submit" value="Login"/>
		</div>
	    </div>
	</form>
	<div class="Inline Join Contrast Form">
	    <form action="join" method="post">
		<h3>New on Feather ? <span style="color: #999;">create an account</span></h3>
		<div class="Field">
		    <label for="join_email">Email</label>
		    <input style="width: 264px;" id="join_email" autocomplete="off" type="text" name="email" />
		</div>
		<div class="Field">
		    <label for="join_password">Password</label>
		    <input style="width: 264px;" id="join_password" type="password" name="password" />
		</div>
		<div class="Field">
		    <label for="join_display_name">Display name</label>
		    <input style="width: 264px;" id="join_display_name" autocomplete="off" type="text" name="display_name" />
		</div>
		<div class="Field" style="text-align: right">
		    <input type="submit" value="Join" />
		</div>
	    </form>
	</div>
    </div>
</div>
<%@ include file="footer.jsp" %>