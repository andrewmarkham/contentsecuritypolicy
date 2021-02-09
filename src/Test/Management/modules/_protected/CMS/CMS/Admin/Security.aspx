<%@ Page Language="c#" Codebehind="Security.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.Security"  Title="Set Access Rights" %>
<%@ Import Namespace="EPiServer.Configuration" %>
<%@ Register TagPrefix="EPiServerUI" Namespace="EPiServer.UI.WebControls.ContentDataSource" Assembly="EPiServer.UI" %>
<asp:Content ContentPlaceHolderID="HeaderContentRegion" runat="server">

    <script type='text/javascript'>	    
		
        var treeViewObj = null;
        var defaultCheckboxDisableSettings;
        var inheritStatusDefault;
		// Initializes the treeView callbacks
		function PageTreeViewInit(treeView)
        {
   	        treeView.OnNodeSelected = OnTreeNavigation;
   	        treeViewObj = treeView;
        }
        
        // Called when the the user selects a page in the tree
        function OnTreeNavigation(itemDataPath)
        {            
            window.location.href="security.aspx?id=" + itemDataPath;            
        }
        
        //Depending on which checkbox that are selected we show different confirm text
        function ConfirmSave(e)
        {
            var recursive = document.getElementById('<%= RecursiveCheckbox.ClientID %>');
            if(recursive.checked)
            {
                var inherit = document.getElementById('<%= IsInherited.ClientID %>');
                if (inherit.checked) {
                    if (!confirm('<%=TranslateForScript("/admin/security/recursiveinheritconfirm")%>')) {
                        e.preventDefault();
                    }
                }
                else {
                    if (!confirm('<%=TranslateForScript("/admin/security/recursivesaveconfirm") %>')) {
                        e.preventDefault();
                    }
                }
            }
        }

        // Depending on the status of the inherit checkbox toggles
        // the enabled|disabled style of the ACL list table.
        function setInputStatus() {
            var accessRightsTable = document.getElementById(EPiTableAccessRights);
            var disableInput = inheritedCheckboxIsChecked();

            if (accessRightsTable) {

                if (defaultCheckboxDisableSettings == null) {
                    defaultCheckboxDisableSettings = new Array();
                }

                // In IE disabling the table causes the inputs to be disabled as well as the headings to be greyed out.
                accessRightsTable.disabled = disableInput;

                // Disabling the table will not disable the input elements in FF
                var inputs = accessRightsTable.getElementsByTagName("INPUT");
                for (var i = 0; i < inputs.length; i++) {

                    inputs[i].disabled = disableInput || (inputs[i].getAttribute('data-is-accesslevel-disabled') === "true");
                }
                // Add/remove the class disabled on images and the table itself
                $(accessRightsTable).toggleClass("epi-disabled", disableInput);
                $("img", accessRightsTable).toggleClass("epi-disabled", disableInput);

                StoreInitialAccessRights();
            }

            EPi.ToolButton.SetEnabled(document.getElementById("<%= UserGroupAddButton.ClientID %>"), !disableInput);
            EPi.ToolButton.SetEnabled(document.getElementById("<%= SaveButton.ClientID %>"), CheckIfSaveEnabled());
        }

        function CheckIfSaveEnabled() {
            if (typeof CheckIfAnyRowsAreHighLighted === "function") {
                return (!inheritedCheckboxIsChecked() && CheckIfAnyRowsAreHighLighted()) || (inheritStatusDefault != inheritedCheckboxIsChecked())
            } else {
                return (inheritStatusDefault != inheritedCheckboxIsChecked())
            }
        }

        // Returns trus if the inherit checkbox is shown AND checked, otherwise returns false
        function inheritedCheckboxIsChecked() {
            var checkbox = document.getElementById("<%= IsInherited.ClientID %>");
        return (checkbox && checkbox.checked);
    }
        
    </script>
</asp:Content>
<asp:Content ContentPlaceHolderID="MainRegion" runat="server">    
    <EPiServerScript:ScriptEvent ID="initScript" runat="server" EventType="load" EventTargetClientNode="window" EventHandler="setInputStatus" />
    <div class="episcroll episerver-pagetree-selfcontained">
       <EPiServerUI:PageTreeView ID="pageTreeView" DataSourceID="contentDataSource" CssClass="episerver-pagetreeview" runat="server" 
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
    <div class="epi-buttonDefault">
        <EPiServerUI:ToolButton id="UserGroupAddButton" GeneratesPostBack="False" OnClientClick="OpenUserGroupBrowser(0);" runat="server"  Text="<%$ Resources: EPiServer, button.addusergroupsid %>" ToolTip="<%$ Resources: EPiServer, button.addusergroupsid %>" SkinID="AddUserGroup" />
    </div>
    <div class="epi-marginVertical">
        <EPiServerUI:MembershipAccessLevel SelectedRowCss="epi-applicationSelectedColor" RecursiveCheckboxID="RecursiveCheckbox"  SaveButtonID="SaveButton"  ID="sidList" runat="server" />
    </div>
    <div class="epi-formArea">
        <div class="epi-size25">
            <div>
                <asp:CheckBox runat="server" ID="IsInherited" onClick="setInputStatus();" Text="<%$ Resources: EPiServer, admin.security.inherit %>" ToolTip="<%$ Resources: EPiServer, admin.security.inheritinfo %>" /><br />
            </div>
            <div>
                <asp:CheckBox runat="server" ID="RecursiveCheckbox" onClick="EnableButtons();" Text="<%$ Resources: EPiServer, admin.security.applyrecursive %>"  ToolTip="<%$ Resources: EPiServer, admin.security.recursiveinfo %>" /><br />
            </div>
        </div>
    </div>
    <div class="epi-buttonContainer">

        <EPiServerUI:ToolButton id="SaveButton" DisablePageLeaveCheck="true" CssClass="EPEdit-CommandToolDisabled" Enabled="false" OnClick="SaveButton_Click" runat="server"  Text="<%$ Resources: EPiServer, button.save %>" ToolTip="<%$ Resources: EPiServer, button.save %>" SkinID="Save" />
        <EPiServerScript:ScriptEvent ID="ScriptEvent2" EventType="click" EventTargetID="SaveButton" EventHandler="ConfirmSave" runat="server" />
    </div>
    <EPiServerUI:ContentDataSource ID="contentDataSource" UseFallbackLanguage="true" AccessLevel="NoAccess" runat="server" IncludeRootItem="true" ContentLink="<%# EPiServer.Core.PageReference.RootPage %>" EvaluateHasChildren="<%# !Settings.Instance.UIOptimizeTreeForSpeed %>" />
<EPiServerScript:ScriptEvent runat="server" EventType="load" EventTargetClientNode="window" EventHandler="StoreInitialAccessRights" />
</asp:Content>
