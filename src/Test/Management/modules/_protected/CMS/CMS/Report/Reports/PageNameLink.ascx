<%@ Control Language="C#" AutoEventWireup="false" CodeBehind="PageNameLink.ascx.cs"
    Inherits="EPiServer.UI.Report.Reports.PageNameLink" %>
<% if (String.IsNullOrEmpty(PageEditUrl)) {%>
<span> 
    <%# Server.HtmlEncode(PageData.PageName) %>
</span>       
<% } else { %>
    <a href="<%# PageEditUrl %>" target="EPiServerMainUI" title="<%#ToolTip%>">
        <%# Server.HtmlEncode(PageData.PageName) %>
    </a>
<% } %>