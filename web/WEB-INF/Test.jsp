<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
    <head>
	<meta charset="utf-8">
	<title>Feather</title>
	<script type="text/javascript" src="js/adapter.js"></script>
	<script type="text/javascript" src="js/jquery.js"></script>
	<script type="text/javascript" src="js/jquery_ui.js"></script>
	<script type="text/javascript" src="js/websocket.js"></script>
	<script type="text/javascript" src="js/user.js"></script>
	<script type="text/javascript" src="js/engine.js"></script>
	<script type="text/javascript" src="js/form.js"></script>
	<script type="text/javascript" src="js/script.js"></script>
	<script type="text/javascript" src="js/jquery_cookie.js"></script>
	<script type="text/javascript" src="js/chat.js"></script>
	<script type="text/javascript" src="js/jslinq.js"></script>
	<link rel="stylesheet" href="css/style.css" type="text/css" />
    </head>
    <body>
	<div class="Container">
	    <div class="Content Middle">
		<div class="Controls">
		    <ul>
			<li data-table="Home" class="Control Selected">
			    Home
			</li>
			<li data-table="Search" class="Control">
			    Search
			</li>
			<li data-table="Requests" class="Control">
			    Friend requests
			</li>
		    </ul>
		</div>
	    </div>
	    <div id="Home" class="Table Selected">
		<div class="Content Left">
		    <div class="Contrast">
			<div class="Field">
			    <label for="txtFilterUser">Filter</label>
			    <input type="text" id="txtFilterUser"/>
			</div>
			<ul id="listFriends" class="Users">

			</ul>
		    </div>
		</div>
		<div class="Content Right">
		    <div class="Contrast Output">
			<div id="chatHeader">
			    <div id="mediaOutput">
				
			    </div>
			    <div id="mediaInput">
				
			    </div>
			</div>
			<div id="chatOutputWrapper">
			    <div id="chatOutput">

			    </div>
			</div>
		    </div>
		    <div class="Buttons">
			<div id="btnCamera" class="Button"><div class="Icon Camera"></div></div>
		    </div>
		    <div class="Contrast Input">
			<div id="txtChat" contenteditable="true" class="Content">
			</div>
			<div id="btnChat" class="Button Send">
			    Send !
			</div>
		    </div>
		</div>
	    </div>
	    <div id="Search" class="Table">
		<div class="Content Middle">
		    <div class="Box Medium">
			<div class="Field">
			    <label for="txtSearch">Search</label>
			    <input type="text" id="txtSearch"/>
			    <div id="btnSearch" class="Button">Search</div>
			</div>
		    </div>
		    <div id="FoundUsers" class="Contrast">
			<h3>Results</h3>
			<ul id="listFoundUsers" class="Users">

			</ul>
		    </div>
		    <div id="RequestedUsers" class="Contrast">
			<h3>Requested users</h3>
			<ul id="listRequestedUsers" class="Users">

			</ul>
		    </div>
		</div>
	    </div>
	    <div id="Requests" class="Table">
		<div class="Content Middle">
		    <div class="Contrast FriendRequests">
			<h3>Friendship requests</h3>
			<ul id="listUserRequests" class="Users">
			</ul>
		    </div>
		</div>
	    </div>
	</div>
    </body>
</html>