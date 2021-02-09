<%@ Page Language="c#" Codebehind="AdminGroup.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.AdminGroup"  Title="Admin Group" %>
<%@ Import namespace="EPiServer.Security"%>
<asp:Content ContentPlaceHolderID="HeaderContentRegion" runat="server">
<script type="text/javascript">
// <![CDATA[

    function OpenDeleteDialog(roleName, securityEntityType, providerName)
    {
        OpenDialogMembershipDeleteUserOrRole(roleName, securityEntityType, providerName, MembershipDeleteCompleted, null, null);
    }

    function reloadPage()
    {
        document.location.href = EPi.ResolveUrlFromUI("admin/admingroup.aspx");
    }


// ]]>
</script>


</asp:Content>
<asp:Content runat="server" ContentPlaceHolderID="MainRegion">
    <!--
    ******************************************************************
    create role form create role form create role form create role for
    ******************************************************************
    -->
    <asp:Panel ID="CreateGroupPanel" runat="Server" Visible="false" CssClass="epi-formArea">
    <fieldset>
        <legend><EPiServer:Translate Text="#addgroup" runat="server" /></legend>
        <div class="epi-size10">
            <div>
                <asp:Label runat="server" AssociatedControlID="GroupName" Translate="#group" />
                <asp:TextBox ID="GroupName" MaxLength="256" runat="server" TabIndex="1" class="EP-requiredField"></asp:TextBox>
                <asp:RequiredFieldValidator runat="server" ID="GroupNameRequiredValidator" ErrorMessage="<%$ Resources: EPiServer, admin.admingroup.rolenameinvalid %>" Text="*" ControlToValidate="GroupName" Display="Dynamic" />
                <asp:RegularExpressionValidator runat="server" ID="GroupNameValidator" EnableClientScript="true" Text="*" ControlToValidate="GroupName" Display="Dynamic"  />
            </div>
         </div>
         </fieldset>
            <div class="epi-buttonContainer">
                <EPiServerUI:ToolButton ID="SaveGroup" OnClick="SaveGroup_Click" SkinID="Save" Text="<%$ Resources: EPiServer, button.save %>" ToolTip="<%$ Resources: EPiServer, button.save %>" runat="server"/><EPiServerUI:ToolButton ID="CancelGroupSave" CausesValidation="false" OnClick="CancelGroupSave_Click" SkinID="Cancel" Text="<%$ Resources: EPiServer, button.cancel %>" ToolTip="<%$ Resources: EPiServer, button.cancel %>" runat="server"/>
            </div>
    </asp:Panel>
    <div class="epi-buttonDefault" runat="server" id="CommandTable">
        <EPiServerUI:ToolButton ID="AddGroupButton" OnClick="AddGroupButton_Click" SkinID="Add" Text="<%$ Resources: EPiServer, button.add %>" ToolTip="<%$ Resources: EPiServer, button.add %>" runat="server"/>
    </div>
    <div class="epi-buttonContainer" runat="server" id="CancelPanel">
        <EPiServerUI:ToolButton ID="CancelUsersInRoleButton" OnClick="CancelUsersInRoleButton_Click" SkinID="Cancel" Text="<%$ Resources: EPiServer, button.cancel %>" ToolTip="<%$ Resources: EPiServer, button.cancel %>" runat="server"/>
    </div>
    <asp:DataGrid
        runat="server"
        ID="GroupList"
        AllowPaging="true"
        PageSize="15"
        OnPageIndexChanged="GroupList_PageChange"
        AutoGenerateColumns="False"
        OnDataBinding="SetGroupHeaders"
        UseAccessibleHeader="true">
        <PagerStyle Mode="NumericPages" CssClass="epipager" />
        <Columns>
            <asp:TemplateColumn Visible="true" HeaderStyle-Width="50">
                <ItemTemplate><%# GetTypeImage( DataBinder.Eval(Container.DataItem, "Type")) %></ItemTemplate>
            </asp:TemplateColumn>
            <asp:TemplateColumn ItemStyle-HorizontalAlign="Left">
                <HeaderStyle Width="250" HorizontalAlign="Left"></HeaderStyle>
                <ItemTemplate>
                    <a href="<%#HttpUtility.HtmlAttributeEncode((string)DataBinder.Eval(Container.DataItem, "Url"))%>"><%#Server.HtmlEncode((string)DataBinder.Eval(Container.DataItem, "Name"))%></a>
                </ItemTemplate>
            </asp:TemplateColumn>
            <asp:BoundColumn Visible="true" DataField="ProviderName">
                <HeaderStyle Width="180" HorizontalAlign="Left"></HeaderStyle>
                <ItemStyle></ItemStyle>
            </asp:BoundColumn>
            <asp:TemplateColumn ItemStyle-HorizontalAlign="Left">
                <ItemTemplate>
                    <EPiServerUI:ToolButton
                        runat="server"
                        Enabled='<%#(bool)IsSupportedDelete((string)DataBinder.Eval(Container.DataItem, "ProviderName"))%>'
                        GeneratesPostback="false"
                        OnClientClick='<%#OpenDeleteDialog(Server.UrlEncode((string)DataBinder.Eval(Container.DataItem, "Name")), SecurityEntityType.Role, Server.UrlEncode((string)DataBinder.Eval(Container.DataItem, "ProviderName")))%>'
                        ToolTip="<%$ Resources: EPiServer, admin.admingroup.deletegrouptooltip %>"
                        SkinID="Delete"
                        ID="DeleteToolButton" />
                </ItemTemplate>
                <HeaderStyle Width="80" HorizontalAlign="Left"></HeaderStyle>
                <ItemStyle></ItemStyle>
            </asp:TemplateColumn>
            <asp:BoundColumn Visible="false" DataField="Name">
            </asp:BoundColumn>

        </Columns>
    </asp:DataGrid>
    <p><asp:Label ID="MembershipLabel" runat="server" CssClass="EP-systemInfo" /></p>
    <asp:DataGrid ID="UserList" AutoGenerateColumns="False" runat="server" OnDataBinding="SetUserHeaders" OnDeleteCommand="UserList_DeleteCommand" OnPageIndexChanged="UserList_PageIndexChanged" UseAccessibleHeader="true" AllowPaging="True" PageSize="100" >
        <PagerStyle Mode="NumericPages" CssClass="epipager" />
        <Columns>
            <asp:TemplateColumn Visible="true" HeaderStyle-Width="50">
                <ItemTemplate><%# GetTypeImage( DataBinder.Eval(Container.DataItem, "Type")) %></ItemTemplate>
            </asp:TemplateColumn>
            <asp:HyperLinkColumn Visible="True" DataTextField="Name" DataNavigateUrlField="NameUrlSafe" DataNavigateUrlFormatString="EditUser.aspx?membershipUsername={0}&epUrl=AdminGroup.aspx" >
                <HeaderStyle Width="250" HorizontalAlign="Left"></HeaderStyle>
                <ItemStyle></ItemStyle>
            </asp:HyperLinkColumn>
            <asp:BoundColumn Visible="true" DataField="ProviderName">
                <HeaderStyle Width="180" HorizontalAlign="Left"></HeaderStyle>
                <ItemStyle></ItemStyle>
            </asp:BoundColumn>
            <asp:TemplateColumn ItemStyle-HorizontalAlign="Left">
                <ItemTemplate>
                     <EPiServerUI:ToolButton Enabled='<%#(bool)IsSupportedDelete((string)DataBinder.Eval(Container.DataItem, "ProviderName"))%>' CommandName="Delete" runat="server" ToolTip="<%$ Resources: EPiServer, admin.admingroup.removeuserfromgrouptooltip %>" SkinID="Delete" ID="DeleteUserToolButton" />
                     <EPiServerScript:ScriptConfirmEvent ID="ScriptConfirmEvent1" runat="server" EventTargetID="DeleteUserToolButton" EventType="Click" ConfirmMessage='<%#(string)ConfirmRemoveMessage(Server.HtmlDecode((string)Eval("Name")))%>' />
                </ItemTemplate>
                <HeaderStyle Width="80" HorizontalAlign="Left"></HeaderStyle>
                <ItemStyle></ItemStyle>
            </asp:TemplateColumn>
            <asp:BoundColumn Visible="false" DataField="Name" />
            <asp:BoundColumn Visible="false" DataField="RoleName" />
         </Columns>
    </asp:DataGrid>
</asp:Content>
