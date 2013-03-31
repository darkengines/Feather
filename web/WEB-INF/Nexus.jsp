<%@ include file="header.jsp" %>
<div class="Container">
    <div class="Left">

        <div class="Content Contrast ">
            <div class="Table">
                <ul>
                    <li><a href="#friends" class="Contacts">Friends</a></li>
                    <li><a href="#requests" class="Requests">Requests</a></li>
                </ul>
                <div id="friends">
                    <div class="Friends Hiddable">

                    </div>
                </div>
		<div id="requests">
		    <div class="FriendRequests">

		    </div>
                </div>
            </div>
        </div>
	<div class="Content Form Contrast Channel">
            <h3>Channels</h3>
            <div class="Channel Hiddable">
                <form class="Channel">
                    <div class="Field">
                        <label for="channel">Channel name</label>
                        <input class="ChannelInput" style="width:266px;" type="text" id="channel" name="channel"/>
			<input type="submit" value="Create channel" />
                    </div>
                </form>
                <div class="SearchOutput">

                </div>
            </div>
        </div>
        <div class="Content Form Contrast Search">
            <h3>Search friends</h3>
            <div class="Search Hiddable">
                <form>
                    <div class="Field">
                        <label for="search">Search</label>
                        <input class="SearchInput" style="width:266px;" type="text" id="search" name="search"/>
                    </div>
                </form>
                <div class="SearchOutput">

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