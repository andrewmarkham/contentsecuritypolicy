<%@ Page Language="C#" AutoEventWireup="false"
    CodeBehind="NotPublishedPages.aspx.cs" Inherits="EPiServer.UI.Report.Reports.NotPublishedPages" %>
<%@ Import Namespace="EPiServer.Core" %>
<%@ Register TagPrefix="EPiServerUI" TagName="DateLabel" Src="DateLabel.ascx" %>
<%@ Register TagPrefix="EPiServerUI" TagName="PageNameLink" Src="PageNameLink.ascx" %>
<%@ Register TagPrefix="EPiServerUI" Namespace="EPiServer.UI.Report.Reports" Assembly="EPiServer.UI" %>

<asp:Content ID="Content1" ContentPlaceHolderID="MainRegion" runat="server">
    <div class="epi-formArea">
        <fieldset>
            <legend>
                 <asp:Literal Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.heading %>" runat="server"/>
            </legend>
            <div class="epi-size10">
                <div>
                    <label><asp:Literal runat="server" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.changed %>" /></label>
                    <span class="epilinklist">
                        <asp:LinkButton runat="server" OnCommand="SetTime_Click" CommandName="LastMonth" Text="<%$ Resources: EPiServer, button.lastmonth %>" CausesValidation="false"/>
                        <asp:LinkButton runat="server" OnCommand="SetTime_Click" CommandName="LastWeek" Text="<%$ Resources: EPiServer, button.lastweek %>" CausesValidation="false"/>
                        <asp:LinkButton runat="server" OnCommand="SetTime_Click" CommandName="Yesterday" Text="<%$ Resources: EPiServer, button.yesterday %>" CausesValidation="false"/>
                        <asp:LinkButton runat="server" OnCommand="SetTime_Click" CommandName="Today" Text="<%$ Resources: EPiServer, button.today %>" CausesValidation="false"/>
                    </span>
                </div>
                <div>
                    <asp:Label runat="server" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.changedbetween %>" AssociatedControlID="StartDateSelector" />
                    <EPiServer:InputDate ID="StartDateSelector" CssClass="epiinlineinputcontrol" style="width:auto;" runat="server" /> - <EPiServer:InputDate CssClass="epiinlineinputcontrol" style="width:auto;" ID="EndDateSelector" runat="server"/>
                </div>
                <div>
                    <asp:Label runat="server" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.selectrootpage %>" AssociatedControlID="StartPageSelector" />
                    <EPiServer:InputPageReference CssClass="epiinlineinputcontrol" ID="StartPageSelector" runat="server" DisableCurrentPageOption="true"/>
                </div>
                <div>
                    <asp:Label runat="server" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.readytopublish %>" AssociatedControlID="ReadyToPublishButton" />
                    <asp:RadioButton ID="ReadyToPublishButton" runat="server" Checked="true" GroupName="ReadyToPublishGroup" Text="<%$ Resources: EPiServer, button.yes %>"/>
                    <asp:RadioButton ID="NotReadyToPublish" runat="server" Checked="false" GroupName="ReadyToPublishGroup"  Text="<%$ Resources: EPiServer, button.no %>"/>
                </div>
                <div>
                    <asp:Label runat="server" AssociatedControlID="ChangedByCurrentUser" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.changedbyme %>" />
                    <asp:CheckBox ID="ChangedByCurrentUser" runat="server" Checked="false"/>
                </div>
                <div ID="LanguageSelectionContainer" runat="server">
                    <asp:Label ID="LanguageLabel" runat="server" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.selectlanguage %>" AssociatedControlID="LanguageSelector" />
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
            <asp:Label runat="server" Text="<%$ Resources: EPiServer, reportcenter.reportcriterias.numberofitemsperpage %>" AssociatedControlID="PageSizeSelector" />
            <asp:DropDownList SkinID="Custom" runat="server" ID="PageSizeSelector">
                <asp:ListItem Text="10" Value="10" Selected />
                <asp:ListItem Text="25" Value="25" />
                <asp:ListItem Text="50" Value="50" />
                <asp:ListItem Text="100" Value="100" />
            </asp:DropDownList>
        </div>
        <div class="epi-floatLeft epi-marginVertical-small"><asp:Literal ID="HitsCount" runat="server" /></div>

        <div class="epi-clear">
            <EPiServerUI:SortedGridView ID="ReportView"
            DefaultSortExpression="Saved"
            DefaultSortDirection="Descending"
            Width="100%"
            runat="server"
            AutoGenerateColumns="false"
            >
            <Columns>
                <asp:TemplateField HeaderText="<%$ Resources: EPiServer, reportcenter.reportcolumnheadings.pagename %>" SortExpression="PageName">
                    <ItemTemplate>
                        <EPiServerUI:PageNameLink PageData='<%# (EPiServer.Core.PageData)Container.DataItem %>' runat="server" />
                    </ItemTemplate>
                </asp:TemplateField>
                <asp:TemplateField HeaderText="<%$ Resources: EPiServer, reportcenter.reportcolumnheadings.startpublish %>" SortExpression="StartPublish" >
                    <ItemTemplate>
                        <EPiServerUI:DateLabel Value='<%# Eval("StartPublish") ?? DateTime.MinValue %>' runat="server" />
                    </ItemTemplate>
                </asp:TemplateField>
                <asp:TemplateField HeaderText="<%$ Resources: EPiServer, reportcenter.reportcolumnheadings.modified %>" SortExpression="Saved" >
                    <ItemTemplate>
                        <EPiServerUI:DateLabel Value='<%# Eval("Saved") %>' runat="server" />
                    </ItemTemplate>
                </asp:TemplateField>
                <EPiServerUI:NaiveBoundField DataField="ChangedBy" HeaderText="<%$ Resources: EPiServer, reportcenter.reportcolumnheadings.modifiedby %>" SortExpression="ChangedBy" />
                <EPiServerUI:NaiveBoundField DataField="LanguageID" HeaderText="<%$ Resources: EPiServer, reportcenter.reportcolumnheadings.language %>" SortExpression="Language" />
            </Columns>
            <PagerSettings Mode="NumericFirstLast" />
        </EPiServerUI:SortedGridView>
        </div>
    </div>

    <asp:ObjectDataSource ID="PublishReport" runat="server" SortParameterName="sortExpression"
        TypeName="EPiServer.UI.Report.Reports.NotPublishedPagesData"
        SelectMethod="GetPages"
        SelectCountMethod="GetRowCount"
        EnablePaging="true"
        EnableViewState="true"
        OnSelected="ReportData_Selected"
        OnObjectCreating="ReportData_ObjectCreating">
        <SelectParameters>
            <asp:ControlParameter ControlID="__Page" Direction="Input" Type="Object" PropertyName="RootPage" Name="startPage" />
            <asp:ControlParameter ControlID="__Page" Direction="Input" Type="Boolean" PropertyName="IsReadyToPublish" Name="isReadyToPublish"/>
            <asp:ControlParameter ControlID="__Page" Direction="Input" Type="String" PropertyName="LanguageId" Name="languageId" />
            <asp:ControlParameter ControlID="__Page" Direction="Input" Type="Boolean" PropertyName="IsChangedByCurrentUser" Name="isChangedByCurrentUser" />
            <asp:ControlParameter ControlID="__Page" Direction="Input" PropertyName="StartDate" Name="startDate" />
            <asp:ControlParameter ControlID="__Page" Direction="Input" PropertyName="EndDate" Name="stopDate" />
            <asp:Parameter Direction="Output" Name="rowCount" DefaultValue="0"/>
        </SelectParameters>
    </asp:ObjectDataSource>
</asp:Content>
