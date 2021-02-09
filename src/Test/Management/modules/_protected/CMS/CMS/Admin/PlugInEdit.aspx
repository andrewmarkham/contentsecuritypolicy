<%@ Page Language="c#" Codebehind="PlugInEdit.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.PlugInEdit"  Title="PlugInEdit" %>

<%@ Register TagPrefix="Admin" TagName="PlugInList" Src="PlugInList.ascx" %>
<%@ Register TagPrefix="Admin" TagName="PlugInAdminSettings" Src="PlugInAdminSettings.ascx" %>
<asp:Content ID="Content1" ContentPlaceHolderID="MainRegion" runat="server">
    &nbsp;
    <EPiServerUI:TabStrip runat="server" id="actionTab" GeneratesPostBack="False" targetid="tabView">
			<EPiServerUI:Tab Text="#configurationtab" runat="server" ID="Tab2" />
			<EPiServerUI:Tab Text="#overviewtab" runat="server" ID="Tab1" />
    </EPiServerUI:TabStrip>
    
    <asp:Panel ID="tabView" runat="Server">
        <asp:Panel ID="view2" runat="server">
            <Admin:PlugInAdminSettings runat="server" ID="pluginSettings" />
        </asp:Panel>
        
        <asp:Panel ID="view1" runat="server">
            <Admin:PlugInList runat="server" ID="pluginList" ShowGroup="False" />
        </asp:Panel>
    </asp:Panel>
    
    <div class="epi-buttonContainer">
        <EPiServerUI:ToolButton DisablePageLeaveCheck="true" id="SaveButton" onclick="Save" runat="server" text="<%$ Resources: EPiServer, button.save %>" tooltip="<%$ Resources: EPiServer, button.save %>" SkinID="Save" /><EPiServerUI:ToolButton id="CancelButton" onclick="Cancel" runat="server" text="<%$ Resources: EPiServer, button.cancel %>" tooltip="<%$ Resources: EPiServer, button.cancel %>" SkinID="Cancel" />
    </div>
</asp:Content>
