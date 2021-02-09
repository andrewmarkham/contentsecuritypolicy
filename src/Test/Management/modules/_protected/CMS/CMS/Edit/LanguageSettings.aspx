<%@ Page language="c#" Codebehind="LanguageSettings.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Edit.LanguageSettings"  Title="<%$ Resources: EPiServer, edit.languagesettings.title %>" %>
<asp:Content ID="Content1" ContentPlaceHolderID="MainRegion" runat="server">
	<script type='text/javascript'>
	<!--
	function onNavigate(newPageLink)
	{
		return -1;
	}
	function onCommand(newCommand)
	{
		return -1;
	}
	
	function PageDeleted(id, navId)
	{
		if(window.parent)
		{
			var cmd = new commandNavigateDescriptor('pagedeleted','',id,navId);
			window.parent.commandEvent( window, cmd );
		}
	}
	// -->
	</script>
	    <div class="epi-contentArea epi-formArea">
	        <div class="epi-marginVertical">
		        <asp:CheckBox Checked="True" AutoPostBack="True" OnCheckedChanged="InheritChanged" ID="inheritSettings" Text="Inherit" Runat="server"></asp:CheckBox>
		    </div>
		    <h2><EPiServer:Translate Text="#settingsforeditors" runat="server" /></h2>
		    <fieldset>
			    <legend><EPiServer:Translate Text="#availablelanguagestitle" runat="server" /></legend>
			    <p>
				    <EPiServer:Translate Text="#availablelanguagesdescriptionfirst" runat="server" ID="Translate1" NAME="Translate1"/>
				    <EPiServer:Translate Text="#availablelanguagesdescriptionsecond" runat="server" ID="Translate6" NAME="Translate1"/>
			    </p>
			    <asp:Panel ID="availableLanguagesView" Runat="server">
					    <ul>
						    <asp:Repeater ID="availableLanguagesList" Runat="server">
							    <ItemTemplate>
								    <li><%#:GetBranchName(DataBinder.Eval(Container.DataItem,"LanguageBranch"))%></li>
							    </ItemTemplate>
						    </asp:Repeater>
					    </ul>
					    <EPiServerUI:ToolButton SkinID="Edit" OnClick="ChangeAvailableLanguages" ID="availableEditButton" ToolTip="<%$ Resources: EPiServer, button.change %>" Text="<%$ Resources: EPiServer, button.change %>" Runat="server" />
			    </asp:Panel>
			    <asp:Panel Visible="False" ID="availableLanguagesEdit" Runat="server">
					    <asp:CheckBoxList RepeatColumns="3" Runat="server" ID="availableLanguages"/>
					    <br />
					    <EPiServerUI:ToolButton SkinID="Save" Runat="server" ToolTip="<%$ Resources: EPiServer, button.save %>" OnClick="SaveAvailableLanguages" Text="<%$ Resources: EPiServer, button.save %>" />
					    <EPiServerUI:ToolButton SkinID="Cancel" Runat="server" ToolTip="<%$ Resources: EPiServer, button.cancel %>" Text="<%$ Resources: EPiServer, button.cancel %>" OnClick="CancelSave" />
			    </asp:Panel>
		    </fieldset>
		    <h2><EPiServer:Translate Text="#settingsforsite" runat="server" /></h2>
		    <fieldset>
			    <legend><EPiServer:Translate Text="#fallbacklanguagestitle" runat="server" ID="Translate4" NAME="Translate1"/></legend>
			    <p>
				    <EPiServer:Translate Text="#fallbacklanguagesdescriptionfirst" runat="server" ID="Translate5" NAME="Translate1"/>
				    <EPiServer:Translate Text="#fallbacklanguagesdescriptionsecond" runat="server" ID="Translate8" NAME="Translate1"/>
			    </p>
			    <asp:Panel ID="fallbackLanguagesView" Runat="server">
					    <ul>
						    <asp:Repeater ID="fallbackLanguagesList" Runat="server">
							    <ItemTemplate>
								    <li><%#RenderFallbackList(Container.DataItem)%></li>
							    </ItemTemplate>
						    </asp:Repeater>
					    </ul>
					    <EPiServerUI:ToolButton SkinID="Edit" OnClick="ChangeFallbackLanguages"  ID="fallbackEditButton" ToolTip="<%$ Resources: EPiServer, button.change %>" Text="<%$ Resources: EPiServer, button.change %>" Runat="server" />
			    </asp:Panel>
			    <asp:Panel Visible="False" ID="fallbackLanguagesEdit" Runat="server">
					    <table cellpadding="5" class="epi-default">
						    <asp:Repeater ID="fallbackLanguages" Runat="server">
							    <HeaderTemplate>
								    <tr>
									    <th>
										    <EPiServer:Translate Text="#visitorlanguageheading" runat="server" ID="Translate9" NAME="Translate1"/>
									    </th>
									    <%#RenderEmptyFallbackColumns()%>
								    </tr>
							    </HeaderTemplate>
							    <ItemTemplate>
								    <tr>
									    <td><%#GetBranchName(DataBinder.Eval(Container.DataItem,"LanguageBranch"))%></td>
									    <%#RenderFallbackColumns(Container.DataItem)%>
								    </tr>
							    </ItemTemplate>
						    </asp:Repeater>
					    </table>
					    <br />
					    <EPiServerUI:ToolButton SkinID="Save" Runat="server" OnClick="SaveFallbackLanguages" Text="<%$ Resources: EPiServer, button.save %>" ToolTip="<%$ Resources: EPiServer, button.save %>" ID="Button4" NAME="Button2" />
					    <EPiServerUI:ToolButton SkinID="Cancel" Runat="server" Text="<%$ Resources: EPiServer, button.cancel %>" OnClick="CancelSave" ID="Button3" ToolTip="<%$ Resources: EPiServer, button.cancel %>" NAME="Button3" />
			    </asp:Panel>
		    </fieldset>
            <fieldset>
			    <legend><EPiServer:Translate Text="#replacementlanguagestitle" runat="server" ID="Translate2" NAME="Translate1"/></legend>
			    <p>
				    <EPiServer:Translate Text="#replacementlanguagesdescriptionfirst" runat="server" ID="Translate3" NAME="Translate1"/>
				    <EPiServer:Translate Text="#replacementlanguagesdescriptionsecond" runat="server" ID="Translate7" NAME="Translate1"/>
			    </p>
			    <asp:Panel ID="replacementLanguagesView" Runat="server">
					    <ul>
						    <asp:Repeater ID="replacementLanguagesList" Runat="server">
							    <ItemTemplate>
								    <li><%#GetBranchName(DataBinder.Eval(Container.DataItem,"LanguageBranch"))%> > <%#GetBranchName(DataBinder.Eval(Container.DataItem,"ReplacementLanguageBranch"))%></li>
							    </ItemTemplate>
						    </asp:Repeater>
					    </ul>
					    <EPiServerUI:ToolButton SkinID="Edit" OnClick="ChangeReplacementLanguages" ID="replacementEditButton" ToolTip="<%$ Resources: EPiServer, button.change %>" Text="<%$ Resources: EPiServer, button.change %>" Runat="server" />
			    </asp:Panel>
			    <asp:Panel Visible="False" ID="replacementLanguagesEdit" Runat="server">
					    <table cellpadding="2">
						    <asp:Repeater ID="replacementLanguages" Runat="server">
							    <HeaderTemplate>
								    <tr>
									    <td>
										    <b><EPiServer:Translate Text="#visitorlanguageheading" runat="server" ID="Translate11" NAME="Translate1"/></b>
									    </td>
									    <td>
										    <b><EPiServer:Translate Text="#replacementlanguageheading" runat="server" ID="Translate12" NAME="Translate1"/></b>
									    </td>
								    </tr>
							    </HeaderTemplate>
							    <ItemTemplate>
								    <tr>
									    <td><%#GetBranchName(DataBinder.Eval(Container.DataItem, "LanguageBranch"))%></td>
									    <td>
										    <%#SetupLanguageDropDown((string)DataBinder.Eval(Container.DataItem, "LanguageBranch"))%>
									    </td>
								    </tr>
							    </ItemTemplate>
						    </asp:Repeater>
					    </table>
					    <br />
					    <EPiServerUI:ToolButton SkinID="Save" Runat="server" ToolTip="<%$ Resources: EPiServer, button.save %>" OnClick="SaveReplacementLanguages" Text="<%$ Resources: EPiServer, button.save %>" ID="Button2" NAME="Button2" />
					    <EPiServerUI:ToolButton SkinID="Cancel" Runat="server" ToolTip="<%$ Resources: EPiServer, button.cancel %>" Text="<%$ Resources: EPiServer, button.cancel %>" OnClick="CancelSave" ID="Button1" NAME="Button1" /> 
			    </asp:Panel>
		    </fieldset>
		</div>
</asp:Content>