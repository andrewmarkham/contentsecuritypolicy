<%@ Page Language="c#" Codebehind="ManageContent.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.ManageContent"  Title="ManageContent" %>
<%@ Register TagPrefix="EPiServerUI" Namespace="EPiServer.UI.WebControls.ContentDataSource" Assembly="EPiServer.UI" %>
<asp:Content ID="Content2" ContentPlaceHolderID="HeaderContentRegion" runat="server">

<script type="text/javascript">
// <![CDATA[
            
    function PageTreeViewInit(treeView) {
        treeView.OnNodeSelected = OnTreeNavigation;
    }

    // Called when the the user selects a page in the tree
    function OnTreeNavigation(itemDataPath) {
        window.location.href = "ManageContent.aspx?id=" + itemDataPath;
    }

    function editContent() {
        window.open('<%=EditUrl%>', '_top');
    }
    
// ]]> 
</script>

</asp:Content>

<asp:Content ID="Content1" ContentPlaceHolderID="MainRegion" runat="server">
   
    <asp:PlaceHolder ID="UploadFileView" runat="server">
        <div class="epi-formArea">
            <div class="epi-size20 epi-paddingVertical-small">
                <asp:Label runat="server" AssociatedControlID="PageRoot" Text="<%$ Resources: EPiServer, admin.managecontent.selectcontent %>" />        
                    <div class="episcroll episerver-pagetree-selfcontained">
                    <EPiServerUI:PageTreeView ID="PageRoot" DataSourceID="contentDataSource" CssClass="episerver-pagetreeview" runat="server" 
                        ClientInitializationCallback="PageTreeViewInit" 
                        ExpandDepth="1" 
                        DataTextField="Name" 
                        ExpandOnSelect="false"
                        SelectedNodeViewPath="<%# CurrentContent.ContentLink.ToString() %>"
                        DataNavigateUrlField="ContentLink" EnableViewState="false">
                        <TreeNodeTemplate>
                            <a href="<%# Server.HtmlEncode(((PageTreeNode)Container.DataItem).NavigateUrl) %>"><%# Server.HtmlEncode(((PageTreeNode)Container.DataItem).Text) %></a>
                        </TreeNodeTemplate>
                    </EPiServerUI:PageTreeView>
                </div>
               </div>
            <div class="epi-buttonContainer">
                <EPiServerUI:ToolButton id="EditButton" GeneratesPostBack="false" OnClientClick="editContent();" runat="server" Text="<%$ Resources: EPiServer, admin.managecontent.editcontent %>" ToolTip="<%$ Resources: EPiServer, admin.managecontent.editcontent %>" skinid="Edit" />
                <EPiServerUI:ToolButton id="AccessRightsButton" onclick="SetAccess" runat="server" Text="<%$ Resources: EPiServer, admin.managecontent.setaccess %>" ToolTip="<%$ Resources: EPiServer, admin.managecontent.setaccess %>" skinid="Edit" />
                <EPiServerUI:ToolButton id="DeleteButton" onclick="Delete" ConfirmMessage='<%$ Resources: EPiServer, admin.managecontent.confirmdelete %>' EnableClientConfirm="true" runat="server" Text="<%$ Resources: EPiServer, button.delete %>" ToolTip="<%$ Resources: EPiServer, button.delete %>" skinid="Delete" />
                <EPiServerUI:ToolButton id="MoveButton" onclick="MoveToWasteBasket" EnableClientConfirm="true" runat="server" Text="<%$ Resources: EPiServer, admin.managecontent.movetowastebasket %>" ToolTip="<%$ Resources: EPiServer, admin.managecontent.movetowastebasket %>" />
            </div>
         </div>
    </asp:PlaceHolder>
    <EPiServerUI:ContentDataSource ID="contentDataSource" UseFallbackLanguage="true" AccessLevel="NoAccess" runat="server" IncludeRootItem="true" ContentLink="<%# EPiServer.Core.PageReference.RootPage %>" EvaluateHasChildren="<%# !EPiServer.Configuration.Settings.Instance.UIOptimizeTreeForSpeed %>" />
</asp:Content>
