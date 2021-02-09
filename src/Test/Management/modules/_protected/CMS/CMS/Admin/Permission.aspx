<%@ Page Language="c#" Codebehind="Permission.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.Permission_Page"  Title="Permission" %>

<asp:Content ID="Content1" ContentPlaceHolderID="MainRegion" runat="server">

    <script type='text/javascript'>
		<!--

		function addPermissionRows( userOrGroup, nType )
		{
			var oRow,oCell,oOption;
			var isRowExist = false;

			var rowTable = clientID + '_row_' + userOrGroup;
			var rowDynamicAdded = 'row_' + userOrGroup;

			if(document.getElementById(rowTable) || document.getElementById(rowDynamicAdded))
			{
			    return;
			}

		    var userGroupTable = document.getElementById('<%=UserAndGroupTable.ClientID%>');
			oRow = userGroupTable.insertRow(userGroupTable.rows.length);
			oRow.id = 'row_' + userOrGroup;
			oCell = oRow.insertCell(0);
			var frmImg = document.createElement('img');
			frmImg.src = imageArray[nType];
			frmImg.align = "absmiddle";
			frmImg.setAttribute("class", "epi-marginHorizontal-small");

			oCell.appendChild(frmImg);
			var frmText = document.createTextNode(userOrGroup);
			oCell.appendChild(frmText);

			oCell = oRow.insertCell(1);
			var frmCheckbox = document.createElement('input');
			frmCheckbox.type = "checkbox";
			frmCheckbox.name = "UserOrGroup";
			frmCheckbox.value = nType + ":" + userOrGroup;
			oCell.appendChild(frmCheckbox);
			frmCheckbox.checked = true;

			EPi.PageLeaveCheck.SetPageChanged(true);
		}

		// -->
    </script>
        <asp:Table runat="server" ID="PermissionTable" CssClass="epi-dataTable"  />

        <asp:Panel runat="server" ID="CommandGroup" Visible="False">
            <asp:Table ID="UserAndGroupTable" runat="server" CssClass="epi-default"></asp:Table>
            <div class="epi-buttonDefault">
                <EPiServerUI:ToolButton id="UserGroupAddButton" GeneratesPostBack="False" OnClientClick="OpenUserGroupBrowser(0);" runat="server"  Text="<%$ Resources: EPiServer, button.addusergroupsid %>" ToolTip="<%$ Resources: EPiServer, button.addusergroupsid %>" SkinID="AddUserGroup" />
            </div>

            <div class="epi-buttonContainer">
                <EPiServerUI:ToolButton id="Save" DisablePageLeaveCheck="true" runat="server" text="<%$ Resources: EPiServer, button.save %>" tooltip="<%$ Resources: EPiServer, button.save %>" SkinID="Save" OnClick="Save_Click" /><EPiServerUI:ToolButton id="Cancel" DisablePageLeaveCheck="true" runat="server" text="<%$ Resources: EPiServer, button.cancel %>" tooltip="<%$ Resources: EPiServer, button.cancel %>" SkinID="Cancel" OnClick="Cancel_Click" />
            </div>
        </asp:Panel>
</asp:Content>
