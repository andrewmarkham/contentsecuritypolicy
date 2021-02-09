<%@ Page language="c#" Codebehind="ConfirmLanguageSpecific.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.ConfirmLanguageSpecific"  %>
<asp:Content ContentPlaceHolderID="MainRegion" runat="server">
	<div id="warningGui" style="display: block">
		<div class="epi-buttonContainer">
		    <EPiServerUI:ToolButton id="ContinueButton" runat="server" GeneratePostBack="False" OnClientClick="EPi.GetDialog().Close(true);" Text="<%$ Resources: EPiServer, button.continue %>" ToolTip="<%$ Resources: EPiServer, button.continue %>" SkinID="Check" /><EPiServerUI:ToolButton id="CancelButton" runat="server" GeneratePostBack="False" OnClientClick="EPi.GetDialog().Close(false);" Text="<%$ Resources: EPiServer, button.cancel %>" ToolTip="<%$ Resources: EPiServer, button.cancel %>" SkinID="Cancel" /><EPiServerUI:ToolButton id="OkButton" visible="false" runat="server" GeneratePostBack="False" OnClientClick="EPi.GetDialog().Close(true);" Text="<%$ Resources: EPiServer, button.ok %>" ToolTip="<%$ Resources: EPiServer, button.ok %>" SkinID="Check" />  
        </div>
		<h4><EPiServer:Translate Text="#pagelist" runat="server" ID="pageListText"/></h4>
		<asp:Repeater Runat="server" ID="referenceListPublished">
            <ItemTemplate>
				<div>
				    <%#GeneratePageLink((EPiServer.DataAbstraction.ContentUsage)Container.DataItem)%>
				</div>
			</ItemTemplate>
	    </asp:Repeater>
	</div>
</asp:Content>