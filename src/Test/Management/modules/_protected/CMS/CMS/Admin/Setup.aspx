<%@ Page language="c#" Codebehind="Setup.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.Setup"  Title="Setup" %>

<asp:Content ID="Content1" ContentPlaceHolderID="MainRegion" runat="server">

	<script type='text/javascript'>

	var isClicked = false;

	function CanCancelOperation()
	{
		return !isClicked;
	}

	function DisplayProgressBar()
	{
		if(isClicked)
		{
			return false;
		}
		isClicked = true;

		document.getElementById("message").style.display = "block";

		return true;
	}

	</script>
    <div class="epi-formArea" ID="optionTable" runat="server">
        <fieldset>
	        <legend>
	            <asp:Label runat="server" AssociatedControlID="selectSampleData" Translate="#selectcontent" />
	        </legend>
		    <asp:RadioButtonList RepeatLayout="Flow" ID="selectSampleData" Runat="server" />
	    </fieldset>

		<fieldset runat="server" id="LanguagePanel">
	        <legend>
		        <asp:Label runat="server" AssociatedControlID="selectLanguage" Translate="#selectlanguage" />
		    </legend>
		    <asp:RadioButtonList RepeatLayout="Flow" Runat="server" ID="selectLanguage" />
		</fieldset>

        <div class="epi-paddingVertical-small" runat="server" id="DestinationPanel">
			    <asp:Label runat="server" AssociatedControlID="PageRoot" Translate="#selectdestination" />
			    <EPiServer:InputPageReference ID="PageRoot" style="display: inline;" DisableCurrentPageOption="true" Runat="server" />
			    <asp:CustomValidator ID="RootValidator" runat="server" Text="*" OnServerValidate="ValidatePageRoot" />
        </div>
    </div>
    <div class="epi-buttonContainer">
        <EPiServerUI:ToolButton id="SetupButton" runat="server" OnClick="DoSetup" OnClientClick="DisplayProgressBar();" Text="<%$ Resources: EPiServer, admin.setup.setupbutton %>" ToolTip="<%$ Resources: EPiServer, admin.setup.setupbutton %>" SkinID="Check" />
    </div>

    <div id="message" style="position: absolute; top : 120px; left: 200px; width: 30em;background:#444;border:1px solid #efefef;color: #fff; padding: 4em 2em; text-align: center; text-shadow: #222 0 -1px 0;-moz-border-radius: 6px;-webkit-border-radius: 6px;-moz-box-shadow: #333 0px 3px 16px -7px;-webkit-box-shadow: #333 0px 3px 16px -7px;opacity: 0.96; z-index: 99999; display: none;">
        <span><%=Translate("#progress")%></span>
    </div>

</asp:Content>
