<%@ Page language="c#" Codebehind="EditLanguageBranch.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.EditLanguageBranch"  Title="Edit Language Branch"%>
<asp:Content ContentPlaceHolderID="MainRegion" runat="server">
    <div class="epi-formArea epi-paddingVertical">
        <div class="epi-size15">
            <div>
                <asp:Label AssociatedControlID="LanguageBranchName" Translate="#namecaption" runat="server" />
		        <asp:TextBox id="LanguageBranchName" Runat="server" CssClass="EP-requiredField" MaxLength="255" Columns="50"></asp:TextBox>
		    </div>
	        <div class="epi-indent">
	            <asp:CheckBox id="LanguageBranchEnabled" Checked="True" Runat="server"></asp:CheckBox>
			    <asp:Label ID="Label1" AssociatedControlID="LanguageBranchEnabled" Translate="#enabledcaption" runat="server" />
		    </div>
	        <div>
	            <asp:Label AssociatedControlID="LanguageBranchIcon" title="<%$ Resources: EPiServer, admin.editlanguagebranch.customiconhelp %>" Translate="#customiconcaption" runat="server" />
		        <asp:TextBox id="LanguageBranchIcon" Runat="server" MaxLength="255" Columns="50"></asp:TextBox>
		    </div>
	        <div>
	            <asp:Label AssociatedControlID="LanguageBranchURLSegment" Translate="#urlsegmentcaption" runat="server" />
		        <asp:TextBox id="LanguageBranchURLSegment" Runat="server" MaxLength="255" Columns="50"></asp:TextBox>
		        <asp:RegularExpressionValidator EnableClientScript="True" Runat="server" ID="urlSegmentValidator" Text="*" ControlToValidate="LanguageBranchURLSegment" ValidationExpression="^[a-z0-9\-\._~]+$" />
		    </div>
            <div>
                <asp:Label associatedControlID="UserGroupAddButton" Translate="#requiredaccess" title="<%$ Resources: EPiServer, admin.editlanguagebranch.requiredaccesstooltip %>" runat="server" />
                <EPiServerUI:MembershipAccessLevel CssClass="EPEdit-sidAccessLevel" runat="server" ID="LanguageAccess" EnableSelectAll="false" /><EPiServerUI:ToolButton id="UserGroupAddButton" GeneratesPostBack="False" OnClientClick="OpenUserGroupBrowser('role');" runat="server"  Text="<%$ Resources: EPiServer, button.addusergroupsid %>" ToolTip="<%$ Resources: EPiServer, button.addusergroupsid %>" SkinID="AddUserGroup" />
            </div>
        </div>
    </div>
    <div class="epi-buttonContainer">
        <EPiServerUI:ToolButton id="DeleteLanguageButton" runat="server" text="<%$ Resources: EPiServer, button.delete %>" ToolTip="<%$ Resources: EPiServer, button.delete %>" SkinID="Delete" OnClick="DeleteButton_Click" /><EPiServerUI:ToolButton id="ApplyButton" runat="server" text="<%$ Resources: EPiServer, button.save %>" ToolTip="<%$ Resources: EPiServer, button.save %>" SkinID="Save" OnClick="ApplyButton_Click" /><EPiServerUI:ToolButton id="CancelButton" CausesValidation="false" runat="server" text="<%$ Resources: EPiServer, button.cancel %>" ToolTip="<%$ Resources: EPiServer, button.cancel %>" SkinID="Cancel" OnClick="CancelButton_Click" />
    </div>
</asp:Content>