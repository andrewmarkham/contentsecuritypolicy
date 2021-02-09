<%@ Page Language="C#" AutoEventWireup="false" CodeBehind="SimpleAddresses.aspx.cs" Inherits="EPiServer.UI.Report.Reports.SimpleAddresses" Title="Untitled Page" %>
<%@ Import Namespace="EPiServer.Core" %>
<%@ Register TagPrefix="EPiServerUI" TagName="PageNameLink" Src="PageNameLink.ascx" %>
<%@ Register TagPrefix="EPiServerUI" Namespace="EPiServer.UI.Report.Reports" Assembly="EPiServer.UI" %>
<asp:Content ContentPlaceHolderID="MainRegion" runat="server">
    <div class="epi-formArea">
       <fieldset>
            <legend>
                <asp:Literal Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.heading %>" runat="server"/>
            </legend>
            <div class="epi-size10">
                <div>
                    <asp:label runat="server" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.selectrootpage %>" AssociatedControlID="StartPage" />
                    <EPiServer:InputPageReference CssClass="epiinlineinputcontrol" ID="StartPage" runat="server" DisableCurrentPageOption="true"/>
                </div>
                <div id="LanguageDiv" runat="server">
                    <asp:label runat="server" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.selectlanguage %>" AssociatedControlID="LanguageSelector" />
                    <asp:DropDownList runat="server" ID="LanguageSelector" AppendDataBoundItems="true" DataTextField="Name" DataValueField="LanguageID">
                        <asp:ListItem Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.all %>" Value="" Selected="True" />
                    </asp:DropDownList>
                </div>
            </div>
        </fieldset>

        <div class="epitoolbuttonrow">
            <EPiServerUI:ToolButton runat="server" SkinID="Report" Text="<%$ Resources: EPiServer, button.showreport %>" OnClick="ShowReport_Click" />
        </div>

        <div class="epi-floatRight epi-marginVertical-small">
            <asp:label runat="server" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.numberofitemsperpage %>" AssociatedControlID="PageSizeSelector" />
            <asp:DropDownList SkinID="Custom" runat="server" ID="PageSizeSelector">
                <asp:ListItem Text="10" Value="10" Selected="true" />
                <asp:ListItem Text="25" Value="25" />
                <asp:ListItem Text="50" Value="50" />
                <asp:ListItem Text="100" Value="100" />
            </asp:DropDownList>
        </div>
        <div class="epi-floatLeft epi-marginVertical-small"><asp:Literal ID="HitsCount" runat="server" /></div>

        <div class="epi-clear">
            <EPiServerUI:SortedGridView ID="ReportView"
            DefaultSortExpression="ExternalURL"
            DefaultSortDirection="Ascending"
            Width="100%"
            AutoGenerateColumns="false"
            runat="server">
            <Columns>
                <asp:TemplateField HeaderText="<%$ Resources: EPiServer, reportcenter.reportcolumnheadings.pagename %>" SortExpression="PageName">
                    <ItemTemplate>
                        <EPiServerUI:PageNameLink PageData='<%# (EPiServer.Core.PageData)Container.DataItem %>' runat="server" />
                    </ItemTemplate>
                </asp:TemplateField>
                <asp:TemplateField HeaderText="<%$ Resources: EPiServer, reportcenter.reportcolumnheadings.simpleaddress %>" SortExpression="ExternalURL">
                    <ItemTemplate>
                        <EPiServer:Property runat="server" PropertyName="PageExternalUrl" DisplayMissingMessage="false" />
                    </ItemTemplate>
                </asp:TemplateField>
                <EPiServerUI:NaiveBoundField DataField="ChangedBy" HeaderText="<%$ Resources: EPiServer, reportcenter.reportcolumnheadings.modifiedby %>" SortExpression="ChangedBy" />
                <EPiServerUI:NaiveBoundField DataField="LanguageID" HeaderText="<%$ Resources: EPiServer, reportcenter.reportcolumnheadings.language %>" SortExpression="Language" />
                <asp:TemplateField HeaderText="<%$ Resources: EPiServer, reportcenter.reportcolumnheadings.publishedstatus %>">
                    <ItemTemplate>
                        <asp:Image Runat="server" Title="<%$Resources: EPiServer, episerver.cms.contentediting.versionstatus.delayedpublish %>" ImageUrl='<%# GetImageThemeUrl("Explorertree/PageTree/AwaitingPublish.gif")%>' Visible='<%# ((EPiServer.Core.PageData)Container.DataItem).StartPublish > DateTime.Now %>' />
                        <asp:Image Runat="server" Title="<%$Resources: EPiServer, episerver.cms.contentediting.versionstatus.expired %>" ImageUrl='<%# GetImageThemeUrl("Explorertree/PageTree/PublishExpired.gif")%>' Visible='<%# ((EPiServer.Core.PageData)Container.DataItem).StopPublish < DateTime.Now %>' />
                    </ItemTemplate>
                </asp:TemplateField>
                <asp:TemplateField HeaderText="<%$ Resources: EPiServer, reportcenter.reportcolumnheadings.notvisibleinmenu %>">
                    <ItemTemplate>
                        <asp:Image Runat="server" AlternateText="<%$ Resources: EPiServer, webcontrols.explorertree.statusnotvisibleinmenu %>" ImageUrl='<%# GetImageThemeUrl("Explorertree/PageTree/HiddenInMenu.gif")%>' Visible='<%# ((EPiServer.Core.PageData)Container.DataItem)["PageVisibleInMenu"] == null %>' />
                    </ItemTemplate>
                </asp:TemplateField>
            </Columns>
            <PagerSettings Mode="NumericFirstLast" />
        </EPiServerUI:SortedGridView>
        </div>
    </div>

    <asp:ObjectDataSource ID="SimpleAddressesData" runat="server" SortParameterName="sortExpression"
        TypeName="EPiServer.UI.Report.Reports.SimpleAddressesData"
        SelectMethod="GetPages" SelectCountMethod="GetRowCount" EnablePaging="true"
        OnSelected="ReportData_Selected" OnObjectCreating="ReportData_ObjectCreating">
        <SelectParameters>
            <asp:ControlParameter ControlID="__Page" Direction="Input" Type="Object" PropertyName="SelectedRootPage" Name="startPage" />
            <asp:ControlParameter ControlID="__Page" Direction="Input" Type="String" PropertyName="LanguageId" Name="langID" />
            <asp:Parameter Direction="Output" Name="rowCount" DefaultValue="0"/>
        </SelectParameters>
    </asp:ObjectDataSource>
</asp:Content>

