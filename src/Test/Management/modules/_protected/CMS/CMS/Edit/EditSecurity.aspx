<%@ Page Language="c#" Codebehind="EditSecurity.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Edit.EditSecurity"  Title="<%$ Resources: EPiServer, edit.editsecurity.title %>" %>

<asp:Content ContentPlaceHolderID="HeaderContentRegion" runat="server">

    <script type='text/javascript'>
	<!--
	
	//Variables to keep track of unsaved changes to the page
	var button;
	var localButtonClicked;
	var inheritStatusDefault;
	$(document).ready(function () {
	    inheritStatusDefault = inheritedCheckboxIsChecked();
	});

	function onNavigate(newPageLink)
	{
		return -1;
	}
	function onCommand(newCommand)
	{
		return -1;
	}
	
	function leavePage()
	{
		//If the reload is caused by the save button, do not show the warning
		if (localButtonClicked)
		{
			return;
		}
		event.returnValue = '<%= TranslateForScript("/system/editutil/leavepagewarning") %>';
	}
	
	function onClick()
	{
		localButtonClicked = true;
	}

	// Depending on the status of the inherit checkbox toggles
	// the enabled|disabled style of the ACL list table.
	function setInputStatus() {
	    var accessRightsTable = document.getElementById(EPiTableAccessRights);
	    var disableInput = inheritedCheckboxIsChecked();

	    if (accessRightsTable) {

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
	    EPi.ToolButton.SetEnabled(document.getElementById("<%= SaveButton.ClientID %>"), disableInput != inheritStatusDefault);
	}

        // Returns trus if the inherit checkbox is shown AND checked, otherwise returns false
        function inheritedCheckboxIsChecked() {
            var checkbox = document.getElementById("<%= IsInherited.ClientID %>");
            return (checkbox && checkbox.checked);
        }
	// -->
    </script>

</asp:Content>
<asp:Content ContentPlaceHolderID="MainRegion" runat="server">
    <br />
    <EPiServerUI:ToolButton ID="SaveButton" IsDialogButton="True" Enabled="false" DisablePageLeaveCheck="true" OnClick="SaveButton_Click" OnClientClick="onClick();" runat="server" Text="<%$ Resources: EPiServer, button.save %>" ToolTip="<%$ Resources: EPiServer, button.save %>" SkinID="Save" />
    <EPiServerUI:ToolButton id="UserGroupAddButton" IsDialogButton="False" GeneratesPostBack="False" OnClientClick="OpenUserGroupBrowser(0);" runat="server"  Text="<%$ Resources: EPiServer, button.addusergroupsid %>" ToolTip="<%$ Resources: EPiServer, button.addusergroupsid %>" SkinID="AddUserGroup" />
    <br />
    <br />
    <EPiServerUI:MembershipAccessLevel CssClass="EPEdit-sidAccessLevel" SaveButtonID="SaveButton"  ID="sidList" runat="server" />
    <br />
      <div class="epi-formArea">
        <div class="epi-size25">
            <div>
                <asp:CheckBox runat="server" ID="IsInherited" onClick="setInputStatus();" Text="<%$ Resources: EPiServer, admin.security.inherit %>" ToolTip="<%$ Resources: EPiServer, admin.security.inheritinfo %>" cssclass="epiinheritaccess" /><br />
            </div>
        </div>
    </div>
    <hr />

    <EPiServer:Translate Text="#user" ID="RoleInfo" runat="server" />
    <ul>
        <asp:Repeater ID="ListRoles" runat="server">
            <ItemTemplate>
                <li>
                    <%# System.Web.HttpUtility.HtmlEncode(Container.DataItem.ToString()) %>
                </li>
            </ItemTemplate>
        </asp:Repeater>
    </ul>
<EPiServerScript:ScriptEvent ID="initScript" runat="server" EventType="load" EventTargetClientNode="window" EventHandler="setInputStatus" />
<EPiServerScript:ScriptEvent ID="ScriptEvent1" runat="server" EventType="load" EventTargetClientNode="window" EventHandler="StoreInitialAccessRights" />
</asp:Content>
