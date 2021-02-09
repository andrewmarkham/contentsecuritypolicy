<%@ Import namespace="EPiServer.Security"%>
<%@ Control Language="C#" AutoEventWireup="false" Codebehind="UserMembership.ascx.cs" Inherits="EPiServer.UI.Edit.UserMembership" %>
<!-- Tab Strip. -->
<EPiServerUI:tabstrip id="SettingTabs" runat="Server" GeneratesPostBack="false" targetid="SettingsTabView" supportedpluginarea="SidSettingsArea">
	<EPiServerUI:Tab sticky="True" runat="Server" id="DefaultTab" />
</EPiServerUI:tabstrip>
<asp:Panel ID="SettingsTabView" runat="Server">
    <asp:Panel ID="DefaultView" runat="Server" CssClass="epi-padding">
        <!--
        *************************************************************
        Basic Membership User Credentials
        *************************************************************
        -->
        <asp:HiddenField ID="MembershipUser" runat="server" />
        <asp:Panel runat="server" ID="MembershipBasic" Visible="true">
            <div class="epi-formArea">

                <div class="epi-size10">
                    <asp:Panel runat="server">
                        <asp:Label runat="server" AssociatedControlID="UserName" Text="<%$ Resources: EPiServer, admin.secedit.editname %>"></asp:Label>
                        <asp:TextBox Width="300" runat="server" ID="UserName" MaxLength="256" autocomplete="off" />
                        <asp:RequiredFieldValidator runat="server" ID="UserNameRequiredValidator" ErrorMessage="<%$ Resources: EPiServer, admin.edituser.invalidusername %>" Text="*" ControlToValidate="UserName" Display="Dynamic" EnableClientScript="false"/>
                    </asp:Panel>

                    <asp:Panel ID="CurrentPasswordPanelRow" runat="server">
                        <asp:Label runat="server" AssociatedControlID="CurrentPassword" Text="<%$ Resources: EPiServer, admin.secedit.currentpassword %>"></asp:Label>
                        <asp:TextBox runat="server" ID="CurrentPassword" MaxLength="128" Width="300" TextMode="Password"  autocomplete="off" />
                    </asp:Panel>

                    <asp:Panel runat="server">
                        <asp:Label runat="server" AssociatedControlID="Password" Text="<%$ Resources: EPiServer, admin.secedit.editpassword %>"></asp:Label>
                        <asp:TextBox runat="server" ID="Password" MaxLength="128" Width="300" TextMode="Password"  autocomplete="off" />
                    </asp:Panel>

                    <asp:Panel ID="PasswordConfirmPanelRow" runat="server">
                        <asp:Label runat="server" AssociatedControlID="PasswordConfirm" Text="<%$ Resources: EPiServer, admin.secedit.editconfirmpassword %>"></asp:Label>
                        <asp:TextBox runat="server" ID="PasswordConfirm" MaxLength="128" Width="300" TextMode="Password"  autocomplete="off" />
                    </asp:Panel>

                    <asp:Panel ID="PasswordQuestionPanelRow" runat="server">
                        <asp:Label runat="server" AssociatedControlID="PasswordQuestion" Text="<%$ Resources: EPiServer, admin.secedit.passwordquestion %>"></asp:Label>
                        <asp:TextBox runat="server" ID="PasswordQuestion" MaxLength="256" />
                    </asp:Panel>

                    <asp:Panel ID="PasswordAnswerPanelRow" runat="server">
                        <asp:Label runat="server" AssociatedControlID="PasswordAnswer" Text="<%$ Resources: EPiServer, admin.secedit.passwordanswer %>"></asp:Label>
                        <asp:TextBox runat="server" ID="PasswordAnswer" MaxLength="128" TextMode="Password" />
                    </asp:Panel>

                    <asp:Panel ID="PasswordResetPanelRow" runat="server" CssClass="epi-indent">
                        <asp:CheckBox runat="server" ID="ChangePassword" AutoPostBack="True" OnCheckedChanged="ChangePassword_Click" />
                        <asp:Label runat="server" AssociatedControlID="ChangePassword" Text="<%$ Resources: EPiServer, admin.secedit.changepassword %>"></asp:Label>
                    </asp:Panel>

                    <asp:Panel runat="server">
                        <asp:Label runat="server" AssociatedControlID="Email" Text="<%$ Resources: EPiServer, admin.secedit.editemail %>"></asp:Label>
                        <asp:TextBox Width="300" runat="server" ID="Email" MaxLength="256" />
                        <asp:CustomValidator ID="EmailValidator" runat="server" OnServerValidate="ValidateEmailAddress" Text="*"/>
                        <asp:RequiredFieldValidator runat="server" Text="*" ErrorMessage="<%$ Resources: EPiServer, admin.edituser.invalidemail %>" ID="RequiredEmailValidator" ControlToValidate="Email" Display="Dynamic" EnableClientScript="false" />
                    </asp:Panel>
                </div>

                <div class="epi-size10">
                    <asp:Panel runat="server" visible="<%# ControlEnabled(Approved) %>" CssClass="epi-indent">
                        <asp:CheckBox runat="server" ID="Approved" />
                        <asp:Label runat="server" AssociatedControlID="Approved" Text="<%$ Resources: EPiServer, admin.secedit.editactive %>"></asp:Label>
                    </asp:Panel>

                    <asp:Panel runat="server" visible="<%# ControlEnabled(LockedOut) %>" CssClass="epi-indent epi-size25">
                        <asp:CheckBox runat="server" ID="LockedOut" AutoPostBack="true" />
                        <asp:Label runat="server" AssociatedControlID="LockedOut" Text="<%$ Resources: EPiServer, admin.secedit.lockedout %>"></asp:Label>
                        <br />
                        <em><asp:Label ID="LockedOutDate" runat="server" /></em>
                    </asp:Panel>
                </div>

                <div class="epi-paddingVertical-small epi-size10">
                    <asp:Panel runat="server" visible="<%# ControlEnabled(Provider) %>">
                        <asp:Label ID="LabelProviderHeading" runat="server" AssociatedControlID="Provider" Text="<%$ Resources: EPiServer, admin.admingroup.provider %>"></asp:Label>
                        <asp:Label runat="server" ID="Provider" />
                    </asp:Panel>

                    <asp:Panel runat="server" visible="<%# ControlEnabled(CreatedDate) %>">
                        <asp:Label runat="server" AssociatedControlID="CreatedDate" Text="<%$ Resources: EPiServer, admin.edituser.usercreated %>"></asp:Label>
                        <asp:Label runat="server" ID="CreatedDate" />
                    </asp:Panel>

                    <asp:Panel runat="server" visible="<%# ControlEnabled(LastLoginDate) %>">
                        <asp:Label runat="server" AssociatedControlID="LastLoginDate" Text="<%$ Resources: EPiServer, admin.edituser.userlastlogin %>"></asp:Label>
                        <asp:Label runat="server" ID="LastLoginDate" />
                    </asp:Panel>

                    <asp:Panel runat="server" visible="<%# ControlEnabled(Comment) %>">
                        <asp:Label runat="server" AssociatedControlID="Comment" Text="<%$ Resources: EPiServer, admin.secedit.editdescription %>"></asp:Label>
                        <asp:Label runat="server" ID="Comment" />
                    </asp:Panel>
                </div>

            </div>
        </asp:Panel>

        <!--
        *************************************************************
        Membership User Is In Role Panel.
        *************************************************************
        -->
        <asp:Panel runat="server" ID="MembershipRoles" Visible="<%# ControlEnabled(MembershipRoles) %>" CssClass="epi-paddingVertical" style="width: 680px;">
            <div class="epi-formArea">
                <div class="epi-floatLeft">
                    <episerver:themeimage id="ThemeImage1" runat="server" imageurl="SecurityTypes/Role.gif" AlternateText="" />
                    <asp:Label runat="server" AssociatedControlID="AllRoles" Text="<%$ Resources: EPiServer, admin.secedit.listnotmemberof %>"></asp:Label>
                    <br />
                    <asp:ListBox runat="server" ID="AllRoles" SkinID="Size300" Rows="15" SelectionMode="Multiple" ondblclick="SecMoveOption(allRoles, selectedRoles)"></asp:ListBox>
                </div>
                <div class="epi-floatLeft epi-arrowButtonContainer">
                    <EPiServerUI:ToolButton id="AddRoleButton" tooltip="Add Role" runat="server" SkinID="ArrowRight" style="margin-bottom: 1.5em; margin-top: 1.5em;"  /><br />
                    <EPiServerUI:ToolButton id="RemoveRoleButton" tooltip="Remove Role" runat="server" SkinID="ArrowLeft" />
                </div>
                <div class="epi-floatLeft">
                    <EPiServer:themeimage id="ThemeImage2" runat="server" imageurl="SecurityTypes/Role.gif" AlternateText="" />
                    <asp:Label runat="server" AssociatedControlID="SelectedRoles" Text="<%$ Resources: EPiServer, admin.secedit.listmemberof %>"></asp:Label>
                    <br />
                    <asp:ListBox runat="server" ID="SelectedRoles" SkinID="Size300" Rows="15" SelectionMode="Multiple" ondblclick="SecMoveOption(selectedRoles, allRoles)"></asp:ListBox>
                </div>
            </div>
            <br clear="all" />
        </asp:Panel>

    </asp:Panel>

