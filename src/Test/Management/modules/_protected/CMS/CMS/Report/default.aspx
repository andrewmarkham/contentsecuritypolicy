<%@ Page Language="C#" AutoEventWireup="false" CodeBehind="default.aspx.cs" Inherits="EPiServer.UI.Report.DefaultPage" %>
<%@ Register TagPrefix="sc" Assembly="EPiServer.Shell" Namespace="EPiServer.Shell.Web.UI.WebControls" %>

<asp:Content ID="Content1" ContentPlaceHolderID="FullRegion" runat="server">
    <sc:PlatformNavigationMenu runat="server" Area="CMS" ID="Menu" />

    <EPiServerUI:DynamicTable runat="server" NumberOfColumns="4" CellPadding="0" CellSpacing="0" ID="DynamicTable" KeyName="EPReportFramework">

        <EPiServerUI:DynamicRow runat="server" ID="DynamicRowContent">

            <EPiServerUI:DynamicCell runat="server" Height="100%" Width="170" ID="DynamicCellNavigation">
                <!-- Navigation goes here -->
                <EPiServerUI:SystemIFrame runat="server" id="ReportMenu" SourceFile="menu.aspx" Name="ReportMenu" IsScrollingEnabled="False" />
            </EPiServerUI:DynamicCell>

            <EPiServerUI:DynamicResizeCell Width="10" CssClass="EPEdit-CustomDrag" KeyName="ResizeCell" />

            <EPiServerUI:DynamicCell runat="server" Height="100%" Floating="True" ID="DynamiccellReport">
                <!-- Report goes here -->
                <EPiServerUI:SystemIFrame runat="server" id="InfoFrame" SourceFile="Start.aspx" Name="ep_main" />
            </EPiServerUI:DynamicCell>

        </EPiServerUI:DynamicRow>

    </EPiServerUI:DynamicTable>

</asp:Content>
