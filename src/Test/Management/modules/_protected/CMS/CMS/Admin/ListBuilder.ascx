<%@ Control Language="c#" AutoEventWireup="False" Codebehind="ListBuilder.ascx.cs" Inherits="EPiServer.UI.Admin.ListBuilder" TargetSchema="http://schemas.microsoft.com/intellisense/ie5" %>
<script type='text/javascript'>
	//<![CDATA[
    var list = "<%=itemList.ClientID%>";

	function SelectAllItems()
	{
		for (var i=0; i<document.getElementById(list).length; i++)
		{
			document.getElementById(list).options[i].selected = true;
	    }
	}
	
	function OnReturnFromDialog(returnValue, onCompleteArguments)
	{
	    if(returnValue != null && returnValue != "")
		{
		    var listBox = document.getElementById(list);
		    //Check so we have not already item in list
		    var i=0;
		    for (; i<listBox.length; i++)
		    {
			    if (listBox.options[i].value == returnValue)
			    {
			        break;
			    }
	        }
	        if (i==listBox.length)
	        {
			    var newOption = new Option();
			    newOption.text = returnValue;
			    newOption.value = returnValue;
			    document.getElementById(list).options.add(newOption);
			    document.getElementById(list).options[document.getElementById(list).options.length-1].selected = true;
			    EnableButtons();
			}
		}
	}
	
	function CreateItem()
	{
	    EPi.CreateDialog("<%= DialogUrl %>", OnReturnFromDialog);
	}
	
	
	function EditItem()
	{
		var currentEntry = document.getElementById(list).options[document.getElementById(list).selectedIndex].text;
		var newEntry = prompt("Edit entry \""+ currentEntry +"\":", currentEntry);
		if(newEntry != null && newEntry != "")
		{
			var index = document.all[list].selectedIndex;
			document.getElementById(list).options[index].value = newEntry;
			document.getElementById(list).options[index].text = newEntry;
			document.getElementById(list).options[index].selected = true;
			EnableButtons();
		}
	}
	function RemoveItem()
	{
		document.getElementById(list).remove(document.getElementById(list).selectedIndex);
		EnableButtons();
	}
	function EnableButtons() {
	    var removeButtonId = "<%=removeButton.ClientID%>";
	    var shouldBeEnabled = document.getElementById(list).selectedIndex >= 0;

	    EPi.ToolButton.SetEnabled(removeButtonId, shouldBeEnabled);
	}
	//]]>
</script>
<table cellpadding="5" cellspacing="0">
<tr>
	<td>
		<select runat="server" name="itemList" id="itemList" class="episize500" onchange="EnableButtons();" multiple="true" size="4" />
	</td>
	<td width="7"/>
	<td>
	    <EPiServerUI:ToolButton id="addButton" OnClientClick="CreateItem();" runat="Server" text="<%$ Resources: EPiServer, button.add%>" tooltip="<%$ Resources: EPiServer, button.add%>" skinid="Add" GeneratesPostBack="false" style="margin-bottom:3px;" /><br />
		<EPiServerUI:ToolButton id="removeButton" OnClientClick="RemoveItem();" runat="Server" text="<%$ Resources: EPiServer, button.delete%>" tooltip="<%$ Resources: EPiServer, button.delete%>" skinid="Delete" GeneratesPostBack="false" Enabled="false" /><br />
	</td>
</tr>
</table>