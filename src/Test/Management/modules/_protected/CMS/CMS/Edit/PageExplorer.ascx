<%@ Control Language="C#" AutoEventWireup="false" CodeBehind="PageExplorer.ascx.cs" Inherits="EPiServer.UI.Edit.PageExplorer" %>

<EPiServerScript:ScriptSettings ID="toolTip" runat="server" tooltip="<%$ Resources: EPiServer, edit.pageexplorer.tooltip %>"/>

<asp:Panel ID="noFavouritesPanel" CssClass="epi-padding-small" runat="server" Visible="false">
    <asp:Literal ID="noFavouritesMessage" Text="<%$ Resources:EPiServer, edit.edittree.nofavoritesfound %>" runat="server"/>
</asp:Panel>

<EPiServerUI:PageTreeView runat="server" CssClass="episerver-pagetreeview" ID="treeView"
    OnDataBound="TreeView_DataBound"
    OnPageTreeViewItemDataBound="PageTreeView_ItemDataBound"
    DataTextField="PageName" 
    DataNavigateUrlField="LinkURL"
    DataAttributeFields="Created,Changed,PageLink,PageName"
    ClientInitializationCallback="_pageExplorerInit"
    EnableViewState="false"
    ExpandOnSelect="false">
    <TreeNodeTemplate>
    </TreeNodeTemplate>
</EPiServerUI:PageTreeView>

