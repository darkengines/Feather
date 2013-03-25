<%@ include file="header.jsp" %>
<div class="Container">
	    <div class="Left">

		<div class="Content Contrast ">
		    <h3>Friends</h3>
		    <div class="Friends Hiddable">
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
		<div class="Content Contrast Chat">
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
<%@ include file="footer.jsp" %>