<%@ Page language="c#" Codebehind="EditLanguageBranches.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.EditLanguageBranches"  Title="Edit Language Branch"%>
<%@ Import Namespace="EPiServer.DataAbstraction" %>
<%@ Import Namespace="EPiServer.UI.Internal" %>
<asp:Content ContentPlaceHolderID="MainRegion" runat="server">
    <div class="epi-buttonDefault">
    <EPiServerUI:ToolButton id="NewLanguageBranchButton" OnClick="NewLanguageBranchButton_Click" runat="server" text="<%$ Resources: EPiServer, admin.editlanguagebranches.addlanguage %>" ToolTip="<%$ Resources: EPiServer, admin.editlanguagebranches.addlanguage %>" SkinID="Add" /><EPiServerUI:ToolButton id="CancelButton" OnClick="Cancel_Click" runat="server" text="<%$ Resources: EPiServer, button.cancel %>" SkinID="Cancel" Visible="false" />
    </div>
    <table class="epi-default">
    <asp:Repeater ID="LanguageList" Runat="server">
	    <HeaderTemplate>
		    <tr>
			    <th><episerver:translate runat="server" text="/admin/categories/moveup" /></th>
			    <th><episerver:translate runat="server" text="/admin/categories/movedown" /></th>
			    <th><episerver:translate runat="server" text="/admin/editlanguagebranches/namecaption" /></th>
			    <th><episerver:translate runat="server" text="/admin/editlanguagebranches/idcaption" /></th>
			    <th><episerver:translate runat="server" text="/admin/editlanguagebranches/enabledcaption"/></th>
			    <th><episerver:translate runat="server" text="/admin/editlanguagebranches/systemiconcaption"/></th>
			    <th><episerver:translate runat="server" text="/admin/editlanguagebranches/customiconcaption" /></th>
		    </tr>	
	    </HeaderTemplate>
	    <ItemTemplate>
		    <tr>
			    <td align="center"><asp:ImageButton OnCommand="MoveUp_Click" CommandName='<%# DataBinder.Eval(Container.DataItem, "LanguageID") %>' Runat="server" ID="MoveUpImageButton" ImageUrl='<%# GetImageThemeUrl("Tools/Up.gif") %>'  /></td>
			    <td align="center"><asp:ImageButton OnCommand="MoveDown_Click" CommandName='<%# DataBinder.Eval(Container.DataItem, "LanguageID") %>' Runat="server" ID="MoveDownImageButton" ImageUrl='<%# GetImageThemeUrl("Tools/Down.gif") %>' /></td>
			    <td>
				    <a href="EditLanguageBranch.aspx?languageID=<%# DataBinder.Eval(Container.DataItem, "LanguageID") %>"><%#: DataBinder.Eval(Container.DataItem, "Name") %></a>
			    </td>
			    <td>
				    <%# DataBinder.Eval(Container.DataItem, "LanguageID")%>
			    </td>
			    <td align="center">
				    <asp:Image Runat="server" AlternateText="<%$ Resources: EPiServer, admin.editlanguagebranches.enabledcaption %>" ID="Imagebutton3"  ImageUrl='<%# GetImageThemeUrl("Tools/Check.gif")%>' Visible='<%# DataBinder.Eval(Container.DataItem, "Enabled") %>' />
			    </td>
			    <td>
				    <img src="<%# GetIconPath(((LanguageBranch)Container.DataItem).IconPath()) %>" alt="<%# DataBinder.Eval(Container.DataItem, "Culture.EnglishName") %>" />
			    </td>
			    <td>
				    <img src="<%# GetIconPath((string)DataBinder.Eval(Container.DataItem, "ResolvedIconPath")) %>" alt="<%# DataBinder.Eval(Container.DataItem, "Culture.EnglishName") %>" />
			    </td>
		    </tr>
	    </ItemTemplate>
    </asp:Repeater>
    <asp:Repeater ID="CultureList" Runat="server" Visible="false">
	    <HeaderTemplate>
		    <tr>
			    <th><asp:Literal runat="server" Text="<%$ Resources: EPiServer, admin.editlanguagebranches.namecaption %>" /></th>
			    <th><asp:Literal runat="server" Text="<%$ Resources: EPiServer, admin.editlanguagebranches.idcaption %>" /></th>
			    <th><asp:Literal ID="Literal1" runat="server" Text="<%$ Resources: EPiServer, admin.editlanguagebranches.registeredcaption %>" /></th>
		    </tr>	
	    </HeaderTemplate>
	    <ItemTemplate>
		    <tr>
			    <td>
			        <asp:HyperLink runat="server" ID="LinkCultureEdit" NavigateUrl='<%# "EditLanguageBranch.aspx?languageID=" + (string)DataBinder.Eval(Container.DataItem, "Name") %>' Visible="<%# !CultureRegistered(Container.DataItem) %>"><%# DataBinder.Eval(Container.DataItem, "NativeName") %></asp:HyperLink>
			        <asp:Literal runat="server" ID="LiteralCultureRegistered" Text='<%# DataBinder.Eval(Container.DataItem, "NativeName") %>' Visible="<%# CultureRegistered(Container.DataItem) %>" />
			    </td>
			    <td>
				    <%# DataBinder.Eval(Container.DataItem, "Name")%>
			    </td>
			    <td align="center">
				    <asp:Image Runat="server" ID="ImageCultureEnabled" AlternateText="<%$ Resources: EPiServer, admin.editlanguagebranches.registered %>" Visible="<%# CultureRegistered(Container.DataItem) %>" ImageUrl='<%# GetImageThemeUrl("Tools/Check.gif")%>' />
			    </td>
		    </tr>
	    </ItemTemplate>
    </asp:Repeater>
    </table>
</asp:Content>
