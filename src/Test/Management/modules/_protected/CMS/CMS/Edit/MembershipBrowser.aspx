<%@ Page Language="c#" Codebehind="MembershipBrowser.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Edit.MembershipBrowser"  %>

<%@ Import Namespace="EPiServer.Security" %>
<asp:Content ID="headerContent" ContentPlaceHolderID="HeaderContentRegion" runat="server">

    <script type="text/javascript">
// <![CDATA[
    
    function SaveAndClose()
    {
        var selectList = document.getElementById("AddUserNames");
        if(selectList.options.length == 0)
        {
            EPi.GetDialog().Close();
            return;
        }

            var returnObject = new Array(selectList.options.length);
            for (i=0; i<selectList.options.length; i++) 
            {
                returnObject[i] = selectList.options[i].value;
            }

            EPi.GetDialog().Close(returnObject);

    }
    
     function ToggleSearchInputs( e ) 
     {
        var searchByMembership = this.options[this.selectedIndex].value == "<%= SecurityEntityType.User.ToString() %>";
        var toggleRows = document.getElementById("ToggleRow");
        toggleRows.style.display = searchByMembership ? 'block' : 'none';
    }
// ]]>
    </script>

</asp:Content>
<asp:Content ID="bodyContent" ContentPlaceHolderID="FullRegion" runat="server">
    <div class="epi-formArea epi-paddingHorizontal">
        <fieldset>
            <legend>
                <span><asp:Label runat="server" ID="headingText" ToolTip="<%$ Resources: EPiServer, admin.searchusers.heading %>" Text="<%$ Resources: EPiServer, admin.searchusers.heading %>" /></span>
            </legend>
            <div class="epi-size15">
                <div>
                    <asp:Label runat="server" AssociatedControlID="DropDownSecurityEntity" Text="<%$ Resources: EPiServer, admin.searchusers.typecaption %>" />
                    <asp:DropDownList ID="DropDownSecurityEntity" runat="server" />
                </div>
                <div>
                    <asp:Label runat="server" AssociatedControlID="SearchText" Text="<%$ Resources: EPiServer, admin.searchusers.searchname %>" />
                    <asp:TextBox ID="SearchText" runat="server" MaxLength="200" />
                </div>
                <div id="ToggleRow">
                    <asp:Label ID="Label3" runat="server" AssociatedControlID="Email" Text="<%$ Resources: EPiServer, admin.secedit.editemail %>" />
                    <asp:TextBox ID="Email" runat="server" MaxLength="200" />
                </div>
            </div>
            <div class="epi-buttonDefault">
                <EPiServerUI:toolbutton id="SearchButton" generatespostback="True" runat="server" text="<%$ Resources: EPiServer, button.search %>" tooltip="<%$ Resources: EPiServer, button.search %>" skinid="Search" />
            </div>
        </fieldset>

        <fieldset>
            <legend>
                <span><episerver:translate text="/edit/sidbrowser/heading" runat="server" id="translateHeading" /></span>
            </legend>
            <br clear="all" />
            <div class="epi-floatLeft">
                <episerver:translate text="/edit/sidbrowser/orgsid" runat="server" id="Translate1" /><br />
                <select id="OrgUserNames" name="OrgUserNames" size="15" class="EPEdit-sidSelectList" ondblclick="SecMoveOption(this, document.getElementById('AddUserNames'))">
                    <asp:Repeater ID="UserNamesList" runat="server">
                        <ItemTemplate>
                            <option id="row_<%# Server.HtmlEncode(Container.DataItem.ToString()) %>" value="<%# Server.HtmlEncode(Container.DataItem.ToString()) %>|||<%=(int)SecurityType%>">
                                <%# Server.HtmlEncode(Container.DataItem.ToString())%>
                            </option>
                        </ItemTemplate>
                    </asp:Repeater>
                </select>
            </div>
            
            <div class="epi-floatLeft epi-arrowButtonContainer">
                <EPiServerUI:toolbutton id="RightButton" generatespostback="False" onclientclick="SecMoveOption(document.getElementById('OrgUserNames'), document.getElementById('AddUserNames'));" runat="server" SkinID="ArrowRight" style="margin-bottom: 1.5em; margin-top: 1.5em;" /><br />
                <EPiServerUI:toolbutton id="LeftButton" generatespostback="False" onclientclick="SecMoveOption(document.getElementById('AddUserNames'), document.getElementById('OrgUserNames'));" runat="server" SkinID="ArrowLeft" />
            </div> 
             
            <div class="epi-floatLeft">
                <episerver:translate text="/edit/sidbrowser/newsid" runat="server" id="Translate2" /><br />
                <select id="AddUserNames" name="AddUserNames" <%=AllowMultiple ? "multiple='multiple'" : ""%> size="<%=AllowMultiple ? "15" : "1"%>" class="EPEdit-sidSelectList" ondblclick="SecMoveOption(document.getElementById('AddUserNames'), document.getElementById('OrgUserNames'));">
                </select>
            </div>          
            <br clear="all" />
        </fieldset>
        <%--The following code is to solve a peekaboo bug concerning buttons on this page--%>
        <!--[if lte IE 6]>
            <br style="line-height:0; height:0; margin:0;" />
            <br style="line-height:0; height:0; margin:0;" />
        <![endif]-->
        <div class="epi-buttonContainer">
            <EPiServerUI:toolbutton id="SaveButton" IsDialogButton="True" generatespostback="False" onclientclick="SaveAndClose();" runat="server" text="<%$ Resources: EPiServer, button.ok %>" tooltip="<%$ Resources: EPiServer, button.ok %>" skinid="Check" />
            <EPiServerUI:toolbutton id="CancelButton" IsDialogButton="True" generatespostback="False" onclientclick="EPi.GetDialog().Close();" runat="server" text="<%$ Resources: EPiServer, button.cancel %>" tooltip="<%$ Resources: EPiServer, button.cancel %>" skinid="Cancel" />
        </div>
    </div>   
</asp:Content>
