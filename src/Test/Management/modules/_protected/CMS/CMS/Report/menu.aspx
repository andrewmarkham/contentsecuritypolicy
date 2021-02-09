<%@ Page Language="C#" AutoEventWireup="false" CodeBehind="menu.aspx.cs"  Inherits="EPiServer.UI.Report.Menu" %>
<%@ Import Namespace="EPiServer.PlugIn" %>
<%@ Import Namespace="System.Collections.Generic" %>

<asp:Content ContentPlaceHolderID="HeaderContentRegion" runat="server">
    <base target="ep_main" />
</asp:Content>

<asp:Content ContentPlaceHolderID="FullRegion" runat="server">

    <EPiServerUI:BodySettings CssClass="epi-applicationSidebar episcroll" runat="server" />
    
    <script type="text/javascript">
        $(document).ready(function() {
            var on = function(e) { $(this).closest("li").removeClass("epi-settings-closed"); };
            var off = function(e) { $(this).closest("li").addClass("epi-settings-closed"); };
            $(".epi-localNavigation > ul > li > a").toggle(off, on);
        }); 
    </script>
    
    <div class="epi-adminSidebar">
    
        <asp:Repeater runat="server" ID="Reports">
            <HeaderTemplate>
                <div class="epi-localNavigation">
                    <ul>
            </HeaderTemplate>
            <ItemTemplate>
                        <li class="epi-navigation-standard epi-navigation-selected">
                            <a href="#"><asp:Literal runat="server" Text='<%# Eval("DisplayName") %>' /></a>
                            <asp:Repeater runat="server" DataSource='<%# Eval("Reports") %>' >
                                <HeaderTemplate>
                                    <ul>
                                </HeaderTemplate>
                                <ItemTemplate><li><asp:HyperLink runat="server" NavigateUrl='<%# Eval("Url") %>' ToolTip='<%# Eval("Description") %>' Text='<%# Eval("DisplayName") %>' /></li></ItemTemplate>
                                <FooterTemplate>
                                    </ul>
                                </FooterTemplate>
                            </asp:Repeater>
                        </li>
            </ItemTemplate>
            <FooterTemplate>
                    </ul>
                </div>  
            </FooterTemplate>
        </asp:Repeater>
    
    </div>

</asp:Content>
