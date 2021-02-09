<%@ Page Language="c#" Codebehind="EditDynProp.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Edit.EditDynProp"  Title="<%$ Resources: EPiServer, edit.editdynprop.title %>" %>

<asp:Content ContentPlaceHolderID="HeaderContentRegion" runat="server">

    <script type="text/javascript" language="javascript">
        <!--
        function onNavigate(newPageLink)
        {
	        return -1;
        }
        function onCommand(newCommand)
        {
	        return -1;
        }
        // -->
    </script>

</asp:Content>
<asp:Content ContentPlaceHolderID="MainRegion" runat="server">
   <asp:Label runat="server" ID="NoPropertiesDefinedMessage" Text="<%$ Resources: EPiServer, edit.editdynprop.nodynprop %>" />
    <EPiServerUI:PropertyDataForm EditDynamicProperties="True" AutoLoadTabs="true" runat="server" ID="EditForm">
        <CaptionTemplate>
            <EPiServerUI:DynamicPropertyCaption DynamicProperty="<%#DynProp[Container.Property.Name]%>" runat="server" />
        </CaptionTemplate>
    </EPiServerUI:PropertyDataForm>
    <div class="epi-buttonContainer">
        <EPiServerUI:ToolButton ID="ApplyButton" IsDialogButton="True" runat="server" SkinID="Save" Text="<%$ Resources: EPiServer, button.save %>" ToolTip="<%$ Resources: EPiServer, button.save %>" onclick="ApplyButton_Click" />
    </div>
</asp:Content>
