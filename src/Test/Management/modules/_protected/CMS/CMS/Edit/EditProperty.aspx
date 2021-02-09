<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="EditProperty.aspx.cs" Inherits="EPiServer.UI.Edit.EditProperty"
     %>
<%@ Import Namespace="EPiServer.Framework.Web.Mvc.Html"%>
<%@ Import Namespace="EPiServer.Shell.Web.Mvc.Html" %>

<asp:Content ContentPlaceHolderID="HeaderContentRegion" runat="server">
	<%= Page.ConfigureDojo(false, true, true) %>
	<%= Page.ClientResources("Dojo") %>
</asp:Content>
<asp:Content ContentPlaceHolderID="FullRegion" runat="server">
	<script type="text/javascript">
		function closeDialogAndReturn() {
			var propertyValue = $('#<%=propertyValueField.ClientID %>').val();
			EPi.GetDialog().Close({ value: propertyValue });
        };
	</script>
    <asp:HiddenField ID="propertyValueField" runat="server" />
    <asp:ValidationSummary ID="ValidationSummary" runat="server" CssClass="EP-validationSummary epi-editProperty-validationSummary" ForeColor="Black" />
    <asp:Panel id="PropertyPanel" runat="server" />
    <asp:Button runat="server" OnClick="Save_Click" ID="SaveButton" Text="<%$ Resources: EPiServer, button.save %>" data-epi-dialog-button="true" />
</asp:Content>
