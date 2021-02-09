<%@ Control Language="c#" AutoEventWireup="False" Codebehind="PlugInGroupList.ascx.cs" Inherits="EPiServer.UI.Admin.PlugInGroupList" TargetSchema="http://schemas.microsoft.com/intellisense/ie5" %>
<script type="text/javascript">

function ShowLicensingInfo(clickedNode, s)
{
	clickedNode.style.position = "relative";
	
	if (!window.epiLicensingInfo)
	{
	    var node = window.epiLicensingInfo = document.createElement("div");
	    node.className = "episolidborder epilicensinginfo";
	    EPi.AddEventListener(document, "click", HideLicensingInfo);  
	}
	var parentNode = window.epiLicensingInfo.parentNode;
	
	if (parentNode)
	{
	    parentNode.removeChild(window.epiLicensingInfo);
	}
	
	if (parentNode != clickedNode)
	{
	    window.epiLicensingInfo.innerHTML = s;
	    clickedNode.appendChild(window.epiLicensingInfo);
	}
	return false;
}

function HideLicensingInfo(e)
{
    if (window.epiLicensingInfo.parentNode && e.target != window.epiLicensingInfo.parentNode)
    {
        window.epiLicensingInfo.parentNode.removeChild(window.epiLicensingInfo);
    }
}

</script>

<br>
<asp:DataGrid
	ID="assemblyGrid"
	Runat="server"
	AutoGenerateColumns="false"
	OnDataBinding="SetHeaders"
	UseAccessibleHeader="true"
	>
<Columns>
	<asp:TemplateColumn>
		<ItemStyle>
		</ItemStyle>
		<ItemTemplate>
			<a href="PlugInEdit.aspx?group=<%# Server.UrlEncode(DataBinder.Eval(Container.DataItem,"AssemblyFullName").ToString()) %>"><%# DataBinder.Eval(Container.DataItem,"AssemblyName") %></a>
		</ItemTemplate>
	</asp:TemplateColumn>
	<asp:TemplateColumn>
		<ItemStyle>
		</ItemStyle>
		<ItemTemplate>
			<%# DataBinder.Eval(Container.DataItem,"Description") %>
		</ItemTemplate>
	</asp:TemplateColumn>
	<asp:TemplateColumn>
		<ItemStyle>
		</ItemStyle>
		<ItemTemplate>
			<%# DataBinder.Eval(Container.DataItem,"Version") %>
		</ItemTemplate>
	</asp:TemplateColumn>
	<asp:TemplateColumn>
		<ItemStyle>
		</ItemStyle>
		<ItemTemplate>
			<%# DataBinder.Eval(Container.DataItem,"Company") %>
		</ItemTemplate>
	</asp:TemplateColumn>
	<asp:TemplateColumn>
		<ItemStyle>
		</ItemStyle>
		<ItemTemplate>
			<%# DataBinder.Eval(Container.DataItem,"License") %>
		</ItemTemplate>
	</asp:TemplateColumn>
	<asp:TemplateColumn>
		<ItemStyle>
		</ItemStyle>
		<ItemTemplate>
			<a target="_blank" href="<%# DataBinder.Eval(Container.DataItem,"MoreInfo") %>"><%# DataBinder.Eval(Container.DataItem,"MoreInfo") %></a>
		</ItemTemplate>
	</asp:TemplateColumn>
</Columns>	
</asp:DataGrid>
