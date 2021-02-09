<%@ Page Language="c#" Codebehind="AdminCommand.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.AdminCommand"  Title="AdminCommand" %>
<asp:Content ContentPlaceHolderID="FullRegion" runat="server">
    <EPiServerUI:BodySettings CssClass="epiemptybackground" runat="server"/>
    
    <EPiServerUI:ToolButtonContainer runat="server">
        <EPiServerUI:ToolButton ID="EditCommandTool" runat="server" OnClick="EditCommandTool_Click" SkinID="EditMode" ToolTip="<%$ Resources: EPiServer, dope.editmode %>" /><EPiServerUI:ToolButton ID="ViewCommandTool" runat="server" OnClick="ViewCommandTool_Click" SkinID="ViewMode" ToolTip="<%$ Resources: EPiServer, dope.viewmode %>" />
        <span class="epitoolbutton"><EPiServerUI:HelpButton ToolTip="/button/help" runat="server" ID="CommandTool7" /></span>
    </EPiServerUI:ToolButtonContainer>
</asp:Content>