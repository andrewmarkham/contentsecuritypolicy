<%@ Register TagPrefix="EPiServer" Namespace="EPiServer.Web.WebControls" Assembly="EPiServer" %>
<%@ Control Language="c#" AutoEventWireup="False" Codebehind="PlugInList.ascx.cs" Inherits="EPiServer.UI.Admin.PlugInList" TargetSchema="http://schemas.microsoft.com/intellisense/ie5" %>

<div class="epi-paddingHorizontal">

<asp:Repeater ID="typeList" Runat="server">

	<HeaderTemplate>
		<table>
			<tr>
				<td>		
	</HeaderTemplate>

	<ItemTemplate>
		<br>
		<h2><%# DataBinder.Eval(Container.DataItem,"TypeName") %></h2>
		<table class="epi-default">
			<asp:Repeater
				Runat="server"
				dataSource='<%# DataBinder.Eval(Container.DataItem,"MembersTable") %>'
			>
				<HeaderTemplate>
					<tr>
						<th>
							<EPiServer:Translate Text="/admin/pluginlist/enabled" runat="server"/>
						</th>
						<th>
							<EPiServer:Translate Text="/admin/pluginlist/name" runat="server" ID="Translate1"/>
						</th>
						<th>
							<EPiServer:Translate Text="/admin/pluginlist/description" runat="server" ID="Translate2"/>
						</th>
						<asp:PlaceHolder Runat="server" Visible=<%#ShowGroup%> ID="Placeholder1">
						<th>
							<EPiServer:Translate Text="/admin/pluginlist/plugin" runat="server" ID="Translate4"/>
						</th>
						</asp:PlaceHolder>
					</tr>				
				</HeaderTemplate>
				<ItemTemplate>
					<tr>
						<td>
							<asp:CheckBox Runat="server" Enabled=<%#ShouldBeEditable(Container.DataItem) && Editable %> Checked='<%# DataBinder.Eval(Container.DataItem,"Enabled") %>' Name='<%# DataBinder.Eval(Container.DataItem,"ID").ToString() %>'/>
						</td>
						<td>
							<%# DataBinder.Eval(Container.DataItem,"DisplayName") %>
						</td>
						<td style="width:300px;">
							<%# DataBinder.Eval(Container.DataItem,"Description") %>
						</td>
						<asp:PlaceHolder Runat="server" Visible=<%#ShowGroup%>>
						<td>
							<a href="PlugInEdit.aspx?group=<%# Server.UrlEncode(DataBinder.Eval(Container.DataItem,"GroupFullName").ToString()) %>"><%# DataBinder.Eval(Container.DataItem,"Group") %></a>
						</td>
						</asp:PlaceHolder>
					</tr>
				</ItemTemplate>	
			</asp:Repeater>
		</table>
	</ItemTemplate>

	<FooterTemplate>
				</td>
			</tr>
		</table>
	</FooterTemplate>

</asp:Repeater>

</div>

