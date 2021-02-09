<%@ Page Language="c#" Codebehind="PlugIn.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.PlugIn"  Title="PlugIn" %>

<%@ Register TagPrefix="Admin" TagName="PlugInList" Src="PlugInList.ascx" %>
<%@ Register TagPrefix="Admin" TagName="PlugInGroupList" Src="PlugInGroupList.ascx" %>
<asp:Content ID="Content1" ContentPlaceHolderID="MainRegion" runat="server">
    <EPiServerUI:TabStrip sticky="True" runat="server" id="actionTab" GeneratesPostBack="False" targetid="tabView">
		<EPiServerUI:Tab Text="#plugintab" runat="server" ID="Tab1" />
		<EPiServerUI:Tab Text="#overviewtab" runat="server" ID="Tab2" />
    </EPiServerUI:TabStrip>
    <asp:Panel ID="tabView" runat="Server" CssClass="epi-paddingHorizontal">
        <asp:Panel ID="view1" runat="server">
            <Admin:PlugInGroupList runat="server" ID="groupList" />
        </asp:Panel>
        <asp:Panel ID="view2" runat="server">
            <Admin:PlugInList Editable="False" runat="server" ID="pluginList" />
        </asp:Panel>
    </asp:Panel>
</asp:Content>
