<%@ Page Language="c#" Codebehind="default.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.DefaultPage" %>
<%@ Register TagPrefix="sc" Assembly="EPiServer.Shell" Namespace="EPiServer.Shell.Web.UI.WebControls" %>

<asp:Content runat="server" ContentPlaceHolderID="FullRegion">
    <sc:PlatformNavigationMenu runat="server" Area="CMS" ID="NavigationMenu" />
    <EPiServerUI:DynamicTable runat="server" NumberOfColumns="3" CellPadding="0" CellSpacing="0" ID="DynamicTable2" KeyName="EPAdminFramework">
        <EPiServerUI:DynamicRow runat="server" ID="DynamicRow4">
            <EPiServerUI:DynamicCell runat="server" Width="270px" ID="Dynamiccell1">
                <EPiServerUI:DynamicTable runat="server" NumberOfColumns="1" CellPadding="0" CellSpacing="0" ID="Dynamictable1">
                    <EPiServerUI:DynamicRow runat="server" ID="Dynamicrow2" NAME="Dynamicrow2">
                        <EPiServerUI:DynamicCell runat="server" Height="100%" ID="Dynamiccell3">
                            <EPiServerUI:SystemIFrame runat="server" id="AdminMenu" SourceFile="menu.aspx" Name="AdminMenu" IsScrollingEnabled="False" />
                        </EPiServerUI:DynamicCell>
                    </EPiServerUI:DynamicRow>
                    <EPiServerUI:DynamicRow style="height:23px;" runat="server" ID="Dynamicrow5">
                        <EPiServerUI:DynamicCell runat="server" ID="Dynamiccell4" CssClass="epifadedbackground" style="height:23px">
                            <asp:Panel runat="server" CssClass="epicontentarea" ID="Panel1">
                                <EPiServerUI:LicenseInfo runat="server" ID="Licenseinfo1" />
                            </asp:Panel>
                        </EPiServerUI:DynamicCell>
                    </EPiServerUI:DynamicRow>
                </EPiServerUI:DynamicTable>
            </EPiServerUI:DynamicCell>
            <EPiServerUI:DynamicResizeCell Width="10" CssClass="EPEdit-CustomDrag" KeyName="ResizeCell1">
            </EPiServerUI:DynamicResizeCell>
            <EPiServerUI:DynamicCell runat="server" Height="100%" Floating="True" ID="Dynamiccell6">
                <EPiServerUI:SystemIFrame runat="server" id="InfoFrame" SourceFile="siteinfo.aspx" Name="ep_main" />
            </EPiServerUI:DynamicCell>
        </EPiServerUI:DynamicRow>
    </EPiServerUI:DynamicTable>
</asp:Content>
