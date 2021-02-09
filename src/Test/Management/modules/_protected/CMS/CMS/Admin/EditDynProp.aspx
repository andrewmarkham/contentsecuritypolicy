<%@ Page language="c#" Codebehind="EditDynProp.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.EditDynProp"  Title="Edit Dynamic Properties"%>

<asp:Content ContentPlaceHolderID="MainRegion" runat="server">
	<div class="epi-buttonDefault">
	    <EPiServerUI:ToolButton id="NewDefinitionButton" runat="server" Text="<%$ Resources: EPiServer, admin.editcontenttype.addproperty %>" ToolTip="<%$ Resources: EPiServer, admin.editcontenttype.addproperty %>" SkinID="Add" OnClick="NewDefinitionButton_Click" />
	</div>
	<asp:Repeater ID="PropertyList" Runat="server">
		<HeaderTemplate>
		<table class="epi-default">
			<tr>
				<th><episerver:translate runat="server" text="/admin/categories/moveup" /></th>
				<th><episerver:translate runat="server" text="/admin/categories/movedown" /></th>
				<th><episerver:translate runat="server" text="/admin/editpropertydefinition/namecaption" /></th>
				<th><episerver:translate runat="server" text="/admin/editpropertydefinition/editcaption" /></th>
				<th><episerver:translate runat="server" text="/admin/editpropertydefinition/helpcaption" /></th>
				<th><episerver:translate runat="server" text="/admin/editpropertydefinition/typecaption" /></th>
			</tr>	
		</HeaderTemplate>
		<ItemTemplate>
			<tr>
				<td align="center"><asp:ImageButton OnCommand="MoveUp_Click" CommandName=<%#DataBinder.Eval(Container.DataItem, "ID") %> Runat="server" ID="Imagebutton1" NAME="Imagebutton1"/></td>
				<td align="center"><asp:ImageButton OnCommand="MoveDown_Click" CommandName=<%#DataBinder.Eval(Container.DataItem, "ID") %> Runat="server" ID="Imagebutton2"/></td>
				<td>
					<a href="EditPropertyDefinition.aspx?typeId=<%# DataBinder.Eval(Container.DataItem, "ID") %>"><%# DataBinder.Eval(Container.DataItem, "Name") %></a>
				</td>
				<td>
					<%# HttpUtility.HtmlEncode((string)DataBinder.Eval(Container.DataItem, "EditCaption")) %>
				</td>
				<td>
					<%# HttpUtility.HtmlEncode((string)DataBinder.Eval(Container.DataItem, "HelpText"))%>
				</td>					
				<td>
					<%# GetPropertyType(Container.DataItem) %>
				</td>					
			</tr>
		</ItemTemplate>
		<FooterTemplate></table></FooterTemplate>
	</asp:Repeater>
</asp:Content>