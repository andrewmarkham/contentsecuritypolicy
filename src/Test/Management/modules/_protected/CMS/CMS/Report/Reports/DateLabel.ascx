<%@ Control Language="C#" AutoEventWireup="true" CodeBehind="DateLabel.ascx.cs" Inherits="EPiServer.UI.Report.Reports.DateLabel" %>
<asp:Label ID="DateDisplay" Text='<%# FormatDateTime(Value, "d") %>' ToolTip='<%# FormatDateTime(Value, "g") %>' runat="server"/>
