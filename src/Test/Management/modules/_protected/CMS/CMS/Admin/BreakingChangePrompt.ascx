<%@ Control Language="C#" AutoEventWireup="True" CodeBehind="BreakingChangePrompt.ascx.cs" Inherits="EPiServer.UI.Admin.BreakingChangePrompt" %>

<div class="epi-contentArea" style="margin-bottom: 15px; text-align: left;">
    <div class="EP-validationSummary">
        <ul>
            <li>
                <p><%: Translate("/admin/breakingchangeprompt/warningmessage") %></p>
            </li>
            <li>
                <asp:CheckBox ID="AllowBreakingChangeCheckBox" runat="server" Text="<%$ Resources: EPiServer, admin.breakingchangeprompt.allowbreakingchangelabel %>" />
            </li>
        </ul>
    </div>
</div>
