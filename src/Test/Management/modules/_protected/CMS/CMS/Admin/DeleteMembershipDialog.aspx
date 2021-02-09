<%@ Page Language="C#" AutoEventWireup="false" Title="Delete user or group" Codebehind="DeleteMembershipDialog.aspx.cs"  Inherits="EPiServer.UI.Admin.DeleteMembershipDialog" %>
<%@ Import namespace="EPiServer.Core"%>

<asp:Content runat="server" ContentPlaceHolderID="MainRegion">
    <p>
        <asp:Panel runat="server" ID="RolePanel" Visible="false">
            <%=Translate("/admin/deletemembershipdialog/deleterightsforrole")%> "<asp:Label runat="server" ID="RoleNameLabel" />"
        </asp:Panel>
        <asp:Panel runat="server" ID="UserPanel" Visible="false">
            <%=Translate("/admin/deletemembershipdialog/deleterightsforuser")%> "<asp:Label runat="server" ID="UserNameLabel" />"
        </asp:Panel>
    </p>
    <div class="epi-formArea epi-paddingVertical-small">
        <div class="epi-size40">
            <div>
                <asp:CheckBox runat="server" Text="<%$ Resources: EPiServer, admin.deletemembershipdialog.deletemembershipaccessrights %>" ID="accessRightsCheckbox" Checked="true" />
            </div>
            <div>
                <asp:CheckBox runat="server" Text="<%$ Resources: EPiServer, admin.deletemembershipdialog.deletemembershippermissionrights %>" ID="permissionCheckbox" Checked="true" />
            </div>
        </div>
    </div>
    <div class="epi-buttonContainer">
        <EPiServerUI:ToolButton skinid="Delete" runat="server" ID="DeleteMembershipButton" generatespostback="true" onclick="DeleteUser_Click" text="<%$ Resources: EPiServer, button.delete %>" ToolTip="<%$ Resources: EPiServer, button.delete %>" /><EPiServerUI:ToolButton skinid="Cancel" runat="server" generatespostback="false" onclientclick="EPi.GetDialog().Close(false);" ToolTip="<%$ Resources: EPiServer, button.cancel %>" text="<%$ Resources: EPiServer, button.cancel %>" />
    </div>
</asp:Content>
