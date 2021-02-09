<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="InitialSetup.aspx.cs" Inherits="EPiServer.Util.InitialSetup" %>
<%@ Import Namespace="EPiServer" %>

<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<title>EPiServer CMS</title>
<style type="text/css">
body {
	font-family: Verdana, Arial, sans-serif;
	color: #ffffff;
	font-size: 77%;
	background-color: #e3e1dd;
}
#page {
	width: 40em;
	border: 2px solid #ffffff;
	height: auto;
	margin-left: auto;
	margin-right: auto;
	margin-top: 5em;
}
#top {
	background-color: #58595b;
	height: 6em;
	padding: 5px;
	border-bottom: 2px solid #ffffff;
}
#bottom {
	height: auto;
	padding: 5px;
}
.boldtop {
	font-weight: bold;
	font-size: 4em;
}
</style>
</head>

<body>

<div id="page">
	<div id="top">
		<span style="color: #faa61b; font-size: 1.5em;">Behind Every Great Web Site</span><br />
		<span class="boldtop">EPiServer CMS</span> </div>
	<div id="bottom" style="color: #000000;">
		<div id="info">
			This installation does not have a site configured at this adress, <a href="<%=UriSupport.ResolveUrlFromUIAsRelativeOrAbsolute("admin") %>">go to the administrative interface to configure sites</a>.
		</div>
	</div>
</div>

</body>

</html>
