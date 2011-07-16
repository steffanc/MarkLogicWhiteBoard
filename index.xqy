xquery version "1.0-ml";
declare namespace ns = "http://localhost/main";
xdmp:set-response-content-type("text/html; charset=utf-8"),
'<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">',
<html xmlns="http://www.w3.org/1999/xhtml">
    <head>
        <title>Mark Logic Whiteboard</title>
		<link href="/css/ramp.css" rel="stylesheet" type="text/css"/>
        <link href="/css/jquery-ui.css" rel="stylesheet" type="text/css"/>
		<script type="text/javascript" src="javascript/jquery-1.4.2.min.js"></script>
		<script type="text/javascript" src="javascript/jquery-ui.min.js"></script>
		<script type="text/javascript" src="javascript/rampNew.js"></script>
    </head>
    <body>
		<div id="searchBar">
			<form action="search.xqy" method="get">	
				<input type="submit" value="Search"/>
				<input type="text" name="searchWord" size="40"/>
				Comment Names: <input type="checkbox" name="commentNames" value="true" checked="checked"/>
				Comment Text: <input type="checkbox" name="commentText" value="true" checked="checked"/>
				File Names: <input type="checkbox" name="fileNames" value="true" checked="checked"/>
				Text: <input type="checkbox" name="text" value="true" checked="checked"/>
			</form>
		</div>
		<div id="main"></div>
    </body>
</html>
