<%@ Control Language="C#" AutoEventWireup="false" CodeBehind="PropertyLinkCollectionEditControl.ascx.cs" Inherits="EPiServer.UI.Edit.PropertyLinkCollectionEditControl" %>

<script type="text/javascript">
    // <![CDATA[
    /*
     * JavaScript support routines for EPiServer
     * Copyright (c) 2008 EPiServer AB
    */
    
    // Opens the hyperlink dialog.
    function LinkCollectionLaunchHyperlinkDialog_<%= ScriptSafeClientID %>(linkEditorUrl, row, href, target, text, title)
    {
        var onCompleteArguments = new Object();
        onCompleteArguments.row = row;

        var dialogArguments = new Object();
        dialogArguments.parentWindow = document.window;
        dialogArguments.href = href;
        dialogArguments.target = target;
        dialogArguments.text = text;
        dialogArguments.title = title;
        dialogArguments.hideBookmarks = true;
        if (href) {
            linkEditorUrl += "&url=" + encodeURIComponent(href);
        }
        
        EPi.CreateDialog(linkEditorUrl, LinkCollectionDialogClose_<%= ScriptSafeClientID %>, onCompleteArguments, dialogArguments, {width: 460, height: 450, scrollbars:"no"})
    }

    // Is called when the hyperlink dialog is closed. Sets the return value on the input type hidden and triggers a postback.
    function LinkCollectionDialogClose_<%= ScriptSafeClientID %>(returnValue, onCompleteArguments)
    { 
        var submitButton = document.getElementById('<%= HiddenSubmitButton.ClientID %>');
        var valueControl = document.getElementById('<%= LinkValue.ClientID %>');
        
        if (returnValue == -1)
        {
            // Delete was pushed in the editor
            // Write values to a hidden control
            valueControl.value = 'delete|' + onCompleteArguments.row;
            
            // Force a submit
            submitButton.click();
            
            return;
        }

        if (returnValue != null)   
        {
            // Write values to a hidden control
            valueControl.value = LinkCollectionBuildReplyString(returnValue, onCompleteArguments.row);
            
            // Force a submit
            submitButton.click();
        }
    }

    // Converts the return value from the hyperlink dialog into a '|' seperated string.
    function LinkCollectionBuildReplyString(linkAttributes, row)
    {   
        var href = linkAttributes.href;
        var target = linkAttributes.target;
        var text = linkAttributes.text;
        var title = linkAttributes.title;
        
        return row + '|' + href + '|' + target + '|' + title + '|' + text;
    }
    // ]]>
</script>

<div class="linkCollection">
    <div class="epi-buttonDefault">
        <EPiServerUI:ToolButton SkinID="Add" OnClientClick="<%# GetOpenEmptyLinkEditorFunction() %>" GeneratesPostBack="false" Text="<%$ Resources: EPiServer, button.addlink %>" ID="AddLinkButton" runat="server" />
    </div>

    <asp:Repeater runat="server" ID="Links">
        <HeaderTemplate>
            <table class="epi-default">
                <tr>
                    <th>
                        <asp:Literal runat="server" Text="<%$ Resources: EPiServer, edit.linkcollection.sortheading %>" />
                    </th>
                    <th>
                        <asp:Literal runat="server" Text="<%$ Resources: EPiServer, edit.linkcollection.linkheading %>" />
                    </th>
                    <th style="text-align: center;">
                        <asp:Literal runat="server" Text="<%$ Resources: EPiServer, button.edit %>" />
                    </th>
                    <th style="text-align: center;">
                        <asp:Literal runat="server" Text="<%$ Resources: EPiServer, button.delete %>" />
                    </th>
                </tr>
        </HeaderTemplate>
        <ItemTemplate>
            <tr>
                <td style="text-align: center;">
                    <asp:ImageButton OnCommand="MoveUp_Click" CommandArgument="<%# CurrentRow %>" ImageUrl='<%# EPiServer.Web.PageExtensions.ThemeUtility.GetImageThemeUrl(Page, "Tools/Up.gif") %>' runat="server" ID="ImageButtonUp" />
                    <asp:ImageButton OnCommand="MoveDown_Click" CommandArgument="<%# CurrentRow %>" ImageUrl='<%# EPiServer.Web.PageExtensions.ThemeUtility.GetImageThemeUrl(Page, "Tools/Down.gif") %>' runat="server" ID="ImageButtonDown" />
                    <EPiServerScript:ScriptDisablePageLeaveEvent EventType="Click" EventTargetId="ImageButtonUp" runat="server" />
                    <EPiServerScript:ScriptDisablePageLeaveEvent EventType="Click" EventTargetId="ImageButtonDown" runat="server" />
                </td>
                <td>
                    <asp:Label runat="server" Text="<%# Server.HtmlEncode(((EPiServer.SpecializedProperties.LinkItem)Container.DataItem).Text) %>" ToolTip="<%# ((EPiServer.SpecializedProperties.LinkItem)Container.DataItem).GetMappedHref() %>" />
                </td>
                <td style="text-align: center;">
                    <EPiServerUI:ToolButton OnClientClick="<%# GetOpenEditLinkEditorFunction((EPiServer.SpecializedProperties.LinkItem)Container.DataItem) %>" GeneratesPostBack="false" SkinId="edit" runat="server" />
                </td>
                <td style="text-align: center;">
                    <EPiServerUI:ToolButton oncommand="DeleteButton_Command" CommandArgument="<%# CurrentRow++ %>" ConfirmMessage="<%# GetConfirmationMessage((EPiServer.SpecializedProperties.LinkItem)Container.DataItem) %>" DisablePageLeaveCheck="true" GeneratesPostBack="true" SkinId="delete" runat="server" ID="DeleteButton" />
                </td>
            </tr>
        </ItemTemplate>
        <FooterTemplate>
            </table>
        </FooterTemplate>
    </asp:Repeater>

    <input type="hidden" runat="server" id="LinkValue" />
    <EPiServerUI:ToolButton text="hidden" DisablePageLeaveCheck="true" GeneratesPostBack="true" SkinId="hidden" runat="server" id="HiddenSubmitButton" onclick="HiddenSubmitButton_ServerClick" style="display:none" />

</div>