</asp:Panel>

<asp:PlaceHolder ID="ToolbarPanel" runat="server">
    <div class="epi-buttonContainer">
        <EPiServerUI:ToolButton id="DeleteButton" OnClientClick='<%#"OpenDeleteDialog(\"" + Server.UrlEncode(GetUserName()) + "\", 0, \"" + Server.UrlEncode(MembershipProviderName) + "\")"%>' GeneratesPostback="false" skinid="Delete" visible="<%# IsAdminMode %>" text="<%$ Resources: EPiServer, button.delete %>" tooltip="<%$ Resources: EPiServer, button.delete %>" runat="server" />
        <EPiServerUI:ToolButton id="ApplyButton" onclick="SaveButton_Click" skinid="Save" text="<%$ Resources: EPiServer, button.save %>" tooltip="<%$ Resources: EPiServer, button.save %>" runat="server" />
    </div>
</asp:PlaceHolder>

<!-- Command Buttons -->
<asp:Panel ID="MySavePanel" runat="server" CssClass="epi-buttonContainer">
   <EPiServerUI:ToolButton id="MySaveButton" onclick="SaveButton_Click" text="<%$ Resources: EPiServer, button.save %>" tooltip="<%$ Resources: EPiServer, button.save %>" runat="server" />
</asp:Panel>

<script type="text/javascript">
    // <![CDATA[

    function OpenDeleteDialog(roleName, securityEntityType, providerName) {
        OpenDialogMembershipDeleteUserOrRole(roleName, securityEntityType, providerName, MembershipDeleteCompleted, null, null);
    }

    function reloadPage() {
        document.location.href = EPi.ResolveUrlFromUI("admin/searchusers.aspx");
    }

    var selectedRoles = document.getElementById("<%= SelectedRoles.ClientID %>");
    var allRoles = document.getElementById("<%= AllRoles.ClientID %>");

    function SelAllMember() {
        if (selectedRoles != null) {
            for (var i = 0; i < selectedRoles.length; i++) {
                selectedRoles.options[i].selected = true;
            }
        }
    }

    // ]]>
</script>
