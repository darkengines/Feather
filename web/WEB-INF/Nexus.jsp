<%@ include file="header.jsp" %>
<div class="Container">
    <div class="Left">

        <div class="Content Contrast ">
            <div class="Table">
                <ul>
                    <li><a href="#friends" class="Contacts">Friends</a></li>
                    <li><a href="#requests" class="Requests">Requests</a></li>
		    <li><a href="#search" class="Search">Search</a></li>
                </ul>
                <div id="friends">
                    <div class="Friends Hiddable">

                    </div>
                </div>
		<div id="requests">
		    <div class="FriendRequests">

		    </div>
                </div>
		<div id="search" class="Form Search Hiddable">
		    <form>
			<div class="Field">
			    <label for="search_input">Search</label>
			    <input class="SearchInput" style="width:266px;" type="text" id="search_input" name="search"/>
			</div>
		    </form>
		    <div class="SearchOutput">

		    </div>
		</div>
            </div>
        </div>
	<div class="Content Contrast ">
	    <div class="Table">
		<ul>
		    <li><a href="#channels" class="Contacts">Channels</a></li>
		    <li><a href="#channel_invitations" class="Requests">Invitations</a></li>
		    <li><a href="#channel_creation" class="Requests">Create channel</a></li>
		</ul>
		<div id="channels">
		    <div class="Channel">
			<h3>Channel name 0</h3>
			<ul class="Participants Hiddable">
			    <li class="Participant">
				Caca
			    </li>
			    <li class="Participant">
				Pipi
			    </li>
			    <li class="Participant">
				Zizi
			    </li>
			</ul>
		    </div>
		    <div class="Channel">
			<h3>Channel name 1</h3>
			<ul class="Participants Hiddable">
			    <li class="Participant">
				Caca
			    </li>
			    <li class="Participant">
				Pipi
			    </li>
			    <li class="Participant">
				Zizi
			    </li>
			</ul>
		    </div>
		</div>
		<div id="channel_invitations">

		</div>
		<div id="channel_creation" class="Form Channel Hiddable">
		    <form class="Channel">
			<div class="Field">
			    <label for="channel_name">Channel name</label>
			    <input class="ChannelInput" style="width:266px;" type="text" id="channel_name" name="channel"/>
			    <input type="submit" value="Create channel" />
			</div>
		    </form>
		</div>
	    </div>
	</div>
    </div>
    <div class="Right">
	<div class="Content Contrast Main">
	    <div class="Welcome">

	    </div>
	    <div class="Chat">
		<h3>Talk</h3>
		<div class="Header">
		    <div class="LocalMedias"></div>
		    <div class="RemoteMedias"></div>
		</div>
		<div class="Contrast Output">
		    <div class="TextContent"></div>
		    <div class="Notification">
			<table>
			    <tr>
				<td align="left" class="CallNotification"></td>
				<td align="right" class="MessageNotification"></td>
			    </tr>
			</table>
		    </div>
		</div>
		<div class="Options">
		    <a href="#" class="Camera"><img src="image/camera.png"/></a>
		</div>
		<div class="Contrast Input" contenteditable="true">
		</div>
	    </div>
	</div>
    </div>
</div>
<%@ include file="footer.jsp" %>