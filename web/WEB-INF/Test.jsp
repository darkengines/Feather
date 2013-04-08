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
		    <div class="Contrast Users">
			<div style="position: relative">
			    <label for="txtFilterUser">Filter</label>
			    <input type="text" id="txtFilterUser"/>
			</div>
			<ul id="listFriends">

			</ul>
		    </div>
		</div>
		<div class="Content Right">
		    <div id="chatOutput" class="Contrast Output">
			Prout !
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
		    <div class="Box Search">
			<div class="Field">
			    <label for="txtSearch">Search</label>
			    <input type="text" id="txtSearch"/>
			    <div id="btnSearch" class="Button">Search</div>
			</div>
		    </div>
		    <div class="Contrast Search Users">
			<ul>
			    <li class="User">
				Arnaud Davoise
			    </li>
			    <li class="User">
				Florent Tollin
			    </li>
			</ul>
		    </div>
		    <div class="Contrast Requested Users">
			<ul>
			    <li class="User">
				Arnaud Davoise
			    </li>
			    <li class="User">
				Florent Tollin
			    </li>
			</ul>
		    </div>
		</div>
	    </div>
	    <div id="Requests" class="Table">
		<div class="Content Middle">
		    <div class="Contrast Requests Users">
			<ul>
			    <li class="User">
				Arnaud Davoise
			    </li>
			    <li class="User">
				Florent Tollin
			    </li>
			</ul>
		    </div>
		</div>
	    </div>
	</div>
    </body>
</html>