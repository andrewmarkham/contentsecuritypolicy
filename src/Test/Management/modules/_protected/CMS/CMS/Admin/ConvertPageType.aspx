<%@ Page Language="c#" Codebehind="ConvertPageType.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.ConvertPageType"  Title="ConvertPageType" %>

<asp:Content ContentPlaceHolderID="HeaderContentRegion" runat="server">
<script type="text/javascript">
// <![CDATA[
      
    function ShowDialog()
    {
	    var retval="";
        return confirm("<%=ConfirmMessage%>");
    }
// ]]>
</script> 
</asp:Content>

<asp:Content ContentPlaceHolderID="MainRegion" runat="server">
<div class="epi-formArea">
    <div class="epi-size15">
        <div>
            <asp:Label runat="server" AssociatedControlID="PageRoot" Translate="/admin/convertpagetype/selectpageroot" />
            <EPiServer:InputPageReference id="PageRoot" DisableCurrentPageOption="true" runat="server" style="display: inline;" />				
		</div>
		<div class="epi-indent epi-size40">
			<asp:CheckBox ID="Recursive" Runat="server"/>
			<asp:Label runat="server" AssociatedControlID="Recursive" Translate="/admin/convertpagetype/recursive" />
       </div>
   </div>
</div><br />
    <EPiServerUI:ConvertPageTypeProperties ID="Properties" Runat="server" />
    <div class="epi-buttonContainer">
        <EPiServerUI:ToolButton runat="server" id="ConvertButton" OnClientClick="return ShowDialog();" OnClick="Convert" ToolTip="<%$ Resources: EPiServer, admin.convertpagetype.convert %>" Text="<%$ Resources: EPiServer, admin.convertpagetype.convert %>"/><EPiServerUI:ToolButton runat="server" id="TestButton" OnClick="Convert" ToolTip="<%$ Resources: EPiServer, admin.convertpagetype.runtest %>" Text="<%$ Resources: EPiServer, admin.convertpagetype.runtest %>"/>		
    </div>
</asp:Content>
