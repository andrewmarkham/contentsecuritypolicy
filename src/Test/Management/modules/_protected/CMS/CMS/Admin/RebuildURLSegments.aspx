<%@ Page Language="c#" Codebehind="RebuildURLSegments.aspx.cs" AutoEventWireup="False" Inherits="EPiServer.UI.Admin.RebuildURLSegments"  Title="RebuildURLSegments" %>

<asp:Content ContentPlaceHolderID="MainRegion" runat="server">
    <div class="epi-buttonDefault">
        <EPiServerUI:ToolButton id="ButtonRebuild" onclick="Rebuild_Click" runat="server" text="<%$ Resources: EPiServer, admin.rebuildurlsegments.rebuild %>" tooltip="<%$ Resources: EPiServer, admin.rebuildurlsegments.rebuild %>" SkinID="Check" />
    </div>
    <div class="epi-paddingVertical-small">
        <asp:CheckBox runat="server" ID="CheckBoxRebuildNonEmpty" EnableViewState="True" />
        <asp:Label ID="Label1" runat="server" AssociatedControlID="CheckBoxRebuildNonEmpty" Translate="/admin/rebuildurlsegments/rebuildnonempty" />
    </div>
    <table class="epi-default">
       <tr>
           <th><episerver:translate text="/admin/rebuildurlsegments/status" runat="server" id="TranslateStatus" /></th>
           <th><episerver:translate text="/admin/rebuildurlsegments/pages" runat="server" id="Translate1" /></th>
           <th><episerver:translate text="/admin/rebuildurlsegments/pagestoreplace" runat="server" id="TranslatePagesToReplace" /></th>
       </tr>
       <tr>
           <td><asp:Label ID="LabelStatus" runat="server" /></td>
           <td><asp:Label ID="LabelStatusPages" runat="server" /></td>
           <td><asp:Label ID="LabelPagesToReplace" runat="server" /></td>
       </tr>
     </table>
</asp:Content>
