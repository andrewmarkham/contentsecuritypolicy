<%@ Page Language="c#" Codebehind="EditUser.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.EditUser"  Title="Create User" %>

<asp:Content runat="server" ContentPlaceHolderID="MainRegion" ID="MainContent">
   
   <EPiServer:ControlLoader runat="Server" Src="../edit/UserMembership.ascx" id="UserMembership"/>

    <script language="javascript" type="text/javascript">
    	EPi.AddEventListener(EPi.GetForm(), "submit", SelAllMember);
    </script>

</asp:Content>
