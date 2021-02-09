<%@ Page Language="c#" CodeBehind="PageBrowser.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Edit.PageBrowser"  %>

<%@ Register TagPrefix="EPiServerUI" TagName="PageExplorer" Src="PageExplorer.ascx" %>

<asp:Content ID="Content1" ContentPlaceHolderID="HeaderContentRegion" runat="server">
    <base target="_self" />
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="FullRegion" runat="server">
    <EPiServerUI:BodySettings CssClass="epi-applicationSidebar" runat="server" />

    <script type='text/javascript'>
        //<![CDATA[
        var pageTreeView = null;
        var returnValue = false;

        function onOK() {
            if (document.getElementById('<%=selectedPageLink.ClientID %>').value == '') {
                EPi.GetDialog().Close();
                return;
            }
            closeDialog();
        }

        function closeDialog() {
            SetValues(document.getElementById('<%=selectedPageLink.ClientID %>').value, document.getElementById('<%=selectedPageName.ClientID %>').value + ' [' + document.getElementById('<%=selectedPageLink.ClientID %>').value + ']');
    	    EPi.GetDialog().Close(returnValue);
    	}

    	function onNothing() {
    	    SetValues('', '');
    	    EPi.GetDialog().Close(returnValue);
    	}

    	function onSelf() {
    	    SetValues('-', '<%= TranslateForScript("/system/pagebrowser/infoselflink") %>');
		    EPi.GetDialog().Close(returnValue);
		}

		function onCancel() {
		    EPi.GetDialog().Close(returnValue);
		}

		function onLoad() {
		    window.focus();
		    if (this.activeItem) {
		        this.activeItem.scrollIntoView(false);
		    }
		}

		function SetValues(value, info) {
		    var doc = EPi.GetDialog().dialogArguments;
		    doc.getElementById('<%=ValueVariable%>').value = value;
		    doc.getElementById('<%=InfoVariable%>').value = info;

		    returnValue = true;
		}

		function SetLocalValues(value, info) {
		    document.getElementById('<%=selectedPageLink.ClientID %>').value = value;
		    document.getElementById('<%=selectedPageName.ClientID %>').value = info;
		}

		function setEnabledStateOfSelfButton() {
		    var doc = EPi.GetDialog().dialogArguments;

		    if (doc && doc.getElementById('disablePageBrowserSelfLinkButton') && doc.getElementById('disablePageBrowserSelfLinkButton').value == 'true')
		        EPi.ToolButton.SetEnabled('<%=selfButton.ClientID %>', false);
        }


        function initPageTreeView(treeView) {
            pageTreeView = treeView;
            pageTreeView.OnNodeSelected = OnTreeNavigation;

        }

        function OnTreeNavigation(itemDataPath) {
            var pageName = pageTreeView.GetPropertyValue(itemDataPath, "PageName");
            SetLocalValues(itemDataPath, pageName);
        }

        //]]>
    </script>

    <input type="hidden" id="selectedPageLink" name="selectedPageLink" runat="server" />
    <input type="hidden" id="selectedPageName" name="selectedPageName" runat="server" />

    <asp:Panel runat="server" CssClass="episerver-pagebrowserSearch">
        <asp:Label ID="Label1" runat="server" Text="<%$ Resources: EPiServer, button.search  %>" />
        <asp:TextBox ID="searchKey" runat="server" />
        <EPiServerUI:ToolButton ID="searchButton" OnClick="searchButton_Click" runat="server" ToolTip="<%$ Resources: EPiServer, button.search %>" SkinID="Search" />
    </asp:Panel>

    <asp:Panel runat="server" CssClass="episcroll episerver-pagebrowserContainer">
        <EPiServerUI:PageExplorer id="pageTreeView" runat="server" DisplayTreeMode="ExplorerTree"
            ExpandDepth="1"
            ExpandOnSelect="false"
            EnableDragAndDrop="false"
            ClientInitializationCallback="initPageTreeView"
            OnTreeItemDataBound="pageTreeView_TreeItemDataBound">
        </EPiServerUI:PageExplorer>
    </asp:Panel>

    <asp:Panel runat="server" CssClass="episerver-pagebrowserButtonContainer">
        <EPiServerUI:ToolButton ID="okButton" IsDialogButton="true" GeneratesPostBack="False" runat="server" OnClientClick="onOK();" Text="<%$ Resources: EPiServer, button.select %>" ToolTip="<%$ Resources: EPiServer, button.select %>" SkinID="Check" />
        <EPiServerUI:ToolButton ID="nothingButton" IsDialogButton="true" GeneratesPostBack="False" runat="server" OnClientClick="onNothing();" Text="<%$ Resources: EPiServer, system.pagebrowser.buttonnolink %>" ToolTip="<%$ Resources: EPiServer, system.pagebrowser.buttonnolink %>" SkinID="Delete" />
        <EPiServerUI:ToolButton ID="selfButton" IsDialogButton="true" GeneratesPostBack="False" runat="server" OnClientClick="onSelf();" Text="<%$ Resources: EPiServer, system.pagebrowser.buttonselflink %>" ToolTip="<%$ Resources: EPiServer, system.pagebrowser.buttonselflink %>" SkinID="File" />
        <EPiServerUI:ToolButton ID="cancelButton" IsDialogButton="true" GeneratesPostBack="False" runat="server" OnClientClick="onCancel();" Text="<%$ Resources: EPiServer, button.cancel %>" ToolTip="<%$ Resources: EPiServer, button.cancel %>" SkinID="Cancel" />
    </asp:Panel>
    <EPiServerScript:ScriptEvent ID="ScriptEvent1" EventTargetClientNode="window" EventType="load" EventHandler="setEnabledStateOfSelfButton" runat="server" />
</asp:Content>
