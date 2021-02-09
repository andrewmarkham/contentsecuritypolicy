<%@ Page language="c#" Codebehind="PlugInLicense.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.PlugInLicense"  %>
<asp:Content ID="Content1" ContentPlaceHolderID="MainRegion" runat="server">
	<EPiServerUI:TabStrip runat="server" id="actionTab" GeneratesPostBack="False" TargetID="TabView">
		<EPiServerUI:Tab Text="#tabinfo" runat="server" ID="Tab1" sticky="True" />
		<EPiServerUI:Tab Text="#tabinstallnew" runat="server" ID="Tab2" sticky="True" />
	</EPiServerUI:TabStrip>
	
	<asp:Panel ID="TabView" Runat="server" CssClass="epi-formArea">
	
		<asp:Panel ID="Info" Runat="server">
		    <fieldset>
		        <legend><span>Restrictions</span></legend>
		        <asp:Repeater DataSource=<%#CurrentLicense.Restrictions%> Runat="server">
				    <ItemTemplate>
					    <asp:Repeater DataSource=<%#((EPiServer.Licensing.Restriction)Container.DataItem).Entries%> Runat="server" ID="Repeater1">
						    <ItemTemplate>
							    <asp:Label Text=<%#DataBinder.Eval(Container.DataItem,"Description")%> Runat="server" ID="Label1" NAME="Label1"/><br>
						    </ItemTemplate>
					    </asp:Repeater>
				    </ItemTemplate>
		        </asp:Repeater>
		    </fieldset>
	    </asp:Panel>
	
	    <asp:Panel ID="New" Runat="server">
	        <div class="epi-size15">
	            <label><asp:Label runat="server" Text="<%$ Resources: EPiServer, admin.license.selectfile %>" /></label>
		        <input type="file" runat="server" />
		    </div>
		    <div class="epi-buttonContainer">
		        <EPiServerUI:ToolButton OnClick="UploadLicense_Click" runat="server" SkinID="File" text="<%$ Resources: EPiServer, admin.license.uploadlicense %>" ToolTip="<%$ Resources: EPiServer, admin.license.uploadlicense %>" />
		    </div>
	    </asp:Panel>
	</asp:Panel>
</asp:Content>